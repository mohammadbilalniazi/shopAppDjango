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
    # list_display=("organization","item_name","get_detail","category","get_minimum_requirement","get_item_amount_available","get_row","get_column","get_purchased_price","get_selling_price","image_tag")
    list_display=("item_name","model","category","get_minimum_requirement","get_row","get_column","get_purchased_price","get_selling_price")
    list_filter=("category","item_name")
    # fields = ['image_tag']
    # readonly_fields = ['image_tag']
    # def queryset(self, request):
    #     qs = super(Product, self).queryset(request)
    #     (self_organization,=find_organization(request)
    #     print("organization ",organization)
    #     # if request.user.is_superuser:
    #     #     return qs
    #     return qs.filter(product_detail__organization=organization)

    def get_column(self, obj):
        if obj.row_column_address:
            return obj.row_column_address.column
        else:
            return None

    def get_row(self, obj):
        if obj.row_column_address:
            return obj.row_column_address.row
        else:
            return None

    

 
    def get_minimum_requirement(self, obj):
        if obj.product_detail:
            return obj.product_detail.minimum_requirement
        else:
            return 1
    
    def get_purchased_price(self, obj):
        if obj.product_detail:
            return obj.product_detail.purchased_price
        else:
            return 0

    def get_selling_price(self, obj):
        if obj.product_detail:
            return obj.product_detail.selling_price
        else:
            return 0


 
# @admin.register(Service) 
# class ServiceAdmin(admin.ModelAdmin):
#     list_display=("name","category","dest","detail","html_id","is_active")

 
# @admin.register(SubService) 
# class SubSerivceAdmin(admin.ModelAdmin):
#     list_display=("service","sub_service_name","dest","detail","html_id","is_active")


    

    # Service=("service","uploader","file","is_active") 