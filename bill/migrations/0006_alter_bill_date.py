# Generated by Django 4.1.1 on 2024-09-06 06:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bill', '0005_alter_bill_unique_together'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bill',
            name='date',
            field=models.CharField(default='1403-06-16', max_length=10),
        ),
    ]