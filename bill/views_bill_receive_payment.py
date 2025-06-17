from django.http import HttpResponse
from jalali_date import date2jalali
from django.template import loader  
from django.contrib.auth.decorators import login_required
from product.models import Store
from common.organization import find_organization
from common.date import handle_day_out_of_range
from configuration.models import Organization
from configuration.models import *
from datetime import datetime
from django.contrib import messages
from .models import Bill,Bill_Description,Bill_Receiver2
from django.forms.models import model_to_dict
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .forms import Bill_Form
from django.db.models import Q
from .views_bill import get_opposit_bill

@login_required(login_url='/admin')
def bill_form(request):
    template=loader.get_template('bill/bill_form_receive_payment.html')
    date = date2jalali(datetime.now())
    year=date.strftime('%Y')
    (self_organization,parent_organization,store)=find_organization(request)
    # print('self_organization ',self_organization,' parent_organization ',parent_organization)
    form=Bill_Form()
    # context={}
    form.fields['date'].initial=date
    # bill_no=getBillNo(request,parent_organization.id,'PURCHASE')
    context={
        'form':form,
        'organization':parent_organization,
        # 'rcvr_orgs':Organizations.objects.all(),
        'stores':Store.objects.filter(Q(organization=parent_organization)|Q(organization__parent=parent_organization)),
        # 'bill_no':bill_no,
        'date':date,
    } 
    
    return HttpResponse(template.render(context,request))


@login_required(login_url='/admin')
@api_view(['POST','PUT'])
def bill_insert(request):  
    context={}    
    print(".request.data ",request.data)
    ########################################## Bill input taking############################
    bill_no=int(request.data.get("bill_no",None))  
    id=request.data.get("id")
    date=request.data.get("date")
    year=date.split("-")[0]
    status=int(request.data.get("status",0))
    ############before request.data  and request.data.getlist
    store=int(request.data.get("store",0))
    store_query=Store.objects.filter(id=store)
    
    bill_receiver2_store=int(request.data.get("bill_receiver2_store",0))
    bill_receiver2_store_query=Store.objects.filter(id=bill_receiver2_store)
    print("bill_receiver2_store id",bill_receiver2_store)
    if store_query.count()>0:
        store=store_query[0] 
    if bill_receiver2_store_query.count()>0:
        bill_receiver2_store=bill_receiver2_store_query[0]
    # print("bill_receiver2_store ",bill_receiver2_store)
    # return Response({"message":"test","ok":False})
    organization=request.data.get("organization")
    organization=Organization.objects.get(id=int(organization))
    (self_organization,parent_organization,store)=find_organization(request)
    bill_type=request.data.get("bill_type",None)
    creator=request.user
    total=request.data.get("total",0)
    if total=='' or total=="" or total==None:
        total=0
    payment=request.data.get("total_payment",0)      
    
    ################## bill_receiver2#######################
    bill_rcvr_org=request.data.get("bill_rcvr_org",None) #id
    try:
        bill_rcvr_org=Organization.objects.get(id=int(bill_rcvr_org))
    except Exception as e:
        return Response({"message":str(e),"ok":False,"data":None,"bill_id":None}) 

    is_approved=request.data.get("is_approved",False)
    if is_approved==1 or is_approved=="1" or is_approved=="on":
        is_approved=True
    else:
        is_approved=False
    approval_date=request.data.get("approval_date",None)
    # print("approval_date ",approval_date)
    try:
        approval_date = date2jalali(datetime.now())
        approval_date=datetime.strptime(date.strftime('%Y-%m-%d'),'%Y-%m-%d')
    except Exception as e:
        date_str=str(date2jalali(datetime.now()))
        date_str=handle_day_out_of_range(date_str)
        approval_date=datetime.strptime(date_str,'%Y-%m-%d')

        
    # approval_user=request.data.get("approval_user")
    print("1status ",status," approval_date=",approval_date," is_approved= ",is_approved)
    if bill_rcvr_org==parent_organization:
        if is_approved or int(status)==1:
            status=1
            approval_user=request.user
            is_approved=True
        elif status==0:
            approval_user=None
            is_approved=False
        else:
            approval_user=request.user
            is_approved=False
    else:
        status=0
        approval_date=None
        approval_user=None
        is_approved=False
    print("2status ",status," approval_date=",approval_date," approval_user ",approval_user," is_approved= ",is_approved)
    #########endof data prepration########
    if id!="" and id!='':
        ###############update#########################
        bill_query=Bill.objects.filter(id=int(id))
        print("update with id== something bill_query.count()==0 ",bill_query.count()==0) 
        if bill_query.count()==0:
            ok=False
            message="The Bill with Id {} not exist ".format(id)
            return Response({"message":message,"ok":ok})
        bill_obj=bill_query[0] 

        query_new_bill=Bill.objects.filter(Q(bill_no=int(bill_no)),Q(year=int(year)),Q(organization=organization),Q(bill_type=bill_type),Q(bill_receiver2__bill_rcvr_org=bill_rcvr_org) )
        #after_update_same_bill_duplicate
        if query_new_bill.count()>0:
            if query_new_bill[0].id!=bill_obj.id:
                message="Bill No {} Already Exists For {} So We Can Update New Features".format(bill_no,bill_obj.year)
                ok=False
                return Response({"message":message,"ok":ok})
        if hasattr(bill_obj,'bill_receiver2'):
            if  bill_obj.bill_receiver2.approval_user!=None or bill_obj.bill_receiver2.is_approved: # it means approved
                message="Bill Id {} is can not be updated it is already approved".format(id)
                ok=False
                return Response({"message":message,"ok":ok})
        # praint(dir(bill_obj))
        previous_bill_type =bill_obj.bill_type
        # print("0 bill_obj.bill_type ",bill_obj.bill_type," previous_bill_obj.bill_type ",previous_bill_obj.bill_type)  
        bill_obj.total=total
        bill_obj.bill_no=bill_no
        bill_obj.payment=payment
        bill_obj.bill_type=bill_type
        bill_obj.profit=0
        # bill_obj.organization=organization   #because organization=find_organization in opposit organization approval will be changed
        ####################### bill_description update bill_receiver2 update####################
        if previous_bill_type!="EXPENSE":
            # bill_description=bill_obj.bill_description
            if hasattr(bill_obj,'bill_receiver2'):
                bill_receiver2=bill_obj.bill_receiver2
        if previous_bill_type!="EXPENSE" and bill_type=="EXPENSE":
            bill_receiver2.delete()
            bill_description.delete()
    else: ############### new insert Bill if not in system#############
        opposit_bill=get_opposit_bill(bill_type)
        # bill_query=Bill.objects.filter(Q(bill_no=int(bill_no)),Q(year=year),Q(Q(bill_type=bill_type),Q(organization=organization)) | Q(Q(bill_type=opposit_bill),Q(bill_receiver2__bill_rcvr_org=organization)))
        bill_query=Bill.objects.filter(Q(bill_no=int(bill_no)),Q(year=int(year)),Q(organization=organization),Q(bill_type=bill_type),Q(bill_receiver2__bill_rcvr_org=bill_rcvr_org) )
      
        if bill_query.count()>0: # if we are not having update then we check if such bill present or not if exists we not enter
            ok=False
            message="The Bill is already in system search for Bill No {} Bill Type {} Year {} ".format(bill_no,bill_type,year)
            return Response({"message":message,"ok":ok})
        bill_obj=Bill(bill_type=bill_type,date=date,year=year,bill_no=bill_no,organization=organization,creator=creator,total=total,payment=payment)
    try:
        bill_obj.save()
        if bill_type!="EXPENSE":  # in expense we do not need bill_description and bill_receiver2
            bill_description_query=Bill_Description.objects.filter(bill=bill_obj)
            bill_receiver2_query=Bill_Receiver2.objects.filter(bill=bill_obj)
            if bill_description_query.count()>0:
                bill_description_query.update(store=store,status=status)
            else:
                bill_description=Bill_Description(bill=bill_obj,store=store,status=status)
                bill_description.save()  
            if bill_receiver2_query.count()>0:
                bill_receiver2_query.update(bill_rcvr_org=bill_rcvr_org,is_approved=is_approved,approval_date=approval_date,approval_user=approval_user,store=bill_receiver2_store)
            else:
                bill_receiver2=Bill_Receiver2(bill=bill_obj,bill_rcvr_org=bill_rcvr_org,is_approved=is_approved,approval_date=approval_date,approval_user=approval_user,store=bill_receiver2_store)
                bill_receiver2.save()  
        ok=True
        message="bill No {} Successfully Insert".format(bill_no)
    except Exception as e:
        ok=False
        message=str(e)
        print("e ",e)
        return Response({"message":message,"ok":ok})
    ######################## if item_name total_amount is < payment and payment is more then reject ############ 
    if ok==False:
        messages.error(request,message)
    else:  
        messages.success(request,message)
    return Response({"message":message,"ok":ok,"data":model_to_dict(bill_obj),"bill_id":bill_obj.id})    

