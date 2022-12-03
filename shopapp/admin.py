from django.contrib import admin
#from shopapp.models import Log,Customer,Customer_kahatha_received,Product,Purchase_detail,Purchase_bill,Roznamcha,Initial_asset,Sale_bill,Sales_detail
from products.models import Vendors,Product
from shopapp.models import Customer, Supplier , Supplier_Ledger , Customer_Ledger , Log ,Sale_bill,Sales_detail,Roznamcha,Asset
from django.utils.html import format_html

 
 
admin.site.site_header=format_html("<a href='/'><h1 style='color:rgb(255, 174, 0); font-weight:bold; text-align:center; font-size:40px'>Tejaratistan</h1></a>")

def get_model_fields(model):
    field_list=[field.name for field in model._meta.get_fields()]
    return field_list

  
@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display=get_model_fields(Log)

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display=("name","tazkira","contact")
    

@admin.register(Customer_Ledger)
class Customer_LedgerAdmin(admin.ModelAdmin):
    list_display=get_model_fields(Customer_Ledger)
    
@admin.register(Roznamcha)
class RoznamchaAdmin(admin.ModelAdmin):
    list_display=get_model_fields(Roznamcha)
    readonly_field=("spender",)
 
    def save_model(self,request,obj,form,change): 
        obj.user=request.user
        obj.save()

@admin.register(Asset)
class Initial_assetAdmin(admin.ModelAdmin):
    list_display=("initial_asset","current_asset","start_date") 

@admin.register(Sale_bill)
class SaleAdmin(admin.ModelAdmin): 
    list_display=("payment","sale_date","seller","customer","total_sale_bill","discount")


@admin.register(Sales_detail)
class Sales_detailAdmin(admin.ModelAdmin): 
    list_display=("sale_bill","product","item_amount","item_price","return_qty")

