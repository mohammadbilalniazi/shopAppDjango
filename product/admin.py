from django.contrib import admin
from .models import Product,Category,Unit

@admin.register(Unit) 
class UnitAdmin(admin.ModelAdmin):
    list_display=("name","description","is_active")


@admin.register(Category) 
class CategoryAdmin(admin.ModelAdmin):
    list_display=("name","description","is_active","image_tag")
    readonly_fields = ['image_tag']
    

@admin.register(Product) 
class ProductAdmin(admin.ModelAdmin):
    list_display=("item_name","model","category")
    list_filter=("category","item_name")
 