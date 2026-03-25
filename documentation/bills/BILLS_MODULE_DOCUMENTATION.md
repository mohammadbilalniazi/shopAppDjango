Bills Module Documentation

1. Module Scope

The bills module handles:
- Purchase and selling bills
- Payment and receivement bills
- Loss/degrade and expense bills
- Manual payment recording
- Stripe online payment and refund operations

Primary implementation files:
- bill/models.py
- bill/views_bill.py
- bill/views_bill_receive_payment.py
- bill/models_stripe.py
- bill/views_stripe.py
- shop/urls.py

2. Core Data Models

Bill
The Bill model stores header-level transaction data.

```python
bill_types = (
    ("PURCHASE", "PURCHASE"),
    ("SELLING", "SELLING"),
    ("PAYMENT", "PAYMENT"),
    ("RECEIVEMENT", "RECEIVEMENT"),
    ("LOSSDEGRADE", "LOSSDEGRADE"),
    ("EXPENSE", "EXPENSE"),
)
STATUS = ((0, "CANCELLED"), (1, "CREATED"))

class Bill(models.Model):
    bill_no=models.IntegerField()
    bill_type=models.CharField(max_length=11,default="PURCHASE",choices=bill_types)
    organization = models.ForeignKey(Organization, on_delete=models.PROTECT,null=True)
    branch = models.ForeignKey(
        'configuration.Branch', on_delete=models.SET_NULL, null=True, blank=True,
        help_text="Branch where this bill was created"
    )
    creator=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT,null=True,blank=True,related_name="creator_set")
    total=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    payment=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    year=models.SmallIntegerField(default=get_year)
    date=models.CharField(max_length=10,default=get_date)
    profit=models.IntegerField(default=0)
    status=models.SmallIntegerField(choices=STATUS,default=0)
    currency=models.CharField(max_length=7,default="afg")
    shipment_location=models.ForeignKey(Location,on_delete=models.PROTECT,null=True,default=None)
```

Bill_Receiver2
Bill receiver relation for inter-organization documents and approval lifecycle.

```python
class Bill_Receiver2(models.Model):
    bill=models.OneToOneField(Bill,on_delete=models.CASCADE)
    bill_rcvr_org=models.ForeignKey(Organization,on_delete=models.PROTECT,null=True,blank=True)
    is_approved=models.BooleanField(default=False,null=True,blank=True)
    approval_date=models.DateField(null=True,blank=True)
    approval_user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT,null=True,blank=True,default=None)
```

Bill_detail
Line-level product entries in one bill.

```python
class Bill_detail(models.Model):
    bill=models.ForeignKey(Bill,on_delete=models.CASCADE)
    product=models.ForeignKey(Product,on_delete=models.PROTECT,null=False, blank=False)
    unit=models.ForeignKey(Unit,on_delete=models.PROTECT,null=True, blank=True)
    item_amount =models.DecimalField(default=0.0,max_digits=15,decimal_places=5)
    item_price=models.DecimalField(default=0.0,max_digits=15,decimal_places=5)
    return_qty=models.IntegerField(null=True,blank=True)
    discount=models.IntegerField(default=0)
    profit=models.IntegerField(default=None,null=True)
```

3. Stripe Payment Data Models

StripePayment
Tracks payment intent, charge, card summary, status, and refund information.

```python
class StripePayment(models.Model):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='stripe_payments')
    organization = models.ForeignKey(Organization, on_delete=models.PROTECT)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True)
    stripe_charge_id = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    refunded = models.BooleanField(default=False)
    refund_amount = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    refund_reason = models.TextField(blank=True, null=True)
```

TransactionLog
Unified transaction event log for manual and Stripe flows.

```python
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

class TransactionLog(models.Model):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='transaction_logs')
    organization = models.ForeignKey(Organization, on_delete=models.PROTECT)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    event_type = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    amount = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    reference_id = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['bill', 'created_at']),
            models.Index(fields=['organization', 'created_at']),
            models.Index(fields=['source', 'status']),
            models.Index(fields=['reference_id']),
        ]
```

4. Main Routes

Registered in shop/urls.py:

```python
path('bill/payment/create-intent/', views_stripe.create_payment_intent, name='stripe_create_intent')
path('bill/payment/status/<int:payment_id>/', views_stripe.get_payment_status, name='stripe_payment_status')
path('bill/payment/refund/<int:payment_id>/', views_stripe.refund_payment, name='stripe_refund_payment')
path('bill/payment/history/<int:bill_id>/', views_stripe.get_bill_payments, name='stripe_bill_payments')
path('bill/payment/transaction-logs/', views_stripe.get_transaction_logs, name='transaction_logs')
path('stripe/webhook/', views_stripe.stripe_webhook, name='stripe_webhook')
```

And classic bill operations:

```python
path('bill/insert/', views_bill.bill_insert, name="bill_insert")
path('bill/detail/<bill_id>/', views_bill.bill_show)
path('bill/detail/delete/<bill_detail_id>', views_bill.bill_detail_delete)
path('bill/delete/<id>/', views_bill.bill_delete)
path('receive_payment/bill/save/', views_bill_receive_payment.bill_insert)
```

5. Refund Processing Logic (Important For Thesis)

The refund endpoint supports full and partial refund and validates authorization and refundable balance.

```python
@login_required
@api_view(['POST'])
@transaction.atomic
def refund_payment(request, payment_id):
    stripe_payment = get_object_or_404(StripePayment, id=payment_id)

    if stripe_payment.status != 'succeeded':
        return Response({'ok': False, 'message': 'Only successful payments can be refunded'}, status=400)

    already_refunded = Decimal(stripe_payment.refund_amount or 0)
    max_refundable = Decimal(stripe_payment.amount) - already_refunded

    amount_raw = request.data.get('amount')
    refund_amount = Decimal(str(amount_raw)) if amount_raw not in (None, '') else max_refundable

    if not amount_raw or amount_raw == '':
        refund_amount = max_refundable
        full_refund = True
    else:
        try:
            refund_amount = Decimal(str(amount_raw))
        except Exception:
            return Response({'ok': False, 'message': 'Invalid refund amount'}, status=400)
        if refund_amount <= 0:
            return Response({'ok': False, 'message': 'Refund amount must be greater than zero'}, status=400)
        if refund_amount > max_refundable:
            return Response({'ok': False, 'message': f'Refund amount exceeds refundable balance ({max_refundable})'}, status=400)
        full_refund = (refund_amount == max_refundable)

    stripe_amount_cents = int(refund_amount * 100)
    refund_kwargs = {
        'charge': stripe_payment.stripe_charge_id,
        'amount': stripe_amount_cents,
        'reason': 'requested_by_customer',
    }

    refund = stripe.Refund.create(**refund_kwargs)
    charge = stripe.Charge.retrieve(stripe_payment.stripe_charge_id)
    handle_payment_refund(charge)
```

Idempotent local sync strategy
Webhook retry safety uses delta refund update:

```python
new_refund_amount = Decimal(charge.get('amount_refunded', 0)) / 100
previous_refund_amount = Decimal(stripe_payment.refund_amount or 0)
refund_delta = new_refund_amount - previous_refund_amount

if refund_delta < 0:
    refund_delta = Decimal('0')

if refund_delta > 0:
    updated_payment = Decimal(bill.payment) - refund_delta
    bill.payment = updated_payment if updated_payment > 0 else Decimal('0')
    bill.save()
```

This prevents double deduction in repeated charge.refunded webhook events.

6. Manual Payment Logging

Manual receive/payment flow creates transaction logs from bill/views_bill_receive_payment.py:

```python
def _log_manual_transaction(bill, user, payment_amount, event_type, status_value, message, metadata=None):
    TransactionLog.objects.create(
        bill=bill,
        organization=bill.organization,
        user=user,
        source='manual',
        event_type=event_type,
        status=status_value,
        amount=Decimal(str(payment_amount or 0)),
        currency=(bill.currency or 'USD').upper(),
        reference_id=f'bill-{bill.id}',
        message=message,
        metadata=metadata or {},
    )
```

7. Asset Summary Integration Through Signals

bill/models.py updates financial summary tables after bill save/delete and Bill_Receiver save/delete through Django signals:
- update_asset_bill_summary
- rollback_asset_bill_summary
- handle_bill_receiver
- rollback_bill_receiver

This creates a strong accounting consistency layer for thesis discussion of event-driven data integrity.

8. Suggested Thesis Discussion Points

1. Compare manual and online payment integration in one domain model.
2. Explain webhook idempotency through refund delta calculation.
3. Show role-based multi-organization authorization checks.
4. Explain transaction logging as an audit trail architecture.
