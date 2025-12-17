# apps/backup/apps.py
from django.apps import AppConfig

class BackupConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.backup'
    verbose_name = 'Sistema de Backup'