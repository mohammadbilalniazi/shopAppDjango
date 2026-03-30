from django.urls import path
from asset import views, views_financial

urlpatterns = [
    # Admin Dashboard (Main Overview)
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    
    # Dashboard
    path('dashboard/', views.asset_dashboard, name='asset_dashboard'),
    
    # Financial Statements
    path('balance-sheet/', views.balance_sheet_view, name='balance_sheet'),
    path('profit-loss/', views.profit_loss_view, name='profit_loss'),
    path('cash-flow/', views.cash_flow_view, name='cash_flow'),
    
    # Loans
    path('loans/', views.loans_view, name='loans'),
    
    # NEW: Organization Ledger Summary (uses cached data)
    path('ledger/', views_financial.organization_ledger_summary, name='organization_ledger'),
    path('ledger/adjustment/save/', views_financial.ledger_adjustment_save, name='ledger_adjustment_save'),
    
    # NEW: Financial Dashboard (uses AssetWholeBillSummary for performance)
    path('financial/', views_financial.financial_summary_dashboard, name='financial_dashboard'),
    
    # NEW: Organization User Summary
    path('summary/', views_financial.organization_user_summary, name='user_summary'),
    
    # NEW: Admin - Adjust Summary Values
    path('admin/adjust/', views_financial.admin_adjust_summary, name='admin_adjust'),
    path('admin/update-ajax/', views_financial.admin_update_summary_ajax, name='admin_update_ajax'),
    
    # API Endpoints
    path('api/refresh/', views.refresh_assets, name='refresh_assets_api'),
    path('api/summary/<int:org_id>/', views.get_asset_summary_api, name='asset_summary_api'),
]
