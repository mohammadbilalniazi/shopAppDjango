# Generated by Django 4.1.1 on 2024-03-08 18:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0007_alter_stock_store'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product_detail',
            name='current_amount',
        ),
        migrations.AlterField(
            model_name='store',
            name='name',
            field=models.CharField(max_length=50, unique=True),
        ),
    ]
