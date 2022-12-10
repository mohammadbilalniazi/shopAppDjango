from django.shortcuts import render
from django.http import HttpResponse,HttpResponseRedirect
from django.urls import reverse
from django.template import loader 
from django.contrib.auth.decorators import login_required
from shopapp.models import Customer, Supplier , Supplier_Ledger , Customer_Ledger , Log ,Sale_bill,Sales_detail,Roznamcha,Asset
from products.models import Product,Vendors
from django.contrib.auth.models import User
from datetime import datetime
from django.contrib import messages
from .models import Purchase_bill, Purchase_detail


@login_required(login_url='/admin')
def purchase_show(request,purchase_bill_id=None):
    context={}
    if purchase_bill_id==None:
        print("@@@@purchase_bill_id ",purchase_bill_id)
        context['purchase_bills']=Purchase_bill.objects.all()
        template=loader.get_template('purchase_show.html')
    else:
        #Purchase_bill.objects.get(id=int(purchase_bill_id))
        print(Purchase_bill.objects.get(id=int(purchase_bill_id)))
        #return HttpResponse(Purchase_bill.objects.get(id=int(purchase_bill_id)))
        context['detail']=True
        purchase_bill_obj=Purchase_bill.objects.get(id=int(purchase_bill_id))
        print("purchase_bill_obj.payment=",purchase_bill_obj.payment)
        context['purchase_bill']=purchase_bill_obj
        template=loader.get_template('purchase_form.html')
    
    
    return HttpResponse(template.render(context,request))

@login_required(login_url='/admin')
def purchase_bill_form(request):  
    #print("dkdk",request.POST)
    context={}    
    if request.method == "POST":
        print(request.POST)
        print("request.method 2",request.method)
        print("item_name=",request.POST.getlist("item_name"), " len(request.POST.getlist('item_name'))=",len(request.POST.getlist("item_name")))
        print("item_amount=",request.POST.getlist("item_amount")," len(request.POST.getlist('item_amount)=",len(request.POST.getlist("item_amount")))
        print("item_price=",request.POST.getlist("item_price"))
        print("return_qty=",request.POST.getlist("return_qty"))
        #print(request.GET)
        ########################################## purchase_bill input taking############################
        purchase_bill=request.POST.get("id",None)
        ##date conversion##
        purchasing_date=request.POST.get("bill_date",None)
        purchasing_date=datetime.strptime(purchasing_date,"%Y-%m-%d")
        ###################
        seller=request.POST.get("vendor",None)
        purchaser=request.POST.get("purchaser",None)
        purchaser=request.user
        total_purchase_bill=request.POST.get("total_bill_amount",None)
        payment=request.POST.get("total_payment",None)
        purchase_bill_obj=Purchase_bill(purchasing_date=purchasing_date,seller=seller,purchaser=purchaser,total_purchase_bill=total_purchase_bill,payment=payment)
        purchase_bill_obj.save()
        ######################################################bill detail############################

        product=request.POST.getlist('item_name',None)        #in models it's name is product
        print("test")
        item_amount=request.POST.getlist('item_amount',None)
        
        item_price=request.POST.getlist('item_price',None)

        return_qty=request.POST.getlist('return_qty',None)
        ########################################validations##################################
        ########################validation 1 if charger1 is repeated 2 times than reject##############
        ######################## validations 2 if return_qty>item_amount##################reject
        ######################## if item_name total_amount is < payment and payment is more then reject ############ 
        for i in range(len(request.POST.getlist('item_name'))):
            print(product[i]," ",item_amount[i])
            #return HttpResponse(Product.objects.get(item_name=product[i]))
            product_obj=Product.objects.get(item_name=product[i])
            purchase_detail_obj=Purchase_detail(purchase_bill=purchase_bill_obj,product=product_obj,item_amount=item_amount[i],item_price=item_price[i],return_qty=return_qty[i])
            purchase_detail_obj.save()
        #template=loader.get_template('purchase_temp.html')
        #return HttpResponse(request.POST)
    else:
        print("test2")   #return HttpResponse(request.POST)
      
        #return HttpResponse(User.objects.all())
        count_bills=Purchase_bill.objects.all().count()

        context={
            'users':User.objects.all(),
            'vendors':Vendors.objects.all(),
            'purchase_bill_no':count_bills+1,
        } 

    template=loader.get_template('purchase_form.html')
    return HttpResponse(template.render(context,request))
  
