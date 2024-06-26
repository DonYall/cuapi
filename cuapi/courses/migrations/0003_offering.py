# Generated by Django 5.0.6 on 2024-05-28 03:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0002_coursesection'),
    ]

    operations = [
        migrations.CreateModel(
            name='Offering',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('related_offering', models.CharField(max_length=100)),
                ('registration_term', models.CharField(max_length=100)),
                ('sections', models.ManyToManyField(to='courses.coursesection')),
            ],
        ),
    ]
