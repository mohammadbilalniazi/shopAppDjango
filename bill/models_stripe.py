from django.db import models
from django.conf import settings
from .models import Bill
from configuration.models import Organization


class StripePayment(models.Model):
    """
    Model to track Stripe payment transactions for bills
    """
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('canceled', 'Canceled'),
        ('refunded', 'Refunded'),
    )
    
    bill = models.ForeignKey(
        Bill, 
        on_delete=models.CASCADE, 
        related_name='stripe_payments',
        help_text="Bill associated with this payment"
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        help_text="Organization making the payment"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        help_text="User who initiated the payment"
    )
    
    # Stripe specific fields
    stripe_payment_intent_id = models.CharField(
        max_length=255,
        unique=True,
        help_text="Stripe Payment Intent ID"
    )
    stripe_charge_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Stripe Charge ID (after payment succeeds)"
    )
    
    # Payment details
    amount = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        help_text="Amount to be paid"
    )
    currency = models.CharField(
        max_length=3,
        default='USD',
        help_text="Currency code (e.g., USD, EUR, AFG)"
    )
    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default='pending',
        help_text="Payment status"
    )
    
    # Card information (last 4 digits only for security)
    card_brand = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Card brand (e.g., Visa, Mastercard)"
    )
    card_last4 = models.CharField(
        max_length=4,
        blank=True,
        null=True,
        help_text="Last 4 digits of card"
    )
    
    # Metadata
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Payment description"
    )
    failure_message = models.TextField(
        blank=True,
        null=True,
        help_text="Failure reason if payment failed"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Timestamp when payment was completed"
    )
    
    # Refund tracking
    refunded = models.BooleanField(
        default=False,
        help_text="Whether payment has been refunded"
    )
    refund_amount = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0,
        help_text="Amount refunded"
    )
    refund_reason = models.TextField(
        blank=True,
        null=True,
        help_text="Reason for refund"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Stripe Payment'
        verbose_name_plural = 'Stripe Payments'
        indexes = [
            models.Index(fields=['stripe_payment_intent_id']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['bill', 'status']),
        ]
    
    def __str__(self):
        return f"Payment {self.stripe_payment_intent_id} - {self.amount} {self.currency} ({self.status})"
    
    @property
    def is_successful(self):
        """Check if payment was successful"""
        return self.status == 'succeeded'
    
    @property
    def is_pending(self):
        """Check if payment is still pending"""
        return self.status in ['pending', 'processing']
    
    @property
    def can_be_refunded(self):
        """Check if payment can be refunded"""
        return self.is_successful and not self.refunded


class StripeWebhookEvent(models.Model):
    """
    Model to log Stripe webhook events for debugging and auditing
    """
    event_id = models.CharField(
        max_length=255,
        unique=True,
        help_text="Stripe event ID"
    )
    event_type = models.CharField(
        max_length=100,
        help_text="Event type (e.g., payment_intent.succeeded)"
    )
    payment = models.ForeignKey(
        StripePayment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='webhook_events',
        help_text="Related payment if applicable"
    )
    
    # Event data
    payload = models.JSONField(
        help_text="Full webhook payload"
    )
    processed = models.BooleanField(
        default=False,
        help_text="Whether event has been processed"
    )
    processing_error = models.TextField(
        blank=True,
        null=True,
        help_text="Error message if processing failed"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When event was processed"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Stripe Webhook Event'
        verbose_name_plural = 'Stripe Webhook Events'
        indexes = [
            models.Index(fields=['event_id']),
            models.Index(fields=['event_type', 'processed']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.event_type} - {self.event_id}"


class TransactionLog(models.Model):
    """
    Unified transaction log for manual and Stripe payment events.
    """
    SOURCE_CHOICES = (
        ('manual', 'Manual'),
        ('stripe', 'Stripe'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    bill = models.ForeignKey(
        Bill,
        on_delete=models.CASCADE,
        related_name='transaction_logs',
        help_text="Bill associated with this transaction event"
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        help_text="Organization related to this transaction"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="User who triggered this transaction event"
    )

    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        help_text="Where the transaction originated"
    )
    event_type = models.CharField(
        max_length=100,
        help_text="Event name (e.g., payment_intent_created, payment_succeeded)"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Transaction event outcome"
    )
    amount = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0,
        help_text="Amount related to this event"
    )
    currency = models.CharField(
        max_length=3,
        default='USD',
        help_text="Currency code"
    )
    reference_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="External reference (payment intent, charge, etc.)"
    )
    message = models.TextField(
        blank=True,
        null=True,
        help_text="Human-readable log message"
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional context for this log entry"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Transaction Log'
        verbose_name_plural = 'Transaction Logs'
        indexes = [
            models.Index(fields=['bill', 'created_at']),
            models.Index(fields=['organization', 'created_at']),
            models.Index(fields=['source', 'status']),
            models.Index(fields=['reference_id']),
        ]

    def __str__(self):
        return f"{self.source}:{self.event_type} bill={self.bill_id} status={self.status}"
