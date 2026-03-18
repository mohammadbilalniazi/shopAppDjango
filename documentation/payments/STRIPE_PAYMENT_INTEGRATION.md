Stripe Payment Integration Documentation

Purpose

This document explains the technical design of the Stripe payment gateway integration used in the project. It focuses on architecture, payment flow, webhook processing, and integration with the bill subsystem.

Implementation Scope

Stripe support is implemented primarily through bill/models_stripe.py, bill/views_stripe.py, templates/bill/stripe_payment.html, shop/settings.py, and shop/urls.py. The design adds card payment support to the bill system without replacing existing manual payment workflows.

Architecture

The integration uses Stripe Payment Intents for payment creation. The backend creates a payment intent after validating that the current user may access the bill organization. A local StripePayment row is then stored so the system can track the transaction independently of Stripe. This local record is important because it enables payment history, audit logs, refund tracking, and financial reconciliation.

Webhook Integration

After a payment attempt, Stripe sends signed webhook events to the application. The stripe_webhook function verifies the request signature and then records the incoming event in StripeWebhookEvent. Depending on the event type, the system updates local payment status, logs failures, or synchronizes refund information. This design supports eventual consistency between Stripe and the local database.

Security Design

The payment subsystem is designed so that card details do not pass through or remain stored on the application server. Stripe handles the sensitive card workflow, while the application stores only operational metadata such as payment identifiers, amount, status, card brand, and the last four digits of the card. In addition, the webhook endpoint validates Stripe signatures and user-facing payment endpoints enforce organization-based authorization.

Supported Behaviors

The current integration supports full bill payment, partial payment, payment history retrieval, payment status retrieval, webhook-driven status updates, transaction logging, and refund processing. Refunds may be full or partial, depending on the remaining refundable balance.

Relationship To Billing

The integration is tightly coupled with the Bill model. A successful Stripe payment increases bill.payment, while a refund decreases bill.payment by the refund delta. This means the payment gateway is not just a detached service; it directly influences the accounting state of the bill module.

Thesis Value

This integration is useful in a thesis because it shows how an external payment platform can be incorporated into a domain-specific accounting system. It demonstrates practical concerns such as authorization, audit logging, webhook verification, and idempotent refund processing.
