"""
Asset Management Views
Uses AssetWholeBillSummary and AssetBillSummary for performance
Provides admin interface for manual adjustments
Shows organization ledger summaries
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Sum, Q, F
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from decimal import Decimal

from asset.models import (
    AssetBillSummary, AssetWholeBillSummary, 
    OrganizationAsset, Loan, ProfitLossStatement
)
from configuration.models import Organization
from user.models import OrganizationUser


@login_required
def organization_ledger_summary(request):
    """
    Show ledger summary between organizations
    Example: ABC org has 10000 upon XYZ org
    Uses cached AssetBillSummary data for performance
    """
    # Get user's organizations
    user = request.user
    
    if user.is_superuser or user.is_staff:
        # Admin can see all organizations
        user_orgs = Organization.objects.all()
    else:
        # Regular user sees only their organizations
        user_orgs = Organization.objects.filter(
            organizationuser__user=user
        ).distinct()
    
    # Selected organization (from dropdown or first org)
    selected_org_id = request.GET.get('organization')
    if selected_org_id:
        selected_org = get_object_or_404(Organization, id=selected_org_id)
    elif user_orgs.exists():
        selected_org = user_orgs.first()
    else:
        selected_org = None
    
    ledger_data = []
    
    if selected_org:
        # Get all organizations this org has transactions with
        # Using AssetBillSummary for performance (cached data)
        
        # Organizations we sold to / they owe us (SELLING)
        receivables = AssetBillSummary.objects.filter(
            organization=selected_org,
            bill_type='SELLING'
        ).values('bill_rcvr_org').annotate(
            total_sold=Sum('total'),
            total_received=Sum('payment')
        )
        
        # Organizations we purchased from / we owe them (PURCHASE)
        payables = AssetBillSummary.objects.filter(
            organization=selected_org,
            bill_type='PURCHASE'
        ).values('bill_rcvr_org').annotate(
            total_purchased=Sum('total'),
            total_paid=Sum('payment')
        )
        
        # Combine into ledger
        org_ledgers = {}
        
        # Process receivables (they owe us)
        for item in receivables:
            if item['bill_rcvr_org']:
                org = Organization.objects.get(id=item['bill_rcvr_org'])
                org_ledgers[org.id] = {
                    'organization': org,
                    'total_sold': item['total_sold'] or 0,
                    'payment_received': item['total_received'] or 0,
                    'receivable': (item['total_sold'] or 0) - (item['total_received'] or 0),
                    'total_purchased': 0,
                    'payment_made': 0,
                    'payable': 0,
                }
        
        # Process payables (we owe them)
        for item in payables:
            if item['bill_rcvr_org']:
                org_id = item['bill_rcvr_org']
                org = Organization.objects.get(id=org_id)
                
                if org_id in org_ledgers:
                    org_ledgers[org_id]['total_purchased'] = item['total_purchased'] or 0
                    org_ledgers[org_id]['payment_made'] = item['total_paid'] or 0
                    org_ledgers[org_id]['payable'] = (item['total_purchased'] or 0) - (item['total_paid'] or 0)
                else:
                    org_ledgers[org_id] = {
                        'organization': org,
                        'total_sold': 0,
                        'payment_received': 0,
                        'receivable': 0,
                        'total_purchased': item['total_purchased'] or 0,
                        'payment_made': item['total_paid'] or 0,
                        'payable': (item['total_purchased'] or 0) - (item['total_paid'] or 0),
                    }
        
        # Calculate net position for each organization
        for org_id, ledger in org_ledgers.items():
            # Net position: positive = they owe us, negative = we owe them
            ledger['net_position'] = ledger['receivable'] - ledger['payable']
            ledger_data.append(ledger)
        
        # Sort by absolute net position (largest debts first)
        ledger_data.sort(key=lambda x: abs(x['net_position']), reverse=True)
    
    context = {
        'user_organizations': user_orgs,
        'selected_organization': selected_org,
        'ledger_data': ledger_data,
        'is_admin': user.is_superuser or user.is_staff,
    }
    
    return render(request, 'asset/organization_ledger.html', context)


@login_required
def financial_summary_dashboard(request):
    """
    Financial dashboard using AssetWholeBillSummary for performance
    Shows purchase, sell, receive, payment, expense, loss, benefits
    """
    user = request.user
    
    # Get user's organizations
    if user.is_superuser or user.is_staff:
        user_orgs = Organization.objects.all()
    else:
        user_orgs = Organization.objects.filter(
            organizationuser__user=user
        ).distinct()
    
    # Selected organization
    selected_org_id = request.GET.get('organization')
    if selected_org_id:
        selected_org = get_object_or_404(Organization, id=selected_org_id)
    elif user_orgs.exists():
        selected_org = user_orgs.first()
    else:
        selected_org = None
    
    financial_summary = {}
    
    if selected_org:
        # Use AssetWholeBillSummary for performance (cached data, no bill queries)
        summaries = AssetWholeBillSummary.objects.filter(
            organization=selected_org
        )
        
        for summary in summaries:
            financial_summary[summary.bill_type] = {
                'total': summary.total,
                'payment': summary.payment,
                'profit': summary.profit,
                'outstanding': summary.total - summary.payment,
            }
        
        # Calculate totals
        purchases = financial_summary.get('PURCHASE', {})
        selling = financial_summary.get('SELLING', {})
        payments = financial_summary.get('PAYMENT', {})
        receivements = financial_summary.get('RECEIVEMENT', {})
        expenses = financial_summary.get('EXPENSE', {})
        losses = financial_summary.get('LOSSDEGRADE', {})
        
        # Derived metrics
        total_revenue = selling.get('total', 0)
        total_cost = purchases.get('total', 0)
        total_expenses = expenses.get('total', 0)
        total_losses = losses.get('total', 0)
        
        gross_profit = total_revenue - total_cost
        net_profit = gross_profit - total_expenses - total_losses
        
        # Accounts receivable (from selling)
        accounts_receivable = selling.get('outstanding', 0)
        
        # Accounts payable (from purchases)
        accounts_payable = purchases.get('outstanding', 0)
        
        # Loans receivable (money we gave out)
        loans_receivable = payments.get('outstanding', 0)
        
        # Loans payable (money we received)
        loans_payable = receivements.get('outstanding', 0)
        
        context = {
            'user_organizations': user_orgs,
            'selected_organization': selected_org,
            'financial_summary': financial_summary,
            
            # Key Metrics
            'total_revenue': total_revenue,
            'total_cost': total_cost,
            'total_expenses': total_expenses,
            'total_losses': total_losses,
            'gross_profit': gross_profit,
            'net_profit': net_profit,
            
            # Balance Sheet Items
            'accounts_receivable': accounts_receivable,
            'accounts_payable': accounts_payable,
            'loans_receivable': loans_receivable,
            'loans_payable': loans_payable,
            'net_position': accounts_receivable - accounts_payable + loans_receivable - loans_payable,
            
            'is_admin': user.is_superuser or user.is_staff,
        }
    else:
        context = {
            'user_organizations': user_orgs,
            'selected_organization': None,
            'financial_summary': {},
        }
    
    return render(request, 'asset/financial_dashboard.html', context)


@staff_member_required
def admin_adjust_summary(request):
    """
    Admin interface to manually adjust AssetWholeBillSummary values
    Useful for corrections or adjustments
    """
    if request.method == 'POST':
        summary_id = request.POST.get('summary_id')
        summary = get_object_or_404(AssetWholeBillSummary, id=summary_id)
        
        # Update values
        summary.total = Decimal(request.POST.get('total', summary.total))
        summary.payment = Decimal(request.POST.get('payment', summary.payment))
        summary.profit = int(request.POST.get('profit', summary.profit))
        summary.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Summary updated successfully'
        })
    
    # Get all organizations
    organizations = Organization.objects.all()
    selected_org_id = request.GET.get('organization')
    
    if selected_org_id:
        selected_org = get_object_or_404(Organization, id=selected_org_id)
        summaries = AssetWholeBillSummary.objects.filter(
            organization=selected_org
        ).order_by('bill_type')
    else:
        selected_org = None
        summaries = AssetWholeBillSummary.objects.all().order_by(
            'organization', 'bill_type'
        )[:50]  # Limit for performance
    
    context = {
        'organizations': organizations,
        'selected_organization': selected_org,
        'summaries': summaries,
    }
    
    return render(request, 'asset/admin_adjust_summary.html', context)


@staff_member_required
@require_http_methods(["POST"])
def admin_update_summary_ajax(request):
    """
    AJAX endpoint to update summary values
    """
    try:
        summary_id = request.POST.get('summary_id')
        field = request.POST.get('field')
        value = request.POST.get('value')
        
        summary = get_object_or_404(AssetWholeBillSummary, id=summary_id)
        
        if field == 'total':
            summary.total = Decimal(value)
        elif field == 'payment':
            summary.payment = Decimal(value)
        elif field == 'profit':
            summary.profit = int(value)
        else:
            return JsonResponse({'success': False, 'error': 'Invalid field'})
        
        summary.save()
        
        return JsonResponse({
            'success': True,
            'message': f'{field.title()} updated successfully',
            'new_value': str(getattr(summary, field))
        })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })


@login_required
def organization_user_summary(request):
    """
    Summary for organization users (non-admin)
    Shows their organization's financial position
    Uses cached data for performance
    """
    user = request.user
    
    # Get user's organizations
    user_orgs = Organization.objects.filter(
        organizationuser__user=user
    ).distinct()
    
    if not user_orgs.exists():
        return render(request, 'asset/no_organization.html', {
            'message': 'You are not assigned to any organization'
        })
    
    # Selected organization
    selected_org_id = request.GET.get('organization')
    if selected_org_id:
        selected_org = get_object_or_404(
            Organization, 
            id=selected_org_id,
            organizationuser__user=user
        )
    else:
        selected_org = user_orgs.first()
    
    # Get financial summary from cached data
    summaries = AssetWholeBillSummary.objects.filter(
        organization=selected_org
    )
    
    summary_dict = {}
    for s in summaries:
        summary_dict[s.bill_type] = {
            'total': s.total,
            'payment': s.payment,
            'outstanding': s.total - s.payment,
            'profit': s.profit,
        }
    
    # Get ledger with other organizations
    ledger_items = AssetBillSummary.objects.filter(
        organization=selected_org
    ).values('bill_rcvr_org', 'bill_type').annotate(
        total=Sum('total'),
        payment=Sum('payment')
    ).order_by('bill_rcvr_org', 'bill_type')
    
    context = {
        'user_organizations': user_orgs,
        'selected_organization': selected_org,
        'summary': summary_dict,
        'ledger_items': ledger_items,
        'can_edit': user.is_superuser or user.is_staff,
    }
    
    return render(request, 'asset/user_financial_summary.html', context)
