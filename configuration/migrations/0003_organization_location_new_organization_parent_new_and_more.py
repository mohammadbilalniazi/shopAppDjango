# Generated by Django 4.2 on 2025-04-25 12:04

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('configuration', '0002_currency'),
    ]

    operations = [
        migrations.AddField(
            model_name='organization',
            name='location_new',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='organization_location2', to='configuration.location'),
        ),
        migrations.AddField(
            model_name='organization',
            name='parent_new',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='organization_parent_sets2', to='configuration.organization'),
        ),
        migrations.AlterField(
            model_name='organization',
            name='location',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='organization_location', to='configuration.location', to_field='city'),
        ),
        migrations.AlterField(
            model_name='organization',
            name='parent',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='organization_parent_sets', to='configuration.organization', to_field='name'),
        ),
    ]
