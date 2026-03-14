"""
Stripe Payment Integration Views
Handles payment processing, webhooks, and payment management
"""
import stripe
import json
from decimal import Decimal
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, render
from django.db import transaction
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Bill
from .models_stripe import StripePayment, StripeWebhookEvent, TransactionLog
from common.organization import find_userorganization
from configuration.models import Organization

# Initialize Stripe with your secret key
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')


def _create_transaction_log(
    bill,
    organization,
    user,
    source,
    event_type,
    status_value,
    amount=Decimal('0'),
    currency='USD',
    reference_id=None,
    message='',
    metadata=None,
):
    """
    Best-effort transaction logging helper that never blocks payment flow.
    """
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


@login_required
@api_view(['POST'])
def create_payment_intent(request):
    """
    Create a Stripe Payment Intent for a bill
    
    Expected POST data:
    - bill_id: ID of the bill to pay
    - amount: Amount to pay (optional, defaults to bill amount)
    - currency: Currency code (optional, defaults to USD)
    """
    bill = None
    payment_amount = Decimal('0')
    currency = 'USD'

    try:
        bill_id = request.data.get('bill_id')
        amount = request.data.get('amount')
        currency = request.data.get('currency', 'USD').upper()
        
        if not bill_id:
            return Response({
                'ok': False,
                'message': 'Bill ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the bill
        bill = get_object_or_404(Bill, id=bill_id)
        
        # Verify user has access to this bill's organization
        self_organization, user_orgs = find_userorganization(request)
        
        if not request.user.is_superuser:
            if self_organization:
                if bill.organization != self_organization:
                    return Response({
                        'ok': False,
                        'message': 'You do not have permission to pay this bill'
                    }, status=status.HTTP_403_FORBIDDEN)
            elif user_orgs:
                if bill.organization not in user_orgs:
                    return Response({
                        'ok': False,
                        'message': 'You do not have permission to pay this bill'
                    }, status=status.HTTP_403_FORBIDDEN)
        
        # Calculate amount to pay
        if amount:
            payment_amount = Decimal(str(amount))
        else:
            # Calculate remaining amount to be paid
            remaining = bill.total - bill.payment
            if remaining <= 0:
                return Response({
                    'ok': False,
                    'message': 'This bill has already been fully paid'
                }, status=status.HTTP_400_BAD_REQUEST)
            payment_amount = remaining
        
        # Stripe requires amount in cents (smallest currency unit)
        stripe_amount = int(payment_amount * 100)
        
        # Create Payment Intent
        payment_intent = stripe.PaymentIntent.create(
            amount=stripe_amount,
            currency=currency.lower(),
            metadata={
                'bill_id': bill.id,
                'bill_no': bill.bill_no,
                'bill_type': bill.bill_type,
                'organization_id': bill.organization.id,
                'organization_name': bill.organization.name,
                'user_id': request.user.id,
                'username': request.user.username,
            },
            description=f'Payment for Bill #{bill.bill_no} - {bill.bill_type}',
        )
        
        # Create StripePayment record
        stripe_payment = StripePayment.objects.create(
            bill=bill,
            organization=bill.organization,
            user=request.user,
            stripe_payment_intent_id=payment_intent.id,
            amount=payment_amount,
            currency=currency,
            status='pending',
            description=f'Payment for Bill #{bill.bill_no}'
        )

        _create_transaction_log(
            bill=bill,
            organization=bill.organization,
            user=request.user,
            source='stripe',
            event_type='payment_intent_created',
            status_value='pending',
            amount=payment_amount,
            currency=currency,
            reference_id=payment_intent.id,
            message=f'Created Stripe payment intent for Bill #{bill.bill_no}',
            metadata={
                'stripe_payment_id': stripe_payment.id,
                'bill_no': bill.bill_no,
                'bill_type': bill.bill_type,
            },
        )
        
        return Response({
            'ok': True,
            'message': 'Payment intent created successfully',
            'client_secret': payment_intent.client_secret,
            'payment_intent_id': payment_intent.id,
            'stripe_payment_id': stripe_payment.id,
            'amount': float(payment_amount),
            'currency': currency,
            'publishable_key': getattr(settings, 'STRIPE_PUBLISHABLE_KEY', '')
        }, status=status.HTTP_200_OK)
        
    except stripe.error.StripeError as e:
        if bill is not None:
            _create_transaction_log(
                bill=bill,
                organization=bill.organization,
                user=request.user,
                source='stripe',
                event_type='payment_intent_create_failed',
                status_value='failed',
                amount=payment_amount,
                currency=currency,
                message=f'Stripe error: {str(e)}',
                metadata={'bill_id': bill.id},
            )
        return Response({
            'ok': False,
            'message': f'Stripe error: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        if bill is not None:
            _create_transaction_log(
                bill=bill,
                organization=bill.organization,
                user=request.user,
                source='stripe',
                event_type='payment_intent_create_error',
                status_value='failed',
                amount=payment_amount,
                currency=currency,
                message=f'Unhandled error: {str(e)}',
                metadata={'bill_id': bill.id},
            )
        return Response({
            'ok': False,
            'message': f'Error creating payment intent: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    """
    Handle Stripe webhook events
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        # Invalid payload
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        # Invalid signature
        return HttpResponse(status=400)
    
    webhook_event = None

    # Log the webhook event
    try:
        webhook_event = StripeWebhookEvent.objects.create(
            event_id=event['id'],
            event_type=event['type'],
            payload=event
        )
    except Exception as e:
        print(f"Error logging webhook event: {e}")
    
    # Handle the event
    try:
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            handle_payment_success(payment_intent, webhook_event)
        
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            handle_payment_failure(payment_intent, webhook_event)
        
        elif event['type'] == 'charge.refunded':
            charge = event['data']['object']
            handle_payment_refund(charge, webhook_event)
        
        # Mark webhook as processed
        if webhook_event:
            webhook_event.processed = True
            webhook_event.processed_at = timezone.now()
            webhook_event.save()
    
    except Exception as e:
        print(f"Error processing webhook: {e}")
        if webhook_event:
            webhook_event.processing_error = str(e)
            webhook_event.save()
    
    return HttpResponse(status=200)


@transaction.atomic
def handle_payment_success(payment_intent, webhook_event=None):
    """
    Handle successful payment
    """
    payment_intent_id = payment_intent['id']
    
    try:
        # Get the StripePayment record
        stripe_payment = StripePayment.objects.get(
            stripe_payment_intent_id=payment_intent_id
        )
        
        # Update stripe payment status
        stripe_payment.status = 'succeeded'
        stripe_payment.paid_at = timezone.now()
        stripe_payment.stripe_charge_id = payment_intent.get('latest_charge')
        
        # Extract card details if available
        if payment_intent.get('charges') and payment_intent['charges'].get('data'):
            charge = payment_intent['charges']['data'][0]
            payment_method = charge.get('payment_method_details', {})
            card = payment_method.get('card', {})
            stripe_payment.card_brand = card.get('brand', '').capitalize()
            stripe_payment.card_last4 = card.get('last4')
        
        stripe_payment.save()
        
        # Update the bill payment amount
        bill = stripe_payment.bill
        bill.payment = Decimal(bill.payment) + stripe_payment.amount
        bill.save()

        _create_transaction_log(
            bill=bill,
            organization=bill.organization,
            user=stripe_payment.user,
            source='stripe',
            event_type='payment_succeeded',
            status_value='succeeded',
            amount=stripe_payment.amount,
            currency=stripe_payment.currency,
            reference_id=stripe_payment.stripe_charge_id or payment_intent_id,
            message=f'Payment succeeded for Bill #{bill.bill_no}',
            metadata={
                'payment_intent_id': payment_intent_id,
                'stripe_payment_id': stripe_payment.id,
            },
        )
        
        # Link webhook event to payment
        if webhook_event:
            webhook_event.payment = stripe_payment
            webhook_event.save()
        
        print(f"Payment successful: {payment_intent_id} for Bill #{bill.bill_no}")
        
    except StripePayment.DoesNotExist:
        print(f"StripePayment not found for payment_intent: {payment_intent_id}")
    except Exception as e:
        print(f"Error handling payment success: {e}")
        raise


def handle_payment_failure(payment_intent, webhook_event=None):
    """
    Handle failed payment
    """
    payment_intent_id = payment_intent['id']
    
    try:
        stripe_payment = StripePayment.objects.get(
            stripe_payment_intent_id=payment_intent_id
        )
        
        stripe_payment.status = 'failed'
        stripe_payment.failure_message = payment_intent.get('last_payment_error', {}).get('message', 'Payment failed')
        stripe_payment.save()

        _create_transaction_log(
            bill=stripe_payment.bill,
            organization=stripe_payment.organization,
            user=stripe_payment.user,
            source='stripe',
            event_type='payment_failed',
            status_value='failed',
            amount=stripe_payment.amount,
            currency=stripe_payment.currency,
            reference_id=payment_intent_id,
            message=stripe_payment.failure_message or 'Stripe payment failed',
            metadata={'stripe_payment_id': stripe_payment.id},
        )
        
        if webhook_event:
            webhook_event.payment = stripe_payment
            webhook_event.save()
        
        print(f"Payment failed: {payment_intent_id}")
        
    except StripePayment.DoesNotExist:
        print(f"StripePayment not found for payment_intent: {payment_intent_id}")
    except Exception as e:
        print(f"Error handling payment failure: {e}")


def handle_payment_refund(charge, webhook_event=None):
    """
    Handle payment refund
    """
    charge_id = charge['id']
    
    try:
        stripe_payment = StripePayment.objects.get(stripe_charge_id=charge_id)
        
        new_refund_amount = Decimal(charge.get('amount_refunded', 0)) / 100
        previous_refund_amount = Decimal(stripe_payment.refund_amount or 0)
        refund_delta = new_refund_amount - previous_refund_amount

        # Avoid double counting when webhook is retried.
        if refund_delta < 0:
            refund_delta = Decimal('0')

        stripe_payment.status = 'refunded' if new_refund_amount > 0 else stripe_payment.status
        stripe_payment.refunded = new_refund_amount > 0
        stripe_payment.refund_amount = new_refund_amount
        stripe_payment.save()

        # Update bill payment only for the newly refunded delta.
        bill = stripe_payment.bill
        if refund_delta > 0:
            updated_payment = Decimal(bill.payment) - refund_delta
            bill.payment = updated_payment if updated_payment > 0 else Decimal('0')
            bill.save()

            _create_transaction_log(
                bill=bill,
                organization=stripe_payment.organization,
                user=stripe_payment.user,
                source='stripe',
                event_type='payment_refunded',
                status_value='refunded',
                amount=refund_delta,
                currency=stripe_payment.currency,
                reference_id=charge_id,
                message=f'Payment refunded for Bill #{bill.bill_no}',
                metadata={
                    'stripe_payment_id': stripe_payment.id,
                    'total_refunded': float(new_refund_amount),
                },
            )
        
        if webhook_event:
            webhook_event.payment = stripe_payment
            webhook_event.save()
        
        print(f"Payment refunded: {charge_id}")
        
    except StripePayment.DoesNotExist:
        print(f"StripePayment not found for charge: {charge_id}")
    except Exception as e:
        print(f"Error handling refund: {e}")


@login_required
@api_view(['POST'])
@transaction.atomic
def refund_payment(request, payment_id):
    """
    Create a Stripe refund for a successful payment.

    Optional POST data:
    - amount: refund amount (defaults to maximum refundable)
    - reason: free-text reason stored locally
    """
    try:
        stripe_payment = get_object_or_404(StripePayment, id=payment_id)

        # Verify user has access
        self_organization, user_orgs = find_userorganization(request)

        if not request.user.is_superuser:
            if self_organization:
                if stripe_payment.organization != self_organization:
                    return Response({
                        'ok': False,
                        'message': 'Access denied'
                    }, status=status.HTTP_403_FORBIDDEN)
            elif user_orgs:
                if stripe_payment.organization not in user_orgs:
                    return Response({
                        'ok': False,
                        'message': 'Access denied'
                    }, status=status.HTTP_403_FORBIDDEN)

        if stripe_payment.status != 'succeeded':
            return Response({
                'ok': False,
                'message': 'Only successful payments can be refunded'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not stripe_payment.stripe_charge_id:
            return Response({
                'ok': False,
                'message': 'No Stripe charge found for this payment yet'
            }, status=status.HTTP_400_BAD_REQUEST)

        already_refunded = Decimal(stripe_payment.refund_amount or 0)
        max_refundable = Decimal(stripe_payment.amount) - already_refunded
        if max_refundable <= 0:
            return Response({
                'ok': False,
                'message': 'This payment has already been fully refunded'
            }, status=status.HTTP_400_BAD_REQUEST)

        amount_raw = request.data.get('amount')
        reason_text = (request.data.get('reason') or '').strip()

        if amount_raw not in (None, ''):
            try:
                refund_amount = Decimal(str(amount_raw))
            except Exception:
                return Response({
                    'ok': False,
                    'message': 'Invalid refund amount'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            refund_amount = max_refundable

        if refund_amount <= 0:
            return Response({
                'ok': False,
                'message': 'Refund amount must be greater than zero'
            }, status=status.HTTP_400_BAD_REQUEST)

        if refund_amount > max_refundable:
            return Response({
                'ok': False,
                'message': f'Refund amount exceeds refundable balance ({max_refundable})'
            }, status=status.HTTP_400_BAD_REQUEST)

        refund_kwargs = {
            'charge': stripe_payment.stripe_charge_id,
            'reason': 'requested_by_customer',
            'metadata': {
                'shop_payment_id': str(stripe_payment.id),
                'bill_id': str(stripe_payment.bill_id),
                'requested_by': str(request.user.id),
            },
        }
        if reason_text:
            refund_kwargs['metadata']['note'] = reason_text

        full_refund = refund_amount == max_refundable
        if not full_refund:
            refund_kwargs['amount'] = int(refund_amount * 100)

        refund = stripe.Refund.create(**refund_kwargs)

        # Sync local records immediately; webhook retries stay safe via delta logic.
        charge = stripe.Charge.retrieve(stripe_payment.stripe_charge_id)
        handle_payment_refund(charge)

        # Store user-provided reason for auditability.
        if reason_text:
            stripe_payment.refresh_from_db()
            stripe_payment.refund_reason = reason_text
            stripe_payment.save(update_fields=['refund_reason', 'updated_at'])

        _create_transaction_log(
            bill=stripe_payment.bill,
            organization=stripe_payment.organization,
            user=request.user,
            source='stripe',
            event_type='refund_requested',
            status_value='succeeded',
            amount=refund_amount,
            currency=stripe_payment.currency,
            reference_id=refund.id,
            message=f'Refund requested for payment {stripe_payment.id}',
            metadata={
                'stripe_charge_id': stripe_payment.stripe_charge_id,
                'full_refund': full_refund,
                'reason': reason_text,
            },
        )

        return Response({
            'ok': True,
            'message': 'Refund processed successfully',
            'refund_id': refund.id,
            'payment_id': stripe_payment.id,
            'refund_amount': float(refund_amount),
            'currency': stripe_payment.currency,
        }, status=status.HTTP_200_OK)

    except stripe.error.StripeError as e:
        return Response({
            'ok': False,
            'message': f'Stripe error: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'ok': False,
            'message': f'Error processing refund: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@login_required
@api_view(['GET'])
def get_transaction_logs(request):
    """
    Return transaction log entries with organization-based access control.
    """
    try:
        bill_id = request.query_params.get('bill_id')
        source = request.query_params.get('source')
        status_filter = request.query_params.get('status')
        limit_param = request.query_params.get('limit', '100')

        try:
            limit = int(limit_param)
        except (TypeError, ValueError):
            limit = 100

        limit = max(1, min(limit, 500))

        logs = TransactionLog.objects.select_related(
            'bill', 'organization', 'user'
        ).order_by('-created_at')

        self_organization, user_orgs = find_userorganization(request)

        if not request.user.is_superuser:
            if self_organization:
                logs = logs.filter(organization=self_organization)
            elif user_orgs:
                logs = logs.filter(organization__in=user_orgs)
            else:
                logs = logs.none()

        if bill_id:
            logs = logs.filter(bill_id=bill_id)

        if source:
            logs = logs.filter(source=source.lower())

        if status_filter:
            logs = logs.filter(status=status_filter.lower())

        logs = logs[:limit]

        logs_data = []
        for log in logs:
            logs_data.append({
                'id': log.id,
                'bill_id': log.bill_id,
                'bill_no': log.bill.bill_no,
                'organization_id': log.organization_id,
                'organization_name': log.organization.name,
                'user_id': log.user_id,
                'username': log.user.username if log.user else None,
                'source': log.source,
                'event_type': log.event_type,
                'status': log.status,
                'amount': float(log.amount),
                'currency': log.currency,
                'reference_id': log.reference_id,
                'message': log.message,
                'metadata': log.metadata,
                'created_at': log.created_at.isoformat(),
            })

        return Response({
            'ok': True,
            'count': len(logs_data),
            'logs': logs_data,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'ok': False,
            'message': str(e),
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@login_required
@api_view(['GET'])
def get_payment_status(request, payment_id):
    """
    Get status of a Stripe payment
    """
    try:
        stripe_payment = get_object_or_404(StripePayment, id=payment_id)
        
        # Verify user has access
        self_organization, user_orgs = find_userorganization(request)
        
        if not request.user.is_superuser:
            if self_organization:
                if stripe_payment.organization != self_organization:
                    return Response({
                        'ok': False,
                        'message': 'Access denied'
                    }, status=status.HTTP_403_FORBIDDEN)
            elif user_orgs:
                if stripe_payment.organization not in user_orgs:
                    return Response({
                        'ok': False,
                        'message': 'Access denied'
                    }, status=status.HTTP_403_FORBIDDEN)
        
        return Response({
            'ok': True,
            'payment': {
                'id': stripe_payment.id,
                'bill_id': stripe_payment.bill.id,
                'bill_no': stripe_payment.bill.bill_no,
                'amount': float(stripe_payment.amount),
                'currency': stripe_payment.currency,
                'status': stripe_payment.status,
                'card_brand': stripe_payment.card_brand,
                'card_last4': stripe_payment.card_last4,
                'paid_at': stripe_payment.paid_at.isoformat() if stripe_payment.paid_at else None,
                'failure_message': stripe_payment.failure_message,
                'refunded': stripe_payment.refunded,
                'refund_amount': float(stripe_payment.refund_amount),
                'refund_reason': stripe_payment.refund_reason,
            }
        })
        
    except Exception as e:
        return Response({
            'ok': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@login_required
@api_view(['GET'])
def get_bill_payments(request, bill_id):
    """
    Get all Stripe payments for a bill
    """
    try:
        bill = get_object_or_404(Bill, id=bill_id)
        
        # Verify user has access
        self_organization, user_orgs = find_userorganization(request)
        
        if not request.user.is_superuser:
            if self_organization:
                if bill.organization != self_organization:
                    return Response({
                        'ok': False,
                        'message': 'Access denied'
                    }, status=status.HTTP_403_FORBIDDEN)
            elif user_orgs:
                if bill.organization not in user_orgs:
                    return Response({
                        'ok': False,
                        'message': 'Access denied'
                    }, status=status.HTTP_403_FORBIDDEN)
        
        payments = bill.stripe_payments.all().order_by('-created_at')
        
        payments_data = []
        for payment in payments:
            payments_data.append({
                'id': payment.id,
                'amount': float(payment.amount),
                'currency': payment.currency,
                'status': payment.status,
                'card_brand': payment.card_brand,
                'card_last4': payment.card_last4,
                'paid_at': payment.paid_at.isoformat() if payment.paid_at else None,
                'created_at': payment.created_at.isoformat(),
                'refunded': payment.refunded,
                'refund_amount': float(payment.refund_amount),
                'refund_reason': payment.refund_reason,
            })
        
        return Response({
            'ok': True,
            'bill_id': bill.id,
            'bill_no': bill.bill_no,
            'total': float(bill.total),
            'paid': float(bill.payment),
            'remaining': float(bill.total - bill.payment),
            'payments': payments_data
        })
        
    except Exception as e:
        return Response({
            'ok': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@login_required
def payment_page(request, bill_id):
    """
    Render the payment page for a bill
    """
    bill = get_object_or_404(Bill, id=bill_id)
    
    # Verify user has access
    self_organization, user_orgs = find_userorganization(request)
    
    if not request.user.is_superuser:
        if self_organization:
            if bill.organization != self_organization:
                from django.contrib import messages
                messages.error(request, 'Access denied')
                from django.shortcuts import redirect
                return redirect('/admin/bill/bill/')
        elif user_orgs:
            if bill.organization not in user_orgs:
                from django.contrib import messages
                messages.error(request, 'Access denied')
                from django.shortcuts import redirect
                return redirect('/admin/bill/bill/')
    
    remaining = bill.total - bill.payment
    
    context = {
        'bill': bill,
        'remaining_amount': remaining,
        'stripe_publishable_key': getattr(settings, 'STRIPE_PUBLISHABLE_KEY', ''),
    }
    
    return render(request, 'bill/stripe_payment.html', context)
