Stripe Refund API Documentation

Overview
This document explains how to use the Stripe refund endpoint implemented in this project.

The refund flow supports:
- Full refund (default when amount is not provided)
- Partial refund (when amount is provided)
- Organization-based authorization checks
- Transaction logging for audit
- Idempotent local balance updates when webhooks are retried

Endpoint
- Method: POST
- URL: /bill/payment/refund/<payment_id>/
- Route name: stripe_refund_payment
- View function: refund_payment in bill/views_stripe.py
- URL registration: shop/urls.py

Authentication and Authorization
The endpoint requires an authenticated user.

Access rules:
- Superuser: allowed
- Non-superuser: allowed only if the payment organization is accessible to the user
- Unauthorized access returns HTTP 403 with message: Access denied

Path Parameter
- payment_id: integer ID of the StripePayment record to refund

Request Body
All fields are optional.

- amount
  - Type: decimal string or number
  - Meaning: amount to refund
  - If omitted, the system refunds the full remaining refundable amount
- reason
  - Type: string
  - Meaning: optional human-readable reason saved for audit

Example body for partial refund:
{
  "amount": "25.50",
  "reason": "Customer returned damaged item"
}

Example body for full refund:
{}

Validation Rules
The API rejects the request if any of the following is true:
- Payment status is not succeeded
- Payment has no stripe_charge_id yet
- Payment is already fully refunded
- Provided amount is invalid or not numeric
- Provided amount is less than or equal to zero
- Provided amount is greater than the refundable balance

Refund Processing Logic
1. Load StripePayment by payment_id.
2. Verify user authorization for organization access.
3. Compute refundable balance as:
   refundable = payment.amount - payment.refund_amount
4. Validate and normalize refund amount.
5. Create Stripe refund using stripe.Refund.create.
6. Retrieve Stripe charge and sync local records through handle_payment_refund.
7. Optionally store user-provided reason in refund_reason.
8. Write transaction log entry for refund request.

Idempotency and Webhook Safety
The project uses delta-based refund sync in handle_payment_refund:
- new_refund_amount = charge.amount_refunded / 100
- refund_delta = new_refund_amount - previous_refund_amount
- Bill payment balance is reduced only by refund_delta

This prevents double subtraction if Stripe sends duplicate charge.refunded webhook events.

Success Response
HTTP 200

{
  "ok": true,
  "message": "Refund processed successfully",
  "refund_id": "re_...",
  "payment_id": 123,
  "refund_amount": 25.5,
  "currency": "USD"
}

Error Responses
HTTP 400 examples:
- Only successful payments can be refunded
- No Stripe charge found for this payment yet
- This payment has already been fully refunded
- Invalid refund amount
- Refund amount must be greater than zero
- Refund amount exceeds refundable balance (...)
- Stripe error: ...

HTTP 403:
- Access denied

HTTP 500:
- Error processing refund: ...

Related Endpoints
- Create payment intent: POST /bill/payment/create-intent/
- Payment status: GET /bill/payment/status/<payment_id>/
- Bill payment history: GET /bill/payment/history/<bill_id>/
- Transaction logs: GET /bill/payment/transaction-logs/
- Stripe webhook: POST /stripe/webhook/

cURL Examples
Refund full amount:
curl -X POST "http://localhost:8000/bill/payment/refund/123/" \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: <csrftoken>" \
  -b "csrftoken=<csrftoken>; sessionid=<sessionid>" \
  -d "{}"

Refund partial amount:
curl -X POST "http://localhost:8000/bill/payment/refund/123/" \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: <csrftoken>" \
  -b "csrftoken=<csrftoken>; sessionid=<sessionid>" \
  -d "{\"amount\": \"25.50\", \"reason\": \"Customer return\"}"

Notes
- Stripe reason sent to Stripe API is requested_by_customer.
- Custom reason text is stored in local metadata and refund_reason.
- Payment status and history responses include refund fields:
  - refunded
  - refund_amount
  - refund_reason
