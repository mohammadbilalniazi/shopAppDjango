from email.policy import default
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from product.models import Product,Unit,Store
from configuration.models import Organization,Location
from django.conf import settings
from common.date import current_shamsi_date

STATUS=((0,"CANCELLED"),(1,"CREATED"))
BILL_TYPES=(("purchase","purchase"),("sell","sell"),("expense","expense"),("payment","payment"))

def get_current_shamsi_date():
    return int(current_shamsi_date().split("-")[0])
class Bill(models.Model):
    bill_no=models.IntegerField(default=None)
    bill_type=models.CharField(max_length=11,default="PURCHASE")  
    # organization=models.ForeignKey(Organization,on_delete=models.DO_NOTHING,to_field="name",related_name='bill_organization_set1',default=None)
    organization=models.ForeignKey(Organization,on_delete=models.CASCADE,related_name='bill_organization_set',null=True,blank=True)
  
    # creator=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.DO_NOTHING,null=True,blank=True,to_field="username",related_name='bill_location_set1')
    creator=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.DO_NOTHING,null=True,blank=True,related_name='bill_location_set')
  
    total=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    payment=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    # year=models.SmallIntegerField(default=1401)   
    year=models.SmallIntegerField(default=get_current_shamsi_date)
    # date=models.DateField(null=True)
    date=models.CharField(max_length=10,default=current_shamsi_date)  
    profit=models.IntegerField(default=0)
 
class Bill_Receiver2(models.Model):
    bill=models.OneToOneField(Bill,on_delete=models.CASCADE,unique=True)
    bill_rcvr_org=models.ForeignKey(Organization,on_delete=models.DO_NOTHING,null=True,blank=True)
    is_approved=models.BooleanField(default=False,null=True,blank=True)
    approval_date=models.DateField(default=None,null=True,blank=True)
    approval_user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.DO_NOTHING,null=True,blank=True,default=None)
    store=models.ForeignKey(Store,on_delete=models.DO_NOTHING,null=True,blank=True)

class Bill_Description(models.Model):
    bill=models.OneToOneField(Bill,on_delete=models.CASCADE)
    # store=models.ForeignKey(Store,on_delete=models.DO_NOTHING,null=True,blank=True,to_field="name",related_name='bill_description_set1')
    store=models.ForeignKey(Store,on_delete=models.DO_NOTHING,null=True,blank=True,related_name='bill_description_set')
    status=models.SmallIntegerField(choices=STATUS,default=0) # 0 created 1 approved 2 reversed  3  rejected
    currency=models.CharField(max_length=7,default="afn")
    # shipment_location=models.ForeignKey(Location,on_delete=models.DO_NOTHING,null=True,to_field='city',related_name='bill_city_set1',default=None)
    shipment_location_new=models.ForeignKey(Location,on_delete=models.DO_NOTHING,null=True,related_name='bill_city_set',default=None)
   
    # def __str__(self):
    #     return f"{self.bill}"

    
class Bill_detail(models.Model):
    bill=models.ForeignKey(Bill,on_delete=models.CASCADE)
    product=models.ForeignKey(Product,on_delete=models.DO_NOTHING,null=False, blank=False)
    unit=models.ForeignKey(Unit,on_delete=models.DO_NOTHING,null=True, blank=True)
    item_amount = models.IntegerField() 
    item_price=models.DecimalField(default=0.0,max_digits=15,decimal_places=5)
    return_qty=models.IntegerField(null=True,blank=True)      
    discount=models.IntegerField(default=0)
    profit=models.IntegerField(default=None,null=True)  
    def __str__(self):
        return f"{self.id}"
    class Meta:
        # unique_together =("bill","product",)
        verbose_name_plural = "Bill detail" 

 






