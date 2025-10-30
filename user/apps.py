from django.apps import AppConfig

class UserConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user'
    
    def ready(self):
        # Import signals to register them
        import user.signals
        print("✅ User signals registered: Auto-assign organizations to admin users")