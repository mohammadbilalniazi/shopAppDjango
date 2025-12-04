from .serializer import StockUpdateSerializer
from .models import Stock,Product
from configuration.models import Organization
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import render
from common.organization import find_userorganization

@csrf_exempt
@api_view(['POST'])
def update(request):
    data=request.data.copy()
    print("############data ",data)
    current_amount=request.data.get('current_amount',0)
    product_id=request.data.get('product_id',None)
    organization_id=request.data.get('organization_id',None)
    branch_id=request.data.get('branch_id',None)

    product=Product.objects.get(id=int(product_id))
    organization=Organization.objects.get(id=int(organization_id))
    
    # Handle branch if provided
    branch = None
    if branch_id:
        try:
            from configuration.models import Branch
            branch = Branch.objects.get(
                id=int(branch_id), 
                organization=organization,
                is_active=True
            )
        except Branch.DoesNotExist:
            pass  # Branch is optional
    
    data['product']=product.id
    data['organization']=organization.id
    data['branch']=branch.id if branch else None
    data['current_amount']=current_amount
    
    stock,_=Stock.objects.get_or_create(
        product=product,
        organization=organization,
        branch=branch,
        defaults={'current_amount': 0}
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
        stock_query = Stock.objects.filter(organization=self_organization).select_related('product', 'branch')
    else:
        branches = Branch.objects.filter(organization__in=user_orgs, is_active=True)
        stock_query = Stock.objects.filter(organization__in=user_orgs).select_related('product', 'branch')
    
    # Filter by branch if specified
    branch_id = request.GET.get('branch')
    if branch_id:
        try:
            selected_branch = branches.get(id=int(branch_id))
            stock_query = stock_query.filter(branch=selected_branch)
        except (Branch.DoesNotExist, ValueError):
            pass
    
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

    