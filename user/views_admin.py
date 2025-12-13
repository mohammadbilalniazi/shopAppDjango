"""
Custom Admin Dashboard Views
Replaces Django's default admin with custom interface
Only accessible to admin users
"""
from django.shortcuts import render, redirect
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta

from user.models import User, OrganizationUser
from configuration.models import Organization, Branch
from product.models import Product, Stock
from bill.models import Bill, Bill_detail
from asset.models import OrganizationAsset, AssetWholeBillSummary
from expenditure.models import Expense


def is_admin_user(user):
    """Check if user is admin (superuser or staff)"""
    return user.is_authenticated and (user.is_superuser or user.is_staff)


@login_required
@user_passes_test(is_admin_user, login_url='/host_to_heroku_login_form/')
def custom_admin_dashboard(request):
    """
    Custom Admin Dashboard - Main Entry Point
    Replaces Django's default /admin/ page
    Only accessible to admin users
    """
    # Get statistics for dashboard
    today = timezone.now().date()
    last_30_days = today - timedelta(days=30)
    
    # User Statistics
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    admin_users = User.objects.filter(Q(is_superuser=True) | Q(is_staff=True)).count()
    recent_users = User.objects.filter(date_joined__gte=last_30_days).count()
    
    # Organization Statistics
    total_organizations = Organization.objects.count()
    total_branches = Branch.objects.count()
    total_org_users = OrganizationUser.objects.count()
    
    # Product Statistics
    total_products = Product.objects.count()
    # Product model doesn't have is_active field, so we count products with stock instead
    active_products = Stock.objects.values('product').distinct().count()
    total_stock_value = Stock.objects.aggregate(
        total=Sum('current_amount')
    )['total'] or 0
    
    # Bill Statistics
    total_bills = Bill.objects.count()
    # Bill.date is a CharField in Shamsi format (YYYY-MM-DD), so we use string matching
    from common.date import current_shamsi_date
    current_shamsi = current_shamsi_date()  # Format: YYYY-MM-DD
    current_shamsi_month = current_shamsi[:7]  # Format: YYYY-MM
    
    bills_today = Bill.objects.filter(date=current_shamsi).count()
    bills_this_month = Bill.objects.filter(date__startswith=current_shamsi_month).count()
    
    # Financial Statistics - USE CACHED DATA for performance
    # Use AssetWholeBillSummary instead of querying bills directly
    
    # Get aggregated revenue (SELLING)
    revenue_summary = AssetWholeBillSummary.objects.filter(
        bill_type='SELLING'
    ).aggregate(
        total=Sum('total'),
        profit=Sum('profit')
    )
    total_revenue = revenue_summary['total'] or 0
    total_profit_from_sales = revenue_summary['profit'] or 0
    
    # Get aggregated purchases
    purchase_summary = AssetWholeBillSummary.objects.filter(
        bill_type='PURCHASE'
    ).aggregate(
        total=Sum('total')
    )
    total_purchases = purchase_summary['total'] or 0
    
    # Get aggregated expenses
    expense_summary = AssetWholeBillSummary.objects.filter(
        bill_type='EXPENSE'
    ).aggregate(
        total=Sum('total')
    )
    total_Expense = expense_summary['total'] or 0
    
    # Get aggregated losses
    loss_summary = AssetWholeBillSummary.objects.filter(
        bill_type='LOSSDEGRADE'
    ).aggregate(
        total=Sum('total')
    )
    total_losses = loss_summary['total'] or 0
    
    # Calculate total expenses (purchases + expenses + losses)
    total_expenses = total_purchases + total_Expense + total_losses
    
    # Recent Activities
    # Bill model has 'organization' not 'bill_creator_org'
    # bill_rcvr_org is in Bill_Receiver2 model
    recent_bills = Bill.objects.select_related(
        'organization'
    ).order_by('-date', '-id')[:10]
    
    recent_products = Product.objects.select_related(
        'category'
    ).order_by('-id')[:10]
    
    recent_org_users = OrganizationUser.objects.select_related(
        'user', 'organization'
    ).order_by('-id')[:10]
    
    # Quick Actions for Admin
    quick_actions = [
        {
            'title': 'User Management',
            'icon': '👥',
            'description': 'Manage users, permissions, and roles',
            'url': '/user/dashboard/',
            'color': '#3498db'
        },
        {
            'title': 'Organization Management',
            'icon': '🏢',
            'description': 'Manage organizations and branches',
            'url': '/configuration/organization/',
            'color': '#2ecc71'
        },
        {
            'title': 'Product Management',
            'icon': '📦',
            'description': 'Manage products and inventory',
            'url': '/admin/product/product/',
            'color': '#9b59b6'
        },
        {
            'title': 'Bill Management',
            'icon': '💰',
            'description': 'View and manage all bills',
            'url': '/admin/bill/bill/',
            'color': '#e74c3c'
        },
        {
            'title': 'Financial Dashboard',
            'icon': '📊',
            'description': 'View cached financial summary (fast)',
            'url': '/asset/financial/',
            'color': '#f39c12'
        },
        {
            'title': 'Organization Ledger',
            'icon': '📒',
            'description': 'Who owes whom - inter-org balances',
            'url': '/asset/ledger/',
            'color': '#e67e22'
        },
        {
            'title': 'Adjust Summaries',
            'icon': '🛠️',
            'description': 'Admin: Manually adjust cached values',
            'url': '/asset/admin/adjust/',
            'color': '#c0392b'
        },
        {
            'title': 'Session Management',
            'icon': '🔒',
            'description': 'Manage active user sessions',
            'url': '/user/sessions/',
            'color': '#1abc9c'
        },
        {
            'title': 'Groups & Permissions',
            'icon': '🏷️',
            'description': 'Manage user groups and permissions',
            'url': '/user/groups/',
            'color': '#34495e'
        },
        {
            'title': 'Branch Management',
            'icon': '🏪',
            'description': 'Manage organization branches',
            'url': '/configuration/branch/',
            'color': '#16a085'
        },
    ]
    
    context = {
        # Statistics
        'total_users': total_users,
        'active_users': active_users,
        'admin_users': admin_users,
        'recent_users': recent_users,
        'total_organizations': total_organizations,
        'total_branches': total_branches,
        'total_org_users': total_org_users,
        'total_products': total_products,
        'active_products': active_products,
        'total_stock_value': total_stock_value,
        'total_bills': total_bills,
        'bills_today': bills_today,
        'bills_this_month': bills_this_month,
        'total_revenue': total_revenue,
        'total_expenses': total_expenses,
        'total_Expense': total_Expense,
        'net_profit': total_revenue - total_expenses - total_Expense,
        
        # Recent Activities
        'recent_bills': recent_bills,
        'recent_products': recent_products,
        'recent_org_users': recent_org_users,
        
        # Quick Actions
        'quick_actions': quick_actions,
        
        # User Info
        'is_superuser': request.user.is_superuser,
        'is_staff': request.user.is_staff,
        'username': request.user.username,
    }
    
    return render(request, 'admin/custom_admin_dashboard.html', context)
