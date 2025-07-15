from django.contrib import admin
from .models import *
# Register your models here.
@admin.register(OrganizationUser)
class OrganizationUserAdmin(admin.ModelAdmin):
    list_display=("organization","user","is_active","img")