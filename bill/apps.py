from django.apps import AppConfig


class BillConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bill'
    verbose_name="Bill"

    def ready(self):
        from .models import Bill
        from configuration.models import Organization
        from django.contrib.auth.models import User
        from .models import Bill_Description
        from product.models import Store,Product_Detail
        
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
        # for bill_desc in Bill_Description.objects.all():
        #     try:
        #         store=Store.objects.get(name=bill_desc.store)
        #         print("organization",store," bill_desc.store ",bill_desc.store)
        #         bill_desc.store_new=store
        #         bill_desc.currency=1
        #         bill_desc.save()
        #     except Bill_Description.DoesNotExist:
        #         print("Store not found")
                
        # for product_detail in Product_Detail.objects.all():
        #     try:
        #         organization=Organization.objects.get(name=product_detail.organization)
        #         print("organization",organization," product_detail.organization ",product_detail.organization)
        #         product_detail.product_new_organization=organization
        #         product_detail.save()
        #     except Organization.DoesNotExist:
        #         print("organization not found",product_detail.organization)