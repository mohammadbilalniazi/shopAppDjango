# Generated by Django 4.2 on 2025-03-08 02:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('configuration', '0004_delete_language_detail'),
        ('product', '0013_alter_service_unique_together_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Languages',
        ),
    ]
