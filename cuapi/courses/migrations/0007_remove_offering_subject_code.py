# Generated by Django 5.0.6 on 2024-06-02 18:49

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0006_coursesection_description_offering_description_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='offering',
            name='subject_code',
        ),
    ]
