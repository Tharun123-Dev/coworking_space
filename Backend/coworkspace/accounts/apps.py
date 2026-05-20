from django.apps import AppConfig


# accounts/apps.py
from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"

    def ready(self):
        from django.core.management import call_command
        try:
            call_command("create_default_superuser")
        except Exception:
            pass
