
from django.db.models import Sum
from django.db import transaction
from django.http import HttpResponse, JsonResponse
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
from django.db.models import Sum, Q
from django.template import loader


def _wants_json(request):
    accept = request.headers.get('Accept', '')
    requested_with = request.headers.get('X-Requested-With', '')
    return 'application/json' in accept or requested_with == 'XMLHttpRequest'


def _api_success(request, message, redirect_url=None, data=None):
    if _wants_json(request):
        payload = {'success': True, 'message': message}
        if redirect_url:
            payload['redirect_url'] = redirect_url
        if data:
            payload.update(data)
        return JsonResponse(payload)
    messages.success(request, message)
    return redirect(redirect_url or '/configuration/organization/')


def _api_error(request, message, status_code=400, redirect_url=None, data=None):
    if _wants_json(request):
        payload = {'success': False, 'message': message, 'error': message}
        if data:
            payload.update(data)
        return JsonResponse(payload, status=status_code)
    messages.error(request, message)
    return redirect(redirect_url or '/configuration/organization/form/')

@login_required
@api_view(('GET','DELETE'))
def rcvr_org_show(request,id="all"):
    """
    API endpoint for bill_rcvr_org dropdown.
    Returns all organizations for the receiver dropdown. The bill form filters
    out the currently selected creator organization.
    """
    # if request.type=="DELETE":
    if id=="all":
        query_set = Organization.objects.all().order_by('-pk')
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
    if request.method != 'DELETE':
        return _api_error(request, 'Invalid request method.', status_code=405)
    if id is None:
        return _api_error(request, 'No organization was selected.', status_code=400)
    if not request.user.is_superuser:
        return _api_error(request, 'Only admin can delete an organization.', status_code=403)

    query = Organization.objects.filter(id=int(id))
    if not query.exists():
        return _api_error(request, f'No organization with id {id} was found.', status_code=404)

    organization = query.first()
    organization_name = organization.name
    delete_file(organization, 'img')
    query.delete()
    return _api_success(
        request,
        f'Organization "{organization_name}" deleted successfully.',
        redirect_url='/configuration/organization/'
    )
@login_required(login_url='/admin')
def form(request,id=None):
    context={}
    if id!=None:
        organization=Organization.objects.get(id=int(id))
        context['organization']=organization
        context['id']=int(id)
        # If the request expects JSON (called via fetch for edit), return organization data
        accept = request.META.get('HTTP_ACCEPT', '')
        if 'application/json' in accept or request.headers.get('Accept', '').find('application/json') != -1:
            data = {
                'id': organization.id,
                'name': organization.name,
                'owner': organization.owner.username if organization.owner else None,
                'email': organization.owner.email if organization.owner else '',
                'type': organization.organization_type,
                'location': organization.location.id if organization.location else None,
                'is_active': organization.is_active,
            }
            return JsonResponse({'success': True, 'data': data})
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
    # Use safe accessors so missing fields result in a 400 response instead of an exception
    owner = request.data.get('owner', '')
    text = ""
    for i in str(owner).split():
        text = text + i
    owner = text
    password = request.data.get('password', '')
    last_name = request.data.get('type', '')
    organization_type = request.data.get('type', '')
    email = request.data.get('email', '')
    name = (request.data.get('name') or '').strip()
    location_id = request.data.get('location')  # location id

    # Basic required-field validation: return 400 when required fields are missing
    if not name or not location_id:
        return _api_error(request, 'Organization name and location are required.', status_code=400)
    if not owner:
        return _api_error(request, 'Owner username is required.', status_code=400)
    if (id == '' or id == 'None' or id is None) and not password:
        return _api_error(request, 'Password is required for a new organization owner.', status_code=400)
    try:
        location=Location.objects.get(id=int(location_id))
        # print("location ",location)
    except Exception as e:
        return _api_error(request, f'Invalid location: {e}', status_code=400)
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
        org_query=Organization.objects.filter(name__iexact=name)
        if org_query.count()==0:
            try:
                owner_user, created = User.objects.get_or_create(
                    username=owner,
                    defaults={
                        'first_name': name,
                        'last_name': last_name,
                        'email': email,
                        'is_staff': True,
                        'is_active': is_active,
                    }
                )
                existing_owner_org = Organization.objects.filter(owner=owner_user).first()
                if existing_owner_org:
                    return _api_error(
                        request,
                        f'Owner username "{owner}" is already assigned to organization "{existing_owner_org.name}".',
                        status_code=400
                    )
                owner_user.first_name = name
                owner_user.last_name = last_name
                owner_user.email = email
                owner_user.is_staff = True
                owner_user.is_active = is_active
                group_query=Group.objects.filter(name=group)   
                if group_query.count()>0:
                    group_obj=group_query[0]
                else:
                    group_obj=Group.objects.create(name=group)   
                owner_user.groups.add(group_obj)
                owner_user.set_password(password)
                owner_user.save()
                org=Organization(owner=owner_user,name=name,location=location,is_active=is_active,created_date=created_date,img=img,organization_type=organization_type )
                org.save()
                
                for admin in User.objects.filter(is_superuser=True):
                    adm_org_c,created=OrganizationUser.objects.get_or_create(user=admin, organization=org,role="superuser")
                stock_query=Stock.objects.filter(organization=org)
                if stock_query.count()==0:
                    stock=Stock(organization=org,current_amount=0)
                    stock.save()
                return _api_success(
                    request,
                    f'Organization "{org.name}" successfully created.',
                    redirect_url='/configuration/organization/',
                    data={'organization_id': org.id}
                )
            except Exception as e:
                return _api_error(request, 'We could not create organization: '+str(e), status_code=500)
        else:
            org=org_query[0]
            return _api_error(
                request,
                'We already have organization "{}"; a duplicate cannot be created.'.format(org.name),
                status_code=400,
                redirect_url='/configuration/organization/form/'+str(org.id)
            )
    else: # step 2 update user and org
        org_query=Organization.objects.filter(id=int(id))  
        if org_query.count()>0:
            org=org_query[0]    
            owner_obj=org.owner 
            duplicate_org = Organization.objects.filter(name__iexact=name).exclude(id=org.id).first()
            if duplicate_org:
                return _api_error(
                    request,
                    f'Organization name "{name}" is already used by another organization.',
                    status_code=400
                )
            duplicate_user = User.objects.filter(username=owner).exclude(id=owner_obj.id).first()
            if duplicate_user:
                return _api_error(
                    request,
                    f'Username "{owner}" is already used by another user.',
                    status_code=400
                )
            owner_obj.first_name=name
            owner_obj.username=owner
            owner_obj.last_name=last_name
            owner_obj.email=email
            owner_obj.is_active=is_active
            group_obj=Group.objects.get(name=group)   
            owner_obj.groups.add(group_obj)
            if password:
                owner_obj.set_password(password)
            owner_obj.save() 
            
            if img!=None:
                ok,message=delete_file(org_query[0],'img')
                org.img = img
            org.owner = owner_obj
            org.name = name
            org.location = location
            org.organization_type = organization_type
            org.is_active = is_active
            org.save()
            return _api_success(
                request,
                f'Organization "{org.name}" successfully updated.',
                redirect_url='/configuration/organization/',
                data={'organization_id': org.id}
            )
        else:
            return _api_error(
                request,
                'This organization was not found. Please create it first.',
                status_code=404
            )
