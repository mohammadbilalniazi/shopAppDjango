from configuration.models import Organization
from django.db import IntegrityError

def top_parent(organization):
    for i in range(5):
        if organization.parent!=None:
            organization=organization.parent
        else:
            break
    
    return organization
def find_organization(request,organization_id=None):
    # A: Find Organization through Organization or Member_User 
    # B: then find if it has parent so find parent through three levels grand father organization (org.org.org)
    if organization_id is not None:
        query = Organization.objects.filter(id=int(organization_id))
    elif request.user.is_superuser:
        query = Organization.objects.all()
    else:
        query = Organization.objects.filter(owner=request.user)
    if query.count() == 1:
        self_organization = query[0]
        parent_organization = top_parent(self_organization)
        return (self_organization, parent_organization)
    else:
        return (None,None)
