# Stripe Payment Gateway Integration

## Overview

This implementation adds Stripe payment gateway integration to the bill payment system, allowing users to pay bills using credit/debit cards securely.

## Features

✅ **Secure Card Payments**
- Accept Visa, Mastercard, American Express, and other major cards
- PCI-DSS compliant payment processing through Stripe
- Card details never touch your server

✅ **Payment Tracking**
- Complete payment history for each bill
- Real-time payment status updates
- Support for partial payments

✅ **Webhook Integration**
- Automatic payment confirmation via webhooks
- Payment status synchronization
- Refund handling

✅ **User-Friendly Interface**
- Modern, responsive payment form
- Real-time card validation
- Clear error messages
- Payment success confirmation

## Installation & Configuration

### 1. Install Required Package

Stripe is already included in `requirements.txt`. If needed, install it:

```bash
pip install stripe
```

### 2. Configure Stripe Keys

Add your Stripe API keys to your environment variables or `.env` file:

```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_CURRENCY=USD
```

**Getting Stripe Keys:**
1. Sign up at [https://stripe.com](https://stripe.com)
2. Go to Developers → API Keys
3. Copy your Publishable Key and Secret Key
4. For webhooks: Go to Developers → Webhooks → Add endpoint

### 3. Run Database Migrations

Create and apply migrations for the new Stripe models:

```bash
python manage.py makemigrations bill
python manage.py migrate
```

### 4. Configure Webhook Endpoint

**Webhook URL:** `https://yourdomain.com/stripe/webhook/`

**Events to Subscribe:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

**Steps:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL
4. Select the events listed above
5. Copy the webhook signing secret
6. Add it to your environment as `STRIPE_WEBHOOK_SECRET`

## Database Models

### StripePayment

Tracks all Stripe payment transactions:

| Field | Type | Description |
|-------|------|-------------|
| bill | ForeignKey | Associated bill |
| organization | ForeignKey | Organization making payment |
| user | ForeignKey | User who initiated payment |
| stripe_payment_intent_id | CharField | Stripe Payment Intent ID |
| stripe_charge_id | CharField | Stripe Charge ID |
| amount | DecimalField | Payment amount |
| currency | CharField | Currency code (USD, EUR, etc.) |
| status | CharField | Payment status (pending, succeeded, failed, etc.) |
| card_brand | CharField | Card brand (Visa, Mastercard, etc.) |
| card_last4 | CharField | Last 4 digits of card |
| paid_at | DateTimeField | Payment completion timestamp |
| refunded | BooleanField | Whether payment was refunded |

### StripeWebhookEvent

Logs all webhook events for debugging:

| Field | Type | Description |
|-------|------|-------------|
| event_id | CharField | Stripe event ID |
| event_type | CharField | Event type |
| payment | ForeignKey | Related payment |
| payload | JSONField | Full webhook payload |
| processed | BooleanField | Processing status |
| processing_error | TextField | Error message if failed |

## API Endpoints

### Create Payment Intent

**URL:** `/bill/payment/create-intent/`  
**Method:** `POST`  
**Auth:** Required

**Request Body:**
```json
{
  "bill_id": 123,
  "amount": 100.50,
  "currency": "USD"
}
```

**Response:**
```json
{
  "ok": true,
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxx",
  "stripe_payment_id": 1,
  "amount": 100.50,
  "currency": "USD",
  "publishable_key": "pk_test_xxx"
}
```

### Get Payment Status

**URL:** `/bill/payment/status/<payment_id>/`  
**Method:** `GET`  
**Auth:** Required

**Response:**
```json
{
  "ok": true,
  "payment": {
    "id": 1,
    "bill_id": 123,
    "bill_no": 456,
    "amount": 100.50,
    "currency": "USD",
    "status": "succeeded",
    "card_brand": "Visa",
    "card_last4": "4242",
    "paid_at": "2026-03-01T12:00:00Z"
  }
}
```

### Get Bill Payment History

**URL:** `/bill/payment/history/<bill_id>/`  
**Method:** `GET`  
**Auth:** Required

**Response:**
```json
{
  "ok": true,
  "bill_id": 123,
  "bill_no": 456,
  "total": 500.00,
  "paid": 350.00,
  "remaining": 150.00,
  "payments": [
    {
      "id": 1,
      "amount": 200.00,
      "status": "succeeded",
      "card_brand": "Visa",
      "card_last4": "4242",
      "paid_at": "2026-03-01T10:00:00Z"
    },
    {
      "id": 2,
      "amount": 150.00,
      "status": "succeeded",
      "card_brand": "Mastercard",
      "card_last4": "5555",
      "paid_at": "2026-03-01T12:00:00Z"
    }
  ]
}
```

### Webhook Handler

**URL:** `/stripe/webhook/`  
**Method:** `POST`  
**Auth:** Stripe signature verification

This endpoint is called by Stripe automatically when payment events occur.

## Usage

### Option 1: Direct Payment Page

Navigate to the payment page for any bill:

```
/bill/payment/<bill_id>/
```

Example: `/bill/payment/123/`

### Option 2: Add Pay Button to Bill List

Add this button to your bill list template:

```html
{% if bill.total > bill.payment %}
<a href="{% url 'stripe_payment_page' bill.id %}" class="btn btn-primary">
    <i class="fas fa-credit-card"></i> Pay with Card
</a>
{% endif %}
```

### Option 3: Programmatic Payment

```javascript
// Create payment intent
const response = await fetch('/bill/payment/create-intent/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({
        bill_id: 123,
        amount: 100.50,
        currency: 'USD'
    })
});

const data = await response.json();

// Confirm payment with Stripe
const result = await stripe.confirmCardPayment(data.client_secret, {
    payment_method: {
        card: cardElement,
        billing_details: {
            name: 'Customer Name'
        }
    }
});

if (result.paymentIntent.status === 'succeeded') {
    console.log('Payment successful!');
}
```

## Security Considerations

✅ **PCI Compliance**
- Card details handled entirely by Stripe
- No sensitive card data stored on your server
- Stripe Elements for secure card input

✅ **Authentication**
- All payment endpoints require user authentication
- Organization-based access control
- CSRF protection enabled

✅ **Webhook Security**
- Webhook signature verification
- Event replay prevention
- Secure payload validation

✅ **Data Protection**
- Only last 4 card digits stored
- Payment intents expire after 24 hours
- Encrypted data transmission

## Testing

### Test Cards

Use Stripe's test cards for development:

| Card Number | Brand | Scenario |
|------------|-------|----------|
| 4242 4242 4242 4242 | Visa | Success |
| 4000 0000 0000 9995 | Visa | Declined |
| 4000 0000 0000 3220 | Visa | 3D Secure |
| 5555 5555 5555 4444 | Mastercard | Success |

**Expiry:** Any future date  
**CVC:** Any 3 digits  
**ZIP:** Any 5 digits

### Test Webhook Locally

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8000/stripe/webhook/

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

## Admin Interface

Access Stripe payment records in Django admin:

- **Stripe Payments:** `/django-admin/bill/stripepayment/`
- **Webhook Events:** `/django-admin/bill/stripewebhookevent/`

**Admin Features:**
- View all payment transactions
- Filter by status, date, organization
- Search by bill number, payment ID
- View card details (last 4 digits only)
- Track refunds
- Monitor webhook events

## Troubleshooting

### Payment Not Updating Bill

**Issue:** Payment succeeded in Stripe but bill payment amount not updated.

**Solution:**
1. Check webhook configuration
2. Verify webhook secret in settings
3. Check webhook event logs in admin
4. Look for processing errors in webhook events

### Webhook Signature Verification Failed

**Issue:** Webhook returns 400 error.

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` is correct
2. Use the webhook secret from the specific endpoint
3. Ensure webhook URL is correct (https in production)
4. Check Stripe Dashboard → Webhooks → Recent events

### Payment Intent Creation Failed

**Issue:** Error when creating payment intent.

**Solution:**
1. Verify `STRIPE_SECRET_KEY` is set correctly
2. Check if amount is valid (must be > 0)
3. Ensure currency is supported
4. Check Stripe API logs in dashboard

### Card Declined

**Issue:** Real card being declined in production.

**Solution:**
1. Ask customer to contact their bank
2. Try different payment method
3. Verify billing address matches
4. Check if card supports online payments

## Production Checklist

Before going live:

- [ ] Replace test API keys with live keys
- [ ] Configure production webhook endpoint (HTTPS)
- [ ] Test payment flow end-to-end
- [ ] Verify webhook events are processing
- [ ] Set up monitoring/alerting for failed payments
- [ ] Review Stripe Dashboard settings
- [ ] Enable email receipts in Stripe
- [ ] Test refund process
- [ ] Document payment policies
- [ ] Train staff on payment management

## Support & Resources

- **Stripe Documentation:** [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe Dashboard:** [https://dashboard.stripe.com](https://dashboard.stripe.com)
- **Test Mode:** Use test keys (pk_test_xxx, sk_test_xxx)
- **Go Live:** Request account review and use live keys

## File Structure

```
bill/
├── models_stripe.py         # Stripe payment models
├── views_stripe.py          # Stripe payment views
├── admin.py                 # Updated with Stripe admin
└── migrations/
    └── 000X_stripe_models.py  # Migration file

templates/
└── bill/
    └── stripe_payment.html   # Payment page template

shop/
├── settings.py              # Updated with Stripe config
└── urls.py                  # Updated with Stripe routes
```

## Changelog

**Version 1.0 (March 1, 2026)**
- Initial Stripe integration
- Card payment support
- Webhook handling
- Admin interface
- Payment tracking
- Refund support

---

**Note:** This integration uses Stripe Payment Intents API, which is the recommended approach for online payments. It supports 3D Secure authentication and works globally.
