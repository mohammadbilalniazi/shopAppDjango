# Generated by Django 4.2 on 2025-03-01 02:07

import bill.models
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('configuration', '0002_currency'),
        ('product', '0009_stock_purchasing_amount_stock_selling_amount'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('bill', '0015_remove_bill_organization_new_alter_bill_date_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='bill_description',
            name='store_new',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='new_store', to='product.store'),
        ),
        migrations.AlterField(
            model_name='bill',
            name='bill_no',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='bill',
            name='creator',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL, to_field='username'),
        ),
        migrations.AlterField(
            model_name='bill',
            name='organization',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='configuration.organization'),
        ),
        migrations.AlterField(
            model_name='bill',
            name='year',
            field=models.SmallIntegerField(default=bill.models.get_year),
        ),
        migrations.AlterField(
            model_name='bill_description',
            name='shipment_location',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.PROTECT, to='configuration.location'),
        ),
        migrations.AlterField(
            model_name='bill_description',
            name='store',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='old_store', to='product.store', to_field='name'),
        ),
        migrations.AlterField(
            model_name='bill_detail',
            name='product',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='product.product'),
        ),
        migrations.AlterField(
            model_name='bill_detail',
            name='unit',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='product.unit'),
        ),
        migrations.AlterField(
            model_name='bill_receiver2',
            name='approval_user',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='bill_receiver2',
            name='bill_rcvr_org',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='configuration.organization'),
        ),
        migrations.AlterField(
            model_name='bill_receiver2',
            name='store',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='product.store'),
        ),
    ]
