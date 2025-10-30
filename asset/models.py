from django.db import models
from common.date import current_shamsi_date
from configuration.models import Organization

def get_year():
    return int(current_shamsi_date().split("-")[0])
# class AssetGeneralLegder(models.Model):
#     total_sum_purchase=models.DecimalField(max_digits=1000000000000,decimal_places=3,default=0)
#     payment_sum_purchase=models.DecimalField(max_digits=1000000000000,decimal_places=3,default=0)
#     total_sum_selling=models.DecimalField(max_digits=1000000000000,decimal_places=3,default=0)
#     payment_sum_selling=models.DecimalField(max_digits=1000000000000,decimal_places=3,default=0)
#     payment_sum_payment=models.DecimalField(max_digits=1000000000000,decimal_places=3,default=0)
#     payment_sum_receivement=models.DecimalField(max_digits=1000000000000,decimal_places=3,default=0)

bill_types=(("PURCHASE","PURCHASE"),("SELLING","SELLING"),("PAYMENT","PAYMENT"),("RECEIVEMENT","RECEIVEMENT"),("LOSSDEGRADE","LOSSDEGRADE"),("EXPENSE","EXPENSE"))
class AssetBillSummary(models.Model):
    bill_type=models.CharField(max_length=11,default="PURCHASE",choices=bill_types)  
    organization = models.ForeignKey(
        Organization, on_delete=models.PROTECT,null=True,
        related_name="assetbillorganization"
    )  # New field
    bill_rcvr_org = models.ForeignKey(
        Organization, on_delete=models.PROTECT,null=True,
        related_name="assetbillrcvrorg"
    )  # New field
    total=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    payment=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    year=models.SmallIntegerField(default=get_year)
    profit=models.IntegerField(default=0)
    currency=models.CharField(max_length=7,default="afg")

    class Meta:
        unique_together=("year","organization","bill_rcvr_org","bill_type")

bill_types=(("PURCHASE","PURCHASE"),("PURCHASED_AMNT_USNG_STOCK","PURCHASED_AMNT_USNG_STOCK"),("SELLING","SELLING"),("PAYMENT","PAYMENT"),("RECEIVEMENT","RECEIVEMENT"),("LOSSDEGRADE","LOSSDEGRADE"),("EXPENSE","EXPENSE"))
class AssetWholeBillSummary(models.Model):
    bill_type=models.CharField(max_length=25,default="PURCHASE",choices=bill_types)  
    organization = models.ForeignKey(
        Organization, on_delete=models.PROTECT,null=True
    )  # New field
    total=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    payment=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    profit=models.IntegerField(default=0)
    currency=models.CharField(max_length=7,default="afg")

    class Meta:
        unique_together=("organization","bill_type")

