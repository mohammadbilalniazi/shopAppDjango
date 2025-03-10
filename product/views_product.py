from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from .serializer import *
from .models import *
from common.organization import findOrganization
from django.http import HttpResponse
from django.template import loader 
from django.contrib.auth.decorators import login_required
from django.db.models import Q
    
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

from django.shortcuts import get_object_or_404
from django.db import transaction


@login_required(login_url='/admin')
@api_view(('PUT', 'POST'))
@transaction.atomic #no partial update
def create(request, id=None):
    data = request.data
    print("EEE")
    
    # Create product dictionary
    product = {
        "id": data.get("id"),
        "img": request.FILES.get("img", None),
        "item_name": data.get("item_name"),
        "category": get_object_or_404(Category, id=int(data["category"])),  # Ensures category exists
        "model": data.get("model", ""),
        "is_service": data.get("is_service") == "on"
    }

    # Convert numeric values safely
    product_detail = {
        "minimum_requirement": int(data.get("minimum_requirement", 0)),
        "purchased_price": float(data.get("purchased_price", 0)),
        "selling_price": float(data.get("selling_price", 0))
    }
    
    stock_detail = {
        "current_amount": float(data.get("current_amount", 0))
    }

    # Fetch parent organization
    self_organization, parent_organization, store = findOrganization(request)
    product_detail["organization"] = parent_organization

    # Create or update Product
    if not product["id"] or str(product["id"]).strip() == "":
        product.pop("id")
        product_query = Product.objects.filter(item_name=product["item_name"], model=product["model"])
        if product_query.exists():
            product = product_query.first()
            return Response({"message": f"Product {product.item_name} {product.model} already exists", "ok": False, "id": product.id})

        product = Product(**product)
        try:
            product.save()
            message = "Product Inserted"
            ok = True
        except Exception as e:
            return Response({"message": str(e), "ok": False})
    else:
        product["id"] = int(product["id"])
        try:
            product_query = Product.objects.filter(id=product["id"])
            product_query.update(**product)
            product = product_query.first()
            message = "Data Updated"
            ok = True
        except Exception as e:
            return Response({"message": str(e), "ok": False})

    # Ensure product has correct image
    if product.img:  # Check if there's an image
        product.img = request.FILES.get("img")  # Assign uploaded image
        product.save()

    # Update or create Product_Detail
    product_detail_query = Product_Detail.objects.filter(product=product, organization=parent_organization)
    if product_detail_query.exists():
        product_detail_query.update(**product_detail)
    else:
        Product_Detail.objects.create(product=product, **product_detail)

    # Update stock for all stores in the parent organization
    org_store_query = Store.objects.filter(Q(organization=parent_organization) | Q(organization__parent=parent_organization))
    for store in org_store_query:
        stock, created = Stock.objects.get_or_create(product=product, store=store, defaults={"current_amount": stock_detail["current_amount"]})
        if not created:
            stock.current_amount = stock_detail["current_amount"]
            stock.save()

    return Response({"message": message, "ok": ok, "id": product.id})

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




