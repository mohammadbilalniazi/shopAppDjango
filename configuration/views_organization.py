
from django.db.models import Sum
from django.db import transaction
from django.http import HttpResponse
from jalali_date import date2jalali
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from configuration.models import *
from django.contrib.auth.models import User
from datetime import datetime
from .serializer import OrganizationSerializer
from django.contrib import messages
from .models import Organization
from user.models import OrganizationUser
from rest_framework.response import Response
from django.shortcuts import redirect
from product.models import Stock
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from common.file_handle import delete_file
from common.organization import find_userorganization
import random
from django.db.models import Sum, Q
from django.template import loader

@login_required
@api_view(('GET','DELETE'))
def rcvr_org_show(request,id="all"):
    """
    API endpoint for bill_rcvr_org dropdown.
    Returns:
    - For superadmin: ALL organizations
    - For regular users: ALL organizations EXCEPT their own organization
    """
    # if request.type=="DELETE":
    if id=="all":
        self_organization,user_orgs = find_userorganization(request)
        
        # Superadmin sees all organizations
        if request.user.is_superuser:
            query_set = Organization.objects.all().order_by('-pk')
        # Regular users see all organizations except their own
        elif self_organization is not None:
            query_set = Organization.objects.all().exclude(id=self_organization.id).order_by('-pk')
        else:
            # User with multiple orgs - exclude all their organizations
            user_org_ids = user_orgs.values_list('id', flat=True)
            query_set = Organization.objects.all().exclude(id__in=user_org_ids).order_by('-pk')
        
        print("rcvr_org_show query set ", query_set)
    else:
        query_set=Organization.objects.filter(name=str(id))
    serializer=OrganizationSerializer(query_set,many=True)
    return Response(serializer.data)


@login_required
@api_view(('GET',))
def user_organizations(request):
    """
    API endpoint for organization dropdown.
    Returns:
    - For superadmin: ALL organizations
    - For regular users: ONLY their accessible organization(s)
    """
    self_organization, user_orgs = find_userorganization(request)
    
    # Superadmin sees all organizations
    if request.user.is_superuser:
        query_set = Organization.objects.all().order_by('-pk')
    # Regular users see only their organization(s)
    else:
        query_set = user_orgs.order_by('-pk')
    
    print("user_organizations query set ", query_set)
    serializer = OrganizationSerializer(query_set, many=True)
    return Response(serializer.data)

@login_required(login_url='/admin')
def show(request):
    q = request.GET.get('q', '')
    organizations = Organization.objects.all().order_by("-pk")

    if q:
        organizations = organizations.filter(Q(name__icontains=q))

    paginator = Paginator(organizations, per_page=10)
    page = request.GET.get('page') or 1
    organizations_page = paginator.get_page(page)

    # aggregate totals per organization
    totals = {}
    for org in organizations_page:
        receive_amount = (
            org.assetbillrcvrorg.filter(bill_type='RECEIVEMENT')
            .aggregate(total=Sum('total'))['total'] or 0
        )
        pay_amount = (
            org.assetbillorganization.filter(bill_type='PAYMENT')
            .aggregate(total=Sum('total'))['total'] or 0
        )
        sell_amount = (
            org.assetbillorganization.filter(bill_type='SELLING')
            .aggregate(total=Sum('total'))['total'] or 0
        )
        purchase_amount = (
            org.assetbillrcvrorg.filter(bill_type='PURCHASE')
            .aggregate(total=Sum('total'))['total'] or 0
        )
        sell_amount_received_payment = (
            org.assetbillorganization.filter(bill_type='SELLING')
            .aggregate(total=Sum('payment'))['total'] or 0
        )
        purchase_amount_payed_payment = (
            org.assetbillorganization.filter(bill_type='PURCHASE')
            .aggregate(total=Sum('payment'))['total'] or 0
        )
        totals[org.id] = {
            'receive_amount': receive_amount+sell_amount_received_payment,
            'pay_amount': pay_amount+purchase_amount_payed_payment,
            'sell_amount': sell_amount,
            'purchase_amount': purchase_amount,
        }

    template = loader.get_template('configurations/organization_show.html')
    return HttpResponse(template.render({
        'organizations': organizations_page,
        'totals': totals,
        'request': request,
    }, request))

@login_required()
def delete(request,id=None):
    print("delete is called ","id!=None ",id!=None," id ",id)
    if id!=None:
        query=Organization.objects.filter(id=int(id))
        print("query ",query," request.user.is_superuser ",request.user.is_superuser)
        if not request.user.is_superuser:
            messages.error(request,"Admin Can only Delete The  Organization ")
        elif query.count()>0:
            ok,message=delete_file(query[0],'img')
            messages.success(request,"Organization {} is deleted successfully ".format(id))
            query.delete()
        else:
            messages.error(request,"No Organization With {} id ".format(id))
    else:
        messages.error(request,"No Organization specific organization is selected ")
    return redirect("/conifgurations/organization/")
@login_required(login_url='/admin')
def form(request,id=None):
    print("organization id ",id)
    context={}
    if id!=None:
        organization=Organization.objects.get(id=int(id))
        print('organization is_active',organization.is_active)
        context['organization']=organization
        context['id']=int(id)
    template=loader.get_template('configurations/organization_form.html')
    
    self_organization, user_orgs = find_userorganization(request)

    # print("self_organization ",self_organization)
    context['self_organization']=self_organization
    context['parent_organization']=None  # Deprecated field
    # HttpResponse("TES") 
    context['created_date']=date2jalali(datetime.now()) 
    return HttpResponse(template.render(context,request))

@login_required(login_url='/admin')
@api_view(('POST',))
@transaction.atomic
def create(request,id=None):
    ##################################################data gathering#############################
    owner=request.data['owner']
    text=""
    for i in owner.split():
        text=text+i
    owner=text
    password=request.data['password']
    last_name=request.data['type']
    organization_type=request.data['type']
    email=request.data['email']
    name=request.data['name']
    location_id=request.data['location'] # location id
    try:
        location=Location.objects.get(id=int(location_id))
        # print("location ",location)
    except Exception as e:
        messages.error(request,str(e))
        return redirect('/configuration/organization/form/')
    try:
        is_active=request.data.get('is_active',False)
        if is_active=='on':
            is_active=True
        else:
            is_active=False
    except:
        is_active=False  

    if 'img' in request.FILES:
        img=request.FILES['img']
    else:
        img=None
    created_date=datetime.strptime(datetime.now().strftime("%Y-%m-%d"),"%Y-%m-%d") 
    created_date=date2jalali(created_date)
    created_date=datetime.strptime(created_date.strftime("%Y-%m-%d"),"%Y-%m-%d")
    
    # Set group to organization (parent functionality removed)
    group = 'organization'
    #############################################end data get#############################
    
    if id=='' or id=='None' or id==None: # 1 step create
        org_query=Organization.objects.filter(name=name)
        print(f"org_query {org_query}")
        if org_query.count()==0:
            try:
                # if owner_user_query.count()==0:
                user_query= User.objects.filter(username=owner)
                print(f"user_query {user_query}")
                if user_query.count()==0:
                    owner=owner+str(random.randint(2,1000))
                    owner,created = User.objects.get_or_create(username=owner,first_name=name,last_name=last_name,email=email,is_staff=True,is_active=is_active) 
                else:
                    owner=user_query[0]
                group_query=Group.objects.filter(name=group)   
                if group_query.count()>0:
                    group_obj=group_query[0]
                else:
                    group_obj=Group.objects.create(name=group)   
                owner.groups.add(group_obj)
                owner.set_password(password)
                org=Organization(owner=owner,name=name,location=location,is_active=is_active,created_date=created_date,img=img,organization_type=organization_type )
                org.save()
                
                for admin in User.objects.filter(is_superuser=True):
                    adm_org_c,created=OrganizationUser.objects.get_or_create(user=admin, organization=org,role="superuser")
                    print(f"adm_org_c {adm_org_c}")
                stock_query=Stock.objects.filter(organization=org)
                if stock_query.count()==0:
                    stock=Stock(organization=org,current_amount=0)
                    stock.save()
                messages.success(request,'Organization {} successfully created '.format(org.name))
                return redirect('/configuration/organization/form/'+str(org.id))
            except Exception as e:
                messages.error(request,' we could not create organization '+str(e))
                return redirect('/configuration/organization/form/')
        else:
            org=org_query[0]
            messages.error(request,'we already have {} organization we cant create new'.format(org.name))
            return redirect('/configuration/organization/form/'+str(org.id))
    else: # step 2 update user and org
        org_query=Organization.objects.filter(id=int(id))  
        if org_query.count()>0:
            org=org_query[0]    
            owner_obj=org.owner 
            owner_obj.first_name=name
            owner_obj.username=owner
            owner_obj.last_name=last_name
            owner_obj.email=email
            owner_obj.is_active=is_active
            group_obj=Group.objects.get(name=group)   
            owner_obj.groups.add(group_obj)
            owner_obj.set_password(password)
            owner_obj.save() 
            
            if img!=None:
                ok,message=delete_file(org_query[0],'img')
            org_query.update(owner=owner_obj,name=name,location=location,organization_type=organization_type,img=img,is_active=is_active)
            messages.success(request,'Organization {} successfully updated '.format(org.name))
            return redirect('/configuration/organization/form/'+str(org_query[0].id)) 
        else:
            messages.error(request,' we do not have {} organization for updation so kindly create organization'.format(org.name))
            return redirect('/configuration/organization/form/') 