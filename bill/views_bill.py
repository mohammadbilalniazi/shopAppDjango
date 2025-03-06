from django.db.models import Sum
from django.http import HttpResponse
from jalali_date import date2jalali
from django.template import loader  
from django.contrib.auth.decorators import login_required
from product.models import Product,Unit,Store
from common.organization import findOrganization
from common.date import handle_day_out_of_range
from configuration.models import *
from datetime import datetime
from django.contrib import messages
from .models import Bill, Bill_detail,Bill_Description,Bill_Receiver2
from django.forms.models import model_to_dict
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .forms import Bill_Form
from django.db.models import Q,Max
from django.db import transaction
from .serializer import Bill_search_Serializer
import re
from rest_framework.pagination import PageNumberPagination

def getBillNo(request,organization_id,bill_rcvr_org_id,bill_type=None):
    date = date2jalali(datetime.now()) 
    year=date.strftime('%Y')
    (self_organization,parent_organization,store)=findOrganization(request,organization_id)
    print("self_organization , parent_organization ",self_organization,parent_organization)
    (bill_rcvr_org,parent_bill_rcvr_org,store)=findOrganization(request,bill_rcvr_org_id)
    opposit_bill=get_opposit_bill(bill_type)
    print("opposit_bill ",opposit_bill)
    if bill_type=="EXPENSE":
        bill_query=Bill.objects.filter(year=int(year),bill_type=bill_type,organization=parent_organization)
    else:    
        bill_query=Bill.objects.filter(Q(year=int(year)),Q(Q(bill_type=bill_type),Q(organization=parent_organization),Q(bill_receiver2__bill_rcvr_org=parent_bill_rcvr_org)) | Q(Q(bill_type=opposit_bill),Q(bill_receiver2__bill_rcvr_org=parent_organization),Q(organization=parent_bill_rcvr_org)))

    if bill_query.count()>0:  
        bill=bill_query[0] 
        bill_no=bill_query.aggregate(Max('bill_no'))['bill_no__max']+1
    else:
        bill_no=1
    return bill_no

def handle_difference_profit_loss(bill=None):
    if bill!=None:
        bill.profit=0
        bill.save()
        print(f"bill ${bill.bill_no} profit ${bill.profit}")
        for bill_detail in bill.bill_detail_set.all():
            print(f"{bill_detail.profit}")
            if bill.bill_type=='SELLING':
                purchased_price=bill_detail.product.product_detail.purchased_price
                if purchased_price==None:
                    purchased_price=0 
                print("#######purchased_price",purchased_price,"bill_detail.item_price",bill_detail.item_price) 
                profit=(float(bill_detail.item_price)-float(purchased_price))*(float(bill_detail.item_amount)-float(bill_detail.return_qty))
                print("#######profit",profit)
                ok=handle_profit_loss(bill_detail,profit,operation='INCREASE')
                print(f"######update bill profit {bill.profit} bill_detail.profit {bill_detail.profit} ")
    else:
        pass 
    return 


@api_view(("GET",))
def select_bill_no(request,organization_id,bill_rcvr_org_id,bill_type=None):
    return Response({"bill_no":getBillNo(request,organization_id,bill_rcvr_org_id,bill_type)})

@login_required(login_url='/admin')
def bill_show(request,bill_id=None):
    print("bill_id =",bill_id)
   
    context={}
    form=Bill_Form()
    context['form']=form
    (self_organization,parent_organization,store)=findOrganization(request)
    
    if bill_id==None :
        context['bills']=Bill.objects.all().order_by("-pk")
        context['rcvr_orgs']=Organization.objects.all() 
        org_store_query=Store.objects.filter(Q(organization=parent_organization)|Q(organization__parent=parent_organization))
        context['stores']=org_store_query
        template=loader.get_template('bill/bill_show.html')
    else:
        bill=Bill.objects.get(id=int(bill_id))
        form.fields['date'].initial=str(bill.date) #before  hawala.mustharadi_file
        # print("bill_obj",bill_obj.bill_detail_set.all().order_by("id"))
        context['bill_detail_set']=bill.bill_detail_set.all().order_by("id")
        context['bill']=bill
        #handle_difference_profit_loss(bill)        
        if bill.bill_type=='PAYMENT' or bill.bill_type=='RECEIVEMENT':
            template=loader.get_template('bill/bill_form_receive_payment.html')
        else:
            template=loader.get_template('bill/bill_form.html')
            # context['products']=Product.objects.filter(product_detail__organization=bill.organization)
            context['products']=Product.objects.all()
        context['units']=Unit.objects.all()
        if bill.organization==parent_organization or request.user.is_superuser:                 
            context['rcvr_orgs']=Organization.objects.all().order_by("-pk") 
            if request.user.is_superuser:
                context['organizations']=Organization.objects.all() 
            else:
                context['organizations']=Organization.objects.filter(id=parent_organization.id)
        elif hasattr(bill,'bill_receiver2'):
            if bill.bill_receiver2.bill_rcvr_org==parent_organization:
                #  bill_obj.bill_receiver2:
                context['rcvr_orgs']=Organization.objects.filter(id=parent_organization.id)
        if bill.bill_type!="EXPENSE":
            org_store_query=Store.objects.filter(Q(organization=bill.organization)|Q(organization__parent=bill.organization))
            context['stores']=org_store_query
            bill_rcvr_org_store_query=Store.objects.filter(organization=bill.bill_receiver2.bill_rcvr_org)
            context['bill_rcvr_org_stores']=bill_rcvr_org_store_query
      
        # return HttpResponse("test")
    # print('(self_organization,parent_organization) ',self_organization,' ',parent_organization)
    context['organization']=parent_organization
    return HttpResponse(template.render(context,request))



@login_required(login_url='/admin')
def bill_detail_show(request,bill_id=None):
    # print("bill_id =",bill_id)
    context={}
    form=Bill_Form()
    context['form']=form
    (self_organization,parent_organization,store)=findOrganization(request)
    if bill_id==None :
        context['bills']=Bill.objects.all().order_by("-pk")
        context['rcvr_orgs']=Organization.objects.all().order_by("-pk")
        template=loader.get_template('bill/bill_show.html')
    else:
        # context['detail_flag']=True
        template=loader.get_template('bill/bill_form.html')
        bill_obj=Bill.objects.get(id=int(bill_id))
        form.fields['date'].initial=str(bill_obj.date) #before  hawala.mustharadi_file
        context['bill']=bill_obj
        if bill_obj.bill_type=='PAYMENT' or bill_obj.bill_type=='RECEIVEMENT':
            template=loader.get_template('bill/bill_form_receive_payment.html')
        context['products']=Product.objects.filter(product_detail__organization=bill_obj.organization)
        context['units']=Unit.objects.all()
        if bill_obj.organization==parent_organization:                 
            context['rcvr_orgs']=Organization.objects.all().order_by("-pk")     
        elif hasattr(bill_obj,'bill_receiver2'):
            if bill_obj.bill_receiver2.bill_rcvr_org==parent_organization:
                #  bill_obj.bill_receiver2:
                context['rcvr_orgs']=Organization.objects.filter(id=parent_organization.id)
        if bill_obj.bill_type!="EXPENSE":
            org_store_query=Store.objects.filter(organization=bill_obj.organization)
            bill_rcvr_org_store_query=Store.objects.filter(organization=bill_obj.bill_receiver2.bill_rcvr_org)
        else:
            org_store_query=Store.objects.filter(organization=bill_obj.organization)
        context['stores']=org_store_query
        context['bill_rcvr_org_stores']=bill_rcvr_org_store_query
        # return HttpResponse("test")
    print('(self_organization,parent_organization) ',self_organization,' ',parent_organization)
    context['organization']=parent_organization
    return HttpResponse(template.render(context,request))


@login_required(login_url='/admin')
def bill_delete(request,id=None):
    context={}
    (self_organization,parent_organization,store)=findOrganization(request)
    if id!=None:
        context['detail']=True
        bill_query=Bill.objects.filter(id=int(id))
        if bill_query.count()>0:
            bill_obj=bill_query[0]
            if bill_obj.organization!=parent_organization:
                message="The Organization {} can not delete the bill id {} because it is not creator of bill".format(parent_organization.name,id)
                messages.error(request,message=message)
                return bill_show(request,bill_id=id)
            bill_obj.delete()
            message="Bill Id {} is Successfully deleted".format(id)
            messages.success(request,message=message)
        else:
            message="Bill Id {} Not Present".format(id)
            messages.error(request,message=message)
    else:
        message="Bill Id Not Present"
        messages.error(request,message=message)
    return bill_show(request,bill_id=None)

@login_required(login_url='/admin')
@api_view(['GET','DELETE'])
def bill_detail_delete(request,bill_detail_id=None):
    context={} 
    (self_organization,parent_organization,store)=findOrganization(request)
    message=""
    is_success=False
    if bill_detail_id!=None:
        context['detail']=True
        bill_detail_query=Bill_detail.objects.filter(id=int(bill_detail_id))
        if bill_detail_query.count()>0:      
            bill_detail=bill_detail_query[0]
            bill=bill_detail.bill
            previous_bill_type=bill.bill_type
            if bill.organization!=parent_organization:
                message="The Organization {} can not delete the bill id {} because it is not creator of bill".format(parent_organization.name,id)
                return Response({"Message":message,"is_success":False})
            if bill.bill_receiver2.approval_user!=None: # it means approved
                return Response({"Message":'it is approved',"is_success":False})
            if len(bill.bill_detail_set.all())==1:
                bill_delete(request,int(bill.id))
                message="The Organization {} can not delete the bill id {} because it is not creator of bill".format(parent_organization.name,id)
                return Response({"Message":message,"is_success":False})
            previous_item_amount=bill_detail.item_amount
            previous_return_qty=bill_detail.return_qty
            item_price=bill_detail.item_price
            deleted_amount=(previous_item_amount-previous_return_qty)*item_price
            total=bill.total
            remaining=total-deleted_amount
            if previous_bill_type=="SELLING":
                ok=handle_profit_loss(bill_detail,bill_detail.profit,operation='DECREASE')
                            
            try:
                bill_detail.delete()
                bill.total=remaining
                bill.save()
                message="Bill Detail Id {} is Successfully deleted and deleted amount {} and current total bill amount is {}".format(bill_detail_id,deleted_amount)
            except Exception as e:
                message=str(e)
            # message="Bill Detail Id {} is Successfully deleted and deleted amount {} and current total bill amount is {}".format(bill_detail_id,deleted_amount)
            # status=status.HTTP_200_OK            
            print("message ",message)
            is_success=True
            messages.success(request,message=message)
        else:
            message="Bill Detail Id {} is not deleted".format(bill_detail_id)
            messages.error(request,message=message)
            # status=status.HTTP_204_NO_CONTENT
            print("message ",message)
            is_success=False
    return Response({"Message":message,"is_success":is_success})

@login_required(login_url='/admin')
def Bill_form(request):
    template=loader.get_template('bill/bill_form.html')
    date = date2jalali(datetime.now())
    year=date.strftime('%Y')
    (self_organization,parent_organization,store)=findOrganization(request)
    form=Bill_Form()
    context={}
    form.fields['date'].initial=date
    # bill_no=getBillNo(request,parent_organization.id,'PURCHASE')
    if request.user.is_superuser:
        organizations=Organization.objects.all()
    else:
        organizations=Organization.objects.filter(id=parent_organization.id)
    context={
        'form':form,
        'organization':parent_organization,
        'organizations':organizations,
        'stores':Store.objects.filter(Q(organization=parent_organization)|Q(organization__parent=parent_organization) ),
        # 'bill_no':bill_no,
        'date':date,
    } 
    # print("context=",context)
    return HttpResponse(template.render(context,request))

def get_opposit_bill(bill_type):
    opposit_bills={"SELLING":"PURCHASE","PURCHASE":"SELLING","PAYMENT":"RECEIVEMENT","RECEIVEMENT":"PAYMENT","EXPENSE":"EXPENSE"}
    return opposit_bills[bill_type]

def handle_profit_loss(bill_detail,profit,operation='INCREASE'):
    bill=bill_detail.bill
    prev_profit_bill_detail=bill_detail.profit
    prev_bill_profit=bill.profit
    if prev_profit_bill_detail==None:
        prev_profit_bill_detail=0
    if prev_bill_profit==None:
        prev_bill_profit=0

    if operation=='INCREASE':
        bill_detail.profit=prev_profit_bill_detail+profit
        bill.profit=prev_bill_profit+profit
    else:
        bill_detail.profilt=prev_profit_bill_detail-profit
        bill.profilt=prev_bill_profit-profit
    try:
        bill_detail.save()
        bill.save()
        ok=True
    except Exception as e:
        ok=False    
    return ok

@login_required(login_url='/admin')
@api_view(['POST','PUT'])
@transaction.atomic
def Bill_insert(request):  
    ########################################## Bill input taking############################
    bill_no=int(request.data.get("bill_no",None))  
    id=request.data.get("id")
    date=request.data.get("date")
    year=date.split("-")[0]
    print("type of year")
    status=int(request.data.get("status",0))
    ############before request.data  and request.data.getlist
    store=int(request.data.get("store",0))
    store_query=Store.objects.filter(id=store)
    
    bill_receiver2_store=int(request.data.get("bill_receiver2_store",0))
    bill_receiver2_store_query=Store.objects.filter(id=bill_receiver2_store)
    if store_query.count()>0:
        store=store_query[0] 
    if bill_receiver2_store_query.count()>0:
        bill_receiver2_store=bill_receiver2_store_query[0]
    organization=request.data.get("organization")
    organization=Organization.objects.get(id=int(organization))
    (self_organization,parent_organization,_)=findOrganization(request)
    bill_type=request.data.get("bill_type",None)
    creator=request.user
    total=request.data.get("total",0)
    if total=='' or total=="" or total==None:
        total=0
    payment=request.data.get("total_payment",0)      
    ###################bill_detail###############
    product=request.data.get('item_name',0)        #getlist=> get
    item_amount=request.data.get('item_amount',0)#getlist=> get
    unit=request.data.get('unit',None)#getlist=> get
    item_price=request.data.get('item_price',0)#getlist=> get
    return_qty=request.data.get('return_qty',0)#getlist=> get
    bill_detail_id=request.data.get('bill_detail_id',"")#getlist=> get
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
    #print("1status ",status," approval_date=",approval_date," is_approved= ",is_approved)
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
    #########endof data prepration########
    if id!="" and id!='':
        ###############update#########################
        bill_query=Bill.objects.filter(id=int(id))
        bill_obj=bill_query[0] 
        print("update with id== something bill_query.count()==0 ",bill_query.count()==0) 
        if bill_query.count()==0:
            ok=False
            message="The Bill with Id {} not exist ".format(id)
            return Response({"message":message,"ok":ok})
        # bill_query=Bill.objects.filter(Q(bill_no=int(bill_no)),Q(year=int(bill_obj.year)),Q(Q(organization=organization),Q(bill_receiver2__bill_rcvr_org=bill_rcvr_org)) | Q(Q(bill_receiver2__bill_rcvr_org=bill_rcvr_org),Q(organization=organization)))
        bill_query=Bill.objects.filter(Q(bill_no=int(bill_no)),Q(year=int(bill_obj.year)),Q(organization=organization),Q(bill_type=bill_type),Q(bill_receiver2__bill_rcvr_org=bill_rcvr_org) )
        if bill_query.exists() and bill_no!=bill_obj.bill_no: # it means already we have some other bill which has such characters
            if bill_query[0].id!=bill_obj.id:
                message="Bill No {} Already Exists For {} ".format(bill_no,bill_obj.year)
                ok=False
                return Response({"message":message,"ok":ok})
        if hasattr(bill_obj,'bill_receiver2'):
            if bill_obj.bill_receiver2.approval_user!=None or bill_obj.bill_receiver2.is_approved: # it means approved
                message="Bill Id {} is can not be updated it is already approved".format(id)
                ok=False
                return Response({"message":message,"ok":ok})
        bill_obj.total=total
        bill_obj.bill_no=bill_no
        bill_obj.payment=payment
        bill_obj.bill_type=bill_type
        bill_obj.profit=0
    else: ############### new insert Bill if not in system#############
        # opposit_bill=get_opposit_bill(bill_type)
        # bill_query=Bill.objects.filter(Q(bill_no=int(bill_no)),Q(year=year),Q(Q(bill_type=bill_type),Q(organization=organization)) | Q(Q(bill_type=opposit_bill),Q(bill_receiver2__bill_rcvr_org=organization)))
        bill_query=Bill.objects.filter(Q(bill_no=int(bill_no)),Q(year=int(year)),Q(organization=organization),Q(bill_type=bill_type),Q(bill_receiver2__bill_rcvr_org=bill_rcvr_org) )
        if bill_query.count()>0: # if we are not having update then we check if such bill present or not if exists we not enter
            ok=False
            message="The Bill is already in system search for Bill No {} Bill Type {} Year {} ".format(bill_no,bill_type,year)
            return Response({"message":message,"ok":ok})
        bill_obj=Bill(bill_type=bill_type,date=date,year=year,bill_no=bill_no,organization=organization,creator=creator,total=total,payment=payment)
    try:
        bill_obj.save()
        bill_description_query=Bill_Description.objects.filter(bill=bill_obj)
        bill_receiver2_query=Bill_Receiver2.objects.filter(bill=bill_obj)
        if bill_description_query.count()>0:
            bill_description_query.update(store=store,status=status)
        else:
            bill_description=Bill_Description(bill=bill_obj,store=store,status=status)
            bill_description.save()  
        if bill_receiver2_query.count()>0:
            bill_receiver2_query.update(bill_rcvr_org=bill_rcvr_org,is_approved=is_approved,approval_date=approval_date,approval_user=approval_user,store=bill_receiver2_store)
            bill_receiver2=bill_receiver2_query[0]
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
    t=0
    for i in range(len(product)):
        try:
            unit_obj=Unit.objects.get(id=unit[i])
            product_obj=Product.objects.get(id=product[i])
        except Exception as e:
            return Response({"message":str(e),"ok":False})
        # print("product_of_bill_rcvr_org ",product_of_bill_rcvr_org)
        net_amount=float(item_amount[i])-float(return_qty[i]) 
        if bill_detail_id[i]=='':
            bill_detail=Bill_detail(bill=bill_obj,product=product_obj,unit=unit_obj,item_amount=item_amount[i],item_price=item_price[i],return_qty=return_qty[i])     
            try:    
                bill_detail.save()
                if bill_obj.bill_type=='SELLING':
                    purchased_price=product_obj.product_detail.purchased_price
                    if purchased_price==None:
                        purchased_price=item_price[i]-10
                    profit=(float(item_price[i])-float(purchased_price))*net_amount
                    # profit=(float(item_price[i])-float(purchased_price))*(float(item_amount[i])-float(return_qty[i]))
                    ok=handle_profit_loss(bill_detail,profit,operation='INCREASE')
            except Exception as e:
                ok=False
                message=str(e)
        else:       
            bill_detail_query=Bill_detail.objects.filter(id=int(bill_detail_id[i]))
            if bill_detail_query.count()>0:       
                bill_detail=bill_detail_query[0]
                purchased_price=bill_detail.product.product_detail.purchased_price
                bill_detail.bill=bill_obj
                bill_detail.unit=unit_obj
                if product_obj.id==bill_detail.product.id:
                    bill_detail.product=bill_detail.product
                else: 
                    bill_detail.product=product_obj
                bill_detail.item_amount=item_amount[i]
                bill_detail.item_price=item_price[i]
                bill_detail.return_qty=return_qty[i]
                bill_detail.profit=0
                try:        
                    bill_detail.save() 
                    if bill_type=='SELLING':
                        if purchased_price==None:
                            purchased_price=0
                        profit=(float(item_price[i])-float(purchased_price))*net_amount
                        ok=handle_profit_loss(bill_detail,profit,operation='INCREASE')
                except Exception as e:
                    ok=False
                    message=str(e)
                    print("e ",e)

        t=t+net_amount*float(item_price[i])
    if float(t)!=float(total):
        bill_obj.total=float(t)
        bill_obj.save()
    
    if ok==False:
        messages.error(request,message)
    else:  
        messages.success(request,message)
    return Response({"message":message,"ok":ok,"data":model_to_dict(bill_obj),"bill_id":bill_obj.id})    

# def search(request,bill_type,bill_no,bill_rcvr_org,store_id,start_date,end_date,page=None):
@api_view(('POST',)) 
def search(request,page=None):
    bill_type=request.data.get("bill_type",None)
    bill_no=request.data.get("bill_no",None)
    bill_rcvr_org=request.data.get("bill_rcvr_org",None)
    store_id=request.data.get("store_id",None)
    start_date=request.data.get("start_date",None)
    end_date=request.data.get("end_date",None)
    print("#####bill_type ",bill_type,"bill_no ",bill_no," bill_rcvr_org ",bill_rcvr_org," store_id ",store_id," start_date ",start_date," end_date ",end_date)
    start_date=re.sub('\t','',str(start_date))
    end_date=re.sub('\t','',str(end_date))
    
    (self_organization,parent_organization,store)=findOrganization(request)
    query=Bill.objects.filter(Q(date__range=[start_date,end_date]),Q(organization=parent_organization)|Q(bill_receiver2__bill_rcvr_org=parent_organization))
    print("1 query coutn ",query.count())
    if int(bill_no)!=0:
        query=query.filter(bill_no=int(bill_no))
        # print("########bill_no 2",query)
    if bill_type!=None and bill_type!="" and bill_type!="all":
        query=query.filter(
        bill_type=bill_type)
        # print("#############bill_type 2",query)
 
    payment_sum_expense=query.filter(organization=parent_organization,
    bill_type='EXPENSE').aggregate(Sum("payment"))['payment__sum']
    # total_sum_expense=query.filter(orgasnization=parent_organization,
    # bill_type='EXPENSE').aggregate(Sum("total"))['total__sum']
    
    if bill_rcvr_org!=None and bill_rcvr_org!="" and bill_rcvr_org!="null" and bill_rcvr_org!="all":
        query=query.filter(Q(organization__id=int(bill_rcvr_org))|Q(bill_receiver2__bill_rcvr_org__id=int(bill_rcvr_org)))
    
    if store_id!=None and store_id!="" and store_id!="all" and bill_type!="EXPENSE":
        query=query.filter(
        bill_description__store__id=int(store_id))
    # if bill_type=="all":
    paginator=PageNumberPagination()
    paginator.page_size=8
    query_set=paginator.paginate_queryset(query.order_by("-pk"),request)
    serializer=Bill_search_Serializer(query_set,many=True)
    # serializer=Bill_search_Serializer(query.order_by("-pk"),many=True)

    total_sum_purchase=query.filter(organization=parent_organization,
    bill_type='PURCHASE').aggregate(Sum("total"))['total__sum']
    payment_sum_purchase=query.filter(organization=parent_organization,
    bill_type='PURCHASE').aggregate(Sum("payment"))['payment__sum']

    total_sum_selling=query.filter(organization=parent_organization,
    bill_type='SELLING').aggregate(Sum("total"))['total__sum']
    payment_sum_selling=query.filter(organization=parent_organization,
    bill_type='SELLING').aggregate(Sum("payment"))['payment__sum']

    # total_sum_payment=query.filter(organization=parent_organization,
    # bill_type='PAYMENT').aggregate(Sum("total"))['total__sum']
    payment_sum_payment=query.filter(organization=parent_organization,
    bill_type='PAYMENT').aggregate(Sum("payment"))['payment__sum']

    # total_sum_receivement=query.filter(organization=parent_organization,
    # bill_type='RECEIVEMENT').aggregate(Sum("total"))['total__sum']
    receivement_sum=query.filter(organization=parent_organization,
    bill_type='RECEIVEMENT').aggregate(Sum("payment"))['payment__sum']
 
    profit_sum=query.filter(bill_type='SELLING',organization=parent_organization).aggregate(Sum("profit"))['profit__sum']
    bill_count=query.count()
    
    if total_sum_purchase==None:
        total_sum_purchase=0
    if payment_sum_purchase==None:
        payment_sum_purchase=0
    
    if total_sum_selling==None:
        total_sum_selling=0
    if payment_sum_selling==None:
        payment_sum_selling=0

    # if total_sum_payment==None:
    #     total_sum_payment=0
    if payment_sum_payment==None:
        payment_sum_payment=0
    
    # if total_sum_expense==None:
    #     total_sum_expense=0
    if payment_sum_expense==None:
        payment_sum_expense=0
    
    
    # if total_sum_receivement==None:
    #     total_sum_receivement=0
    if receivement_sum==None:
        receivement_sum=0 
    if profit_sum==None:
        profit_sum=0
    
    ################################################opposit##############################
    # total_sum_purchase_from_bill_of_bill_rcvr_org=query.filter(bill_receiver2__bill_rcvr_org=parent_organization,
    # bill_type='SELLING').aggregate(Sum("total"))['total__sum']
    # payment_sum_purchase_from_bill_of_bill_rcvr_org=query.filter(bill_receiver2__bill_rcvr_org=parent_organization,
    # bill_type='SELLING').aggregate(Sum("payment"))['payment__sum']
    

    # total_sum_selling_from_bill_of_bill_rcvr_org=query.filter(bill_receiver2__bill_rcvr_org=parent_organization,
    # bill_type='PURCHASE').aggregate(Sum("total"))['total__sum']
    # payment_sum_selling_from_bill_of_bill_rcvr_org=query.filter(bill_receiver2__bill_rcvr_org=parent_organization,
    # bill_type='PURCHASE').aggregate(Sum("payment"))['payment__sum']


    # total_sum_payment_from_bill_of_bill_rcvr_org=query.filter(bill_receiver2__bill_rcvr_org=parent_organization,
    # bill_type='RECEIVEMENT').aggregate(Sum("total"))['total__sum']
    # payment_sum_payment_from_bill_of_bill_rcvr_org=query.filter(bill_receiver2__bill_rcvr_org=parent_organization,
    # bill_type='RECEIVEMENT').aggregate(Sum("payment"))['payment__sum']

    # total_sum_receivement_from_bill_of_bill_rcvr_org=query.filter(bill_receiver2__bill_rcvr_org=parent_organization,
    # bill_type='PAYMENT').aggregate(Sum("total"))['total__sum']
    # receivement_sum_from_bill_of_bill_rcvr_org=query.filter(bill_receiver2__bill_rcvr_org=parent_organization,
    # bill_type='PAYMENT').aggregate(Sum("payment"))['payment__sum']
    
    # profit_sum_from_bill_of_bill_rcvr_org=query.filter(bill_type='PURCHASE',bill_receiver2__bill_rcvr_org=parent_organization).aggregate(Sum("profit"))['profit__sum']
    
    # if total_sum_purchase_from_bill_of_bill_rcvr_org!=None:
    #     total_sum_purchase=total_sum_purchase+total_sum_purchase_from_bill_of_bill_rcvr_org
    # if payment_sum_purchase_from_bill_of_bill_rcvr_org!=None:
    #     payment_sum_purchase=payment_sum_purchase+payment_sum_purchase_from_bill_of_bill_rcvr_org
    
    # if total_sum_selling_from_bill_of_bill_rcvr_org!=None:
    #     total_sum_selling=total_sum_selling+total_sum_selling_from_bill_of_bill_rcvr_org

    # if payment_sum_selling_from_bill_of_bill_rcvr_org!=None:
    #     payment_sum_selling=payment_sum_selling+payment_sum_selling_from_bill_of_bill_rcvr_org

    # if total_sum_payment_from_bill_of_bill_rcvr_org!=None:  
    #     total_sum_payment=total_sum_payment+total_sum_payment_from_bill_of_bill_rcvr_org

    # if payment_sum_payment_from_bill_of_bill_rcvr_org!=None:
    #     payment_sum_payment=payment_sum_payment+payment_sum_payment_from_bill_of_bill_rcvr_org

    # if total_sum_receivement_from_bill_of_bill_rcvr_org!=None:
    #     total_sum_receivement=total_sum_receivement+total_sum_receivement_from_bill_of_bill_rcvr_org
    
    # if receivement_sum_from_bill_of_bill_rcvr_org!=None:
    #     receivement_sum=receivement_sum+receivement_sum_from_bill_of_bill_rcvr_org
    
    # if profit_sum_from_bill_of_bill_rcvr_org!=None:
    #     profit_sum=profit_sum+profit_sum_from_bill_of_bill_rcvr_org
    print("profit_sum",profit_sum)
    #####################################summation of bill created by organization and by opposit organization#################
   
    notpaid_purchase=total_sum_purchase-payment_sum_purchase
    notpaid_sell=total_sum_selling-payment_sum_selling
    total_upon_opposit_org=total_sum_selling+payment_sum_payment+payment_sum_purchase
    total_upon_self_org=total_sum_purchase+payment_sum_selling+receivement_sum
    total_summary=total_upon_opposit_org-total_upon_self_org
    
    possessed_cash_asset=(payment_sum_selling+receivement_sum)-(payment_sum_purchase+payment_sum_expense+payment_sum_payment)
    possessed_non_cash_asset=total_sum_purchase-total_sum_selling
    total_asset=possessed_cash_asset+possessed_non_cash_asset
    net_profit_sum=profit_sum-payment_sum_expense

    #current_profit=total_asset-initial_total_asset

    statistics=dict({
                    "total_summary":total_summary,
                    "total_upon_opposit_org":total_upon_opposit_org,
                    "total_upon_self_org":total_upon_self_org,
                    "bill_count":bill_count,
                    "total_sum_purchase":total_sum_purchase,
                    "payment_sum_purchase":payment_sum_purchase,
                    "notpaid_purchase":notpaid_purchase,
                    "total_sum_selling":total_sum_selling,
                    "payment_sum_selling":payment_sum_selling,
                    "notpaid_sell":notpaid_sell,
                    # "total_sum_payment":total_sum_payment,
                    "payment_sum_payment":payment_sum_payment,
                    # "total_sum_expense":total_sum_expense,
                    "payment_sum_expense":payment_sum_expense,
                    # "total_sum_receivement":total_sum_receivement,
                    "payment_sum_receivement":receivement_sum,
                    "possessed_cash_asset":possessed_cash_asset,
                    "possessed_non_cash_asset":possessed_non_cash_asset,
                    "total_asset":total_asset,
                    "profit_sum":profit_sum,
                    "net_profit_sum":net_profit_sum
                    # "current_profit":current_profit,
                    })      
    print("#####################################",query)
    # query=query.order_by("-pk").values()
    
    serializer_context={"message":"OK","ok":True,"statistics":statistics,"serializer_data":serializer.data}
    return paginator.get_paginated_response(serializer_context)