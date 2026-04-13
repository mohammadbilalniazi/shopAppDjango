"""
Asset Management Views
Uses AssetWholeBillSummary and AssetBillSummary for performance
Provides admin interface for manual adjustments
Shows organization ledger summaries
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from django.db.models import Sum, Q, F
from django.utils.translation import gettext as _
from common.organization import find_userorganization
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from decimal import Decimal, InvalidOperation

from asset.models import (
    AssetBillSummary, AssetWholeBillSummary,
    OrganizationAsset, OpeningBalance, Loan, ProfitLossStatement
)
from asset.utils import update_organization_assets
from bill.models import Bill, LedgerAdjustment
from configuration.models import Organization
from user.models import OrganizationUser


def _get_bill_impact(bill):
    """
    Returns the signed impact of a bill on the running balance
    from the bill creator (organization) perspective vs the receiver.
    Positive  = opposite_org owes org more.
    Negative  = org owes opposite_org more.
    """
    total = Decimal(bill.total or 0)
    payment = Decimal(bill.payment or 0)
    if bill.bill_type == 'SELLING':
        return total - payment      # they owe us (total) minus what they already paid
    elif bill.bill_type == 'PURCHASE':
        return payment - total      # we paid (payment) minus total we owe
    elif bill.bill_type == 'PAYMENT':
        return payment              # we paid them → reduces our debt
    elif bill.bill_type == 'RECEIVEMENT':
        return -payment             # they paid us → reduces their debt
    return Decimal(0)


def _build_summary_ledger(selected_org):
    """
    Returns a list of dicts — one per counterpart org — summarising the
    net balance between selected_org and every org it has dealt with.
    """
    from bill.views_bill import get_statistics_bill

    # All orgs that selected_org has bills with (as creator)
    counterpart_ids = set(
        Bill.objects.filter(
            organization=selected_org,
            bill_receiver2__bill_rcvr_org__isnull=False
        ).values_list('bill_receiver2__bill_rcvr_org', flat=True).distinct()
    )

    rows = []
    for cp_id in counterpart_ids:
        cp_org = Organization.objects.filter(id=cp_id).first()
        if not cp_org:
            continue
        query = Bill.objects.filter(
            organization=selected_org,
            bill_receiver2__bill_rcvr_org=cp_org,
        )
        stats = get_statistics_bill(query)
        # Add manual adjustments
        adj_total = LedgerAdjustment.objects.filter(
            organization=selected_org,
            opposite_org=cp_org,
        ).aggregate(s=Sum('amount'))['s'] or Decimal(0)
        net = Decimal(stats['total_summary'] or 0) + adj_total
        rows.append({
            'organization': cp_org,
            'net_position': net,
            'total_sold': stats['total_sum_selling'],
            'total_purchased': stats['total_sum_purchase'],
            'payment_made': stats['payment_sum_payment'],
            'payment_received': stats['payment_sum_receivement'],
        })
    rows.sort(key=lambda x: abs(x['net_position']), reverse=True)
    return rows


def _build_detail_ledger(org, opposite_org):
    """
    Returns (entries, final_balance) where entries is a chronological list of
    dicts combining bills + manual adjustments with a running_balance column.
    Positive balance  = opposite_org owes org.
    Negative balance  = org owes opposite_org.
    """
    # Bills created by org directed at opposite_org
    bills = list(
        Bill.objects.filter(
            organization=org,
            bill_receiver2__bill_rcvr_org=opposite_org,
            bill_type__in=['PURCHASE', 'SELLING', 'PAYMENT', 'RECEIVEMENT'],
        ).select_related('bill_receiver2').order_by('date', 'bill_no', 'id')
    )

    # Manual adjustments
    adjustments = list(
        LedgerAdjustment.objects.filter(
            organization=org,
            opposite_org=opposite_org,
        ).order_by('date', 'id')
    )

    # Merge by date
    entries = []
    for bill in bills:
        entries.append({
            'kind': 'bill',
            'date': bill.date,
            'bill_no': bill.bill_no,
            'bill_type': bill.bill_type,
            'total': Decimal(bill.total or 0),
            'payment': Decimal(bill.payment or 0),
            'impact': _get_bill_impact(bill),
            'note': '',
            'obj_id': bill.id,
        })
    for adj in adjustments:
        entries.append({
            'kind': 'adjustment',
            'date': adj.date,
            'bill_no': '-',
            'bill_type': 'ADJUSTMENT',
            'total': Decimal(0),
            'payment': Decimal(0),
            'impact': Decimal(adj.amount),
            'note': adj.note,
            'obj_id': adj.id,
        })

    # Sort all entries together by date then bill_no (bills first within same date)
    entries.sort(key=lambda e: (e['date'], 0 if e['kind'] == 'bill' else 1, e.get('bill_no') or 0))

    # Build running balance
    running = Decimal(0)
    for entry in entries:
        running += Decimal(entry['impact'])
        entry['running_balance'] = running

    return entries, running


@login_required
def organization_ledger_summary(request):
    """
    Organization Ledger Summary page.

    Two dropdowns:
      • First  (organization)    : logged-in user's org(s); for superuser — all orgs.
      • Second (opposite_org)    : all orgs except the first; for superuser — all orgs.

    Behaviour:
      • Both selected  → bill-by-bill running ledger between the two orgs.
      • Only first     → summary table of that org vs every counterpart.
    """
    user = request.user

    # ── Dropdown 1: own organisations ─────────────────────────────────────
    if user.is_superuser:
        own_orgs = Organization.objects.all().order_by('name')
    else:
        own_orgs = Organization.objects.filter(
            organizationuser__user=user
        ).distinct().order_by('name')

    selected_org_id = request.GET.get('organization')
    opposite_org_id = request.GET.get('opposite_org')

    selected_org = None
    if selected_org_id:
        selected_org = Organization.objects.filter(id=selected_org_id).first()
    elif own_orgs.exists():
        selected_org = own_orgs.first()

    # ── Dropdown 2: opposite organisations ────────────────────────────────
    if user.is_superuser or user.is_staff:
        opposite_orgs = Organization.objects.all().order_by('name')
    else:
        if selected_org:
            opposite_orgs = Organization.objects.exclude(
                id=selected_org.id
            ).order_by('name')
        else:
            opposite_orgs = Organization.objects.all().order_by('name')

    opposite_org = None
    if opposite_org_id:
        opposite_org = Organization.objects.filter(id=opposite_org_id).first()

    # ── Build ledger data ──────────────────────────────────────────────────
    detail_entries = []
    final_balance = Decimal(0)
    summary_data = []

    if selected_org and opposite_org:
        detail_entries, final_balance = _build_detail_ledger(selected_org, opposite_org)
    elif selected_org:
        summary_data = _build_summary_ledger(selected_org)

    context = {
        'own_orgs': own_orgs,
        'opposite_orgs': opposite_orgs,
        'selected_org': selected_org,
        'opposite_org': opposite_org,
        'detail_entries': detail_entries,
        'final_balance': final_balance,
        'summary_data': summary_data,
        'is_admin': user.is_superuser or user.is_staff,
    }
    return render(request, 'asset/organization_ledger.html', context)


@login_required
@require_http_methods(['POST'])
def ledger_adjustment_save(request):
    """
    AJAX endpoint — save a manual ledger adjustment.
    Expected POST fields: organization, opposite_org, amount, note
    Returns JSON {success, message}.
    """
    org_id = request.POST.get('organization')
    opp_id = request.POST.get('opposite_org')
    amount_raw = request.POST.get('amount', '').strip()
    note = request.POST.get('note', '').strip()

    if not org_id or not opp_id or not amount_raw:
        return JsonResponse({'success': False, 'message': 'All fields are required.'}, status=400)

    try:
        amount = Decimal(amount_raw)
    except InvalidOperation:
        return JsonResponse({'success': False, 'message': 'Invalid amount.'}, status=400)

    org = get_object_or_404(Organization, id=org_id)
    opp = get_object_or_404(Organization, id=opp_id)

    # Security: non-superusers may only adjust their own org's ledger
    if not (request.user.is_superuser or request.user.is_staff):
        is_member = OrganizationUser.objects.filter(
            user=request.user, organization=org, is_active=True
        ).exists()
        if not is_member:
            return JsonResponse(
                {'success': False, 'message': 'Permission denied.'}, status=403
            )

    adj = LedgerAdjustment.objects.create(
        organization=org,
        opposite_org=opp,
        amount=amount,
        note=note,
        created_by=request.user,
    )
    return JsonResponse({
        'success': True,
        'message': f'Adjustment of {amount} saved.',
        'adj_id': adj.id,
        'date': adj.date,
    })


def _parse_decimal(value):
    try:
        return Decimal(str(value).strip()) if value not in (None, '', 'null') else Decimal('0')
    except Exception:
        return Decimal('0')


@login_required
def opening_summary(request):
    """Render and save the organization's opening financial summary."""
    selected_org_id = request.GET.get('organization')
    self_org, user_orgs = find_userorganization(request, selected_org_id)

    if selected_org_id and selected_org_id != 'all':
        try:
            selected_org = Organization.objects.get(id=selected_org_id)
            if not request.user.is_superuser:
                if selected_org.id not in user_orgs.values_list('id', flat=True):
                    selected_org = self_org or user_orgs.first()
        except Organization.DoesNotExist:
            selected_org = self_org or user_orgs.first()
    else:
        selected_org = self_org or user_orgs.first()

    opening_balance = None
    asset_summary = None
    if selected_org:
        opening_balance = OpeningBalance.objects.filter(
            organization=selected_org
        ).first()
        asset_summary = update_organization_assets(selected_org)

    if request.method == 'POST' and selected_org:
        if not (request.user.is_superuser or request.user.is_staff):
            is_member = OrganizationUser.objects.filter(
                user=request.user,
                organization=selected_org,
                is_active=True
            ).exists()
            if not is_member:
                messages.error(request, _('Permission denied.'))
                return redirect('opening_summary')

        cash_on_hand = _parse_decimal(request.POST.get('cash_on_hand'))
        inventory_value = _parse_decimal(request.POST.get('inventory_value'))
        accounts_receivable = _parse_decimal(request.POST.get('accounts_receivable'))
        accounts_payable = _parse_decimal(request.POST.get('accounts_payable'))
        loans_receivable = _parse_decimal(request.POST.get('loans_receivable'))
        loans_payable = _parse_decimal(request.POST.get('loans_payable'))
        total_revenue = _parse_decimal(request.POST.get('total_revenue'))
        total_cost_of_goods_sold = _parse_decimal(request.POST.get('total_cost_of_goods_sold'))
        total_expenses = _parse_decimal(request.POST.get('total_expenses'))
        total_losses = _parse_decimal(request.POST.get('total_losses'))
        note = request.POST.get('note', '').strip()
        effective_date = request.POST.get('effective_date', '').strip()

        if opening_balance:
            opening_balance.cash_on_hand = cash_on_hand
            opening_balance.inventory_value = inventory_value
            opening_balance.accounts_receivable = accounts_receivable
            opening_balance.accounts_payable = accounts_payable
            opening_balance.loans_receivable = loans_receivable
            opening_balance.loans_payable = loans_payable
            opening_balance.total_revenue = total_revenue
            opening_balance.total_cost_of_goods_sold = total_cost_of_goods_sold
            opening_balance.total_expenses = total_expenses
            opening_balance.total_losses = total_losses
            opening_balance.note = note
            if effective_date:
                opening_balance.effective_date = effective_date
            opening_balance.save()
        else:
            create_data = {
                'organization': selected_org,
                'cash_on_hand': cash_on_hand,
                'inventory_value': inventory_value,
                'accounts_receivable': accounts_receivable,
                'accounts_payable': accounts_payable,
                'loans_receivable': loans_receivable,
                'loans_payable': loans_payable,
                'total_revenue': total_revenue,
                'total_cost_of_goods_sold': total_cost_of_goods_sold,
                'total_expenses': total_expenses,
                'total_losses': total_losses,
                'note': note,
            }
            if effective_date:
                create_data['effective_date'] = effective_date
            OpeningBalance.objects.create(**create_data)

        update_organization_assets(selected_org)
        messages.success(request, _('Opening summary saved successfully. Future reports will include this starting position.'))
        return redirect(f"{request.path}?organization={selected_org.id}")

    context = {
        'organizations': user_orgs,
        'selected_org': selected_org,
        'organization': selected_org,
        'opening_balance': opening_balance,
        'asset_summary': asset_summary,
    }
    return render(request, 'asset/opening_summary.html', context)


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
