from django.contrib import admin
from .models import *

# Register Asset Summary models
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


# Register new Asset Management models
@admin.register(OrganizationAsset)
class OrganizationAssetAdmin(admin.ModelAdmin):
    list_display = (
        "organization", 
        "total_assets", 
        "total_liabilities", 
        "equity", 
        "cash_on_hand",
        "inventory_value",
        "net_profit",
        "last_updated"
    )
    list_filter = ("organization", "currency")
    search_fields = ("organization__name",)
    readonly_fields = (
        "total_assets", 
        "total_liabilities", 
        "equity", 
        "net_profit",
        "last_updated"
    )
    fieldsets = (
        ("Organization", {
            "fields": ("organization", "currency")
        }),
        ("Assets", {
            "fields": (
                "inventory_value",
                "cash_on_hand",
                "accounts_receivable",
                "loans_receivable",
                "total_assets"
            )
        }),
        ("Liabilities", {
            "fields": (
                "accounts_payable",
                "loans_payable",
                "total_liabilities"
            )
        }),
        ("Equity", {
            "fields": ("equity",)
        }),
        ("Profit & Loss", {
            "fields": (
                "total_revenue",
                "total_cost_of_goods_sold",
                "total_expenses",
                "total_losses",
                "net_profit"
            )
        }),
        ("Metadata", {
            "fields": ("last_updated",)
        })
    )
    ordering = ("-last_updated",)


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "organization",
        "counterparty",
        "loan_type",
        "principal_amount",
        "amount_paid",
        "amount_remaining",
        "status",
        "loan_date",
        "due_date"
    )
    list_filter = ("loan_type", "status", "organization", "counterparty")
    search_fields = ("organization__name", "counterparty__name", "notes")
    readonly_fields = ("amount_remaining", "created_at", "updated_at")
    fieldsets = (
        ("Loan Details", {
            "fields": (
                "organization",
                "counterparty",
                "loan_type",
                "status"
            )
        }),
        ("Amounts", {
            "fields": (
                "principal_amount",
                "amount_paid",
                "amount_remaining",
                "interest_rate",
                "currency"
            )
        }),
        ("Dates", {
            "fields": (
                "loan_date",
                "due_date",
                "created_at",
                "updated_at"
            )
        }),
        ("Additional Info", {
            "fields": ("notes",)
        })
    )
    ordering = ("-loan_date",)
    list_per_page = 20


@admin.register(ProfitLossStatement)
class ProfitLossStatementAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "organization",
        "year",
        "period_start",
        "period_end",
        "total_revenue",
        "cogs",
        "gross_profit",
        "net_profit"
    )
    list_filter = ("organization", "year", "currency")
    search_fields = ("organization__name",)
    readonly_fields = ("total_revenue", "cogs", "gross_profit", "net_profit", "created_at")
    fieldsets = (
        ("Period Info", {
            "fields": (
                "organization",
                "year",
                "period_start",
                "period_end",
                "currency"
            )
        }),
        ("Revenue", {
            "fields": (
                "revenue_from_sales",
                "other_revenue",
                "total_revenue"
            )
        }),
        ("Cost of Goods Sold", {
            "fields": (
                "beginning_inventory",
                "purchases",
                "ending_inventory",
                "cogs"
            )
        }),
        ("Expenses & Losses", {
            "fields": (
                "operating_expenses",
                "loss_from_damage"
            )
        }),
        ("Profit", {
            "fields": (
                "gross_profit",
                "net_profit"
            )
        }),
        ("Metadata", {
            "fields": ("created_at",)
        })
    )
    ordering = ("-year", "-period_end")
    list_per_page = 20

