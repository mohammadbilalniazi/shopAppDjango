from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from bill import views_bill, views_bill_receive_payment
from product import views_product, views_unit, views_stock
from user import views_login, views_organization_user
from configuration import views_organization, views_location
from expenditure import views as expenditure_view

from django.shortcuts import redirect

urlpatterns = [
    path('login/check', views_login.host_to_heroku_submit),

    # Expenditure
    path('expenditure/bill/form/', expenditure_view.expense_form),
    path('expenditure/bill/form/<id>/', expenditure_view.expense_form),
    path('expenditure/bill/insert/', expenditure_view.expense_insert),

    # Organizations
    path('organizations/finalize-ledger', views_bill.finalize_ledger, name='finalize_ledger'),
    path('organizations/<id>/', views_organization.rcvr_org_show, name='rcvr_org_show'),
    path('configuration/organization/form/', views_organization.form, name='organization_form'),
    path('configuration/organization/form/<id>', views_organization.form, name='organization_form'),
    path('configuration/organization/form/create/', views_organization.create, name='organization_form_save'),
    path('configuration/organization/form/create/<id>', views_organization.create, name='organization_form'),

    # Location
    path('configuration/location/', views_location.show, name='location_show'),

    # Bills
    path('bill/delete/<id>/', views_bill.bill_delete),
    path('bill/select_bill_no/<organization_id>/<bill_rcvr_org_id>/<bill_type>', views_bill.select_bill_no),
    path('bill/search/', views_bill.search),

    path('receive_payment/bill/save/', views_bill_receive_payment.bill_insert),
    path('receive_payment/bill/', views_bill_receive_payment.bill_form),
    path('bill/detail/<bill_id>/', views_bill.bill_show),
    path('admin/bill/bill/', views_bill.bill_show),
    path('admin/bill/bill/add/', views_bill.bill_form_sell_purchase),
    path('loss_degrade_product/bill/add/', views_bill.bill_form_loss_degrade_product),
    path('bill/detail/delete/<bill_detail_id>', views_bill.bill_detail_delete),
    path('bill/insert/', views_bill.bill_insert, name="bill_insert"),

    # Products
    path('products/', views_product.show, name='product_show'),
    path('products/product_form/', views_product.form, name='product_form'),
    path('product/product/add/<id>', views_product.form, name='product_form'),
    path('stock/update/', views_stock.update, name='update_stock'),
    path('product/product/', views_product.show_html, name='product_show_html'),
    path('admin/product/product/', views_product.show_html, name='product_show_html'),
    path('admin/product/product/add/', views_product.form, name='product_form'),
    path('products/product/add/', views_product.form, name='product_form'),
    path('products/product/add/<id>', views_product.form, name='product_form'),
    path('product/product_form/create/', views_product.create, name='product_form_create'),
    path('product/product_form/create/<id>', views_product.create, name='product_form_create'),

    # Users & Organization Users
    path('admin/user/organizationuser/add/', views_organization_user.form, name='organization_user_form'),
    path('user/organization_user/add/<id>', views_organization_user.form, name='organization_user_form'),
    path('user/organization_user/insert/', views_organization_user.insert, name='organization_user_insert'),
    path('user/organization_user/get/', views_organization_user.get, name='organization_user_get'),
    path('user/organization_user/get/<id>', views_organization_user.get, name='organization_user_get_by_id'),
    path('user/organization_user/delete/<id>', views_organization_user.delete, name='organization_user_delete'),
    path('user/organization_user/search/', views_organization_user.search, name='organization_user_search'),

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