from configuration.models import Organization
from product.models import Store
from django.db import IntegrityError

def top_parent(organization):
    for i in range(5):
        if organization.parent!=None:
            organization=organization.parent
        else:
            break
    
    return organization
def find_organization(request,organization_id=None):
    # Business Logic 
    # A: Find Organization through Organization or Member_User 
    # B: then find if it has parent so find parent through three levels grand father organization (org.org.org)
    if organization_id is not None:
        query = Organization.objects.filter(id=int(organization_id))
    elif request.user.is_superuser:
        query = Organization.objects.all()
    else:
        query = Organization.objects.filter(owner=request.user)
    # sub_org=Sub_Organization.objects.filter(user=request.user)
    # member=Member_User.objects.filter(user=request.user)
    # print(" org ",org," member ",member)

    if query.count() == 1:
        self_organization = query[0]
        try:
            store = Store.objects.get(organization=self_organization)
        except Store.DoesNotExist:
            store_name = self_organization.name + " store"
            try:
                store, created = Store.objects.get_or_create(name=store_name, defaults={'organization': self_organization})
            except IntegrityError:
                store = Store.objects.get(name=store_name)  # fallback to fetch it directly
        parent_organization = top_parent(self_organization)
        return (self_organization, parent_organization, store)

    else:
        return (None,None,None)
    # elif sub_org.count()>0:
    #     org=sub_org[0].owner
    #     return org
    # elif member.count()>0:
    #     self_organization=member[0].organization
    #     parent_organization=top_parent(self_organization)
    #     return (self_organization,parent_organization)
    # else:
    return (None,None,None)
