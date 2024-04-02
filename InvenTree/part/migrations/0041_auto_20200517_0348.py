# Generated by Django 3.0.5 on 2020-05-17 03:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('part', '0040_parttesttemplate'),
    ]

    operations = [
        migrations.AlterField(
            model_name='parttesttemplate',
            name='part',
            field=models.ForeignKey(limit_choices_to={'trackable': True}, on_delete=django.db.models.deletion.CASCADE, related_name='test_templates', to='part.Part'),
        ),
    ]
