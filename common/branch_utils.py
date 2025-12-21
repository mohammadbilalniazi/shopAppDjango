"""
Branch utility functions for managing branch-related operations across the application
"""
from django.db.models import Q
from configuration.models import Branch, Organization
from user.models import OrganizationUser


class BranchManager:
    """
    Utility class for managing branch-related operations and access control
    """
    
    @staticmethod
    def get_user_branches(user, organization=None):
        """
        Get all branches accessible to a user
        
        Args:
            user: User instance
            organization: Optional Organization to filter by
            
        Returns:
            QuerySet of accessible Branch instances
        """
        if user.is_superuser:
            # Superusers have access to all active branches
            branches = Branch.objects.filter(is_active=True)
            if organization:
                branches = branches.filter(organization=organization)
            return branches
        
        # Get user's organization assignments
        org_users = OrganizationUser.objects.filter(user=user, is_active=True)
        if organization:
            org_users = org_users.filter(organization=organization)
        
        # Collect accessible branches
        branch_ids = []
        
        for org_user in org_users:
            if org_user.branch:
                # User assigned to specific branch
                branch_ids.append(org_user.branch.id)
            else:
                # User has general organization access - all branches in org
                org_branches = Branch.objects.filter(
                    organization=org_user.organization, 
                    is_active=True
                ).values_list('id', flat=True)
                branch_ids.extend(org_branches)
        
        return Branch.objects.filter(id__in=branch_ids, is_active=True).distinct()
    
    @staticmethod
    def can_user_access_branch(user, branch):
        """
        Check if user can access a specific branch
        
        Args:
            user: User instance
            branch: Branch instance
            
        Returns:
            bool: True if user has access
        """
        if user.is_superuser:
            return True
            
        return BranchManager.get_user_branches(user).filter(id=branch.id).exists()
    
    @staticmethod
    def get_default_branch_for_user(user, organization):
        """
        Get the default branch for a user in an organization
        
        Args:
            user: User instance
            organization: Organization instance
            
        Returns:
            Branch instance or None
        """
        if user.is_superuser:
            # Return first active branch for superusers
            return Branch.objects.filter(organization=organization, is_active=True).first()
        
        # Check if user has specific branch assignment
        org_user = OrganizationUser.objects.filter(
            user=user, 
            organization=organization, 
            is_active=True
        ).first()
        
        if org_user and org_user.branch:
            return org_user.branch
        
        # If no specific branch, return first available branch in organization
        user_branches = BranchManager.get_user_branches(user, organization)
        return user_branches.first()

    @staticmethod
    def get_user_default_branch(user, organization):
        """
        Backwards-compatible alias for `get_default_branch_for_user`.

        Some parts of the codebase call `BranchManager.get_user_default_branch`.
        Keep this alias to avoid AttributeError when older call sites remain.
        """
        return BranchManager.get_default_branch_for_user(user, organization)
    
    @staticmethod
    def assign_user_to_branch(user, branch, role='employee'):
        """
        Assign a user to a specific branch
        
        Args:
            user: User instance
            branch: Branch instance
            role: User role string
            
        Returns:
            OrganizationUser instance
        """
        org_user, created = OrganizationUser.objects.get_or_create(
            user=user,
            organization=branch.organization,
            defaults={
                'role': role,
                'is_active': True,
                'branch': branch
            }
        )
        
        if not created:
            # Update existing assignment
            org_user.branch = branch
            org_user.role = role
            org_user.is_active = True
            org_user.save()
        
        return org_user
    
    @staticmethod
    def remove_user_from_branch(user, branch):
        """
        Remove user's specific branch assignment (they keep organization access)
        
        Args:
            user: User instance
            branch: Branch instance
        """
        OrganizationUser.objects.filter(
            user=user,
            organization=branch.organization,
            branch=branch
        ).update(branch=None)
    
    @staticmethod
    def get_branch_users(branch, role=None):
        """
        Get all users assigned to a specific branch
        
        Args:
            branch: Branch instance
            role: Optional role filter
            
        Returns:
            QuerySet of OrganizationUser instances
        """
        users = OrganizationUser.objects.filter(
            Q(branch=branch) | Q(organization=branch.organization, branch__isnull=True),
            is_active=True
        )
        
        if role:
            users = users.filter(role=role)
            
        return users
    
    @staticmethod
    def get_organization_branch_summary(organization):
        """
        Get summary of branches and user assignments for an organization
        
        Args:
            organization: Organization instance
            
        Returns:
            dict: Summary data
        """
        branches = Branch.objects.filter(organization=organization, is_active=True)
        total_users = OrganizationUser.objects.filter(
            organization=organization, 
            is_active=True
        ).count()
        
        branch_data = []
        users_with_specific_branches = 0
        
        for branch in branches:
            branch_users = BranchManager.get_branch_users(branch)
            specific_branch_users = branch_users.filter(branch=branch).count()
            users_with_specific_branches += specific_branch_users
            
            branch_data.append({
                'branch': branch,
                'total_users': branch_users.count(),
                'specific_users': specific_branch_users,
                'general_users': branch_users.filter(branch__isnull=True).count()
            })
        
        return {
            'organization': organization,
            'total_branches': branches.count(),
            'total_users': total_users,
            'users_with_specific_branches': users_with_specific_branches,
            'users_with_general_access': total_users - users_with_specific_branches,
            'branch_details': branch_data
        }


# Convenience functions for common operations
def get_user_branches(user, organization=None):
    """Convenience wrapper for BranchManager.get_user_branches"""
    return BranchManager.get_user_branches(user, organization)


def can_user_access_branch(user, branch):
    """Convenience wrapper for BranchManager.can_user_access_branch"""
    return BranchManager.can_user_access_branch(user, branch)


def assign_user_to_branch(user, branch, role='employee'):
    """Convenience wrapper for BranchManager.assign_user_to_branch"""
    return BranchManager.assign_user_to_branch(user, branch, role)


def get_default_branch_for_user(user, organization):
    """Convenience wrapper for BranchManager.get_default_branch_for_user"""
    return BranchManager.get_default_branch_for_user(user, organization)