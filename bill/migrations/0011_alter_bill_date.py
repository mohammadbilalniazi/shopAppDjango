# Generated by Django 4.1.1 on 2024-09-08 09:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bill', '0010_alter_bill_unique_together'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bill',
            name='date',
            field=models.CharField(default='1403-06-18', max_length=10),
        ),
    ]
