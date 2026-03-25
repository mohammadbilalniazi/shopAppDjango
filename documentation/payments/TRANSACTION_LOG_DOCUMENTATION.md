Transaction Log Documentation

Purpose

This document explains the TransactionLog model and its role in the supermarket electronic management system. It is intended for thesis use and covers the data structure, query API, relationship to billing, and the audit design it enables.

Module Scope

TransactionLog is implemented in bill/models_stripe.py. It is written to by two separate code paths:
- bill/views_stripe.py for all Stripe card payment events
- bill/views_bill_receive_payment.py for all manual payment and receivement events

Because both paths write to the same table, TransactionLog provides a single unified audit stream for the entire payment subsystem regardless of how payment was made.

Data Model

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

Field Explanations

- bill: the bill this log entry belongs to. Deleting a bill cascades to its transaction logs.
- organization: the organization that owns this log entry. Used for access control filtering.
- user: the user who triggered the event, if known. Nullable for webhook-triggered events.
- source: distinguishes between manual and Stripe transactions.
- event_type: describes the specific event such as payment_intent_created, payment_succeeded, payment_failed, refund_requested, manual_payment, or manual_receivement.
- status: the outcome of the event at the time it was logged.
- amount: the monetary amount involved in this specific event.
- currency: the three-letter currency code such as USD or AFG.
- reference_id: an external identifier such as a Stripe payment intent ID or a bill reference string for manual transactions.
- message: a human-readable description of what happened.
- metadata: a JSON field for storing additional context without schema changes. Examples include bill_no, stripe_payment_id, and reason text.
- created_at: the timestamp when this log row was inserted.

Event Types Written Per Flow

Stripe payment flow event types:
- payment_intent_created: written when a Stripe payment intent is created
- payment_intent_create_failed: written when intent creation fails due to a Stripe error
- payment_succeeded: written by webhook handler when Stripe confirms payment success
- payment_failed: written by webhook handler when Stripe reports a payment failure
- refund_requested: written when a refund is submitted through the refund endpoint

Manual payment and receivement event types:
- manual_payment: written when a manual payment bill is saved
- manual_receivement: written when a manual receivement bill is saved

How Stripe Writes To TransactionLog

Stripe log entries are written through the internal helper function in bill/views_stripe.py:

```python
def _create_transaction_log(
    bill, organization, user, source, event_type,
    status_value, amount, currency, reference_id, message, metadata
):
    try:
        TransactionLog.objects.create(
            bill=bill,
            organization=organization,
            user=user,
            source=source,
            event_type=event_type,
            status=status_value,
            amount=Decimal(str(amount or 0)),
            currency=(currency or 'USD').upper(),
            reference_id=reference_id,
            message=message,
            metadata=metadata or {},
        )
    except Exception as exc:
        print(f"Error creating transaction log: {exc}")
```

The helper is wrapped in a try-except so that a logging failure never blocks the payment or refund operation itself. This is an important design choice because payment operations must complete even if the log write fails.

How Manual Flows Write To TransactionLog

Manual payments and receivements are logged from bill/views_bill_receive_payment.py:

```python
def _log_manual_transaction(bill, user, payment_amount, event_type, status_value, message, metadata=None):
    try:
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
    except Exception as exc:
        print(f"Error creating manual transaction log: {exc}")
```

For manual transactions the reference_id uses a local bill reference pattern (bill-<id>) since there is no external payment identifier.

Query API

The transaction log query endpoint is registered at GET /bill/payment/transaction-logs/ and implemented in bill/views_stripe.py:

```python
@login_required
@api_view(['GET'])
def get_transaction_logs(request):
    bill_id = request.query_params.get('bill_id')
    source = request.query_params.get('source')
    status_filter = request.query_params.get('status')
    limit_param = request.query_params.get('limit', '100')
    limit = max(1, min(int(limit_param), 500))

    logs = TransactionLog.objects.select_related(
        'bill', 'organization', 'user'
    ).order_by('-created_at')

    # Organization-based access control
    self_organization, user_orgs = find_userorganization(request)
    if not request.user.is_superuser:
        if self_organization:
            logs = logs.filter(organization=self_organization)
        elif user_orgs:
            logs = logs.filter(organization__in=user_orgs)
        else:
            logs = logs.none()

    # Optional filters
    if bill_id:
        logs = logs.filter(bill_id=bill_id)
    if source:
        logs = logs.filter(source=source.lower())
    if status_filter:
        logs = logs.filter(status=status_filter.lower())

    logs = logs[:limit]
    ...
```

Query Parameters

- bill_id: filter by a specific bill
- source: filter by manual or stripe
- status: filter by pending, succeeded, failed, or refunded
- limit: maximum number of rows to return, between 1 and 500, default 100

Response Format

```json
{
  "ok": true,
  "count": 3,
  "logs": [
    {
      "id": 42,
      "bill_id": 7,
      "bill_no": 15,
      "organization_id": 2,
      "organization_name": "Main Store",
      "user_id": 1,
      "username": "admin",
      "source": "stripe",
      "event_type": "payment_succeeded",
      "status": "succeeded",
      "amount": 150.00,
      "currency": "USD",
      "reference_id": "ch_3PaBC...",
      "message": "Payment succeeded for Bill #15",
      "metadata": {"stripe_payment_id": 5},
      "created_at": "2025-01-15T10:30:00.000000Z"
    }
  ]
}
```

Access Control

The endpoint enforces organization-based access control. Superusers can retrieve logs from all organizations. Non-superusers can only retrieve logs belonging to their accessible organizations. This prevents cross-organization data leakage through the audit trail.

Route Registration

```python
path('bill/payment/transaction-logs/', views_stripe.get_transaction_logs, name='transaction_logs')
```

Relationship To StripeWebhookEvent

TransactionLog is distinct from StripeWebhookEvent. StripeWebhookEvent stores raw incoming Stripe webhook payloads for debugging and idempotency control. TransactionLog stores structured semantic events that are meaningful to the business, whether they originated from a webhook or from a user action. Both tables together give a complete picture of what happened, at what level, and why.

Relationship To Bill Payment State

Every significant change to bill.payment should have at least one corresponding TransactionLog entry. This creates an audit trail that explains why the bill payment amount changed. For example:
- a successful stripe payment adds to bill.payment and creates a payment_succeeded log entry
- a refund subtracts from bill.payment and creates a refund_requested log entry
- a manual payment changes bill.payment and creates a manual_payment or manual_receivement log entry

Database Indexes

The TransactionLog table uses four database indexes:
- bill and created_at: for fast per-bill history queries ordered by time
- organization and created_at: for fast per-organization log queries ordered by time
- source and status: for filtering by payment source and outcome
- reference_id: for looking up by external Stripe identifiers

Thesis Discussion Points

1. Explain how a single log table can unify events from two different payment mechanisms.
2. Discuss best-effort logging as a design tradeoff between auditability and operational reliability.
3. Analyze how organization-based filtering applies to audit trails in multi-tenant systems.
4. Compare TransactionLog (business-level events) with StripeWebhookEvent (infrastructure-level events) as two complementary audit layers.
5. Show how the metadata JSONField allows flexible event context without requiring schema changes for every new event type.
