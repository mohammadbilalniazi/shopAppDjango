# Generated by Django 4.1.1 on 2022-10-18 20:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('configuration', '0003_alter_language_detail_value'),
    ]

    operations = [
        migrations.AlterField(
            model_name='language_detail',
            name='key',
            field=models.CharField(max_length=80),
        ),
    ]
