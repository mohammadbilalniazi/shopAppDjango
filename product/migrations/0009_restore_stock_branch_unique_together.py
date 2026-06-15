from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0008_alter_stock_unique_together'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='stock',
            unique_together={('organization', 'product', 'branch')},
        ),
    ]
