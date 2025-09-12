from configuration.models import Organization
from user.models import OrganizationUser


def top_parent(organization):
    while organization.parent is not None:
        organization=organization.parent
    return organization


def find_userorganization(request, organization_id=None):
    """
    Returns:
        (organization, parent_organization, user_organizations)
        organization: Organization instance (if exactly one found, else None)
        parent_organization: Top parent organization (if found, else None)
        user_organizations: QuerySet of Organization objects the user belongs to
    """
    if organization_id is not None:
        user_orgs = OrganizationUser.objects.filter(organization_id=organization_id)
    elif request.user.is_superuser:
        user_orgs = OrganizationUser.objects.all()
    else:
        user_orgs = OrganizationUser.objects.filter(user=request.user)
    # Get actual Organization objects
    orgs = Organization.objects.filter(id__in=user_orgs.values_list("organization_id", flat=True))
    if orgs.count() == 1:
        organization = orgs.first()
        parent_organization = top_parent(organization)
    else:
        organization = None
        parent_organization = None
    return organization, parent_organization, orgs