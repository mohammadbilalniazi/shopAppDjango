# Generated by Django 4.2 on 2025-03-04 11:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bill', '0019_bill_new_creator_alter_bill_creator_alter_bill_date'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='bill',
            name='creator',
        ),
    ]
