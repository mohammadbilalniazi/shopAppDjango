from django.urls import path
from asset import views

urlpatterns = [
    # Dashboard
    path('dashboard/', views.asset_dashboard, name='asset_dashboard'),
    
    # Financial Statements
    path('balance-sheet/', views.balance_sheet_view, name='balance_sheet'),
    path('profit-loss/', views.profit_loss_view, name='profit_loss'),
    path('cash-flow/', views.cash_flow_view, name='cash_flow'),
    
    # Loans
    path('loans/', views.loans_view, name='loans'),
    
    # API Endpoints
    path('api/refresh/', views.refresh_assets, name='refresh_assets_api'),
    path('api/summary/<int:org_id>/', views.get_asset_summary_api, name='asset_summary_api'),
]
