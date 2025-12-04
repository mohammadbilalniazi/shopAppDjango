from configuration.models import Organization
from user.models import OrganizationUser


def find_userorganization(request, organization_id=None):
    """
    Returns:
        (organization, user_organizations)
        organization: Organization instance (if exactly one found, else None)
        user_organizations: QuerySet of Organization objects the user belongs to
    """
    # Handle empty string or None as None
    if organization_id is not None and organization_id != '' and organization_id != 'all':
        user_orgs = OrganizationUser.objects.filter(organization_id=organization_id)
        print("organization_id",user_orgs)
    elif request.user.is_superuser:
        user_orgs = OrganizationUser.objects.all()
        print("user.is_superuser ",user_orgs)

    else:
        user_orgs = OrganizationUser.objects.filter(user=request.user)
        print("organizations of user=request.user ",user_orgs)
        
    orgs = Organization.objects.filter(id__in=user_orgs.values_list("organization_id", flat=True))
    if orgs.count() == 1:
        organization = orgs.first()
    else:
        organization = None
    if not organization_id and request.user.is_superuser:
        orgs = Organization.objects.all()
    print(f"organization: {organization}, orgs: {orgs}")
    return organization, orgs


def find_user_organization_and_branch(request, organization_id=None):
    """
    Enhanced version that also returns branch information
    
    Returns:
        (organization, user_organizations, user_branch, accessible_branches)
        organization: Primary Organization instance (if exactly one found, else None)
        user_organizations: QuerySet of Organization objects the user belongs to
        user_branch: User's assigned Branch instance for the organization (if any)
        accessible_branches: QuerySet of Branch objects the user can access
    """
    from common.branch_utils import BranchManager
    
    organization, user_orgs = find_userorganization(request, organization_id)
    
    user_branch = None
    accessible_branches = None
    
    if organization and not request.user.is_superuser:
        # Get user's specific branch assignment in this organization
        org_user = OrganizationUser.objects.filter(
            user=request.user, 
            organization=organization,
            is_active=True
        ).first()
        
        if org_user:
            user_branch = org_user.branch
    
    # Get all branches user can access
    accessible_branches = BranchManager.get_user_branches(request.user, organization)
    
    return organization, user_orgs, user_branch, accessible_branches


def get_user_default_branch(request, organization):
    """
    Get the default branch for a user in a specific organization
    
    Args:
        request: Django request object
        organization: Organization instance
        
    Returns:
        Branch instance or None
    """
    from common.branch_utils import BranchManager
    return BranchManager.get_default_branch_for_user(request.user, organization)


def can_user_access_organization_branch(request, organization, branch):
    """
    Check if a user can access a specific branch within an organization
    
    Args:
        request: Django request object
        organization: Organization instance
        branch: Branch instance
        
    Returns:
        bool: True if user has access
    """
    from common.branch_utils import BranchManager
    
    # First check if user has access to the organization
    _, user_orgs = find_userorganization(request)
    if not user_orgs.filter(id=organization.id).exists() and not request.user.is_superuser:
        return False
    
    # Then check branch access
    return BranchManager.can_user_access_branch(request.user, branch)