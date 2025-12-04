"""
Context processor to add organizations and branches to all templates
This ensures organization and branch data is always available
"""
from configuration.models import Organization, Branch
from common.organization import find_userorganization
from common.branch_utils import BranchManager


def organizations_processor(request):
    """
    Add organizations to context for all templates
    Returns user's organizations or all organizations for superuser
    """
    context = {}
    
    if request.user.is_authenticated:
        try:
            # Get user's organizations using the existing helper
            self_organization, user_orgs = find_userorganization(request)
            
            # For superusers, show all organizations
            if request.user.is_superuser or request.user.is_staff:
                all_organizations = Organization.objects.filter(is_active=True).order_by('name')
            else:
                # For regular users, show only their assigned organizations
                all_organizations = user_orgs.order_by('name')
            
            context['global_organizations'] = all_organizations
            context['global_parent_organization'] = self_organization  # Using self_organization instead
            context['global_organizations_count'] = all_organizations.count()
            
        except Exception as e:
            # Fallback: if error, return empty queryset
            context['global_organizations'] = Organization.objects.none()
            context['global_parent_organization'] = None
            context['global_organizations_count'] = 0
            print(f"⚠️  Organizations context processor error: {e}")
    else:
        # Not authenticated
        context['global_organizations'] = Organization.objects.none()
        context['global_parent_organization'] = None
        context['global_organizations_count'] = 0
    
    return context


def branch_context(request):
    """
    Add branch data to context for all templates
    Returns user's branches and current branch information
    """
    context = {}
    
    if request.user.is_authenticated:
        try:
            # Get user's organizations
            self_organization, user_orgs = find_userorganization(request)
            
            # Get user's branches for the primary organization
            if self_organization:
                user_branches = BranchManager.get_user_branches(request.user, self_organization)
                current_branch = BranchManager.get_user_default_branch(request.user, self_organization)
                
                context['user_branches'] = user_branches
                context['current_branch'] = current_branch
                context['user_branches_count'] = user_branches.count()
                
                # For superusers, add all branches in organization
                if request.user.is_superuser or request.user.is_staff:
                    all_branches = Branch.objects.filter(
                        organization=self_organization, 
                        is_active=True
                    ).order_by('name')
                    context['all_branches'] = all_branches
                    context['all_branches_count'] = all_branches.count()
            else:
                context['user_branches'] = Branch.objects.none()
                context['current_branch'] = None
                context['user_branches_count'] = 0
                context['all_branches'] = Branch.objects.none()
                context['all_branches_count'] = 0
                
        except Exception as e:
            # Fallback: if error, return empty data
            context['user_branches'] = Branch.objects.none()
            context['current_branch'] = None
            context['user_branches_count'] = 0
            context['all_branches'] = Branch.objects.none()
            context['all_branches_count'] = 0
            print(f"⚠️  Branch context processor error: {e}")
    else:
        # Not authenticated
        context['user_branches'] = Branch.objects.none()
        context['current_branch'] = None
        context['user_branches_count'] = 0
        context['all_branches'] = Branch.objects.none()
        context['all_branches_count'] = 0
    
    return context
