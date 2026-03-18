Stripe Activation Checklist

Purpose

This document provides a concise activation checklist for enabling and validating Stripe payment support.

Activation Checklist

1. Create or verify the Stripe account.
2. Obtain publishable, secret, and webhook secret values.
3. Add Stripe configuration values to the deployment environment.
4. Confirm that the Django project loads the Stripe settings correctly.
5. Run database migrations for the bill application.
6. Verify that the payment routes are registered and reachable.
7. Open a valid bill payment page and confirm that it renders correctly.
8. Execute a successful test payment with a Stripe test card.
9. Verify that StripePayment and TransactionLog rows are created.
10. Configure webhook forwarding or a deployed webhook endpoint.
11. Verify that webhook events are stored in StripeWebhookEvent.
12. Test refund behavior and verify that bill payment totals update correctly.
13. Review security settings before production use, especially secret management and HTTPS deployment.

Production Readiness Check

Before production activation, the deployment should use environment-based secrets, HTTPS transport, a verified production webhook endpoint, and live Stripe keys. The operator should also confirm that failed payments and refunds can be monitored from the administrative interface.
