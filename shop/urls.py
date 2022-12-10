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
from shopapp import views,views_roznamcha,views_selling
from purchase import views_purchase
from products import views_vendor,views_product
from user_requests import request_views
from chat import views as views_chat
from chat import views_room
from user import views_login
from configuration import views_language
# from qrapp import views_qr 
from user_requests import test_email_request    
urlpatterns = [
    path('test_email_request/',test_email_request.request),
    path('language/translate/<src>/<dest>/',views_language.select_translations,name="select_translations"),
    path('insert_language_detail/<src>/<dest>/',views_language.save_translations,name='save_translations'),
    path('admin/shopapp/roznamcha/add/',views_roznamcha.roznamcha_form,name='roznamcha_form'), 
    path('roznamcha/save',views_roznamcha.roznamcha_save),
    path('admin/shopapp/selling/add/',views_selling.selling_form,name='selling_form'),
    path('selling/save',views_selling.selling_save),
    path('admin/purchase/purchase_bill/add/',views_purchase.purchase_bill_form,name="purchase_bill_form"),
    path('admin/purchase/purchase_bill/',views_purchase.purchase_show),
    path('purchase_bill/detail/<purchase_bill_id>/',views_purchase.purchase_show),
    path('products/<id>/',views_product.show,name='product_show'),
    path('products/select_service/<html_id>/<dest>/',views_product.select_service,name='select_service'),
    path('vendors/<id>/',views_vendor.vendors_show,name='vendors_show'),
    path('chat/home/',views_chat.home),
    path('chat/send/',views_chat.send,name='send'),
    path('chat/getMessages/<room>/',views_chat.getMessage,name='get_message'),
    path('chat/room/<str:room_id>/',views_chat.room,name='room'),
    path('chat/checkview/',views_chat.checkview,name='checkview'),
    path('chat/get_rooms/',views_room.get_rooms,name='get_rooms'),
    # path('qrapp/qr_generater/',views_qr.qr_generater),
    # path('qrapp/qr_reader/',views_qr.qr_reader),
    path('requests_user/request/save/',request_views.request),
    path('admin/', admin.site.urls),
    path('',views.index),
    # path('/',views.index),
    path('host_to_heroku_login_form/',views_login.host_to_heroku_login_form,name='host_to_heroku_login_form'),
    path("host_to_heroku_login_form/submit/",views_login.host_to_heroku_submit,name="host_to_heroku_submit")
]
 
