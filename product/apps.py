from django.apps import AppConfig


class ProductConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'product'
    # def ready(self):
    #     from .models import Store,Product_Detail,Unit,Category
    #     from configuration.models import Organization
        # for item in Product_Detail.objects.all():
        #     try:
        #         org=Organization.objects.get(name=item.organization)
        #         item.organization_new=org
        #         item.save()
        #     except Exception as e:
        #         print("product detail error ",str(e)," id ",item.id)
        # for item in Store.objects.all():
        #     try:
        #         org=Organization.objects.get(name=item.organization)
        #         item.organization_new=org
        #         item.save()
        #     except Exception as e:
        #         print("store error ",str(e)," id ",item.id)

        # for item in Unit.objects.all():
        #     try:
        #         org=Organization.objects.get(name=item.organization)
        #         item.organization_new=org
        #         item.save()
        #     except Exception as e:
        #         print("unit error ",str(e)," id ",item.id)
    