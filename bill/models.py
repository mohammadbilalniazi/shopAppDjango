from django.db import models
from product.models import Product,Unit,Store
from configuration.models import Organization,Location
from django.conf import settings
from common.date import current_shamsi_date

STATUS=((0,"CANCELLED"),(1,"CREATED"))
BILL_TYPES=(("purchase","purchase"),("sell","sell"),("expense","expense"),("payment","payment"))

def get_year():
    return int(current_shamsi_date().split("-")[0])
class Bill(models.Model):
    bill_no=models.IntegerField()
    bill_type=models.CharField(max_length=11,default="PURCHASE")  
    # organization = models.ForeignKey(
    #     Organization, on_delete=models.DO_NOTHING, to_field="name", default=None, related_name="bills_old"
    # )  # Old field
    organization = models.ForeignKey(
        Organization, on_delete=models.PROTECT,null=True
        #related_name="bills_new"    # New field first organization_new then organization 
    )  # New field

    creator=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT,null=True,blank=True,to_field="username")
    total=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    payment=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    # year=models.SmallIntegerField(default=1401)   
    year=models.SmallIntegerField(default=get_year)
    # date=models.DateField(null=True)
    date=models.CharField(max_length=10,default=current_shamsi_date())  
    profit=models.IntegerField(default=0)
    # bill_rcvr_org=models.CharField(max_length=20,null=True,blank=True)
    # rcvr_org_aprv_usr=models.CharField(max_length=20,null=True,blank=True)
    # class Meta:
    #     unique_together=("organization","year","bill_no","bill_type")


class Bill_Receiver2(models.Model):
    bill=models.OneToOneField(Bill,on_delete=models.CASCADE,unique=True)
    bill_rcvr_org=models.ForeignKey(Organization,on_delete=models.PROTECT,null=True,blank=True)
    is_approved=models.BooleanField(default=False,null=True,blank=True)
    approval_date=models.DateField(default=None,null=True,blank=True)
    approval_user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT,null=True,blank=True,default=None)
    store=models.ForeignKey(Store,on_delete=models.PROTECT,null=True,blank=True)

class Bill_Description(models.Model):
    bill=models.OneToOneField(Bill,on_delete=models.CASCADE)
    store=models.ForeignKey(Store,on_delete=models.PROTECT,null=True,blank=True,to_field="name",related_name="old_store")
    
    store_new=models.ForeignKey(Store,on_delete=models.PROTECT,null=True,blank=True,related_name="new_store")
    status=models.SmallIntegerField(choices=STATUS,default=0) # 0 created 1 approved 2 reversed  3  rejected
    currency=models.CharField(max_length=7,default="afg")
    shipment_location=models.ForeignKey(Location,on_delete=models.PROTECT,null=True,default=None)
    # def __str__(self):
    #     return f"{self.bill}"

    
class Bill_detail(models.Model):
    bill=models.ForeignKey(Bill,on_delete=models.CASCADE)
    product=models.ForeignKey(Product,on_delete=models.PROTECT,null=False, blank=False)
    unit=models.ForeignKey(Unit,on_delete=models.PROTECT,null=True, blank=True)
    item_amount =models.DecimalField(default=0.0,max_digits=15,decimal_places=5)
    item_price=models.DecimalField(default=0.0,max_digits=15,decimal_places=5)
    return_qty=models.IntegerField(null=True,blank=True)      
    discount=models.IntegerField(default=0)
    profit=models.IntegerField(default=None,null=True)  
    def __str__(self):
        return f"{self.id}"
    class Meta:
        # unique_together =("bill","product",)
        verbose_name_plural = "Bill detail" 

 






