"""
Signals for automatically assigning organizations and branches to admin users
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from configuration.models import Organization, Branch
from user.models import OrganizationUser


@receiver(post_save, sender=User)
def assign_all_organizations_to_admin(sender, instance, created, **kwargs):
    """
    When a user is created or updated to be a superuser/admin,
    automatically assign them to all organizations with 'superuser' role.
    For superusers, no specific branch is assigned (they have access to all branches).
    """
    if instance.is_superuser or instance.is_staff:
        # Get all organizations
        all_orgs = Organization.objects.filter(is_active=True)
        
        assigned_count = 0
        for org in all_orgs:
            # For admin/superuser, don't assign specific branch (they have access to all)
            # Create OrganizationUser entry if it doesn't exist
            org_user, was_created = OrganizationUser.objects.get_or_create(
                user=instance,
                organization=org,
                defaults={
                    'role': 'superuser',
                    'is_active': True,
                    'branch': None  # Superusers have access to all branches
                }
            )
            
            # Update existing org_user to ensure superuser status and no branch restriction
            if not was_created and instance.is_superuser:
                org_user.role = 'superuser'
                org_user.branch = None  # Remove branch restriction for superusers
                org_user.is_active = True
                org_user.save()
            
            if was_created:
                assigned_count += 1
        
        if created:
            print(f"✅ Admin user '{instance.username}' assigned to {assigned_count}/{all_orgs.count()} organizations (no branch restrictions)")
        else:
            print(f"✅ Admin user '{instance.username}' organization assignments updated ({assigned_count} new, no branch restrictions)")


@receiver(post_save, sender=Organization)
def assign_organization_to_all_admins(sender, instance, created, **kwargs):
    """
    When a new organization is created,
    automatically assign all admin/superuser users to it.
    Superusers are not restricted to specific branches.
    """
    if created and instance.is_active:
        # Get all admin/superuser users
        admin_users = User.objects.filter(is_superuser=True) | User.objects.filter(is_staff=True)
        admin_users = admin_users.distinct()
        
        assigned_count = 0
        for admin_user in admin_users:
            # Create OrganizationUser entry if it doesn't exist
            # Superusers get no branch restriction (access to all branches)
            org_user, was_created = OrganizationUser.objects.get_or_create(
                user=admin_user,
                organization=instance,
                defaults={
                    'role': 'superuser',
                    'is_active': True,
                    'branch': None  # No branch restriction for superusers
                }
            )
            if was_created:
                assigned_count += 1
        
        print(f"✅ Organization '{instance.name}' assigned to {assigned_count}/{admin_users.count()} admin users (no branch restrictions)")


@receiver(post_save, sender=Branch)
def handle_branch_creation(sender, instance, created, **kwargs):
    """
    When a new branch is created, log the event.
    Regular users will be manually assigned to branches as needed.
    Superusers automatically have access to all branches without specific assignment.
    """
    if created and instance.is_active:
        org_name = instance.organization.name if instance.organization else "Unknown"
        print(f"✅ New branch '{instance.name}' created for organization '{org_name}'")
        
        # Count superusers who have access to this organization (and thus this branch)
        superusers_count = OrganizationUser.objects.filter(
            organization=instance.organization,
            user__is_superuser=True,
            is_active=True
        ).count()
        
        if superusers_count > 0:
            print(f"   → {superusers_count} superuser(s) automatically have access to this branch")


def assign_user_to_branch(user, organization, branch, role='employee'):
    """
    Helper function to assign a user to a specific branch within an organization.
    
    Args:
        user: User instance
        organization: Organization instance
        branch: Branch instance
        role: User role ('employee', 'admin', 'owner', etc.)
    
    Returns:
        tuple: (OrganizationUser instance, was_created boolean)
    """
    if not branch.organization == organization:
        raise ValueError(f"Branch '{branch.name}' does not belong to organization '{organization.name}'")
    
    org_user, was_created = OrganizationUser.objects.get_or_create(
        user=user,
        organization=organization,
        defaults={
            'role': role,
            'is_active': True,
            'branch': branch
        }
    )
    
    # If updating existing user, update their branch assignment
    if not was_created:
        org_user.branch = branch
        org_user.role = role
        org_user.is_active = True
        org_user.save()
    
    print(f"✅ User '{user.username}' assigned to branch '{branch.name}' in organization '{organization.name}' with role '{role}'")
    return org_user, was_created


def get_user_accessible_branches(user, organization=None):
    """
    Helper function to get all branches a user has access to.
    
    Args:
        user: User instance
        organization: Optional Organization instance to filter by
    
    Returns:
        QuerySet of Branch instances the user can access
    """
    if user.is_superuser:
        # Superusers have access to all active branches
        if organization:
            return Branch.objects.filter(organization=organization, is_active=True)
        else:
            return Branch.objects.filter(is_active=True)
    
    # Regular users only have access to branches they're assigned to
    user_orgs = OrganizationUser.objects.filter(user=user, is_active=True)
    
    if organization:
        user_orgs = user_orgs.filter(organization=organization)
    
    # Get branches from user's assigned branches, or all branches if no specific branch assigned
    accessible_branches = Branch.objects.none()
    
    for org_user in user_orgs:
        if org_user.branch:
            # User is assigned to specific branch
            accessible_branches = accessible_branches | Branch.objects.filter(
                id=org_user.branch.id, 
                is_active=True
            )
        else:
            # User has organization access but no specific branch - access all branches in org
            accessible_branches = accessible_branches | Branch.objects.filter(
                organization=org_user.organization, 
                is_active=True
            )
    
    return accessible_branches.distinct()


def can_user_access_branch(user, branch):
    """
    Helper function to check if a user has access to a specific branch.
    
    Args:
        user: User instance
        branch: Branch instance
    
    Returns:
        boolean: True if user has access, False otherwise
    """
    if user.is_superuser:
        return True
    
    # Check if user has access to this branch
    accessible_branches = get_user_accessible_branches(user, branch.organization)
    return accessible_branches.filter(id=branch.id).exists()
