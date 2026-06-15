from .serializer import StockUpdateSerializer
from .models import Stock,Product
from configuration.models import Organization
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import render
from common.organization import find_userorganization
from common.branch_utils import get_valid_branch_for_organization
from .stock_utils import get_stock_for_scope

@api_view(['POST'])
def update(request):
    data=request.data.copy()
    current_amount=request.data.get('current_amount',0)
    product_id=request.data.get('product_id',None)
    organization_id=request.data.get('organization_id',None)
    branch_id=request.data.get('branch_id',None)

    if product_id in (None, "") or organization_id in (None, ""):
        return Response(
            {"message": "Product and organization are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        product=Product.objects.get(id=int(product_id))
        organization=Organization.objects.get(id=int(organization_id))
    except (Product.DoesNotExist, Organization.DoesNotExist, TypeError, ValueError):
        return Response(
            {"message": "Invalid product or organization"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    _, user_orgs = find_userorganization(request)
    if not request.user.is_superuser and not user_orgs.filter(id=organization.id).exists():
        return Response(
            {"message": "You do not have access to this organization"},
            status=status.HTTP_403_FORBIDDEN,
        )
    
    # Handle branch if provided
    try:
        branch = get_valid_branch_for_organization(organization, branch_id)
    except ValueError as exc:
        return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    
    data['product']=product.id
    data['organization']=organization.id
    data['branch']=branch.id if branch else None
    data['current_amount']=current_amount
    
    stock = get_stock_for_scope(
        product=product,
        organization=organization,
        branch=branch,
        defaults={'current_amount': 0},
        align_branch=True,
    )

    serializer=StockUpdateSerializer(stock,data=data,partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    print("###########serializer errors",serializer.errors)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@login_required(login_url='/admin')
def list_stocks(request):
    """List all stocks with branch filtering"""
    self_organization, user_orgs = find_userorganization(request)
    
    # Get branches for dropdown
    from configuration.models import Branch
    if self_organization is not None:
        branches = Branch.objects.filter(organization=self_organization, is_active=True)
        stock_query = Stock.objects.filter(organization=self_organization).select_related('product', 'branch', 'organization')
    else:
        branches = Branch.objects.filter(organization__in=user_orgs, is_active=True)
        stock_query = Stock.objects.filter(organization__in=user_orgs).select_related('product', 'branch', 'organization')
    
    # Filter by branch if specified
    branch_id = request.GET.get('branch')
    if branch_id:
        try:
            selected_branch = branches.get(id=int(branch_id))
            stock_query = stock_query.filter(branch=selected_branch)
        except (Branch.DoesNotExist, ValueError):
            branch_id = None
    
    page = request.GET.get('page', 1)
    paginator = Paginator(stock_query.order_by('-id'), 20)  # Show 20 stocks per page
    
    try:
        stocks = paginator.page(page)
    except PageNotAnInteger:
        stocks = paginator.page(1)
    except EmptyPage:
        stocks = paginator.page(paginator.num_pages)
    
    context = {
        'stocks': stocks,
        'branches': branches,
        'selected_branch': branch_id
    }
    
    return render(request, 'products/stock_list.html', context)

    
