from django.apps import AppConfig

class UserConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user'
    # def ready(self):
    #     from configuration.models import Organization
    #     from user.models import OrganizationUser
    #     from django.contrib.auth.models import User
    #     for org in Organization.objects.all():
    #         org_c=OrganizationUser.objects.get_or_create(user=org.owner, organization=org,role="owner")
    #         print(f"org_c {org_c}")
    #         for admin in User.objects.filter(is_superuser=True):
    #             adm_org_c=OrganizationUser.objects.get_or_create(user=admin, organization=org,role="superuser")
    #             print(f"adm_org_c {adm_org_c}")