# Generated by Django 4.1.1 on 2024-03-08 12:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0006_stock_product_alter_stock_store_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stock',
            name='store',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='product.store'),
        ),
    ]
