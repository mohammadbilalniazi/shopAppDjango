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
    # Get organization based on request parameter or user's organization
    org_id = request.GET.get('organization')
    self_organization, parent_organization, user_orgs = find_userorganization(request, org_id)
    
    context = {}
    
    # Organizations list for dropdown (use user_orgs from find_userorganization)
    context['organizations'] = user_orgs
    
    # Determine selected organization
    if org_id and org_id != 'all':
        # User selected a specific organization
        try:
            selected_org = Organization.objects.get(id=org_id)
            # Verify user has access to this organization
            if not request.user.is_superuser:
                if selected_org.id not in user_orgs.values_list('id', flat=True):
                    selected_org = self_organization or parent_organization or user_orgs.first()
        except Organization.DoesNotExist:
            selected_org = self_organization or parent_organization or user_orgs.first()
    else:
        # Use default organization from find_userorganization
        selected_org = self_organization or parent_organization or user_orgs.first()
    
    context['selected_organization'] = selected_org
    context['organization'] = selected_org  # For consistency with other templates
    
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
    # Get organization based on request parameter or user's organization
    org_id = request.GET.get('organization')
    self_organization, parent_organization, user_orgs = find_userorganization(request, org_id)
    
    context = {}
    
    # Organizations list for dropdown
    context['organizations'] = user_orgs
    
    # Determine selected organization
    if org_id and org_id != 'all':
        try:
            selected_org = Organization.objects.get(id=org_id)
            if not request.user.is_superuser:
                if selected_org.id not in user_orgs.values_list('id', flat=True):
                    selected_org = self_organization or parent_organization or user_orgs.first()
        except Organization.DoesNotExist:
            selected_org = self_organization or parent_organization or user_orgs.first()
    else:
        selected_org = self_organization or parent_organization or user_orgs.first()
    
    context['selected_organization'] = selected_org
    context['organization'] = selected_org
    
    if selected_org:
        context['balance_sheet'] = get_balance_sheet(selected_org)
    
    return render(request, "asset/balance_sheet.html", context)


@login_required(login_url='/')
def profit_loss_view(request):
    """
    Detailed profit & loss statement view.
    """
    # Get organization based on request parameter or user's organization
    org_id = request.GET.get('organization')
    self_organization, parent_organization, user_orgs = find_userorganization(request, org_id)
    
    context = {}
    
    # Organizations list for dropdown
    context['organizations'] = user_orgs
    
    # Determine selected organization
    if org_id and org_id != 'all':
        try:
            selected_org = Organization.objects.get(id=org_id)
            if not request.user.is_superuser:
                if selected_org.id not in user_orgs.values_list('id', flat=True):
                    selected_org = self_organization or parent_organization or user_orgs.first()
        except Organization.DoesNotExist:
            selected_org = self_organization or parent_organization or user_orgs.first()
    else:
        selected_org = self_organization or parent_organization or user_orgs.first()
    
    context['selected_organization'] = selected_org
    context['organization'] = selected_org
    
    if selected_org:
        context['profit_loss'] = get_profit_loss_statement(selected_org)
    
    return render(request, "asset/profit_loss.html", context)


@login_required(login_url='/')
def cash_flow_view(request):
    """
    Cash flow statement view.
    """
    # Get organization based on request parameter or user's organization
    org_id = request.GET.get('organization')
    self_organization, parent_organization, user_orgs = find_userorganization(request, org_id)
    
    context = {}
    
    # Organizations list for dropdown
    context['organizations'] = user_orgs
    
    # Determine selected organization
    if org_id and org_id != 'all':
        try:
            selected_org = Organization.objects.get(id=org_id)
            if not request.user.is_superuser:
                if selected_org.id not in user_orgs.values_list('id', flat=True):
                    selected_org = self_organization or parent_organization or user_orgs.first()
        except Organization.DoesNotExist:
            selected_org = self_organization or parent_organization or user_orgs.first()
    else:
        selected_org = self_organization or parent_organization or user_orgs.first()
    
    context['selected_organization'] = selected_org
    context['organization'] = selected_org
    
    if selected_org:
        context['cash_flow'] = get_cash_flow_summary(selected_org)
    
    return render(request, "asset/cash_flow.html", context)


@login_required(login_url='/')
def loans_view(request):
    """
    View all loans (payable and receivable).
    """
    # Get organization based on request parameter or user's organization
    org_id = request.GET.get('organization')
    self_organization, parent_organization, user_orgs = find_userorganization(request, org_id)
    
    context = {}
    
    # Organizations list for dropdown
    context['organizations'] = user_orgs
    
    # Determine selected organization
    if org_id and org_id != 'all':
        try:
            selected_org = Organization.objects.get(id=org_id)
            if not request.user.is_superuser:
                if selected_org.id not in user_orgs.values_list('id', flat=True):
                    selected_org = self_organization or parent_organization or user_orgs.first()
        except Organization.DoesNotExist:
            selected_org = self_organization or parent_organization or user_orgs.first()
    else:
        selected_org = self_organization or parent_organization or user_orgs.first()
    
    context['selected_organization'] = selected_org
    context['organization'] = selected_org
    
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


@login_required(login_url='/')
def admin_dashboard(request):
    """
    Beautiful comprehensive admin dashboard showing all system statistics.
    """
    from django.db.models import Count, Sum, Q, Avg
    from django.contrib.auth.models import User
    from bill.models import Bill, Bill_Receiver2
    from product.models import Product, Stock, Product_Detail, Category, Unit
    from user.models import OrganizationUser
    from expenditure.models import Expense
    from configuration.models import Organization, CustomUser
    from datetime import datetime, timedelta
    
    # Get organization based on request parameter or user's organization
    org_id = request.GET.get('organization')
    self_organization, parent_organization, user_orgs = find_userorganization(request, org_id)
    
    # Determine selected organization
    if org_id and org_id != 'all':
        # User selected a specific organization
        try:
            selected_org = Organization.objects.get(id=org_id)
            # Verify user has access to this organization
            if not request.user.is_superuser:
                if selected_org.id not in user_orgs.values_list('id', flat=True):
                    selected_org = self_organization or parent_organization or user_orgs.first()
        except Organization.DoesNotExist:
            selected_org = self_organization or parent_organization or user_orgs.first()
    else:
        # Use default organization from find_userorganization
        selected_org = self_organization or parent_organization or user_orgs.first()
    
    context = {}
    
    # Organizations list for dropdown (use user_orgs from find_userorganization)
    context['organizations'] = user_orgs
    context['selected_organization'] = selected_org
    context['organization'] = selected_org  # For consistency with other templates
    
    if selected_org:
        # ===== BILL STATISTICS =====
        bills = Bill.objects.filter(organization=selected_org)
        
        # Total bills by type
        context['total_bills'] = bills.count()
        context['purchase_bills'] = bills.filter(bill_type='PURCHASE').count()
        context['selling_bills'] = bills.filter(bill_type='SELLING').count()
        context['payment_bills'] = bills.filter(bill_type='PAYMENT').count()
        context['receivement_bills'] = bills.filter(bill_type='RECEIVEMENT').count()
        context['expense_bills'] = bills.filter(bill_type='EXPENSE').count()
        context['lossdegrade_bills'] = bills.filter(bill_type='LOSSDEGRADE').count()
        
        # Bill totals by type
        bill_stats = bills.values('bill_type').annotate(
            total=Sum('bill_total'),
            count=Count('id'),
            total_payment=Sum('bill_totalpayment')
        )
        context['bill_stats'] = list(bill_stats)
        
        # Recent bills
        context['recent_bills'] = bills.select_related('organization', 'creator').order_by('-bill_date')[:10]
        
        # Monthly bill trends (last 6 months)
        monthly_bills = []
        for i in range(5, -1, -1):
            month_start = datetime.now().replace(day=1) - timedelta(days=30*i)
            month_bills = bills.filter(
                bill_date__year=month_start.year,
                bill_date__month=month_start.month
            )
            monthly_bills.append({
                'month': month_start.strftime('%b %Y'),
                'count': month_bills.count(),
                'total': month_bills.aggregate(Sum('bill_total'))['bill_total__sum'] or 0
            })
        context['monthly_bills'] = monthly_bills
        
        # ===== PRODUCT STATISTICS =====
        products = Product.objects.filter(organization=selected_org)
        context['total_products'] = products.count()
        context['active_products'] = products.filter(is_active=True).count()
        
        # Stock statistics
        stocks = Stock.objects.filter(organization=selected_org)
        context['total_stock_items'] = stocks.count()
        context['total_stock_quantity'] = stocks.aggregate(Sum('quantity'))['quantity__sum'] or 0
        
        # Low stock alerts (less than 10 units)
        context['low_stock_items'] = stocks.filter(quantity__lt=10).count()
        
        # Products by category
        category_stats = products.values('category__name').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        context['category_stats'] = list(category_stats)
        
        # Recent products
        context['recent_products'] = products.select_related('category').order_by('-id')[:5]
        
        # ===== FINANCIAL STATISTICS =====
        # Update assets first
        update_organization_assets(selected_org)
        
        # Get organization asset
        try:
            org_asset = OrganizationAsset.objects.get(organization=selected_org)
            context['org_asset'] = org_asset
            
            # Financial metrics
            context['total_assets'] = org_asset.total_assets
            context['total_liabilities'] = org_asset.total_liabilities
            context['equity'] = org_asset.equity
            context['net_profit'] = org_asset.net_profit
            context['cash_on_hand'] = org_asset.cash_on_hand
            context['inventory_value'] = org_asset.inventory_value
            context['accounts_receivable'] = org_asset.accounts_receivable
            context['accounts_payable'] = org_asset.accounts_payable
            
            # Revenue breakdown
            context['total_revenue'] = org_asset.total_revenue
            context['total_cogs'] = org_asset.total_cost_of_goods_sold
            context['total_expenses'] = org_asset.total_expenses
            context['total_losses'] = org_asset.total_losses
            
            # Profit margin
            if org_asset.total_revenue > 0:
                context['profit_margin'] = (org_asset.net_profit / org_asset.total_revenue) * 100
            else:
                context['profit_margin'] = 0
                
        except OrganizationAsset.DoesNotExist:
            context['org_asset'] = None
            context['total_assets'] = 0
            context['total_liabilities'] = 0
            context['equity'] = 0
            context['net_profit'] = 0
        
        # ===== LOAN STATISTICS =====
        loans = Loan.objects.filter(organization=selected_org)
        context['total_loans'] = loans.count()
        context['active_loans'] = loans.filter(status='ACTIVE').count()
        context['loans_receivable_count'] = loans.filter(loan_type='RECEIVABLE').count()
        context['loans_payable_count'] = loans.filter(loan_type='PAYABLE').count()
        
        # Loan amounts
        context['loans_receivable_amount'] = loans.filter(loan_type='RECEIVABLE').aggregate(
            Sum('amount_remaining'))['amount_remaining__sum'] or 0
        context['loans_payable_amount'] = loans.filter(loan_type='PAYABLE').aggregate(
            Sum('amount_remaining'))['amount_remaining__sum'] or 0
        
        # ===== USER STATISTICS =====
        org_users = OrganizationUser.objects.filter(organization=selected_org)
        context['total_org_users'] = org_users.count()
        context['active_org_users'] = org_users.filter(is_active=True).count()
        
        # ===== EXPENSE STATISTICS =====
        expenses = Expense.objects.filter(organization=selected_org)
        context['total_expenses_count'] = expenses.count()
        context['total_expenses_amount'] = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Recent expenses
        context['recent_expenses'] = expenses.order_by('-date')[:5]
        
    # ===== SYSTEM-WIDE STATISTICS (for superusers) =====
    if request.user.is_superuser:
        context['total_organizations'] = Organization.objects.count()
        context['total_system_users'] = CustomUser.objects.count()
        context['total_system_bills'] = Bill.objects.count()
        context['total_system_products'] = Product.objects.count()
    
    return render(request, 'asset/admin_dashboard.html', context)
