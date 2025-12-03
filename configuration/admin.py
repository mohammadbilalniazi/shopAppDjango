from django.contrib import admin
from .models import Currency

# Only register Currency from configuration app
@admin.register(Currency)
class CurrenciesAdmin(admin.ModelAdmin):
    list_display=("currency","is_domestic")
    search_fields=("currency",)
    list_filter=("is_domestic",)
    
    class Meta:
        verbose_name = "Currency"
        verbose_name_plural = "Currencies"

