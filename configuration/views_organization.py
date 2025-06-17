
from django.db.models import Sum
from django.http import HttpResponse
from jalali_date import date2jalali
from django.template import loader 
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from product.models import Store
from configuration.models import *
from django.contrib.auth.models import User
from datetime import datetime
from .serializer import OrganizationSerializer
from django.contrib import messages
from .models import Organization
from django.forms.models import model_to_dict
from rest_framework.response import Response
from django.shortcuts import redirect
from product.models import Stock
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from common.file_handle import delete_file
from common.organization import find_organization
import random

@login_required
@api_view(('GET','DELETE'))
def rcvr_org_show(request,id="all"):
    # print("vendors_show id=",id)
    # if request.type=="DELETE":
    if id=="all":
        (self_organization,parent_organization,store)=find_organization(request)
        if parent_organization!=None and self_organization!=None:
            query_set=Organization.objects.all().exclude(id=parent_organization.id).exclude(parent=self_organization).order_by('-pk')
        elif self_organization!=None:
            query_set=Organization.objects.all().exclude(id=self_organization.id).order_by('-pk')
        else:
            query_set=Organization.objects.all().order_by('-pk')
        print("query set ",query_set)
    else:
        query_set=Organization.objects.filter(name=str(id))

    serializer=OrganizationSerializer(query_set,many=True)
    # print("serialzier ",serializer)
    return Response(serializer.data)
@login_required(login_url='/admin') 
def show(request,page=None):
    print("organization id =",page)
    context={}
    organizations=Organization.objects.all().order_by("-pk")
    template=loader.get_template('configurations/organization_show.html')
    organizations=Paginator(organizations,per_page=10)
    if page==None:
        page=1
    organizations=organizations.get_page(page)
    # print("organizations ",organizations.next_page_number())
    context['organizations']=organizations
    return HttpResponse(template.render(context,request))
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
    
    (self_organization,parent_organization,store)=find_organization(request)
    print("self_organization ",self_organization," parent_organization ",parent_organization)
    context['self_organization']=self_organization
    context['parent_organization']=parent_organization
    # HttpResponse("TES") 
    context['created_date']=date2jalali(datetime.now()) 
    return HttpResponse(template.render(context,request))

@login_required(login_url='/admin')
@api_view(('POST',))
def create(request,id=None):
    parent=request.data['parent']
    ##################################################data gathering#############################
    if parent=='None' or parent=='':
        parent=None
        group='organization'
    else:
        group='branch'
        try:
            parent=Organization.objects.get(id=int(parent))
        except:
            messages.error(request,'There Was Technical Error searching parent Organization')
            return redirect('/configuration/organization/form/')
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
    # print("img ",img," ",request.FILES )
    # return HttpResponse('tes2')   

    created_date=datetime.strptime(datetime.now().strftime("%Y-%m-%d"),"%Y-%m-%d") 
    created_date=date2jalali(created_date)
    created_date=datetime.strptime(created_date.strftime("%Y-%m-%d"),"%Y-%m-%d")
    #############################################end data get#############################
    #1 step(create): check org : 1. check update key ==> a. update id==None  then create owner user then create org  then save().
    #2 step(update): query_org find org and update and find owner through org and update then save()
    
    # print("created_date ",type(created_date)," id==None ",id==None)
    # return HttpResponse('tes')
   
    if id=='' or id=='None' or id==None: # 1 step create
        org_query=Organization.objects.filter(name=name)
        owner_user_query=User.objects.filter(username=owner)
        if org_query.count()==0:
            try:
                # if owner_user_query.count()==0:
                user_query= User.objects.filter(username=owner)
                if user_query.count()>0:
                    # owner=user_query[0]
                    owner=owner+str(random.randint(2,1000))
                else:
                    owner = User.objects.create_user(username=owner,first_name=name,last_name=last_name,email=email,is_staff=True,is_active=is_active) 
                group_query=Group.objects.filter(name=group)   
                if group_query.count()>0:
                    group_obj=group_query[0]
                else:
                    group_obj=Group.objects.create(name=group)   
                owner.groups.add(group_obj)
                owner.set_password(password)
                org=Organization(parent=parent,owner=owner,name=name,location=location,is_active=is_active,created_date=created_date,img=img,organization_type=organization_type )
                org.save()
                store_name=name+" "+"store"
                organization_default_store=Store.objects.filter(organization=org)
                if organization_default_store.count()==0:
                    store=Store(organization=org,name=store_name)
                    try:
                        store.save()
                    except:
                        store.name=name
                        store.save()

                stock_query=Stock.objects.filter(store=store)
                if stock_query.count()==0:
                    stock=Stock(store=store,current_amount=0)
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
        # print("created_date ",type(created_date)," org_query ",org_query)
        # return HttpResponse('tes')
      
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
            org_query.update(parent=parent,owner=owner_obj,name=name,location=location,organization_type=organization_type,img=img,is_active=is_active)
            messages.success(request,'Organization {} successfully updated '.format(org.name))
            # org_query[0].save()
            store_name=name+" "+"store"
            if org_query[0].store_set.count()==0:
                store=Store(organization=org,name=store_name)
                store.save()
            return redirect('/configuration/organization/form/'+str(org_query[0].id)) 
        else:
            messages.error(request,' we do not have {} organization for updation so kindly create organization'.format(org.name))
            return redirect('/configuration/organization/form/') 
    return redirect('/configuration/organization/form/')