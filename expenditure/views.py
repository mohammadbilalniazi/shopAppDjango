from django.shortcuts import render
from jalali_date import date2jalali
from datetime import datetime
from bill.forms import Bill_Form
from django.contrib.auth.decorators import login_required
from django.template import loader
from django.http import HttpResponse
from rest_framework.decorators import api_view
from bill.views_bill import (
    can_user_access_bill,
    getBillNo,
    get_bill_form_scope,
    get_bill_organization_for_user,
)
from bill.models import Bill
from django.forms.models import model_to_dict
from rest_framework.response import Response
from .models import Expense
from django.contrib import messages
from common.branch_utils import get_required_branch_for_user_organization
# Create your views here.
@login_required(login_url='/admin')
def expense_form(request,id=None):
    template=loader.get_template('bill/expenditure/expense_form.html')
    date = date2jalali(datetime.now())
    form=Bill_Form()
    form.fields['date'].initial=date
    organizations, organization, branches = get_bill_form_scope(request)
    bill = None

    if id is not None:
        bill = Bill.objects.select_related("organization", "branch").get(id=int(id))
        if not can_user_access_bill(request, bill):
            messages.error(request, "You do not have access to this expense bill.")
            bill = None
        else:
            organization = bill.organization

    if not organizations.exists():
        messages.error(request, "No organizations assigned to your account. Please contact administrator.")

    bill_no = getBillNo(
        request,
        organization.id if organization else None,
        organization.id if organization else None,
        "EXPENSE",
    )
    
    context={
        'form':form,
        'bill_no':bill_no,
        'organization':organization,
        'organizations':organizations,  # ← ADD THIS
        'branches':branches,
        'date':date,
    }
    if bill is not None:
        context['bill']=bill
    return HttpResponse(template.render(context,request))


@login_required(login_url='/admin')
@api_view(['POST','PUT'])
def expense_insert(request):  
    # print(".request.data ",request.data)
    ########################################## Bill input taking############################
    bill_no=int(request.data.get("bill_no",None))  
    id=request.data.get("id")
    date=request.data.get("date")
    year=date.split("-")[0]
    ############before request.data  and request.data.getlist
    organization_id=request.data.get("organization")
    try:
        organization = get_bill_organization_for_user(request, organization_id)
        branch = get_required_branch_for_user_organization(
            request.user,
            organization,
            request.data.get("branch"),
        )
    except ValueError as exc:
        return Response({"message": str(exc), "ok": False})
    bill_type=request.data.get("bill_type",None)
    expense_type=request.data.get("expense_type")
    # print("expense_type ",expense_type)
    creator=request.user
    total=request.data.get("total",0)
    if total=='' or total=="" or total==None:
        total=0
    payment=request.data.get("total_payment",0)      
    #########endof data prepration########
    if id!="" and id!='':
        ###############update#########################
        bill_query=Bill.objects.filter(id=int(id))
        # print("update with id== something bill_query.count()==0 ",bill_query.count()==0) 
        if bill_query.count()==0:
            ok=False
            message="The Bill with Id {} not exist ".format(id)
            return Response({"message":message,"ok":ok})
        bill_obj=bill_query[0] 
        if not can_user_access_bill(request, bill_obj):
            return Response({"message": "You do not have access to this bill.", "ok": False})

        bill_obj.total=total
        bill_obj.payment=payment
        bill_obj.bill_type=bill_type
        bill_obj.organization=organization
        bill_obj.branch=branch
    else: ############### new insert Bill if not in system#############
        bill_query=Bill.objects.filter(bill_no=int(bill_no),year=int(year),bill_type=bill_type,organization=organization)
        if bill_query.count()>0: # if we are not having update then we check if such bill present or not if exists we not enter
            ok=False
            message="The Bill is already in system search for Bill No {} Bill Type {} Year {} ".format(bill_no,bill_type,year)
            return Response({"message":message,"ok":ok})
        bill_obj=Bill(bill_type=bill_type,date=date,year=year,bill_no=bill_no,organization=organization,branch=branch,creator=creator,total=total,payment=payment)
    try:  
        bill_obj.save()
        expense_query=Expense.objects.filter(bill=bill_obj)
        # print("expense",expense_query)
        if expense_query.count()>0:
            expense_query.update(bill=bill_obj,expense_type=int(expense_type))
            expense=expense_query[0]
        else:
            expense=Expense(bill=bill_obj,expense_type=int(expense_type))
            expense.save()
        ok=True
        # print("bill_obj.expense.expense_type",expense)
        message="bill No {} Successfully Insert".format(bill_no)
        messages.success(request,message)
    except Exception as e:
        ok=False
        message=str(e)
        messages.error(request,message)
        print("e ",e)
        return Response({"message":message,"ok":ok})
    ######################## if item_name total_amount is < payment and payment is more then reject ############ 
    return Response({"message":message,"ok":ok,"data":model_to_dict(bill_obj),"bill_id":bill_obj.id})    
