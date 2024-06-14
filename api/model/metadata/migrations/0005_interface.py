# Generated by Django 5.0.2 on 2024-06-14 14:36

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("metadata", "0004_alter_classifier_system"),
    ]

    operations = [
        migrations.CreateModel(
            name="Interface",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, primary_key=True, serialize=False
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField()),
                (
                    "system",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="metadata.system",
                    ),
                ),
            ],
        ),
    ]