# Generated by Django 4.2 on 2025-03-06 02:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('configuration', '0003_customuser_customuser_valid_user_type_and_more'),
        ('product', '0009_stock_purchasing_amount_stock_selling_amount'),
    ]

    operations = [
        migrations.AddField(
            model_name='product_detail',
            name='product_new_organization',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='product_organization', to='configuration.organization'),
        ),
        migrations.AddField(
            model_name='product_detail',
            name='unit',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='product.unit'),
        ),
        migrations.AlterField(
            model_name='product_detail',
            name='organization',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='old_product_organization', to='configuration.organization', to_field='name'),
        ),
    ]
