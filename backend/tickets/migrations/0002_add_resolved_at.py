from django.db import migrations


def add_resolved_at_if_missing(apps, schema_editor):
    connection = schema_editor.connection
    if connection.vendor == 'postgresql':
        schema_editor.execute(
            "ALTER TABLE tickets_ticket ADD COLUMN IF NOT EXISTS "
            "resolved_at timestamp with time zone NULL;"
        )
    else:
        # SQLite: check if column exists
        cursor = connection.cursor()
        cursor.execute("PRAGMA table_info(tickets_ticket);")
        columns = [row[1] for row in cursor.fetchall()]
        if 'resolved_at' not in columns:
            schema_editor.execute(
                "ALTER TABLE tickets_ticket ADD COLUMN "
                "resolved_at datetime NULL;"
            )


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_resolved_at_if_missing, migrations.RunPython.noop),
    ]
