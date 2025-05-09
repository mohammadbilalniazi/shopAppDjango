# Generated by Django 4.2 on 2025-04-26 17:43

import bill.models
import common.date
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('configuration', '0003_organization_location_new_organization_parent_new_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('product', '0010_remove_service_media_service_and_more'),
        ('bill', '0012_alter_bill_detail_unique_together_alter_bill_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='bill',
            name='creator_new',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='bill_location_set', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='bill',
            name='organization_new',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='bill_organization_set', to='configuration.organization'),
        ),
        migrations.AddField(
            model_name='bill_description',
            name='shipment_location_new',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='bill_city_set', to='configuration.location'),
        ),
        migrations.AddField(
            model_name='bill_description',
            name='store_new',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='bill_description_set', to='product.store'),
        ),
        migrations.AlterField(
            model_name='bill',
            name='creator',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='bill_location_set1', to=settings.AUTH_USER_MODEL, to_field='username'),
        ),
        migrations.AlterField(
            model_name='bill',
            name='date',
            field=models.CharField(default=common.date.current_shamsi_date, max_length=10),
        ),
        migrations.AlterField(
            model_name='bill',
            name='organization',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.DO_NOTHING, related_name='bill_organization_set1', to='configuration.organization', to_field='name'),
        ),
        migrations.AlterField(
            model_name='bill',
            name='year',
            field=models.SmallIntegerField(default=bill.models.get_current_shamsi_date),
        ),
        migrations.AlterField(
            model_name='bill_description',
            name='currency',
            field=models.CharField(default='afn', max_length=7),
        ),
        migrations.AlterField(
            model_name='bill_description',
            name='shipment_location',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='bill_city_set1', to='configuration.location', to_field='city'),
        ),
        migrations.AlterField(
            model_name='bill_description',
            name='store',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='bill_description_set1', to='product.store', to_field='name'),
        ),
    ]
