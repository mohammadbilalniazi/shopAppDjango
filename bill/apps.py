from django.apps import AppConfig


class BillConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bill'
    verbose_name="Bill"

    def ready(self):
        from .models import Bill
        from configuration.models import Organization
        from django.contrib.auth.models import User
        
        # for bill in Bill.objects.all():
        #     try:
        #         organization=Organization.objects.get(name=bill.organization)
        #         print("organization",organization," bill.organization ",bill.organization)
        #         bill.organization_new=organization
        #         bill.save()
        #     except Organization.DoesNotExist:
        #         print("organization not found",bill.organization)
        # for bill in Bill.objects.all():
        #     try:
        #         user=User.objects.get(username=bill.creator)
        #         print("user",user," bill.creator ",bill.creator)
        #         bill.new_creator=user
        #         bill.save()
        #     except User.DoesNotExist:
        #         print("User not found",bill.creator)
                
        # for product_detail in Product_Detail.objects.all():
        #     try:
        #         organization=Organization.objects.get(name=product_detail.organization)
        #         print("organization",organization," product_detail.organization ",product_detail.organization)
        #         product_detail.product_new_organization=organization
        #         product_detail.save()
        #     except Organization.DoesNotExist:
        #         print("organization not found",product_detail.organization)