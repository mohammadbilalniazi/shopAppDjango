# Generated by Django 4.1.1 on 2022-10-09 14:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0008_alter_service_service_incharger'),
    ]

    operations = [
        migrations.AddField(
            model_name='subservice',
            name='sub_service_name',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AlterUniqueTogether(
            name='subservice',
            unique_together={('sub_service_name', 'service')},
        ),
    ]
