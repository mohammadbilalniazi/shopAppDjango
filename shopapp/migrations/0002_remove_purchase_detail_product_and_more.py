# Generated by Django 4.1.1 on 2022-09-25 13:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('shopapp', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='purchase_detail',
            name='product',
        ),
        migrations.RemoveField(
            model_name='purchase_detail',
            name='purchase_bill',
        ),
        migrations.DeleteModel(
            name='Purchase_bill',
        ),
        migrations.DeleteModel(
            name='Purchase_detail',
        ),
    ]
