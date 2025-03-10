"""shop URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
# from shopapp import views,views_roznamcha,views_selling
from bill import views_bill,views_bill_receive_payment
from product import views_product,views_unit,views_store
from user_request import request_views
from chat import views as views_chat
from chat import views_room
from user import views_login
from configuration import views_organization,views_location
# from qrapp import views_qr 
from user_request import test_email_request    

from django.contrib import admin
from django.urls import path
from django.conf import settings #new
from django.conf.urls.static import static #new
from user import views_login
from expenditure import views as expenditure_view
from common.generate_ihsaya import generate_product_ihsaya_service

urlpatterns = [ 
    path('login/check',views_login.host_to_heroku_submit),
    path('expenditure/bill/form/',expenditure_view.expense_form),
    path('expenditure/bill/form/<id>/',expenditure_view.expense_form),
    path('expenditure/bill/insert/',expenditure_view.expense_insert),
    path('test_email_request/',test_email_request.request),
    path('organizations/<id>/',views_organization.rcvr_org_show,name='rcvr_org_show'),
    path('conifgurations/organization/',views_organization.show,name='organization_show'),
    path('configuration/organization/form/',views_organization.form,name='organization_form'),
    path('configuration/organization/form/<id>',views_organization.form,name='organization_form'),
    path('configuration/organization/form/create/',views_organization.create,name='organization_form_save'),
    path('configuration/organization/form/create/<id>',views_organization.create,name='organization_form'),
    path('admin/configuration/organization/add/',views_organization.form,name='organization_form'),
    path('configuration/location/',views_location.show,name='location_show'),
    path('admin/bill/bill/add/',views_bill.Bill_form,name="Bill_form"),
    path('bill/delete/<id>/',views_bill.bill_delete),
    path('bill/select_bill_no/<organization_id>/<bill_rcvr_org_id>/<bill_type>',views_bill.select_bill_no),
    path('bill/search/',views_bill.search), 
    path('bill/detail/delete/<bill_detail_id>',views_bill.bill_detail_delete),
    path('bill/insert/',views_bill.bill_insert,name="bill_insert"),
    path('receive_payment/bill/save/',views_bill_receive_payment.bill_insert),
    path('receive_payment/bill/',views_bill_receive_payment.bill_form),
    path('admin/bill/bill/',views_bill.bill_show),
    path('bill/detail/<bill_id>/',views_bill.bill_show),
    path('bill/update/<bill_id>/',views_bill.bill_show),
    path('products/',views_product.show,name='product_show'),
    path('products/product_form/',views_product.form,name='product_form'),
    path('product/product/add/<id>',views_product.form,name='product_form'),
    
    path('admin/product/product/add/',views_product.form,name='product_form'),
    
    path('admin/product/product/',views_product.show_html,name='product_show_html'),
    path('product/product/',views_product.show_html,name='product_show_html'),
    path('products/product/add/',views_product.form,name='product_form'),
    path('products/product/add/<id>',views_product.form,name='product_form'),
    path('product/product_form/create/',views_product.create,name='product_form_create'),
    path('product/product_form/create/<id>',views_product.create,name='product_form_create'),
    path('units/<id>/',views_unit.show,name='unit_show'), 
    path('stores/<id>/<organization>',views_store.show,name='store_show'),
    path('chat/home/',views_chat.home),
    path('chat/send/',views_chat.send,name='send'),
    path('chat/getMessages/<room>/',views_chat.getMessage,name='get_message'),
    path('chat/room/<str:room_id>/',views_chat.room,name='room'),
    path('chat/checkview/',views_chat.checkview,name='checkview'),
    path('chat/get_rooms/',views_room.get_rooms,name='get_rooms'),
    # path('qrapp/qr_generater/',views_qr.qr_generater),
    # path('qrapp/qr_reader/',views_qr.qr_reader),
    path('requests_user/request/save/',request_views.request),
    path('generate_product_ihsaya_service/<store_id>',generate_product_ihsaya_service),
    path('admin/', admin.site.urls),
    path('',admin.site.urls),
    path('host_to_heroku_login_form/',views_login.host_to_heroku_login_form,name='host_to_heroku_login_form'),
    path("host_to_heroku_login_form/submit/",views_login.host_to_heroku_submit,name="host_to_heroku_submit")
]
 

if settings.DEBUG:
    urlpatterns += static( settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)
