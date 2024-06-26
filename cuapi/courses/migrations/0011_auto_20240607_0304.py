# Generated by Django 5.0.6 on 2024-06-07 03:04

from django.db import migrations, connection


def create_pg_trgm_extension(apps, schema_editor):
    with connection.cursor() as cursor:
        cursor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0010_alter_coursedetails_unique_together"),
    ]

    operations = [
        migrations.RunPython(create_pg_trgm_extension),
    ]
