from django.db import migrations


def convert_id_to_uuid(apps, schema_editor):
    connection = schema_editor.connection
    if connection.vendor != 'postgresql':
        return

    cursor = connection.cursor()
    cursor.execute(
        "SELECT data_type FROM information_schema.columns "
        "WHERE table_name = 'tickets_ticket' AND column_name = 'id'"
    )
    row = cursor.fetchone()
    if row and row[0] != 'uuid':
        schema_editor.execute("DELETE FROM tickets_ticket;")
        schema_editor.execute(
            'ALTER TABLE tickets_ticket '
            'ALTER COLUMN id DROP DEFAULT, '
            'ALTER COLUMN id SET DATA TYPE uuid USING gen_random_uuid(), '
            'ALTER COLUMN id SET DEFAULT gen_random_uuid();'
        )


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0002_add_resolved_at'),
    ]

    operations = [
        migrations.RunPython(convert_id_to_uuid, migrations.RunPython.noop),
    ]
