"""
Asset Management Utilities
Handles automatic calculation and updating of asset summaries from bills
"""

from decimal import Decimal
from django.db.models import Sum, Q, F
from asset.models import OrganizationAsset, Loan
from bill.models import Bill, Bill_Receiver2
from product.models import Stock, Product_Detail


def calculate_inventory_value(organization):
    """
    Calculate total inventory value for an organization.
    Sum of (current_stock * purchase_price) for all products.
    """
    from django.db import connection
    
    # Get all stock items with their purchase prices
    inventory_value = Decimal(0)
    
    stocks = Stock.objects.filter(organization=organization).select_related('product')
    
    for stock in stocks:
        try:
            product_detail = Product_Detail.objects.get(
                product=stock.product,
                organization=organization
            )
            item_value = stock.current_amount * product_detail.purchased_price
            inventory_value += item_value
        except Product_Detail.DoesNotExist:
            # No price info, skip
            continue
    
    return inventory_value


def calculate_cash_on_hand(organization):
    """
    Calculate liquid cash available.
    Formula: 
    + SELLING payments received
    + RECEIVEMENT payments received (money coming in)
    - PURCHASE payments made
    - PAYMENT payments made (money going out)
    - EXPENSE payments made
    - LOSSDEGRADE payments made
    """
    cash = Decimal(0)
    
    # Money IN from selling
    selling_received = Bill.objects.filter(
        organization=organization,
        bill_type='SELLING'
    ).aggregate(total=Sum('payment'))['total'] or Decimal(0)
    
    # Money IN from receivements (loans/payments received)
    receivement = Bill.objects.filter(
        organization=organization,
        bill_type='RECEIVEMENT'
    ).aggregate(total=Sum('payment'))['total'] or Decimal(0)
    
    # Money OUT for purchases
    purchase_paid = Bill.objects.filter(
        organization=organization,
        bill_type='PURCHASE'
    ).aggregate(total=Sum('payment'))['total'] or Decimal(0)
    
    # Money OUT for payments (loans/payments made)
    payment_paid = Bill.objects.filter(
        organization=organization,
        bill_type='PAYMENT'
    ).aggregate(total=Sum('payment'))['total'] or Decimal(0)
    
    # Money OUT for expenses
    expense_paid = Bill.objects.filter(
        organization=organization,
        bill_type='EXPENSE'
    ).aggregate(total=Sum('payment'))['total'] or Decimal(0)
    
    # Money OUT for losses
    loss_paid = Bill.objects.filter(
        organization=organization,
        bill_type='LOSSDEGRADE'
    ).aggregate(total=Sum('payment'))['total'] or Decimal(0)
    
    cash = (
        selling_received + receivement -
        purchase_paid - payment_paid - expense_paid - loss_paid
    )
    
    return cash


def calculate_accounts_receivable(organization):
    """
    Calculate money owed TO us by customers.
    Formula: SELLING total - SELLING payment received
    """
    selling_bills = Bill.objects.filter(
        organization=organization,
        bill_type='SELLING'
    ).aggregate(
        total=Sum('total'),
        payment=Sum('payment')
    )
    
    total_sold = selling_bills['total'] or Decimal(0)
    payment_received = selling_bills['payment'] or Decimal(0)
    
    return total_sold - payment_received


def calculate_accounts_payable(organization):
    """
    Calculate money we OWE to suppliers.
    Formula: PURCHASE total - PURCHASE payment made
    """
    purchase_bills = Bill.objects.filter(
        organization=organization,
        bill_type='PURCHASE'
    ).aggregate(
        total=Sum('total'),
        payment=Sum('payment')
    )
    
    total_purchased = purchase_bills['total'] or Decimal(0)
    payment_made = purchase_bills['payment'] or Decimal(0)
    
    return total_purchased - payment_made


def calculate_loans_receivable(organization):
    """
    Calculate money we loaned out (others owe us).
    From PAYMENT bills: total - payment means we gave money expecting return.
    Also sum from Loan model with loan_type='RECEIVABLE'
    """
    # From bills
    payment_bills = Bill.objects.filter(
        organization=organization,
        bill_type='PAYMENT'
    ).aggregate(
        total=Sum('total'),
        payment=Sum('payment')
    )
    
    loans_from_bills = (payment_bills['payment'] or Decimal(0))
    
    # From Loan model
    loans_from_model = Loan.objects.filter(
        organization=organization,
        loan_type='RECEIVABLE'
    ).aggregate(
        total=Sum('amount_remaining')
    )['total'] or Decimal(0)
    
    return loans_from_bills + loans_from_model


def calculate_loans_payable(organization):
    """
    Calculate money we borrowed (we owe others).
    From RECEIVEMENT bills: total - payment means we received money we need to pay back.
    Also sum from Loan model with loan_type='PAYABLE'
    """
    # From bills
    receivement_bills = Bill.objects.filter(
        organization=organization,
        bill_type='RECEIVEMENT'
    ).aggregate(
        total=Sum('total'),
        payment=Sum('payment')
    )
    
    loans_from_bills = (receivement_bills['total'] or Decimal(0)) - (receivement_bills['payment'] or Decimal(0))
    
    # From Loan model
    loans_from_model = Loan.objects.filter(
        organization=organization,
        loan_type='PAYABLE'
    ).aggregate(
        total=Sum('amount_remaining')
    )['total'] or Decimal(0)
    
    return loans_from_bills + loans_from_model


def calculate_profit_loss_items(organization):
    """
    Calculate profit & loss statement items.
    Returns dict with revenue, COGS, expenses, losses, profit
    """
    # Revenue from sales
    revenue = Bill.objects.filter(
        organization=organization,
        bill_type='SELLING'
    ).aggregate(total=Sum('total'))['total'] or Decimal(0)
    
    # Cost of Goods Sold (purchases)
    cogs = Bill.objects.filter(
        organization=organization,
        bill_type='PURCHASE'
    ).aggregate(total=Sum('total'))['total'] or Decimal(0)
    
    # Expenses
    expenses = Bill.objects.filter(
        organization=organization,
        bill_type='EXPENSE'
    ).aggregate(total=Sum('total'))['total'] or Decimal(0)
    
    # Losses
    losses = Bill.objects.filter(
        organization=organization,
        bill_type='LOSSDEGRADE'
    ).aggregate(total=Sum('total'))['total'] or Decimal(0)
    
    # Net Profit
    net_profit = revenue - cogs - expenses - losses
    
    return {
        'revenue': revenue,
        'cogs': cogs,
        'expenses': expenses,
        'losses': losses,
        'net_profit': net_profit
    }


def update_organization_assets(organization):
    """
    Main function to recalculate and update all asset values for an organization.
    Call this after any bill is created/updated/deleted.
    """
    asset_summary, created = OrganizationAsset.objects.get_or_create(
        organization=organization
    )
    
    # Calculate all components
    asset_summary.inventory_value = calculate_inventory_value(organization)
    asset_summary.cash_on_hand = calculate_cash_on_hand(organization)
    asset_summary.accounts_receivable = calculate_accounts_receivable(organization)
    asset_summary.accounts_payable = calculate_accounts_payable(organization)
    asset_summary.loans_receivable = calculate_loans_receivable(organization)
    asset_summary.loans_payable = calculate_loans_payable(organization)
    
    # Calculate P&L items
    pl_items = calculate_profit_loss_items(organization)
    asset_summary.total_revenue = pl_items['revenue']
    asset_summary.total_cost_of_goods_sold = pl_items['cogs']
    asset_summary.total_expenses = pl_items['expenses']
    asset_summary.total_losses = pl_items['losses']
    
    # Save will automatically calculate totals, assets, liabilities, equity
    asset_summary.save()
    
    return asset_summary


def get_balance_sheet(organization):
    """
    Get balance sheet for an organization.
    Returns dict with assets, liabilities, and equity.
    """
    asset_summary = OrganizationAsset.objects.filter(
        organization=organization
    ).first()
    
    if not asset_summary:
        asset_summary = update_organization_assets(organization)
    
    return {
        'assets': {
            'current_assets': {
                'cash': asset_summary.cash_on_hand,
                'accounts_receivable': asset_summary.accounts_receivable,
                'inventory': asset_summary.inventory_value,
                'loans_receivable': asset_summary.loans_receivable,
                'total': (
                    asset_summary.cash_on_hand +
                    asset_summary.accounts_receivable +
                    asset_summary.inventory_value +
                    asset_summary.loans_receivable
                )
            },
            'total_assets': asset_summary.total_assets
        },
        'liabilities': {
            'current_liabilities': {
                'accounts_payable': asset_summary.accounts_payable,
                'loans_payable': asset_summary.loans_payable,
                'total': (
                    asset_summary.accounts_payable +
                    asset_summary.loans_payable
                )
            },
            'total_liabilities': asset_summary.total_liabilities
        },
        'equity': {
            'retained_earnings': asset_summary.net_profit,
            'total_equity': asset_summary.equity
        },
        'last_updated': asset_summary.last_updated
    }


def get_profit_loss_statement(organization):
    """
    Get profit & loss statement for an organization.
    Returns dict with revenue, expenses, and profit.
    """
    asset_summary = OrganizationAsset.objects.filter(
        organization=organization
    ).first()
    
    if not asset_summary:
        asset_summary = update_organization_assets(organization)
    
    gross_profit = asset_summary.total_revenue - asset_summary.total_cost_of_goods_sold
    
    return {
        'revenue': {
            'sales_revenue': asset_summary.total_revenue,
            'total_revenue': asset_summary.total_revenue
        },
        'cost_of_sales': {
            'purchases': asset_summary.total_cost_of_goods_sold,
            'total_cogs': asset_summary.total_cost_of_goods_sold
        },
        'gross_profit': gross_profit,
        'operating_expenses': {
            'general_expenses': asset_summary.total_expenses,
            'losses_from_damage': asset_summary.total_losses,
            'total_expenses': asset_summary.total_expenses + asset_summary.total_losses
        },
        'net_profit': asset_summary.net_profit,
        'last_updated': asset_summary.last_updated
    }


def get_cash_flow_summary(organization):
    """
    Get cash flow summary showing money in and out.
    """
    # Operating Activities
    selling_cash = Bill.objects.filter(
        organization=organization, bill_type='SELLING'
    ).aggregate(total=Sum('payment'))['total'] or Decimal(0)
    
    purchase_cash = Bill.objects.filter(
        organization=organization, bill_type='PURCHASE'
    ).aggregate(total=Sum('payment'))['total'] or Decimal(0)
    
    expense_cash = Bill.objects.filter(
        organization=organization, bill_type='EXPENSE'
    ).aggregate(total=Sum('payment'))['total'] or Decimal(0)
    
    loss_cash = Bill.objects.filter(
        organization=organization, bill_type='LOSSDEGRADE'
    ).aggregate(total=Sum('payment'))['total'] or Decimal(0)
    
    operating_cash_flow = selling_cash - purchase_cash - expense_cash - loss_cash
    
    # Financing Activities
    receivement_cash = Bill.objects.filter(
        organization=organization, bill_type='RECEIVEMENT'
    ).aggregate(total=Sum('payment'))['total'] or Decimal(0)
    
    payment_cash = Bill.objects.filter(
        organization=organization, bill_type='PAYMENT'
    ).aggregate(total=Sum('payment'))['total'] or Decimal(0)
    
    financing_cash_flow = receivement_cash - payment_cash
    
    # Net Cash Flow
    net_cash_flow = operating_cash_flow + financing_cash_flow
    
    return {
        'operating_activities': {
            'cash_from_sales': selling_cash,
            'cash_for_purchases': -purchase_cash,
            'cash_for_expenses': -expense_cash,
            'cash_for_losses': -loss_cash,
            'net_operating_cash': operating_cash_flow
        },
        'financing_activities': {
            'cash_received': receivement_cash,
            'cash_paid': -payment_cash,
            'net_financing_cash': financing_cash_flow
        },
        'net_cash_flow': net_cash_flow
    }
