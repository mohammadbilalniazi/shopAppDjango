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
        
    # Get branches for the organization(s)
    from configuration.models import Branch
    if self_organization is not None:
        branches = Branch.objects.filter(organization=self_organization, is_active=True)
    else:
        branches = Branch.objects.filter(organization__in=user_orgs, is_active=True)
    context['branches'] = branches
    # Provide all branches for client-side filtering
    context['all_branches'] = Branch.objects.filter(is_active=True)
        
    if id!=None:
        try:
            product=Product.objects.select_related('product_detail', 'product_detail__organization', 'product_detail__branch').get(id=int(id))
        except Product.DoesNotExist:
            # Handle case where product doesn't exist
            product = None
        
        if product:
            context['product']=product
            context['id']=int(id)
            
            # Ensure product has product_detail
            if not hasattr(product, 'product_detail') or not product.product_detail:
                # Create product_detail if it doesn't exist
                org_for_detail = self_organization if self_organization else (user_orgs.first() if user_orgs.exists() else None)
                if org_for_detail:
                    Product_Detail.objects.create(
                        product=product,
                        organization=org_for_detail,
                        minimum_requirement=1,
                        purchased_price=0,
                        selling_price=0
                    )
                    # Reload the product with the new product_detail
                    product = Product.objects.select_related('product_detail', 'product_detail__organization', 'product_detail__branch').get(id=int(id))
                    context['product'] = product
            
            stock_query=stock_query.filter(product=product)
            if stock_query.count()>0:
                stock=stock_query[0]
            else:
                stock=Stock(product=product,organization=self_organization,current_amount=0)
                stock.save()
            current_amount=stock.current_amount
            context['current_amount']=current_amount
    template=loader.get_template('products/product_form.html')
    context['self_organization'] = self_organization
    context['parent_organization'] = None  # Deprecated field
    context['organizations'] = user_orgs
    context['categories'] = Category.objects.all()
    # Always provide organizations_list for the dropdown
    context['organizations_list'] = user_orgs
    # Set selected_org for add/edit
    if 'product' in context and hasattr(context['product'], 'product_detail') and context['product'].product_detail and context['product'].product_detail.organization:
        context['selected_org'] = context['product'].product_detail.organization
    else:
        context['selected_org'] = self_organization
    return HttpResponse(template.render(context, request))



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
    # Fetch organization and branch from form data or user's organization
    org_id = data.get("organization")
    branch_id = data.get("branch")
    self_organization, user_orgs = find_userorganization(request)
    
    if org_id:
        try:
            selected_org = user_orgs.get(id=int(org_id)) if user_orgs else None
            if not selected_org and self_organization and self_organization.id == int(org_id):
                selected_org = self_organization
        except (ValueError, TypeError):
            selected_org = None
    else:
        selected_org = self_organization
    
    if not selected_org:
        return Response({"message": "Please select a valid organization", "ok": False})

    # Handle branch selection
    selected_branch = None
    if branch_id:
        try:
            from configuration.models import Branch
            selected_branch = Branch.objects.get(
                id=int(branch_id), 
                organization=selected_org,
                is_active=True
            )
        except (Branch.DoesNotExist, ValueError, TypeError):
            # Branch is optional, so we continue without it
            pass

    product_detail["organization"] = selected_org
    product_detail["branch"] = selected_branch
        
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
    
    # Get organization and branch for product detail and stock
    org_for_product = product_detail.get("organization")
    branch_for_product = product_detail.get("branch")
    
    # Update or create Product_Detail
    product_detail_query = Product_Detail.objects.filter(product=product, organization=org_for_product)
    if product_detail_query.exists():
        product_detail_query.update(**product_detail)
        product_detail_obj = product_detail_query.first()
    else:
        product_detail_obj = Product_Detail.objects.create(product=product, **product_detail)
    
    # Always ensure stock exists for the organization and branch
    stock, created = Stock.objects.get_or_create(
        product=product, 
        organization=org_for_product,
        branch=branch_for_product,
        defaults={'current_amount': stock_detail.get("current_amount", 0)}
    )
    
    if not created:
        # Update existing stock amount
        stock.current_amount = stock_detail.get("current_amount", stock.current_amount)
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


@api_view(['POST'])
def create_category(request):
    """API endpoint to create a new category via AJAX"""
    try:
        name = request.data.get('name', '').strip()
        parent_id = request.data.get('parent', None)
        description = request.data.get('description', '').strip()
        is_active = request.data.get('is_active', True)
        
        # Handle string boolean values from FormData
        if isinstance(is_active, str):
            is_active = is_active.lower() in ['true', '1', 'yes', 'on']
        
        if not name:
            return Response({
                'ok': False,
                'message': 'Category name is required'
            }, status=400)
        
        # Check if category with this name already exists
        if Category.objects.filter(name=name).exists():
            return Response({
                'ok': False,
                'message': f'Category "{name}" already exists'
            }, status=400)
        
        # Get parent category if specified
        parent = None
        if parent_id:
            try:
                parent = Category.objects.get(id=parent_id)
            except Category.DoesNotExist:
                return Response({
                    'ok': False,
                    'message': 'Parent category not found'
                }, status=400)
        
        # Create the category
        category = Category.objects.create(
            name=name,
            parent=parent,
            description=description,
            is_active=is_active
        )
        
        return Response({
            'ok': True,
            'message': 'Category created successfully',
            'category': {
                'id': category.id,
                'name': category.name,
                'parent': category.parent.name if category.parent else None,
                'description': category.description
            }
        })
        
    except Exception as e:
        return Response({
            'ok': False,
            'message': f'Error creating category: {str(e)}'
        }, status=500)


