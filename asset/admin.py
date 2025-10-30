from django.contrib import admin
from .models import *
# # Register your models here.
@admin.register(AssetBillSummary)
class AssetBillSummaryAdmin(admin.ModelAdmin):
    list_display = ("id","organization","bill_rcvr_org","bill_type","year","total","payment","profit","currency")
    list_filter = ("organization","bill_rcvr_org","bill_type","year","currency")
    search_fields = ("organization__name","bill_rcvr_org__name","bill_type","year","currency")
    ordering = ("-year",)
    list_per_page = 20

@admin.register(AssetWholeBillSummary)
class AssetWholeBillSummaryAdmin(admin.ModelAdmin):
    list_display = ("id","organization","bill_type","total","payment","profit","currency")
    list_filter = ("organization","bill_type","currency")
    search_fields = ("organization__name","bill_type","currency")
    ordering = ("-id",)
    list_per_page = 20
