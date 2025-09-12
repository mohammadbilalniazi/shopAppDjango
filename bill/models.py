from django.db import models
from product.models import Product,Unit
from configuration.models import Organization,Location
from django.conf import settings
from common.date import current_shamsi_date
from django.db.models.signals import post_delete,pre_save,post_save
from django.dispatch import receiver
from product.models import Stock,Product_Detail
STATUS=((0,"CANCELLED"),(1,"CREATED"))
BILL_TYPES=(("purchase","purchase"),("sell","sell"),("expense","expense"),("payment","payment"))

def get_year():
    return int(current_shamsi_date().split("-")[0])
def get_date():
    return current_shamsi_date()
class Bill(models.Model):
    bill_no=models.IntegerField()
    bill_type=models.CharField(max_length=11,default="PURCHASE")  
    organization = models.ForeignKey(
        Organization, on_delete=models.PROTECT,null=True
    )  # New field
    creator=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT,null=True,blank=True,related_name="creator_set")
    total=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    payment=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    year=models.SmallIntegerField(default=get_year)
    date=models.CharField(max_length=10,default=get_date)  
    profit=models.IntegerField(default=0)


class Bill_Receiver2(models.Model):
    bill=models.OneToOneField(Bill,on_delete=models.CASCADE)
    bill_rcvr_org=models.ForeignKey(Organization,on_delete=models.PROTECT,null=True,blank=True)
    is_approved=models.BooleanField(default=False,null=True,blank=True)
    approval_date=models.DateField(null=True,blank=True)
    approval_user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT,null=True,blank=True,default=None)

class Bill_Description(models.Model):
    bill=models.OneToOneField(Bill,on_delete=models.CASCADE)
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
 
@receiver(post_delete, sender=Bill_detail)
def update_stock_on_delete(sender, instance, **kwargs):
    """ Adjust stock when a Bill_detail record is deleted. """
    bill_type = instance.bill.bill_type  # Get bill type
    # Ensure stock exists or create an empty stock record
    stock, created = Stock.objects.get_or_create(
        product=instance.product, 
        organization=instance.bill.organization,
        defaults={"current_amount": 0}  # Default to zero if creating new
    )
 
    # If Selling: Add back stock Because Previoulsy reduced(due to selling)
    if bill_type == "SELLING":
        stock.current_amount += instance.item_amount

    # If Purchasing: Reduce stock Because Previously added(due to purchase)
    elif bill_type == "PURCHASE":
        stock.current_amount -= instance.item_amount
    stock.save()

from decimal import Decimal  # ✅ Import Decimal

@receiver(pre_save, sender=Bill_detail)
def update_stock_on_save(sender, instance, **kwargs):
    """ Adjust stock before saving a Bill_detail record. """
    if not instance.pk:
        old_amount = Decimal(0)  # ✅ Ensure decimal type
    else:
        old_instance = Bill_detail.objects.get(pk=instance.pk)
        old_amount = Decimal(old_instance.item_amount)  # ✅ Convert to Decimal

    bill_type = instance.bill.bill_type  

    # Ensure stock exists or create an empty stock record
    stock, created = Stock.objects.get_or_create(
        product=instance.product, 
        organization=instance.bill.organization,
        defaults={"current_amount": Decimal(0)}
    )

    new_amount = Decimal(instance.item_amount)  # ✅ Convert to Decimal

    if bill_type == "SELLING":
        stock.current_amount += old_amount  # Revert old stock deduction
        stock.current_amount -= new_amount  # Deduct new amount

    elif bill_type == "PURCHASE":
        stock.current_amount -= old_amount  # Revert old stock addition
        stock.current_amount += new_amount  # Add new amount

    stock.save()

@receiver(post_save,sender=Bill_detail)
def update_prices(sender,instance,**kwargs):
    product=instance.product
    bill_type=instance.bill.bill_type
    organization=instance.bill.organization
    product_detail,created=Product_Detail.objects.get_or_create(product=product,defaults={"current_amount":0,"organization":organization})
    if bill_type=="PURCHASE":
        product_detail.purchased_price=instance.item_price
    elif bill_type=="SELLING":  
        product_detail.selling_price=instance.item_price
    product_detail.save()


