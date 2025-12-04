from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from bill import views_bill, views_bill_receive_payment
from product import views_product, views_unit, views_stock
from user import views_login, views_organization_user, views_session, views_groups, views_dashboard, views_user
from configuration import views_organization, views_location, views_branch, views_branch_api
from expenditure import views as expenditure_view
from asset import views as asset_view
from django.shortcuts import redirect

# Import admin configuration to customize admin interface
from . import admin_config

urlpatterns = [
    path('login/check', views_login.host_to_heroku_submit),

    # Asset Management & Financial Reports
    path('asset/', include('asset.urls')),

    # Expenditure
    path('expenditure/bill/form/', expenditure_view.expense_form,name="expense_form"),
    path('expenditure/bill/form/<id>/', expenditure_view.expense_form),
    path('expenditure/bill/insert/', expenditure_view.expense_insert),

    # Organizations
    path('organizations/finalize-ledger', views_bill.finalize_ledger, name='finalize_ledger'),
    path('organizations/calculate-purchased-asset/',asset_view.calculate_total_purchased_asset_from_products_using, name='calculate_purchased_asset'),
    path('organizations/user/', views_organization.user_organizations, name='user_organizations'),
    path('organizations/<id>/', views_organization.rcvr_org_show, name='rcvr_org_show'),
    path('configuration/organization/form/', views_organization.form, name='organization_form'),
    path('configuration/organization/form/<id>', views_organization.form, name='organization_form'),
    path('configuration/organization/form/create/', views_organization.create, name='organization_form_save'),
    path('configuration/organization/form/create/<id>', views_organization.create, name='organization_form'),
    path('admin/configuration/organization/', views_organization.show, name='organization_show'),
    path('configuration/organization/', views_organization.show, name='organization_show'),
    # Location
    path('configuration/countries/', views_location.get_countries, name='get_countries'),
    path('configuration/location/<id>/', views_location.show, name='location_show_id'),
    path('configuration/location/', views_location.show, name='location_show'),

    # Branch Management
    path('configuration/branch/', views_branch.branch_select_organization, name='branch_select_organization'),
    path('configuration/branch/organization/<int:org_id>/', views_branch.branch_management, name='branch_management'),
    path('configuration/branch/create/', views_branch.branch_create, name='branch_create'),
    path('configuration/branch/<int:branch_id>/update/', views_branch.branch_update, name='branch_update'),
    path('configuration/branch/<int:branch_id>/delete/', views_branch.branch_delete, name='branch_delete'),
    path('configuration/branch/<int:branch_id>/detail/', views_branch.branch_detail, name='branch_detail'),
    path('configuration/branch/<int:branch_id>/toggle-status/', views_branch.branch_toggle_status, name='branch_toggle_status'),
    path('configuration/organization/<int:org_id>/users/', views_branch.get_organization_users, name='get_organization_users'),

    # Branch API endpoints
    path('api/branches/by-organization/<int:organization_id>/', views_branch_api.get_branches_by_organization, name='get_branches_by_organization'),
    path('api/branches/user-accessible/', views_branch_api.get_all_user_branches, name='get_all_user_branches'),

    # Bills
    path('bill/delete/<id>/', views_bill.bill_delete),
    path('bill/select_bill_no/<organization_id>/<bill_rcvr_org_id>/<bill_type>', views_bill.select_bill_no),
    path('bill/search/', views_bill.search),

    path('receive_payment/bill/save/', views_bill_receive_payment.bill_insert),
    path('receive_payment/bill/', views_bill_receive_payment.bill_form, name="bill_form_receive_payment"),
    path('bill/detail/<bill_id>/', views_bill.bill_show),
    path('admin/bill/bill/', views_bill.bill_show,name="bill_show_html"),
    path('admin/bill/bill/add/', views_bill.bill_form_sell_purchase,name="bill_form_sell_purchase"),
    path('loss_degrade_product/bill/add/', views_bill.bill_form_loss_degrade_product,name="bill_form_loss_degrade_product"),
    path('bill/detail/delete/<bill_detail_id>', views_bill.bill_detail_delete),
    path('bill/insert/', views_bill.bill_insert, name="bill_insert"),

    # Products
    path('products/', views_product.show, name='product_show'),
    path('products/product_form/', views_product.form, name='product_form'),
    path('product/product/add/<id>', views_product.form, name='product_form'),
    path('stock/update/', views_stock.update, name='update_stock'),
    path('stock/list/', views_stock.list_stocks, name='stock_list'),
    path('product/product/', views_product.show_html, name='product_show_html'),
    path('admin/product/product/', views_product.show_html, name='product_show_html'),
    path('admin/product/product/add/', views_product.form, name='product_form'),
    path('products/product/add/', views_product.form, name='product_form'),
    path('products/product/add/<id>', views_product.form, name='product_form'),
    path('product/product_form/create/', views_product.create, name='product_form_create'),
    path('product/product_form/create/<id>', views_product.create, name='product_form_update'),
    path('api/category/create/', views_product.create_category, name='create_category_api'),

    # User Dashboard
    path('user/dashboard/', views_dashboard.user_dashboard, name='user_dashboard'),
    path('user/profile/', views_user.profile, name='user_profile'),
    
    # Users & Organization Users
    path('admin/user/organizationuser/add/', views_organization_user.form, name='organization_user_form'),
    path('user/organization_user/add/<id>', views_organization_user.form, name='organization_user_form'),
    path('user/organization_user/insert/', views_organization_user.insert, name='organization_user_insert'),
    path('user/organization_user/get/', views_organization_user.get, name='organization_user_get'),
    path('user/organization_user/get/<id>', views_organization_user.get, name='organization_user_get_by_id'),
    path('user/organization_user/delete/<id>', views_organization_user.delete, name='organization_user_delete'),
    path('user/organization_user/search/', views_organization_user.search, name='organization_user_search'),

    # User Session Management
    path('user/sessions/', views_session.session_management, name='session_management'),
    path('user/sessions/delete/<str:session_key>/', views_session.delete_session, name='delete_session'),
    path('user/sessions/clear-expired/', views_session.clear_expired_sessions, name='clear_expired_sessions'),
    path('user/sessions/details/', views_session.get_session_details, name='get_session_details'),
    
    # Groups Management
    path('user/groups/', views_groups.groups_management, name='groups_management'),
    path('user/groups/form/', views_groups.group_form, name='group_form'),
    path('user/groups/form/<int:group_id>/', views_groups.group_form, name='group_form_edit'),
    path('user/groups/create-update/', views_groups.create_update_group, name='create_update_group'),
    path('user/groups/delete/<int:group_id>/', views_groups.delete_group, name='delete_group'),
    path('user/groups/details/', views_groups.get_group_details, name='get_group_details'),

    # Units
    path('units/<id>/', views_unit.show, name='unit_show'),

    # Admin
    path('admin/', admin.site.urls),
    path('', lambda request: redirect('admin:index')),

    # Auth/Login
    path('host_to_heroku_login_form/', views_login.host_to_heroku_login_form, name='host_to_heroku_login_form'),
    path("host_to_heroku_login_form/submit/", views_login.host_to_heroku_submit, name="host_to_heroku_submit"),
]


# ✅ Serve media & static files only in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
# In production, you should let your web server (e.g., Nginx/Apache) or 
# CDN serve static/media files, not Django.