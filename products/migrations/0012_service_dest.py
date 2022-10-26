# Generated by Django 4.1.1 on 2022-10-21 18:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('configuration', '0009_alter_language_detail_unique_together'),
        ('products', '0011_alter_service_media_file_alter_subservice_media_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='service',
            name='dest',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='configuration.languages'),
        ),
    ]
