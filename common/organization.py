from configuration.models import Organization
from product.models import Store
def top_parent(organization):
    for i in range(5):
        if organization.parent!=None:
            organization=organization.parent
        else:
            break
    
    return organization
def findOrganization(request,organization_id=None):
    # Business Logic 
    # A: Find Organization through Organization or Member_User 
    # B: then find if it has parent so find parent through three levels grand father organization (org.org.org)
    if organization_id==None:
        org=Organization.objects.filter(owner=request.user)
    else:
        org=Organization.objects.filter(id=int(organization_id))
    # sub_org=Sub_Organization.objects.filter(user=request.user)
    # member=Member_User.objects.filter(user=request.user)
    # print(" org ",org," member ",member)
    if org.count()>0:
        self_organization=org[0] 
        store=Store.objects.get(organization=self_organization)
        parent_organization=top_parent(self_organization)
        # print('(self_organization,parent_organization) ',self_organization,' ',parent_organization)
        return (self_organization,parent_organization,store)
    # elif sub_org.count()>0:
    #     org=sub_org[0].owner
    #     return org
    # elif member.count()>0:
    #     self_organization=member[0].organization
    #     parent_organization=top_parent(self_organization)
    #     return (self_organization,parent_organization)
    # else:
    return (None,None,None)
