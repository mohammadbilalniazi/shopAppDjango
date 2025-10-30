from django.contrib import admin
from .models import Product, Category, Unit, Product_Detail, Stock

@admin.register(Unit) 
class UnitAdmin(admin.ModelAdmin):
    list_display=("name","description","is_active")


@admin.register(Category) 
class CategoryAdmin(admin.ModelAdmin):
    list_display=("name","description","is_active","image_tag")
    readonly_fields = ['image_tag']
    

# Inline for Product_Detail to show organization dropdown
class ProductDetailInline(admin.TabularInline):
    model = Product_Detail
    extra = 0
    fields = ('organization', 'minimum_requirement', 'purchased_price', 'selling_price', 'unit')
    can_delete = True


@admin.register(Product) 
class ProductAdmin(admin.ModelAdmin):
    list_display=("item_name","model","category")
    list_filter=("category","item_name")
    inlines = [ProductDetailInline]


@admin.register(Product_Detail)
class ProductDetailAdmin(admin.ModelAdmin):
    list_display = ("product", "organization", "minimum_requirement", "purchased_price", "selling_price", "unit")
    list_filter = ("organization", "product")
    search_fields = ("product__item_name", "organization__name")


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ("product", "organization", "current_amount", "selling_amount", "purchasing_amount", "loss_amount")
    list_filter = ("organization", "product")
    search_fields = ("product__item_name", "organization__name")
 