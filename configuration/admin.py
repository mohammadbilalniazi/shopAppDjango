from django.contrib import admin
from .models import *

@admin.register(Languages)
class LanguagesAdmin(admin.ModelAdmin):
    list_display=("language","description")
    
@admin.register(Language_Detail)
class Language_DetailAdmin(admin.ModelAdmin):
    list_display=("src","dest","id_field","text","value")
    list_filter=("src","dest","id_field")
