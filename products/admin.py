from django.contrib import admin
from .models import Product,Category,Vendors,Service,SubService,Service_Media,SubService_Media
# Register your models here.



@admin.register(Category) 
class CategoryAdmin(admin.ModelAdmin):
    list_display=("name","description","is_active")
   

@admin.register(Product) 
class ProductAdmin(admin.ModelAdmin):
    list_display=("item_name","detail","category","minimum_requirement","item_amount_available","row","column","purchased_price","selling_price")
    list_filter=("category","item_name")
    #list_display=get_model_fields(Product)
 
@admin.register(Vendors) 
class VendorAdmin(admin.ModelAdmin):
    list_display=("name","description","address","is_active")

 
@admin.register(Service) 
class ServiceAdmin(admin.ModelAdmin):
    list_display=("service_name","category","dest","detail","html_id","service_incharger","is_active")

 
@admin.register(SubService) 
class SubSerivceAdmin(admin.ModelAdmin):
    list_display=("service","sub_service_name","dest","detail","html_id","is_active")


    

    # Service=("service","uploader","file","is_active") 