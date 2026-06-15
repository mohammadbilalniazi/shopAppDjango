import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0009_restore_stock_branch_unique_together'),
    ]

    operations = [
        migrations.AddField(
            model_name='stock',
            name='updated_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='stock',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
