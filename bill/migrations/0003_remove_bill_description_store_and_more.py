# Generated by Django 4.2 on 2025-06-17 09:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bill', '0002_alter_bill_date'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='bill_description',
            name='store',
        ),
        migrations.RemoveField(
            model_name='bill_receiver2',
            name='store',
        ),
    ]
