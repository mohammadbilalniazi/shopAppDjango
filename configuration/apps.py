from django.apps import AppConfig


class ConfigurationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'configuration'
    # def ready(self):
    #     from .models import Organization,Location
    #     for org in Organization.objects.all():
    #         try:
    #             parent=Organization.objects.get(id=org.parent.id)
    #             org.new_parent=parent
    #             org.save()
    #         except Exception as e:
    #             print("org error ",str(e))
    #         try:
    #             location=Location.objects.get(id=org.location.id)
    #             org.new_location=location
    #             org.save()
    #         except Exception as e:
    #             print("org error ",str(e))