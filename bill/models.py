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


class Bill(models.Model):
    bill_no=models.IntegerField(default=None)
    bill_type=models.CharField(max_length=11,default="PURCHASE")  
    organization=models.ForeignKey(Organization,on_delete=models.DO_NOTHING,to_field="name",default=None)
    creator=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.DO_NOTHING,null=True,blank=True,to_field="username")
    total=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    payment=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    # year=models.SmallIntegerField(default=1401)   
    year=models.SmallIntegerField(default=int(current_shamsi_date().split("-")[0]))
    # date=models.DateField(null=True)
    date=models.CharField(max_length=10,default=current_shamsi_date())  
    profit=models.IntegerField(default=0)
    # bill_rcvr_org=models.CharField(max_length=20,null=True,blank=True)
    # rcvr_org_aprv_usr=models.CharField(max_length=20,null=True,blank=True)
    # class Meta:
    #     unique_together=("organization","year","bill_no","bill_type")


# class Bill_Payer(models.Model):
#     bill=models.ForeignKey(Bill,on_delete=models.CASCADE)
#     organization=models.ForeignKey(Organization,on_delete=models.DO_NOTHING,to_field="name",default=None)
#     user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.DO_NOTHING,null=True,blank=True,to_field="username")

# class Bill_Receiver(models.Model):
#     bill=models.OneToOneField(Bill,on_delete=models.CASCADE,unique=True)
#     bill_rcvr_org=models.ForeignKey(Organization,on_delete=models.DO_NOTHING,to_field="name",null=True,blank=True)
#     is_approved=models.BooleanField(default=False,null=True,blank=True)
#     approval_date=models.DateField(default="",null=True,blank=True)
#     approval_user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.DO_NOTHING,null=True,blank=True,default="",to_field="username")
#     store=models.ForeignKey(Store,on_delete=models.DO_NOTHING,null=True,blank=True,to_field="name")


class Bill_Receiver2(models.Model):
    bill=models.OneToOneField(Bill,on_delete=models.CASCADE,unique=True)
    bill_rcvr_org=models.ForeignKey(Organization,on_delete=models.DO_NOTHING,null=True,blank=True)
    is_approved=models.BooleanField(default=False,null=True,blank=True)
    approval_date=models.DateField(default=None,null=True,blank=True)
    approval_user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.DO_NOTHING,null=True,blank=True,default=None)
    store=models.ForeignKey(Store,on_delete=models.DO_NOTHING,null=True,blank=True)

class Bill_Description(models.Model):
    bill=models.OneToOneField(Bill,on_delete=models.CASCADE)
    store=models.ForeignKey(Store,on_delete=models.DO_NOTHING,null=True,blank=True,to_field="name")
    status=models.SmallIntegerField(choices=STATUS,default=0) # 0 created 1 approved 2 reversed  3  rejected
    currency=models.CharField(max_length=7,default="afg")
    shipment_location=models.ForeignKey(Location,on_delete=models.DO_NOTHING,null=True,to_field='city',default=None)
    # def __str__(self):
    #     return f"{self.bill}"

    
class Bill_detail(models.Model):
    bill=models.ForeignKey(Bill,on_delete=models.CASCADE)
    product=models.ForeignKey(Product,on_delete=models.DO_NOTHING,null=False, blank=False)
    unit=models.ForeignKey(Unit,on_delete=models.DO_NOTHING,null=True, blank=True)
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

 






