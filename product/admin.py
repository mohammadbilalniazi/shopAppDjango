from django.contrib import admin
from .models import Unit, Product, Category, Product_Detail, Stock
from .forms import ProductAdminForm

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "is_active", "image_tag")
    search_fields = ("name", "description")
    list_filter = ("is_active", "parent")
    ordering = ("name",)
    readonly_fields = ("image_tag",)
    
    # Enable search for autocomplete in Product admin
    search_fields = ["name", "description"]
    
    fieldsets = (
        ("Basic Information", {
            "fields": ("name", "parent", "description", "is_active")
        }),
        ("Image", {
            "fields": ("img", "image_tag"),
            "classes": ("collapse",)
        }),
    )

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = ("item_name", "category", "model", "barcode", "is_service")
    search_fields = ("item_name", "model", "barcode", "serial_no")
    list_filter = ("is_service", "category", "category__parent")
    ordering = ("item_name",)
    
    # Enable popup functionality for category field with + button
    autocomplete_fields = ["category"]
    
    fieldsets = (
        ("Product Information", {
            "fields": ("item_name", "category", "model", "barcode", "serial_no"),
            "description": "Fill in the basic product information. Use the '+' button next to category to add a new category."
        }),
        ("Additional Details", {
            "fields": ("img", "is_service"),
            "classes": ("collapse",)
        }),
    )
    
    # Enable JavaScript for popup functionality
    class Media:
        css = {
            'all': ('admin/css/widgets.css',)
        }
        js = (
            'admin/js/admin/RelatedObjectLookups.js',
            'admin/js/jquery.init.js',
            'admin/js/core.js',
        )

@admin.register(Product_Detail)
class ProductDetailAdmin(admin.ModelAdmin):
    list_display = ("product", "organization", "purchased_price", "selling_price", "unit", "minimum_requirement")
    search_fields = ("product__item_name", "organization__name")
    list_filter = ("organization", "unit")
    autocomplete_fields = ["product", "unit"]
    raw_id_fields = ("organization",)

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ("product", "organization", "current_amount", "selling_amount", "purchasing_amount", "loss_amount")
    search_fields = ("product__item_name", "organization__name")
    list_filter = ("organization",)
    autocomplete_fields = ["product"]
    raw_id_fields = ("organization",)

@admin.register(Unit) 
class UnitAdmin(admin.ModelAdmin):
    list_display=("name","description","is_active","organization")
    search_fields=("name","description")
    list_filter=("is_active","organization")
    ordering=('organization', 'name')
    
    # Enable search for autocomplete in other models
    search_fields = ["name"]
 