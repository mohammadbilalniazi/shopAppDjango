# Generated by Django 4.2 on 2025-03-06 02:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bill', '0021_rename_new_creator_bill_creator'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bill',
            name='date',
            field=models.CharField(default='1403-12-16', max_length=10),
        ),
    ]
