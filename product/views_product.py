from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from .serializer import *
from .models import *
from common.organization import find_userorganization
from django.http import HttpResponse
from django.template import loader 
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.db import transaction
    
def show_html(request,id=None):
    context={}
    self_organization, user_orgs = find_userorganization(request)

    if id==None or id=="all":
        if request.user.is_superuser:
            query=Product.objects.all()
        else:
            if self_organization is not None:
                query=Product.objects.filter(product_detail__organization=self_organization)
            else:
                query=Product.objects.filter(product_detail__organization__in=user_orgs)
    else:
        query=Product.objects.filter(id=int(id))

    context['products']=query.order_by("-pk")
    context['organizations']=user_orgs
    context['products_length']=query.count()
    return render(request,'products/products.html',context)

@login_required(login_url='/admin')
def form(request,id=None):
    context={}
    self_organization, user_orgs = find_userorganization(request)

    if self_organization is not None:
        stock_query=Stock.objects.filter(organization=self_organization)
    else:
        stock_query=Stock.objects.filter(organization__in=user_orgs)
        
    if id!=None:
        product=Product.objects.get(id=int(id))
        context['product']=product
        context['id']=int(id)
        stock_query=stock_query.filter(product=product)
        if stock_query.count()>0:
            stock=stock_query[0]
        else:
            stock=Stock(product=product,organization=self_organization,current_amount=0)
            stock.save()
        current_amount=stock.current_amount
        context['current_amount']=current_amount
    template=loader.get_template('products/product_form.html')
    context['self_organization']=self_organization
    context['parent_organization']=None  # Deprecated field
    context['organizations']=user_orgs
    context['categories']=Category.objects.all()
    return HttpResponse(template.render(context,request))



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
    # Fetch organization
    self_organization, user_orgs = find_userorganization(request)

    if self_organization is not None:
        product_detail["organization"] = self_organization
    else:
        # For users with multiple orgs, use the first one or get from request
        product_detail["organization"] = user_orgs.first() if user_orgs.exists() else None
        
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
    
    # Get organization for product detail and stock
    org_for_product = product_detail.get("organization")
    
    # Update or create Product_Detail
    product_detail_query = Product_Detail.objects.filter(product=product, organization=org_for_product)
    if product_detail_query.exists():
        product_detail_query.update(**product_detail)
    else:
        Product_Detail.objects.create(product=product, **product_detail)
    stock, created = Stock.objects.get_or_create(product=product, organization=org_for_product)
    if not created:
        stock.current_amount = stock_detail["current_amount"]
        stock.save()
    return Response({"message": message, "ok": ok, "id": product.id})
 

@api_view(['POST'])
def show(request):
    item_name=request.data.get("item_name",None)
    organization_id = request.data.get("organization", None)
    
    # Treat empty string as None
    if organization_id == '' or organization_id == 'all':
        organization_id = None
    
    self_organization, user_orgs = find_userorganization(request, organization_id)
    
    if organization_id is None:
        query_set=Product.objects.order_by('-pk')
    else:
        if self_organization is not None:
            query_set=Product.objects.filter(product_detail__organization=self_organization)
        else:
            query_set=Product.objects.filter(product_detail__organization__in=user_orgs)
    if item_name: 
        query_set=query_set.filter(item_name__icontains=item_name)
    print("self_organization ",self_organization)
    context={'organization':self_organization.id if hasattr(self_organization,'id') else None,'request':request}
    is_paginate=int(request.data.get("is_paginate",0))
    if  is_paginate==1:
        paginator=PageNumberPagination()
        paginator.page_size=20
        query_set=paginator.paginate_queryset(query_set.order_by('item_name'),request)
        serializer=ProductSerializer(query_set,many=True,context=context)
        return paginator.get_paginated_response({'ok':True,'serializer_data':serializer.data})
    serializer=ProductSerializer(query_set.order_by('item_name'),context=context,many=True)
    return Response(serializer.data)


