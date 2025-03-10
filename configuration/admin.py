from django.contrib import admin
from .models import *

@admin.register(Currency)
class CurrenciesAdmin(admin.ModelAdmin):
    list_display=("currency","is_domestic")
    
# @admin.register(Language_Detail)
# class Language_DetailAdmin(admin.ModelAdmin):
#     list_display=("src","dest","id_field","text","value")
#     list_filter=("src","dest","id_field")


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display=("owner","name","created_date")
    # readonly_fields=("parent","owner",)

# @admin.register(Sub_Organization)
# class Sub_OrganizationAdmin(admin.ModelAdmin):
#     list_display=("organization","name","created_date")

# @admin.register(Member_User)
# class Member_UserAdmin(admin.ModelAdmin):
#     list_display=("organization","first_name","is_active")



@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display=("name","shortcut")
    
@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display=("country","state","city","is_active")

