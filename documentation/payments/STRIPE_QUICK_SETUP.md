Stripe Quick Setup Documentation

Purpose

This document provides a concise deployment-oriented setup guide for enabling Stripe in the project.

Prerequisites

Before enabling Stripe, the project should be running correctly, database migrations should be available, and a Stripe account should be created. The environment must also support secret configuration through environment variables.

Required Settings

The following values must be configured:
- STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_CURRENCY

Setup Procedure

First, obtain the publishable key and secret key from the Stripe dashboard. Second, place those values in the deployment environment or in a local .env file for development use. Third, run Django migrations so that StripePayment and StripeWebhookEvent tables exist. Fourth, verify that the payment page and API routes are available.

Webhook Setup

For local development, Stripe CLI may be used to forward webhook events to the local application. For deployment, a production webhook endpoint should be created in Stripe and configured to deliver at least payment_intent.succeeded, payment_intent.payment_failed, and charge.refunded events.

Verification

After configuration, the application should be tested with Stripe test cards. The payment page should load correctly, a payment intent should be created, a successful test payment should update the local bill state, and webhook events should appear in the local webhook log table.

Operational Note

This quick setup text is intended for deployment and verification. The full architectural explanation is documented in PAYMENTS_MODULE_DOCUMENTATION.md and STRIPE_PAYMENT_INTEGRATION.md.
