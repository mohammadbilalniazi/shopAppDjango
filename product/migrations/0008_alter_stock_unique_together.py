"""Alter Stock unique_together to (organization, product)"""
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0007_alter_stock_branch_alter_stock_organization'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='stock',
            unique_together={('organization', 'product')},
        ),
    ]
