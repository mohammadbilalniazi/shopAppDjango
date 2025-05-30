# Generated by Django 4.1.1 on 2024-02-23 11:24

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('configuration', '0001_initial'),
        ('product', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Bill',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bill_no', models.IntegerField(default=None)),
                ('bill_type', models.CharField(default='PURCHASE', max_length=9)),
                ('total', models.DecimalField(decimal_places=5, default=0.0, max_digits=20)),
                ('payment', models.DecimalField(decimal_places=5, default=0.0, max_digits=20)),
                ('year', models.SmallIntegerField(default=1402)),
                ('date', models.DateField(null=True)),
                ('profit', models.IntegerField(default=0)),
                ('creator', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to=settings.AUTH_USER_MODEL, to_field='username')),
                ('organization', models.ForeignKey(default=None, on_delete=django.db.models.deletion.DO_NOTHING, to='configuration.organization', to_field='name')),
            ],
            options={
                'unique_together': {('organization', 'year', 'bill_no', 'bill_type')},
            },
        ),
        migrations.CreateModel(
            name='Bill_Receiver',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_approved', models.BooleanField(blank=True, default=False, null=True)),
                ('approval_date', models.DateField(blank=True, default='', null=True)),
                ('approval_user', models.ForeignKey(blank=True, default='', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to=settings.AUTH_USER_MODEL, to_field='username')),
                ('bill', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='bill.bill')),
                ('bill_rcvr_org', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='configuration.organization', to_field='name')),
                ('store', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='product.store', to_field='name')),
            ],
        ),
        migrations.CreateModel(
            name='Bill_Description',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.SmallIntegerField(choices=[(0, 'CANCELLED'), (1, 'CREATED')], default=0)),
                ('currency', models.CharField(default='afg', max_length=7)),
                ('bill', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='bill.bill')),
                ('shipment_location', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='configuration.location', to_field='city')),
                ('store', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='product.store', to_field='name')),
            ],
        ),
        migrations.CreateModel(
            name='Bill_detail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item_amount', models.IntegerField()),
                ('item_price', models.DecimalField(decimal_places=5, default=0.0, max_digits=15)),
                ('return_qty', models.IntegerField(blank=True, null=True)),
                ('discount', models.IntegerField(default=0)),
                ('profit', models.IntegerField(default=None, null=True)),
                ('bill', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='bill.bill')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='product.product')),
                ('unit', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='product.unit')),
            ],
            options={
                'verbose_name_plural': 'Bill detail',
                'unique_together': {('bill', 'product')},
            },
        ),
    ]
