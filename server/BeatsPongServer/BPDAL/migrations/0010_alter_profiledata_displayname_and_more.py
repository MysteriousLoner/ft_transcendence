# Generated by Django 4.2.11 on 2025-01-17 09:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('BPDAL', '0009_profilepicture_remove_profiledata_profilepicture_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profiledata',
            name='displayName',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='profiledata',
            name='winRate',
            field=models.FloatField(default=100),
        ),
    ]
