from django.db import models
from product.models import Product,Unit,Store
from configuration.models import Organization,Location
from django.conf import settings
from common.date import current_shamsi_date
from django.db.models.signals import post_delete,pre_save,post_save
from django.dispatch import receiver
from product.models import Stock,Product_Detail
from django.db.models import F, Sum, DecimalField, ExpressionWrapper


STATUS=((0,"CANCELLED"),(1,"CREATED"))
BILL_TYPES=(("purchase","purchase"),("sell","sell"),("expense","expense"),("payment","payment"))

def get_current_shamsi_date():
    return int(current_shamsi_date().split("-")[0])
class Bill(models.Model):
    bill_no=models.IntegerField(default=None)
    bill_type=models.CharField(max_length=11,default="PURCHASE")  
    organization=models.ForeignKey(Organization,on_delete=models.CASCADE,null=True,blank=True)
    creator=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.DO_NOTHING,null=True,blank=True)
    total=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    payment=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    year=models.SmallIntegerField(default=get_current_shamsi_date)
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
    store=models.ForeignKey(Store,on_delete=models.DO_NOTHING,null=True,blank=True)
    status=models.SmallIntegerField(choices=STATUS,default=0) # 0 created 1 approved 2 reversed  3  rejected
    currency=models.CharField(max_length=7,default="afn")
    shipment_location_new=models.ForeignKey(Location,on_delete=models.DO_NOTHING,null=True,default=None)
   
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

   


def calculate_bill_total(bill):
    total = Bill_detail.objects.filter(bill=bill).annotate(
        line_total=ExpressionWrapper(
            F('item_price') * F('item_amount'),
            output_field=DecimalField()
        )
    ).aggregate(sum_total=Sum('line_total'))['sum_total'] or 0
    bill.total = total
    bill.save()


@receiver(post_delete, sender=Bill_detail)
def update_stock_on_delete(sender, instance, **kwargs):
    """ Adjust stock when a Bill_detail record is deleted. """
    bill_type = instance.bill.bill_type  # Get bill type
    if hasattr(instance.bill,'bill_description') and instance.bill.bill_description and instance.bill.bill_description.store:
        # Ensure stock exists or create an empty stock record
        stock, created = Stock.objects.get_or_create(
            product=instance.product, 
            store=instance.bill.bill_description.store,
            defaults={"current_amount": 0}  # Default to zero if creating new
        )
    
        # If Selling: Add back stock Because Previoulsy reduced(due to selling)
        if bill_type == "SELLING":
            stock.current_amount += instance.item_amount

        # If Purchasing: Reduce stock Because Previously added(due to purchase)
        elif bill_type == "PURCHASE":
            stock.current_amount -= instance.item_amount
        stock.save()
    calculate_bill_total(instance.bill)

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
    
    if not hasattr(instance.bill,'bill_description')or not instance.bill.bill_description or not instance.bill.bill_description.store:
        return
    # Ensure stock exists or create an empty stock record
    stock, created = Stock.objects.get_or_create(
        product=instance.product, 
        store=instance.bill.bill_description.store,
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
def update_prices_profit(sender,instance,**kwargs):
    product=instance.product
    bill_type=instance.bill.bill_type
    bill=instance.bill
    organization=instance.bill.organization
    product_detail,created=Product_Detail.objects.get_or_create(product=product,defaults={"current_amount":0,"organization":organization})
    if bill_type=="PURCHASE":
        product_detail.purchased_price=instance.item_price
    elif bill_type=="SELLING":  
        product_detail.selling_price=instance.item_price
    product_detail.save()
    purchased_price=product_detail.purchased_price or Decimal(0)
    selling_price=product_detail.selling_price or Decimal(0)
    # calculate profit of Bill_detail 
    if bill_type=="SELLING":
        profit=(instance.item_price-purchased_price)*instance.item_amount
    elif bill_type=="PURCHASE":
        profit=Decimal(0)
    # calculate profit of Bill

    Bill_detail.objects.filter(pk=instance.pk).update(profit=profit)
    total_profit=Bill_detail.objects.filter(bill=bill).aggregate(total=models.Sum("profit"))["total"] or 0
    bill.profit=total_profit
    bill.save()
    calculate_bill_total(instance.bill)






