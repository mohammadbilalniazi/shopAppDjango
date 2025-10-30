"""
Signals for automatically assigning organizations to admin users
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from configuration.models import Organization
from user.models import OrganizationUser


@receiver(post_save, sender=User)
def assign_all_organizations_to_admin(sender, instance, created, **kwargs):
    """
    When a user is created or updated to be a superuser/admin,
    automatically assign them to all organizations with 'superuser' role.
    """
    if instance.is_superuser or instance.is_staff:
        # Get all organizations
        all_orgs = Organization.objects.filter(is_active=True)
        
        for org in all_orgs:
            # Create OrganizationUser entry if it doesn't exist
            OrganizationUser.objects.get_or_create(
                user=instance,
                organization=org,
                defaults={
                    'role': 'superuser',
                    'is_active': True
                }
            )
        
        if created:
            print(f"✅ Admin user '{instance.username}' assigned to {all_orgs.count()} organizations")
        else:
            print(f"✅ Admin user '{instance.username}' organization assignments updated")


@receiver(post_save, sender=Organization)
def assign_organization_to_all_admins(sender, instance, created, **kwargs):
    """
    When a new organization is created,
    automatically assign all admin/superuser users to it.
    """
    if created and instance.is_active:
        # Get all admin/superuser users
        admin_users = User.objects.filter(is_superuser=True) | User.objects.filter(is_staff=True)
        admin_users = admin_users.distinct()
        
        for admin_user in admin_users:
            # Create OrganizationUser entry if it doesn't exist
            OrganizationUser.objects.get_or_create(
                user=admin_user,
                organization=instance,
                defaults={
                    'role': 'superuser',
                    'is_active': True
                }
            )
        
        print(f"✅ Organization '{instance.name}' assigned to {admin_users.count()} admin users")
