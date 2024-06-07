# Generated by Django 5.0.6 on 2024-05-28 02:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CourseSection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('registration_term', models.CharField(max_length=100)),
                ('related_offering', models.CharField(max_length=100)),
                ('section_key', models.CharField(max_length=100)),
                ('lectures', models.ManyToManyField(related_name='lecture_course_details', to='courses.coursedetails')),
                ('tutorials', models.ManyToManyField(related_name='tutorial_course_details', to='courses.coursedetails')),
            ],
        ),
    ]
