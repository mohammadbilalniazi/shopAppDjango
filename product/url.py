from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [    
    # path('products/<id>/',views_product.show,name='product_show'),
    # path('products/product_form/',views_product.form,name='product_form')
]

# if settings.DEBUG:
#     urlpatterns+=static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)
