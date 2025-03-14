# Generated by Django 4.2 on 2025-03-08 02:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('configuration', '0004_delete_language_detail'),
        ('product', '0012_rename_product_detail_product_new_organization_and_more'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='service',
            unique_together=None,
        ),
        migrations.RemoveField(
            model_name='service',
            name='category',
        ),
        migrations.RemoveField(
            model_name='service',
            name='dest',
        ),
        migrations.RemoveField(
            model_name='service',
            name='organization',
        ),
        migrations.RemoveField(
            model_name='service_media',
            name='service',
        ),
        migrations.RemoveField(
            model_name='service_media',
            name='uploader',
        ),
        migrations.AlterUniqueTogether(
            name='subservice',
            unique_together=None,
        ),
        migrations.RemoveField(
            model_name='subservice',
            name='dest',
        ),
        migrations.RemoveField(
            model_name='subservice',
            name='service',
        ),
        migrations.RemoveField(
            model_name='subservice_media',
            name='service',
        ),
        migrations.RemoveField(
            model_name='subservice_media',
            name='uploader',
        ),
        migrations.RenameField(
            model_name='product',
            old_name='is_active',
            new_name='is_service',
        ),
        migrations.AddField(
            model_name='product',
            name='serial_no',
            field=models.CharField(blank=True, max_length=25, null=True),
        ),
        migrations.AlterField(
            model_name='product_detail',
            name='organization',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='configuration.organization'),
        ),
        migrations.DeleteModel(
            name='Row_Column_Address',
        ),
        migrations.DeleteModel(
            name='Service',
        ),
        migrations.DeleteModel(
            name='Service_Media',
        ),
        migrations.DeleteModel(
            name='SubService',
        ),
        migrations.DeleteModel(
            name='SubService_Media',
        ),
    ]
