from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from .serializer import *
from .models import *
import json
from common.organization import findOrganization
from django.http import HttpResponse
from django.template import loader 
from django.contrib.auth.decorators import login_required
from django.forms.models import model_to_dict
from common.generate_ihsaya import generate_product_report
from django.db.models import Q
def change_prices_product(bill_type,item_price,product_detail):
    if bill_type=="PURCHASE":
        product_detail.purchased_price=item_price
    elif bill_type=="SELLING":
        product_detail.selling_price=item_price
    try:
        product_detail.save()
        changed=True
    except Exception as e:
        print("product_detail error ",e)
        changed=False
    return changed
    
# @login_required()
def handle_price_stock_product(bill_detail,operation='INCREASE',bill_type='PURCHASE',store=None):
    # bill_type=bill_detail.bill.bill_type
    # print("")
    organization=bill_detail.bill.organization
    if store==None:
        store=bill_detail.bill.bill_description.store
    item_price=bill_detail.item_price
    item_amount=bill_detail.item_amount
    return_qty=bill_detail.return_qty
    product=bill_detail.product
    
    # price_changed=change_prices_product(bill_type,item_price,product.product_detail)
    ###########################change_detail##################
    net_amount=(float(item_amount)-float(return_qty))
    # print("item_amount ",item_amount,"returnQty ",return_qty,"net_amount",net_amount)
    stock_query=Stock.objects.filter(store=store,product=product)

    if stock_query.count()>0:
        stock=stock_query[0]
        current_amount=stock.current_amount
    else:
        current_amount=0
        stock=Stock(store=store,product=product,current_amount=0)

    product_detail_query=Product_Detail.objects.filter(product=product)
    if product_detail_query.count()>0:
        product_detail=product_detail_query[0]
    else:
        product_detail=Product_Detail(product=product,organization=organization,current_amount=0)


    if operation=='INCREASE':      
        if bill_type=="PURCHASE":
            product_detail.purchased_price=item_price
            current_amount=float(current_amount)+net_amount
        elif bill_type=="SELLING":  
            product_detail.selling_price=item_price
            current_amount=float(current_amount)-net_amount
    else:
        if bill_type=="PURCHASE":
            print("PURCHASE current_amount ",current_amount,"net amount ",net_amount)
            current_amount=float(current_amount)-net_amount
        elif bill_type=="SELLING":  
            print("SELLING current_amount ",current_amount,"net amount ",net_amount)
            current_amount=float(current_amount)+net_amount
    try:
        print("stock ",stock,"store ",store,"final_current amount ",current_amount)
        stock.current_amount=current_amount
        stock.save()
        product_detail.save()
        detail_changed=True
    except Exception as e:
        print("########change_price_product error",e)
        detail_changed=False
    # print(" price_changed,detail_changed ",price_changed,detail_changed)
    return (bill_detail,detail_changed)  


def show_html(request,id=None):
    context={}
    (self_organization,parent_organization,store)=findOrganization(request)
    if id==None or id=="all":
        if request.user.is_superuser:
            query=Product.objects.all()
        else:
            query=Product.objects.filter(product_detail__organization=parent_organization)
    else:
        query=Product.objects.filter(id=int(id))
    (self_organization,parent_organization,store)=findOrganization(request)
    org_store_query=Store.objects.filter(Q(organization=parent_organization)|Q(organization__parent=parent_organization))
    context['stores']=org_store_query

    context['products']=query.order_by("-pk")
    context['organizations']=Organization.objects.all()
    context['products_length']=query.count()
    # context['']
    return render(request,'products/products.html',context)

@login_required(login_url='/admin')
def form(request,id=None):
    context={}
    (self_organization,parent_organization,store)=findOrganization(request)
    stock_query=Stock.objects.filter(store=store)
    if id!=None:
        product=Product.objects.get(id=int(id))
        context['product']=product
        context['id']=int(id)
        stock_query=stock_query.filter(product=product)
        if stock_query.count()>0:
            stock=stock_query[0]
        else:
            stock=Stock(product=product,store=store,current_amount=0)
            stock.save()
        current_amount=stock.current_amount
        context['current_amount']=current_amount
    template=loader.get_template('products/product_form.html')
    context['self_organization']=self_organization
    context['parent_organization']=parent_organization
    context['categories']=Category.objects.all()
    return HttpResponse(template.render(context,request))

@login_required(login_url='/admin')
@api_view(('PUT','POST'))
def create(request,id=None):
    data=request.data
    print("EEE")
    product=dict()
    product['id']=data['id']
    product['item_name']=data['item_name']
    product['category']=data['category']
    # product['organization']=data['organization']
    if hasattr(request.FILES,'img'):
        img=request.FILES['img']
    else:
        img=None
    # print("imagge",request.FILES['img'])
    product['is_active']=data['is_active']
    print(" data",data) 
    # return Response("test")
    product_detail=dict()
    stock_detail=dict()
    product['model']=data['model']
    if data['minimum_requirement']=='':
        data['minimum_requirement']=0
    product_detail['minimum_requirement']=data['minimum_requirement']
    if data['current_amount']=='':
        data['current_amount']=0
    stock_detail['current_amount']=data['current_amount']
    
    if data['purchased_price']=='':
        data['purchased_price']=0
    product_detail['purchased_price']=data['purchased_price']
    if data['selling_price']=='':
        data['selling_price']=0
    product_detail['selling_price']=data['selling_price']
    category_id=product['category']
    product['category']=Category.objects.get(id=int(category_id))
    (self_organization,parent_organization,store)=findOrganization(request)
    product_detail['organization']=parent_organization
    # print('request.data ',type(product))
    # product=request.data
    # print('product ',product,' request data ',request.data,' product_detail ',product_detail)
    if 'is_active' in product.keys():
        if product['is_active']=='on':
            product['is_active']=True
        else:
            product['is_active']=False
    else:
        product['is_active']=False
    if product['id']=='' or product['id']==' ' or product['id']==None:
        product.pop('id')
        product_query=Product.objects.filter(item_name=product['item_name'],model=product['model'])
        if product_query.exists():
            ok=False
            message="product {} {} already exists".format(product['item_name'],product['model'])
            product=product_query[0]
            # print('product execption ',e)
            return Response({"message":message,"ok":ok,"id":product.id})
        product=Product(**product)
        print(' product ',product)
        try:
            product.save()
            message='Product Inserted'
            ok=True
        except Exception as e:
            message=str(e)
            ok=False
            print('product execption ',e)
    else:
        product['id']=int(product['id'])
        try:
            product_query=Product.objects.filter(id=product['id'])
            product_query.update(**product)
            product=product_query[0]
            ok=True
            message="Data Inserted"
        except Exception as e:
            print("Exception ",str(e))
    product.img=img
    product.save()
    product_detail_query=Product_Detail.objects.filter(product=product,organization=parent_organization)
    print("product_detail_query ",product_detail_query)
    try:        
        if product_detail_query.count()>0:
            product_detail_query.update(**product_detail)
        else:
            print("product_detail_query.count()<0 ")
            product_detail=Product_Detail(product=product,**product_detail)
            product_detail.save()
    except Exception as e:
        print("product_detail e ",e)
        message=str(e)
        ok=False
    
    org_store_query=Store.objects.filter(Q(organization=parent_organization)|Q(organization__parent=parent_organization))
    for store in org_store_query:
        stock_query=Stock.objects.filter(product=product,store=store)
        if len(stock_query)==0:
            stock=Stock(product=product,store=store,current_amount=stock_detail['current_amount']) 
            stock.save()
    return Response({"message":message,"ok":ok,"id":product.id})

@api_view(['GET','POST'])
def show(request,organization_id="all"):
    # print("method",request.method,"data",request.data)
    if organization_id=="all":
        (self_organization,parent_organization,store)=findOrganization(request)      
        query_set=Product.objects.all().order_by('-pk')
        if request.method=='POST':
            if 'item_name' in request.data:
                query_set=query_set.filter(item_name__icontains=request.data['item_name'])
    else:
        (self_organization,parent_organization,store)=findOrganization(request,organization_id)      
        query_set=Product.objects.filter(product_detail__organization=parent_organization)

    if 'store_id' in request.data:
        context={'store_id':request.data['store_id']}
    else:
        if store:
            context={'store_id':store.id}
        else:
            context={'store_id':None}
    if request.method=='POST':
        if  int(request.data['is_paginate'])==1:
            paginator=PageNumberPagination()
            paginator.page_size=20
            query_set=paginator.paginate_queryset(query_set.order_by('item_name'),request)
            serializer=ProductSerializer(query_set,many=True,context=context)
            return paginator.get_paginated_response({'ok':True,'serializer_data':serializer.data})
    serializer=ProductSerializer(query_set.order_by('item_name'),context=context,many=True)
    return Response(serializer.data)


@api_view(['GET'])
def select_service(request,html_id="all",dest=None):  
    print("########id=",html_id)
    if html_id=="all":
        query_set=Service.objects.all().order_by('-pk')
    else:
        language_obj=Languages.objects.get(language=dest)
        query_set=Service.objects.filter(html_id=str(html_id),dest=language_obj)
        
    print("select service=",query_set)
    serializer=ServiceSerializer(query_set,many=True)

    return Response(serializer.data)




