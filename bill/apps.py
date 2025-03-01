from django.apps import AppConfig


class BillConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bill'
    verbose_name="Bill"

    # def ready(self):
    #     from .models import Bill
    #     from configuration.models import Organization
    #     for bill in Bill.objects.all():
    #         try:
    #             organization=Organization.objects.get(name=bill.organization)
    #             print("organization",organization," bill.organization ",bill.organization)
    #             bill.organization_new=organization
    #             bill.save()
    #         except Organization.DoesNotExist:
    #             print("organization not found",bill.organization)
                
