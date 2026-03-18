Stripe Payment Quick Reference

Purpose

This file serves as a short operational reference for the Stripe payment subsystem.

Main Capabilities

The payment subsystem supports payment-intent creation, payment page rendering, payment status lookup, bill payment history lookup, refund processing, webhook event handling, and transaction logging.

Main Routes

The routes used most often are:
- /bill/payment/<bill_id>/ for the payment page
- /bill/payment/create-intent/ for payment intent creation
- /bill/payment/status/<payment_id>/ for payment status lookup
- /bill/payment/history/<bill_id>/ for payment history lookup
- /bill/payment/refund/<payment_id>/ for refund processing
- /stripe/webhook/ for Stripe callback handling

Main Files

The main implementation files are:
- bill/models_stripe.py
- bill/views_stripe.py
- templates/bill/stripe_payment.html
- shop/settings.py
- shop/urls.py

Testing Reminder

Stripe test cards should be used during development. Webhook delivery should also be tested so that local payment state and refund state remain synchronized with Stripe.

Relationship To Other Documents

This file is a quick reference only. For detailed explanation, use PAYMENTS_MODULE_DOCUMENTATION.md, STRIPE_PAYMENT_INTEGRATION.md, and STRIPE_REFUND_API_DOCUMENTATION.md.
