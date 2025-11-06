from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.decorators import login_required
from common.organization import find_userorganization
from configuration.models import Organization
from asset.models import OrganizationAsset, Loan, ProfitLossStatement
from asset.utils import (
    update_organization_assets,
    get_balance_sheet,
    get_profit_loss_statement,
    get_cash_flow_summary
)
from decimal import Decimal


@login_required(login_url='/')
def asset_dashboard(request):
    """
    Main asset dashboard showing overview of financial position.
    """
    self_organization, parent_organization, user_orgs = find_userorganization(request)
    
    context = {}
    
    # Handle organization selection
    if request.user.is_superuser:
        context['organizations'] = Organization.objects.all()
    else:
        if parent_organization is not None:
            context['organizations'] = Organization.objects.filter(id=parent_organization.id)
        else:
            context['organizations'] = user_orgs
    
    # Get selected organization or use default
    org_id = request.GET.get('organization')
    if org_id:
        try:
            selected_org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            selected_org = parent_organization or user_orgs.first()
    else:
        selected_org = parent_organization or user_orgs.first()
    
    context['selected_organization'] = selected_org
    
    if selected_org:
        # Update asset summary
        asset_summary = update_organization_assets(selected_org)
        context['asset_summary'] = asset_summary
        
        # Get financial statements
        context['balance_sheet'] = get_balance_sheet(selected_org)
        context['profit_loss'] = get_profit_loss_statement(selected_org)
        context['cash_flow'] = get_cash_flow_summary(selected_org)
    
    return render(request, "asset/dashboard.html", context)


@login_required(login_url='/')
def balance_sheet_view(request):
    """
    Detailed balance sheet view.
    """
    self_organization, parent_organization, user_orgs = find_userorganization(request)
    
    context = {}
    
    if request.user.is_superuser:
        context['organizations'] = Organization.objects.all()
    else:
        if parent_organization is not None:
            context['organizations'] = Organization.objects.filter(id=parent_organization.id)
        else:
            context['organizations'] = user_orgs
    
    org_id = request.GET.get('organization')
    if org_id:
        try:
            selected_org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            selected_org = parent_organization or user_orgs.first()
    else:
        selected_org = parent_organization or user_orgs.first()
    
    context['selected_organization'] = selected_org
    
    if selected_org:
        context['balance_sheet'] = get_balance_sheet(selected_org)
    
    return render(request, "asset/balance_sheet.html", context)


@login_required(login_url='/')
def profit_loss_view(request):
    """
    Detailed profit & loss statement view.
    """
    self_organization, parent_organization, user_orgs = find_userorganization(request)
    
    context = {}
    
    if request.user.is_superuser:
        context['organizations'] = Organization.objects.all()
    else:
        if parent_organization is not None:
            context['organizations'] = Organization.objects.filter(id=parent_organization.id)
        else:
            context['organizations'] = user_orgs
    
    org_id = request.GET.get('organization')
    if org_id:
        try:
            selected_org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            selected_org = parent_organization or user_orgs.first()
    else:
        selected_org = parent_organization or user_orgs.first()
    
    context['selected_organization'] = selected_org
    
    if selected_org:
        context['profit_loss'] = get_profit_loss_statement(selected_org)
    
    return render(request, "asset/profit_loss.html", context)


@login_required(login_url='/')
def cash_flow_view(request):
    """
    Cash flow statement view.
    """
    self_organization, parent_organization, user_orgs = find_userorganization(request)
    
    context = {}
    
    if request.user.is_superuser:
        context['organizations'] = Organization.objects.all()
    else:
        if parent_organization is not None:
            context['organizations'] = Organization.objects.filter(id=parent_organization.id)
        else:
            context['organizations'] = user_orgs
    
    org_id = request.GET.get('organization')
    if org_id:
        try:
            selected_org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            selected_org = parent_organization or user_orgs.first()
    else:
        selected_org = parent_organization or user_orgs.first()
    
    context['selected_organization'] = selected_org
    
    if selected_org:
        context['cash_flow'] = get_cash_flow_summary(selected_org)
    
    return render(request, "asset/cash_flow.html", context)


@login_required(login_url='/')
def loans_view(request):
    """
    View all loans (payable and receivable).
    """
    self_organization, parent_organization, user_orgs = find_userorganization(request)
    
    context = {}
    
    if request.user.is_superuser:
        context['organizations'] = Organization.objects.all()
    else:
        if parent_organization is not None:
            context['organizations'] = Organization.objects.filter(id=parent_organization.id)
        else:
            context['organizations'] = user_orgs
    
    org_id = request.GET.get('organization')
    if org_id:
        try:
            selected_org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            selected_org = parent_organization or user_orgs.first()
    else:
        selected_org = parent_organization or user_orgs.first()
    
    context['selected_organization'] = selected_org
    
    if selected_org:
        # Get loans
        context['loans_payable'] = Loan.objects.filter(
            organization=selected_org,
            loan_type='PAYABLE'
        ).select_related('counterparty')
        
        context['loans_receivable'] = Loan.objects.filter(
            organization=selected_org,
            loan_type='RECEIVABLE'
        ).select_related('counterparty')
    
    return render(request, "asset/loans.html", context)


@api_view(['POST'])
def refresh_assets(request):
    """
    API endpoint to manually refresh asset calculations for an organization.
    """
    org_id = request.data.get('organization_id')
    
    if not org_id:
        return Response(
            {'error': 'organization_id required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        organization = Organization.objects.get(id=org_id)
    except Organization.DoesNotExist:
        return Response(
            {'error': 'Organization not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Recalculate assets
    asset_summary = update_organization_assets(organization)
    
    return Response({
        'success': True,
        'message': 'Assets updated successfully',
        'data': {
            'total_assets': float(asset_summary.total_assets),
            'total_liabilities': float(asset_summary.total_liabilities),
            'equity': float(asset_summary.equity),
            'net_profit': float(asset_summary.net_profit),
            'cash_on_hand': float(asset_summary.cash_on_hand),
            'inventory_value': float(asset_summary.inventory_value),
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_asset_summary_api(request, org_id):
    """
    API endpoint to get asset summary as JSON.
    """
    try:
        organization = Organization.objects.get(id=org_id)
    except Organization.DoesNotExist:
        return Response(
            {'error': 'Organization not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    asset_summary = update_organization_assets(organization)
    balance_sheet = get_balance_sheet(organization)
    profit_loss = get_profit_loss_statement(organization)
    cash_flow = get_cash_flow_summary(organization)
    
    return Response({
        'organization': organization.name,
        'balance_sheet': {
            'total_assets': float(balance_sheet['assets']['total_assets']),
            'total_liabilities': float(balance_sheet['liabilities']['total_liabilities']),
            'total_equity': float(balance_sheet['equity']['total_equity']),
            'cash': float(balance_sheet['assets']['current_assets']['cash']),
            'inventory': float(balance_sheet['assets']['current_assets']['inventory']),
            'accounts_receivable': float(balance_sheet['assets']['current_assets']['accounts_receivable']),
            'accounts_payable': float(balance_sheet['liabilities']['current_liabilities']['accounts_payable']),
        },
        'profit_loss': {
            'revenue': float(profit_loss['revenue']['total_revenue']),
            'cogs': float(profit_loss['cost_of_sales']['total_cogs']),
            'gross_profit': float(profit_loss['gross_profit']),
            'expenses': float(profit_loss['operating_expenses']['total_expenses']),
            'net_profit': float(profit_loss['net_profit']),
        },
        'cash_flow': {
            'operating_cash': float(cash_flow['operating_activities']['net_operating_cash']),
            'financing_cash': float(cash_flow['financing_activities']['net_financing_cash']),
            'net_cash_flow': float(cash_flow['net_cash_flow']),
        }
    }, status=status.HTTP_200_OK)


@login_required(login_url='/admin')
@api_view(['POST'])
def calculate_total_purchased_asset_from_products_using(request):
    """
    Calculate total purchased asset from products using purchased_price and stock current_amount.
    Formula: SUM(current_amount * purchased_price) for all products
    Stores result in AssetWholeBillSummary with bill_type='PURC_ASSET'
    """
    try:
        from product.models import Product_Detail, Stock
        from asset.models import AssetWholeBillSummary
        
        organization_id = request.data.get("organization", None)
        
        if not organization_id:
            return JsonResponse({'success': False, 'message': 'Organization is required'}, status=400)
        
        try:
            organization = Organization.objects.get(id=int(organization_id))
        except Organization.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Organization not found'}, status=404)
        
        # Calculate total purchased asset
        total_purchased_asset = Decimal('0.00')
        products_calculated = 0
        
        # Get all product details for this organization
        product_details = Product_Detail.objects.filter(organization=organization)
        
        for product_detail in product_details:
            product = product_detail.product
            purchased_price = product_detail.purchased_price or Decimal('0.00')
            
            # Get stock for this product and organization
            try:
                stock = Stock.objects.get(product=product, organization=organization)
                current_amount = stock.current_amount or Decimal('0.00')
                
                # Calculate: current_amount * purchased_price
                product_asset_value = current_amount * purchased_price
                total_purchased_asset += product_asset_value
                products_calculated += 1
                
                print(f"Product: {product.item_name}, Stock: {current_amount}, Price: {purchased_price}, Value: {product_asset_value}")
                
            except Stock.DoesNotExist:
                # If no stock exists, skip this product
                print(f"No stock found for product: {product.item_name}")
                continue
        
        # Create or update AssetWholeBillSummary
        # Using 'PURC_ASSET' to match the model choices
        asset_summary, created = AssetWholeBillSummary.objects.update_or_create(
            organization=organization,
            bill_type='PURC_ASSET',
            defaults={
                'total': total_purchased_asset,
                'payment': Decimal('0.00'),  # Not applicable for this calculation
                'profit': 0,
                'currency': 'afg'
            }
        )
        
        action = "created" if created else "updated"
        
        return JsonResponse({
            'success': True,
            'message': f'Purchased asset {action} successfully',
            'data': {
                'organization': organization.name,
                'total_purchased_asset': float(total_purchased_asset),
                'products_calculated': products_calculated,
                'action': action
            }
        })
        
    except Exception as e:
        print("Error in calculate_total_purchased_asset_from_products_using: ", str(e))
        import traceback
        traceback.print_exc()
        return JsonResponse({'success': False, 'message': str(e)}, status=400)
