from django.contrib import admin
from .models import Bill, Bill_Receiver2
from .models_stripe import StripePayment, StripeWebhookEvent, TransactionLog


@admin.register(StripePayment)
class StripePaymentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 
        'bill_display', 
        'organization', 
        'amount', 
        'currency', 
        'status', 
        'card_display',
        'created_at',
        'paid_at'
    ]
    list_filter = ['status', 'currency', 'card_brand', 'created_at', 'refunded']
    search_fields = [
        'stripe_payment_intent_id', 
        'stripe_charge_id', 
        'bill__bill_no',
        'organization__name',
        'user__username'
    ]
    readonly_fields = [
        'stripe_payment_intent_id',
        'stripe_charge_id',
        'created_at',
        'updated_at',
        'paid_at'
    ]
    fieldsets = (
        ('Payment Information', {
            'fields': (
                'bill',
                'organization',
                'user',
                'amount',
                'currency',
                'status',
                'description'
            )
        }),
        ('Stripe Details', {
            'fields': (
                'stripe_payment_intent_id',
                'stripe_charge_id',
            )
        }),
        ('Card Information', {
            'fields': (
                'card_brand',
                'card_last4',
            )
        }),
        ('Status & Timestamps', {
            'fields': (
                'failure_message',
                'created_at',
                'updated_at',
                'paid_at',
            )
        }),
        ('Refund Information', {
            'fields': (
                'refunded',
                'refund_amount',
                'refund_reason',
            )
        }),
    )
    
    def bill_display(self, obj):
        return f"Bill #{obj.bill.bill_no} ({obj.bill.bill_type})"
    bill_display.short_description = 'Bill'
    
    def card_display(self, obj):
        if obj.card_brand and obj.card_last4:
            return f"{obj.card_brand} ****{obj.card_last4}"
        return '-'
    card_display.short_description = 'Card'
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of successful payments
        if obj and obj.status == 'succeeded':
            return False
        return super().has_delete_permission(request, obj)


@admin.register(StripeWebhookEvent)
class StripeWebhookEventAdmin(admin.ModelAdmin):
    list_display = [
        'event_id',
        'event_type',
        'payment',
        'processed',
        'created_at',
        'processed_at'
    ]
    list_filter = ['event_type', 'processed', 'created_at']
    search_fields = ['event_id', 'event_type']
    readonly_fields = [
        'event_id',
        'event_type',
        'payload',
        'created_at',
        'processed_at'
    ]
    fieldsets = (
        ('Event Information', {
            'fields': (
                'event_id',
                'event_type',
                'payment',
            )
        }),
        ('Processing Status', {
            'fields': (
                'processed',
                'processing_error',
                'created_at',
                'processed_at',
            )
        }),
        ('Event Data', {
            'fields': (
                'payload',
            ),
            'classes': ('collapse',),
        }),
    )
    
    def has_add_permission(self, request):
        # Webhook events should only be created by the webhook handler
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Allow deletion only if not processed or older than 30 days
        return super().has_delete_permission(request, obj)


@admin.register(TransactionLog)
class TransactionLogAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'created_at',
        'source',
        'event_type',
        'status',
        'bill_display',
        'organization',
        'amount',
        'currency',
        'reference_id',
        'user'
    ]
    list_filter = ['source', 'status', 'currency', 'created_at']
    search_fields = [
        'event_type',
        'reference_id',
        'message',
        'bill__bill_no',
        'organization__name',
        'user__username'
    ]
    readonly_fields = ['created_at']

    def bill_display(self, obj):
        return f"Bill #{obj.bill.bill_no} ({obj.bill.bill_type})"
    bill_display.short_description = 'Bill'

