from django.db.models import Sum
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from jalali_date import date2jalali
from django.template import loader  
from django.contrib.auth.decorators import login_required
from product.models import Product, Unit, Category
from common.organization import find_userorganization
from common.date import handle_day_out_of_range
from configuration.models import *
from datetime import datetime
from decimal import Decimal
from django.contrib import messages
from .models import Bill, Bill_detail,Bill_Receiver2
from django.forms.models import model_to_dict
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .forms import Bill_Form
from django.db.models import Q,Max
from django.db import transaction
from .serializer import BillSearchSerializer
import re
from rest_framework.pagination import PageNumberPagination
from django.http import JsonResponse

def getBillNo(request,organization_id,bill_rcvr_org_id,bill_type=None):
    date = date2jalali(datetime.now()) 
    year=date.strftime('%Y')
    self_organization,user_orgs = find_userorganization(request,organization_id)
    # print("self_organization ",self_organization)
    bill_rcvr_org,user_orgs = find_userorganization(request,bill_rcvr_org_id)
    opposit_bill=get_opposit_bill(bill_type)
    print("opposit_bill ",opposit_bill)
    if bill_type=="EXPENSE":
        bill_query=Bill.objects.filter(year=int(year),bill_type=bill_type,organization=self_organization)
    else:    
        bill_query=Bill.objects.filter(Q(year=int(year)),Q(Q(bill_type=bill_type),Q(organization=self_organization),Q(bill_receiver2__bill_rcvr_org=bill_rcvr_org)) | Q(Q(bill_type=opposit_bill),Q(bill_receiver2__bill_rcvr_org=self_organization),Q(organization=bill_rcvr_org)))

    if bill_query.count()>0:  
        bill_no=bill_query.aggregate(Max('bill_no'))['bill_no__max']+1
    else:
        bill_no=1
    return bill_no

@api_view(("GET",))
def select_bill_no(request,organization_id,bill_rcvr_org_id,bill_type=None):
    return Response({"bill_no":getBillNo(request,organization_id,bill_rcvr_org_id,bill_type)})

@login_required(login_url='/admin')
def bill_show(request,bill_id=None):
    print("bill_id =",bill_id)
    context={}
    form=Bill_Form()
    form.set_start_date()
    print(f"############ start_date {form.fields["start_date"].initial}")
    context['form']=form
    self_organization,user_orgs = find_userorganization(request)
    
    # Get branches for the organization(s)
    from configuration.models import Branch
    if self_organization is not None:
        branches = Branch.objects.filter(organization=self_organization, is_active=True)
    else:
        branches = Branch.objects.filter(organization__in=user_orgs, is_active=True)
    
    organizations=Organization.objects.all()
    organization=self_organization

    # Handle case when self_organization is None
    if self_organization is None:
        if request.user.is_superuser:
            # Superuser can see all organizations
            organizations = Organization.objects.all()
            organization = None
        else:
            # Regular user with multiple orgs but no self org - use first org or show error
            if user_orgs and user_orgs.count() > 0:
                organizations = user_orgs
                organization = user_orgs.first()
            else:
                # No organizations assigned to user
                from django.contrib import messages
                messages.error(request, "No organizations assigned to your account. Please contact administrator.")
                organizations = Organization.objects.none()
                organization = None
    else:
        # Normal case - self_organization exists
        organization = self_organization
        if request.user.is_superuser:
            organizations = Organization.objects.all()
        else:
            organizations = Organization.objects.filter(id=self_organization.id)
    # Receiver organizations: if a current organization is set, exclude it from receiver list
    if organization:
        rcvr_orgs = Organization.objects.exclude(id=organization.id)
    else:
        rcvr_orgs = Organization.objects.all()
    if bill_id==None :
        context['bills']=Bill.objects.all().order_by("-pk")
        context['rcvr_orgs']=rcvr_orgs
        context['organizations']=organizations
        context['organization']=organization
        template=loader.get_template('bill/bill_detail_show.html')
    else:  
        bill=Bill.objects.get(id=int(bill_id))
        form.fields['date'].initial=str(bill.date) #before  hawala.mustharadi_file
        # print("bill_obj",bill_obj.bill_detail_set.all().order_by("id"))
        context['bill_detail_set']=bill.bill_detail_set.all().order_by("id")
        context['bill']=bill
        print("bill 0",model_to_dict(bill))
        if bill.bill_type in ('PAYMENT', 'RECEIVEMENT'):
            template=loader.get_template('bill/bill_form_receive_payment.html')
        elif bill.bill_type in ("LOSSDEGRADE"):
            template=loader.get_template('bill/expenditure/bill_form_loss.html')
            context['products']=Product.objects.all()
            context['units']=Unit.objects.all()
        else:
            template=loader.get_template('bill/bill_form_sell_purchase.html')
            # context['products']=Product.objects.filter(product_detail__organization=bill.organization)
            context['products']=Product.objects.all()
            context['units']=Unit.objects.all()
        if self_organization and (bill.organization==self_organization or request.user.is_superuser):                 
            if self_organization:
                rcvr_orgs = Organization.objects.exclude(id=self_organization.id).order_by("-pk")
            else:
                rcvr_orgs = Organization.objects.all().order_by("-pk")
            if request.user.is_superuser:
                organizations=Organization.objects.all() 
            else:
                organizations=Organization.objects.filter(id=self_organization.id)
        elif hasattr(bill,'bill_receiver2') and self_organization:
            if bill.bill_receiver2.bill_rcvr_org==self_organization:
                #  bill_obj.bill_receiver2:
                rcvr_orgs=Organization.objects.filter(id=self_organization.id)
    
    context['organizations'] = organizations
    context['organization'] =organization
    context['branches'] = branches
    context['rcvr_orgs']=rcvr_orgs
    return HttpResponse(template.render(context,request))



@login_required(login_url='/admin')
@transaction.atomic
def bill_delete(request,id=None):
    context={}
    self_organization,user_orgs = find_userorganization(request)
    if id!=None:
        context['detail']=True
        bill_query=Bill.objects.filter(id=int(id))
        if bill_query.count()>0:
            bill_obj=bill_query[0]
            if  not request.user.is_superuser:
                org_name = self_organization.name if self_organization else "Unknown"
                message="The Organization {} can not delete the bill id {} because it is not admin".format(org_name,id)
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
@transaction.atomic
def bill_detail_delete(request,bill_detail_id=None):
    context={} 
    self_organization,user_orgs = find_userorganization(request)
    message=""
    is_success=False
    if bill_detail_id!=None:
        context['detail']=True
        bill_detail_query=Bill_detail.objects.filter(id=int(bill_detail_id))
        if bill_detail_query.count()>0:      
            bill_detail=bill_detail_query[0]
            bill=bill_detail.bill
            previous_bill_type=bill.bill_type
            if bill.organization!=self_organization:
                org_name = self_organization.name if self_organization else "Unknown"
                message="The Organization {} can not delete the bill id {} because it is not creator of bill".format(org_name,id)
                return Response({"Message":message,"is_success":False})
            if bill.bill_receiver2.approval_user!=None: # it means approved
                return Response({"Message":'it is approved',"is_success":False})
            if len(bill.bill_detail_set.all())==1:
                bill_delete(request,int(bill.id))
                org_name = self_organization.name if self_organization else "Unknown"
                message="The Organization {} can not delete the bill id {} because it is not creator of bill".format(org_name,id)
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
def bill_form_sell_purchase(request):
    print("bill_form_sell_purchase called")
    template=loader.get_template('bill/bill_form_sell_purchase.html')
    date = date2jalali(datetime.now())
    self_organization,user_orgs = find_userorganization(request)
    form=Bill_Form()
    context={}
    form.fields['date'].initial=date
    
    # Get branches for the organization(s)
    from configuration.models import Branch
    if self_organization is not None:
        branches = Branch.objects.filter(organization=self_organization, is_active=True)
    else:
        branches = Branch.objects.filter(organization__in=user_orgs, is_active=True)
    
    # Handle case when self_organization is None
    if self_organization is None:
        if request.user.is_superuser:
            organizations = Organization.objects.all()
            rcvr_orgs = Organization.objects.all()
            self_organization = None  # Superuser can work without specific org
        else:
            # Regular user with multiple orgs - use first org as fallback
            if user_orgs and user_orgs.count() > 0:
                self_organization = user_orgs.first()
                organizations = user_orgs
                # User's organization present; receiver orgs should exclude user's own org
                rcvr_orgs = Organization.objects.exclude(id=self_organization.id)
            else:
                # No organizations assigned
                from django.contrib import messages
                messages.error(request, "No organizations assigned to your account. Please contact administrator.")
                organizations = Organization.objects.none()
                rcvr_orgs = Organization.objects.none()
    else:
        # Normal case - self_organization exists
        if request.user.is_superuser:
            organizations = Organization.objects.all()
            rcvr_orgs = Organization.objects.all()
        else:
            organizations = Organization.objects.filter(id=self_organization.id)
            rcvr_orgs = Organization.objects.exclude(id=self_organization.id)
    
    context={
        'form':form,
        'organization':self_organization,
        'organizations':organizations,
        'rcvr_orgs':rcvr_orgs,  # ← ADD THIS
        'branches': branches,  # Add branch context
        'date':date,
        'categories':Category.objects.all(),
    } 
    # print("EEEEEEEEEEEEEEEEEEEE")
    # print("context=",context)
    return HttpResponse(template.render(context,request))

@login_required(login_url='/admin')
def bill_form_loss_degrade_product(request):
    template=loader.get_template('bill/expenditure/bill_form_loss.html')
    date = date2jalali(datetime.now())
    self_organization,user_orgs = find_userorganization(request)
    form=Bill_Form()
    context={}
    form.fields['date'].initial=date
    
    # Handle case when self_organization is None
    if self_organization is None:
        if request.user.is_superuser:
            organizations = Organization.objects.all()
            self_organization = None  # Superuser can work without specific org
        else:
            # Regular user with multiple orgs - use first org as fallback
            if user_orgs and user_orgs.count() > 0:
                self_organization = user_orgs.first()
                organizations = user_orgs
            else:
                # No organizations assigned
                from django.contrib import messages
                messages.error(request, "No organizations assigned to your account. Please contact administrator.")
                organizations = Organization.objects.none()
    else:
        # Normal case - self_organization exists
        if request.user.is_superuser:
            organizations = Organization.objects.all()
        else:
            organizations = Organization.objects.filter(id=self_organization.id)
    
    context={
        'form':form,
        'organization':self_organization,
        'organizations':organizations,
        'date':date,
    } 
    # print("context=",context)
    return HttpResponse(template.render(context,request))


def get_opposit_bill(bill_type):
    opposit_bills={"SELLING":"PURCHASE","PURCHASE":"SELLING","PAYMENT":"RECEIVEMENT","RECEIVEMENT":"PAYMENT","EXPENSE":"EXPENSE","LOSSDEGRADE":"LOSSDEGRADE"}
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
        bill_detail.profit=prev_profit_bill_detail-profit
        bill.profit=prev_bill_profit-profit
    try:
        bill_detail.save()
        bill.save()
        ok=True
    except Exception as e:
        ok=False    
    return ok
@login_required(login_url='/admin')
@api_view(['POST', 'PUT'])
def bill_insert(request):

    data = request.data
    user = request.user
    # -----------------------------
    # Basic fields
    # -----------------------------
    bill_id = data.get("id")
    bill_no = int(data.get("bill_no"))
    date = data.get("date")
    year = date.split("-")[0]
    status = int(data.get("status", 0))
    bill_type = data.get("bill_type")
    total = float(data.get("total") or 0)
    payment = float(data.get("total_payment") or 0)

    organization = Organization.objects.get(id=int(data.get("organization")))
    self_org, _ = find_userorganization(request, organization.id)

    # -----------------------------
    # Branch (optional)
    # -----------------------------
    branch = None
    branch_id = data.get("branch")
    if branch_id:
        branch = Branch.objects.filter(
            id=int(branch_id),
            organization=organization,
            is_active=True
        ).first()

    # -----------------------------
    # Receiver organization
    # -----------------------------
    bill_rcvr_org = None
    if bill_type != "LOSSDEGRADE":
        try:
            bill_rcvr_org = Organization.objects.get(id=int(data.get("bill_rcvr_org")))
        except Organization.DoesNotExist:
            return Response({"ok": False, "message": "Invalid receiver organization"})

    # -----------------------------
    # Approval logic
    # -----------------------------
    is_approved = str(data.get("is_approved")).lower() in ["1", "true", "on"]
    approval_user = None
    approval_date = None

    if bill_rcvr_org == self_org:
        if is_approved or status == 1:
            status = 1
            is_approved = True
            approval_user = user
            approval_date = datetime.now()
    else:
        status = 0
        is_approved = False

    # -----------------------------
    # Detail arrays
    # -----------------------------
    products = data.get("item_name", [])
    amounts = data.get("item_amount", [])
    prices = data.get("item_price", [])
    units = data.get("unit", [])
    # print("units ",units)
    returns = data.get("return_qty", [])
    detail_ids = data.get("bill_detail_id", [])

    # -----------------------------
    # Atomic transaction
    # -----------------------------
    with transaction.atomic():

        # =============================
        # CREATE / UPDATE BILL
        # =============================
        if bill_id:
            bill = get_object_or_404(Bill, id=bill_id)

            if hasattr(bill, 'bill_receiver2') and bill.bill_receiver2.is_approved:
                return Response({"ok": False, "message": "Approved bill cannot be updated"})

            bill.bill_no = bill_no
            bill.total = total
            bill.payment = payment
            bill.bill_type = bill_type
            bill.branch = branch

        else:
            if Bill.objects.filter(
                bill_no=bill_no,
                year=year,
                organization=organization,
                bill_type=bill_type,
                bill_receiver2__bill_rcvr_org=bill_rcvr_org
            ).exists():
                return Response({"ok": False, "message": "Bill already exists"})

            bill = Bill.objects.create(
                bill_no=bill_no,
                date=date,
                year=year,
                bill_type=bill_type,
                organization=organization,
                creator=user,
                total=total,
                payment=payment,
                branch=branch
            )

        bill.save()

        # =============================
        # Receiver
        # =============================
        if bill_type != "LOSSDEGRADE":
            Bill_Receiver2.objects.update_or_create(
                bill=bill,
                defaults={
                    "bill_rcvr_org": bill_rcvr_org,
                    "is_approved": is_approved,
                    "approval_user": approval_user,
                    "approval_date": approval_date
                }
            )
        else:
            Bill_Receiver2.objects.filter(bill=bill).delete()

        # =============================
        # BILL DETAILS
        # =============================
        calculated_total = 0

        for i in range(len(products)):
            product = Product.objects.get(id=int(products[i]))
            unit = Unit.objects.get(id=int(units[i]))
            qty = float(amounts[i])
            ret = float(returns[i])
            net_qty = qty - ret
            price = float(prices[i])

            detail_data = {
                "bill": bill,
                "product": product,
                "unit": unit,
                "item_amount": qty,
                "item_price": price,
                "return_qty": ret,
            }

            if not detail_ids[i]:
                detail = Bill_detail.objects.create(**detail_data)
            else:
                detail = Bill_detail.objects.get(id=int(detail_ids[i]))
                for k, v in detail_data.items():
                    setattr(detail, k, v)
                detail.save()

            # Profit handling
            purchased_price = getattr(
                getattr(product, "product_detail", None),
                "purchased_price",
                price
            )

            if bill.bill_type == "SELLING":
                profit = (price - purchased_price) * net_qty
                handle_profit_loss(detail, profit, "INCREASE")

            elif bill.bill_type == "LOSSDEGRADE":
                handle_profit_loss(detail, price * net_qty, "DECREASE")

            calculated_total += net_qty * price

        # =============================
        # Recalculate total
        # =============================
        if calculated_total != bill.total:
            bill.total = calculated_total
            bill.save()

    return Response({
        "ok": True,
        "message": f"Bill {bill.bill_no} saved successfully",
        "bill_id": bill.id,
        "data": model_to_dict(bill)
    })


def get_statistics_bill(query):
    payment_sum_expense=query.filter(
    bill_type='EXPENSE').aggregate(Sum("payment"))['payment__sum']
    payment_sum_loss=query.filter(
    bill_type='LOSSDEGRADE').aggregate(Sum("total"))['total__sum']
    total_sum_purchase=query.filter(
    bill_type='PURCHASE').aggregate(Sum("total"))['total__sum']
    payment_sum_purchase=query.filter(
    bill_type='PURCHASE').aggregate(Sum("payment"))['payment__sum']

    total_sum_selling=query.filter(
    bill_type='SELLING').aggregate(Sum("total"))['total__sum']
    payment_sum_selling=query.filter(
    bill_type='SELLING').aggregate(Sum("payment"))['payment__sum']

    payment_sum_payment=query.filter(
    bill_type='PAYMENT').aggregate(Sum("payment"))['payment__sum']

    receivement_sum=query.filter(
    bill_type='RECEIVEMENT').aggregate(Sum("payment"))['payment__sum']
 
    profit_sum=query.filter(bill_type='SELLING').aggregate(Sum("profit"))['profit__sum']
    bill_count=query.count()
    
    if total_sum_purchase==None:
        total_sum_purchase=0
    if payment_sum_purchase==None:
        payment_sum_purchase=0
    
    if total_sum_selling==None:
        total_sum_selling=0
    if payment_sum_selling==None:
        payment_sum_selling=0

    if payment_sum_payment==None:
        payment_sum_payment=0
    if payment_sum_loss==None:
        payment_sum_loss=0
    if payment_sum_expense==None:
        payment_sum_expense=0
    
    if receivement_sum==None:
        receivement_sum=0 
    if profit_sum==None:
        profit_sum=0
    # print("profit_sum",profit_sum)
    #####################################summation of bill created by organization and by opposit organization#################
    notpaid_purchase=total_sum_purchase-payment_sum_purchase
    notpaid_sell=total_sum_selling-payment_sum_selling
    total_upon_opposit_org=total_sum_selling+payment_sum_payment+payment_sum_purchase
    total_upon_self_org=total_sum_purchase+payment_sum_selling+receivement_sum
    total_summary=total_upon_opposit_org-total_upon_self_org
    possessed_cash_asset=(payment_sum_selling+receivement_sum)-(payment_sum_purchase+payment_sum_expense+payment_sum_payment+payment_sum_loss)
    possessed_non_cash_asset=total_sum_purchase-total_sum_selling
    total_asset=possessed_cash_asset+possessed_non_cash_asset
    net_profit_sum=profit_sum-payment_sum_expense-payment_sum_loss
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
                    "payment_sum_payment":payment_sum_payment,
                    "payment_sum_expense":payment_sum_expense,
                    "payment_sum_loss":payment_sum_loss,
                    "payment_sum_receivement":receivement_sum,
                    "possessed_cash_asset":possessed_cash_asset,
                    "possessed_non_cash_asset":possessed_non_cash_asset,
                    "total_asset":total_asset,
                    "profit_sum":profit_sum,
                    "net_profit_sum":net_profit_sum
                    })      
    # query=query.order_by("-pk").values()
    return statistics

@api_view(('POST',)) 
def search(request, page=None):
    bill_type = request.data.get("bill_type", None)
    bill_no = request.data.get("bill_no", None)
    bill_rcvr_org = request.data.get("bill_rcvr_org", None)
    organization = request.data.get("organization", None)
    
    # Normalize empty values
    if organization in [None, "", "null", "all"]:
        organization = None
    
    if organization is None:
        if request.user.is_superuser:
            self_organization = None  # Will search all organizations
            user_orgs = None
        else:
            self_organization, user_orgs = find_userorganization(request)
    else:
        self_organization, user_orgs = find_userorganization(request, organization)

    start_date = request.data.get("start_date", None)
    end_date = request.data.get("end_date", None)
    
    print(f"#####bill_type {bill_type}, bill_no {bill_no}, bill_rcvr_org {bill_rcvr_org}, start_date {start_date}, end_date {end_date}")
    
    # Clean dates
    start_date = re.sub('\t', '', str(start_date))
    end_date = re.sub('\t', '', str(end_date))
    
    # Base query with date range
    query = Bill.objects.filter(date__range=[start_date, end_date])
    
    # Filter by organization
    if self_organization is not None:
        # Specific organization or user's organization
        query = query.filter(
            Q(organization=self_organization) | 
            Q(bill_receiver2__bill_rcvr_org=self_organization)
        )
    # else: superuser viewing all organizations - no filter needed
    
    print(f"1 query count {query.count()}")
    
    # Filter by bill number
    if bill_no and str(bill_no).strip() and str(bill_no) != "0":
        try:
            query = query.filter(bill_no=int(bill_no))
        except (ValueError, TypeError):
            pass  # Invalid bill_no, skip filtering
    
    # Filter by bill type
    if bill_type and bill_type not in [None, "", "all", "null"]:
        query = query.filter(bill_type=bill_type)
    
    # Filter by receiver organization
    if bill_rcvr_org and bill_rcvr_org not in [None, "", "null", "all"]:
        try:
            query = query.filter(bill_receiver2__bill_rcvr_org__id=int(bill_rcvr_org))
        except (ValueError, TypeError):
            pass  # Invalid bill_rcvr_org, skip filtering
    
    # Pagination
    paginator = PageNumberPagination()
    paginator.page_size = 8
    query_set = paginator.paginate_queryset(query.order_by("-pk"), request)
    
    # Serialize results
    serializer = BillSearchSerializer(query_set, many=True)
    statistics = get_statistics_bill(query)
    
    serializer_context = {
        "message": "OK",
        "ok": True,
        "statistics": statistics,
        "serializer_data": serializer.data
    }
    
    return paginator.get_paginated_response(serializer_context)

@login_required(login_url='/admin')
@api_view(['POST'])
def finalize_ledger(request):
    org_id = request.data.get("organization",None)
    bill_rcvr_org_id = request.data.get("bill_rcvr_org",None)
    print("finalize_ledger org_id ",org_id," bill_rcvr_org_id ",bill_rcvr_org_id)
    if org_id==None or org_id=="all" or org_id=="" or org_id=="null" or bill_rcvr_org_id==None or bill_rcvr_org_id=="all" or bill_rcvr_org_id=="" or bill_rcvr_org_id=="null":
        return JsonResponse({'success': False, 'message': str("شرکت را انتخاب کنید")}, status=400)
    try:
        organization = Organization.objects.get(pk=int(org_id))
        bill_rcvr_org = Organization.objects.get(pk=int(bill_rcvr_org_id))
        query = Bill.objects.filter(
            organization=organization,
            bill_receiver2__bill_rcvr_org=bill_rcvr_org
        )
        statistics = get_statistics_bill(query)
        total_summary = Decimal(statistics.get('total_summary') or 0)

        if total_summary == 0:
            return JsonResponse({'success': False, 'message': 'No balance to finalize.'}, status=400)

        # Decide bill type and amount
        if total_summary < 0: #should be paid the amount
            bill_type = 'PAYMENT'
            amount = abs(total_summary)
        else:  #should be received the amount to finalize
            bill_type = 'RECEIVEMENT'
            amount = total_summary

        bill_no = getBillNo(request, organization.id, bill_rcvr_org.id, bill_type)

        with transaction.atomic():
            # Create the bill
            bill = Bill.objects.create(
                bill_type=bill_type,
                date=date2jalali(datetime.now()),
                year=int(date2jalali(datetime.now()).strftime('%Y')),
                bill_no=bill_no,
                organization=organization,
                creator=request.user,
                total=0,
                payment=amount,
                profit=0
            )

            bill_rcvr=Bill_Receiver2.objects.create(
                bill=bill,
                bill_rcvr_org=bill_rcvr_org,
                is_approved=True,
                approval_date=str(date2jalali(datetime.now())),
                approval_user=request.user
            )
            # a="abc"/2
            # create_bill_summary(bill)  # ← Your own summary function
        return JsonResponse({
            'success': True,
            'message': f'Ledger finalized with {amount} ({bill_type}) for {bill_rcvr_org.name}'
        })

    except Organization.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Organization not found'}, status=404)
    except Exception as e:
        print("Error in finalize_ledger: ", str(e))
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

