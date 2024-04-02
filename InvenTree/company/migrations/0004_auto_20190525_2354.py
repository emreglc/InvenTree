# Generated by Django 2.2 on 2019-05-25 13:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('company', '0003_remove_supplierpart_minimum'),
    ]

    operations = [
        migrations.AlterField(
            model_name='supplierpart',
            name='part',
            field=models.ForeignKey(help_text='Select part', limit_choices_to={'has_variants': False, 'purchaseable': True}, on_delete=django.db.models.deletion.CASCADE, related_name='supplier_parts', to='part.Part'),
        ),
    ]
