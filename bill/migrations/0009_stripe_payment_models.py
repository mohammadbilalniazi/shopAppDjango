# Generated migration for Stripe Payment models

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('configuration', '0001_initial'),
        ('bill', '0008_bill_branch'),
    ]

    operations = [
        migrations.CreateModel(
            name='StripePayment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('stripe_payment_intent_id', models.CharField(help_text='Stripe Payment Intent ID', max_length=255, unique=True)),
                ('stripe_charge_id', models.CharField(blank=True, help_text='Stripe Charge ID (after payment succeeds)', max_length=255, null=True)),
                ('amount', models.DecimalField(decimal_places=2, help_text='Amount to be paid', max_digits=20)),
                ('currency', models.CharField(default='USD', help_text='Currency code (e.g., USD, EUR, AFG)', max_length=3)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('processing', 'Processing'), ('succeeded', 'Succeeded'), ('failed', 'Failed'), ('canceled', 'Canceled'), ('refunded', 'Refunded')], default='pending', help_text='Payment status', max_length=20)),
                ('card_brand', models.CharField(blank=True, help_text='Card brand (e.g., Visa, Mastercard)', max_length=20, null=True)),
                ('card_last4', models.CharField(blank=True, help_text='Last 4 digits of card', max_length=4, null=True)),
                ('description', models.TextField(blank=True, help_text='Payment description', null=True)),
                ('failure_message', models.TextField(blank=True, help_text='Failure reason if payment failed', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('paid_at', models.DateTimeField(blank=True, help_text='Timestamp when payment was completed', null=True)),
                ('refunded', models.BooleanField(default=False, help_text='Whether payment has been refunded')),
                ('refund_amount', models.DecimalField(decimal_places=2, default=0, help_text='Amount refunded', max_digits=20)),
                ('refund_reason', models.TextField(blank=True, help_text='Reason for refund', null=True)),
                ('bill', models.ForeignKey(help_text='Bill associated with this payment', on_delete=django.db.models.deletion.CASCADE, related_name='stripe_payments', to='bill.bill')),
                ('organization', models.ForeignKey(help_text='Organization making the payment', on_delete=django.db.models.deletion.PROTECT, to='configuration.organization')),
                ('user', models.ForeignKey(help_text='User who initiated the payment', on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Stripe Payment',
                'verbose_name_plural': 'Stripe Payments',
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['stripe_payment_intent_id'], name='bill_models_stripe__1e2d3a_idx'),
                    models.Index(fields=['status', 'created_at'], name='bill_models_status_4b5c6d_idx'),
                    models.Index(fields=['bill', 'status'], name='bill_models_bill_id_7e8f9a_idx'),
                ],
            },
        ),
        migrations.CreateModel(
            name='StripeWebhookEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_id', models.CharField(help_text='Stripe event ID', max_length=255, unique=True)),
                ('event_type', models.CharField(help_text='Event type (e.g., payment_intent.succeeded)', max_length=100)),
                ('payload', models.JSONField(help_text='Full webhook payload')),
                ('processed', models.BooleanField(default=False, help_text='Whether event has been processed')),
                ('processing_error', models.TextField(blank=True, help_text='Error message if processing failed', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('processed_at', models.DateTimeField(blank=True, help_text='When event was processed', null=True)),
                ('payment', models.ForeignKey(blank=True, help_text='Related payment if applicable', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='webhook_events', to='bill.stripepayment')),
            ],
            options={
                'verbose_name': 'Stripe Webhook Event',
                'verbose_name_plural': 'Stripe Webhook Events',
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['event_id'], name='bill_models_event_i_0a1b2c_idx'),
                    models.Index(fields=['event_type', 'processed'], name='bill_models_event_t_3d4e5f_idx'),
                    models.Index(fields=['created_at'], name='bill_models_created_6g7h8i_idx'),
                ],
            },
        ),
    ]
