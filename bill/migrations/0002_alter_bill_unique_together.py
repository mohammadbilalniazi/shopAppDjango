# Generated by Django 4.1.1 on 2024-02-25 13:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('configuration', '0001_initial'),
        ('bill', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='bill',
            unique_together={('organization', 'year', 'bill_no')},
        ),
    ]
