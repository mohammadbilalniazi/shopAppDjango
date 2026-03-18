Payments Module Documentation

Purpose

This document provides a precise overview of the payment subsystem used in the supermarket electronic management system. It is intended as the main thesis appendix text for online payments, webhook processing, refunds, and payment auditability.

Scope

The payment subsystem is implemented mainly in:
- bill/models_stripe.py
- bill/views_stripe.py
- bill/views_bill_receive_payment.py
- shop/settings.py
- shop/urls.py

The subsystem supports two payment categories:
- manual payment and receivement logging
- Stripe card payment processing

Core Data Structures

StripePayment stores the bill reference, organization, initiating user, Stripe payment intent identifier, charge identifier, amount, currency, payment status, card summary fields, timestamps, and refund state. This model is the central operational record for card-based bill payments.

StripeWebhookEvent stores every relevant Stripe callback event. It preserves the Stripe event identifier, event type, related payment, raw payload, processing status, and processing error. This model supports troubleshooting and audit review.

TransactionLog stores both manual and Stripe-generated financial events. It unifies payment history by storing source, event type, status, amount, currency, reference identifier, message text, and additional metadata.

Main Endpoints

The main payment routes registered in shop/urls.py are:
- /bill/payment/<bill_id>/ for the payment page
- /bill/payment/create-intent/ for payment intent creation
- /bill/payment/status/<payment_id>/ for payment status retrieval
- /bill/payment/refund/<payment_id>/ for refund creation
- /bill/payment/history/<bill_id>/ for payment history retrieval
- /bill/payment/transaction-logs/ for transaction log retrieval
- /stripe/webhook/ for Stripe callback processing

Payment Creation Flow

The payment flow begins when the user opens the payment page for a bill. The backend validates that the current user is authorized to access the organization that owns the bill. The create_payment_intent function then computes the payable amount, converts it into the smallest currency unit expected by Stripe, and creates a Stripe payment intent. After this, the system stores a local StripePayment row and writes a transaction log entry.

Webhook Processing Flow

After Stripe completes payment processing, Stripe sends a signed webhook request to the application. The stripe_webhook view verifies the Stripe signature using the configured webhook secret. Once verified, the event is recorded in StripeWebhookEvent and then routed to one of the internal handlers for payment success, payment failure, or refund synchronization.

On success, the handler updates StripePayment status, stores charge identifiers and card summary data when available, increases the bill payment amount, and records a success event in TransactionLog.

Refund Processing Flow

Refunds are initiated through refund_payment. The function validates that the payment exists, belongs to an organization the user may access, and is in a successful state. It also validates that the requested refund amount does not exceed the refundable balance. The function then creates a Stripe refund and immediately synchronizes the local bill and payment records.

An important design feature is idempotent refund synchronization. The system calculates the difference between the latest Stripe-refunded amount and the previously stored local refund amount. Only that delta is subtracted from the bill payment total. This prevents double subtraction when Stripe retries webhook delivery.

Security Model

The payment subsystem depends on several security controls:
- authenticated access to user-facing payment endpoints
- organization-based authorization checks before payment, refund, and payment-history access
- Stripe webhook signature verification for external callbacks
- audit logging through StripeWebhookEvent and TransactionLog
- database transactions around sensitive mutation flows

Relationship To Billing

The payment subsystem is not isolated from billing. Each StripePayment points to a Bill, and successful payments increase bill.payment. Refunds decrease bill.payment by the refund delta. This means the payment layer is tightly integrated with the bill and financial summary design of the system.

Thesis Relevance

This module is useful in thesis discussion for several reasons. It demonstrates integration of an external payment gateway into a multi-organization business system. It also shows the use of webhook verification, audit logging, partial refund support, and idempotent update logic. These features make it a strong example of secure transactional integration in a Django-based application.
