# Generated by Django 5.0.6 on 2024-06-02 18:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0007_remove_offering_subject_code'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='offering',
            unique_together={('related_offering', 'registration_term')},
        ),
    ]
