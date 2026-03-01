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
from .models_stripe import StripePayment, StripeWebhookEvent
from common.organization import find_userorganization
from configuration.models import Organization

# Initialize Stripe with your secret key
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')


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
        return Response({
            'ok': False,
            'message': f'Stripe error: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
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
        
        stripe_payment.status = 'refunded'
        stripe_payment.refunded = True
        stripe_payment.refund_amount = Decimal(charge['amount_refunded']) / 100
        stripe_payment.save()
        
        # Update bill payment (subtract refunded amount)
        bill = stripe_payment.bill
        bill.payment = Decimal(bill.payment) - stripe_payment.refund_amount
        bill.save()
        
        if webhook_event:
            webhook_event.payment = stripe_payment
            webhook_event.save()
        
        print(f"Payment refunded: {charge_id}")
        
    except StripePayment.DoesNotExist:
        print(f"StripePayment not found for charge: {charge_id}")
    except Exception as e:
        print(f"Error handling refund: {e}")


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
