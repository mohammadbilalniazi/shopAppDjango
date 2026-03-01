# Stripe Payment Gateway - Quick Setup Guide

## Prerequisites
- Active Stripe account ([Sign up at stripe.com](https://stripe.com))
- Python environment with Django installed
- Project running locally or on server

## 5-Minute Setup

### Step 1: Get Stripe API Keys (2 minutes)

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **API Keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)
5. Save these keys securely

### Step 2: Configure Environment Variables (1 minute)

Create or update your `.env` file in the project root:

```env
# Stripe API Keys (Test Mode)
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_CURRENCY=USD
```

Or set them in your system environment/Heroku config vars.

### Step 3: Run Database Migration (1 minute)

```bash
# Create migration
python manage.py makemigrations bill

# Apply migration
python manage.py migrate
```

This creates the `StripePayment` and `StripeWebhookEvent` tables.

### Step 4: Test Payment (1 minute)

1. Start your development server:
   ```bash
   python manage.py runserver
   ```

2. Navigate to any bill payment page:
   ```
   http://localhost:8000/bill/payment/1/
   ```

3. Use a test card:
   - **Card Number:** 4242 4242 4242 4242
   - **Expiry:** Any future date (e.g., 12/30)
   - **CVC:** Any 3 digits (e.g., 123)
   - **ZIP:** Any 5 digits (e.g., 12345)

4. Click "Pay" and verify payment succeeds!

## Optional: Setup Webhooks (for production)

Webhooks ensure payments are tracked even if user closes browser.

### For Local Testing (Development)

```bash
# Install Stripe CLI
# Download from: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:8000/stripe/webhook/
```

Copy the webhook signing secret (starts with `whsec_`) and add to your `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### For Production

1. In [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://yourdomain.com/stripe/webhook/
   ```
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click **Add endpoint**
6. Copy the **Signing secret** and add to your environment

## Verification Checklist

✅ **Environment Variables Set**
```bash
# Check if variables are loaded
python manage.py shell
>>> from django.conf import settings
>>> print(settings.STRIPE_PUBLISHABLE_KEY[:15])
pk_test_xxxxxxx
```

✅ **Migration Applied**
```bash
python manage.py showmigrations bill
```
Should show `[X] 0009_stripe_payment_models`

✅ **URL Routes Working**
```bash
python manage.py show_urls | grep stripe
```
Should show `/stripe/webhook/`, `/bill/payment/`, etc.

✅ **Admin Access**
Navigate to: http://localhost:8000/django-admin/bill/stripepayment/

✅ **Payment Page Loads**
Navigate to: http://localhost:8000/bill/payment/1/

## Common Issues

### Issue: "No module named 'stripe'"
**Solution:**
```bash
pip install stripe
# or
pip install -r requirements.txt
```

### Issue: "STRIPE_SECRET_KEY not found"
**Solution:**
- Verify `.env` file exists in project root
- Check environment variables are loaded
- Restart Django server after adding variables

### Issue: "Bill does not exist"
**Solution:**
- Ensure you have at least one bill in database
- Replace `/bill/payment/1/` with valid bill ID
- Check bill exists: `python manage.py shell`
  ```python
  from bill.models import Bill
  Bill.objects.all()
  ```

### Issue: "API request failed"
**Solution:**
- Verify Stripe keys are correct (no extra spaces)
- Check you're using test keys in development
- Ensure internet connection is active

## Next Steps

1. **Go Live:**
   - Replace test keys with live keys
   - Set up production webhook endpoint
   - Test with real card (small amount)
   - Review Stripe Dashboard settings

2. **Customize:**
   - Adjust currency in settings
   - Modify payment page styling in `stripe_payment.html`
   - Add custom branding
   - Configure email receipts in Stripe Dashboard

3. **Monitor:**
   - Set up email alerts for failed payments
   - Check Stripe Dashboard regularly
   - Review webhook event logs
   - Monitor payment success rates

## Support

- **Documentation:** [STRIPE_PAYMENT_INTEGRATION.md](STRIPE_PAYMENT_INTEGRATION.md)
- **Stripe Docs:** [https://stripe.com/docs](https://stripe.com/docs)
- **Test Cards:** [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Stripe Support:** [https://support.stripe.com](https://support.stripe.com)

## Production Deployment

### Heroku

```bash
# Set config vars
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_xxx
heroku config:set STRIPE_SECRET_KEY=sk_live_xxx
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_xxx

# Push code
git push heroku main

# Run migrations
heroku run python manage.py migrate
```

### Other Platforms

Ensure these environment variables are set:
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CURRENCY`

---

**That's it! You now have Stripe payment gateway integrated. 🎉**

Start accepting payments with: `/bill/payment/<bill_id>/`
