from django.db import models
from product.models import Product,Unit
from configuration.models import Organization,Location
from django.conf import settings
from common.date import current_shamsi_date
from decimal import Decimal
from django.db.models.signals import post_delete,pre_save,post_save
from django.dispatch import receiver
from product.models import Stock,Product_Detail
from asset.models import AssetBillSummary,AssetWholeBillSummary
STATUS=((0,"CANCELLED"),(1,"CREATED"))
bill_types=(("PURCHASE","PURCHASE"),("SELLING","SELLING"),("PAYMENT","PAYMENT"),("RECEIVEMENT","RECEIVEMENT"),("LOSSDEGRADE","LOSSDEGRADE"),("EXPENSE","EXPENSE"))

def get_year():
    return int(current_shamsi_date().split("-")[0])
def get_date():
    return current_shamsi_date()
class Bill(models.Model):
    bill_no=models.IntegerField()
    bill_type=models.CharField(max_length=11,default="PURCHASE",choices=bill_types)  
    organization = models.ForeignKey(
        Organization, on_delete=models.PROTECT,null=True
    )  # New field
    creator=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT,null=True,blank=True,related_name="creator_set")
    total=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    payment=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    year=models.SmallIntegerField(default=get_year)
    date=models.CharField(max_length=10,default=get_date)  
    profit=models.IntegerField(default=0)
    status=models.SmallIntegerField(choices=STATUS,default=0) # 0 created 1 approved 2 reversed  3  rejected
    currency=models.CharField(max_length=7,default="afg")
    shipment_location=models.ForeignKey(Location,on_delete=models.PROTECT,null=True,default=None)


class Bill_Receiver2(models.Model):
    bill=models.OneToOneField(Bill,on_delete=models.CASCADE)
    bill_rcvr_org=models.ForeignKey(Organization,on_delete=models.PROTECT,null=True,blank=True)
    is_approved=models.BooleanField(default=False,null=True,blank=True)
    approval_date=models.DateField(null=True,blank=True)
    approval_user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT,null=True,blank=True,default=None)
# --------------------------------------------------------
# SIGNAL: UPDATE ASSET BILL SUMMARY AFTER BILL APPROVAL
# --------------------------------------------------------
@receiver(post_save, sender=Bill_Receiver2)
def update_asset_bill_summary(sender, instance, **kwargs):
    """Update AssetBillSummary and AssetWholeBillSummary on approval."""
    bill = instance.bill

    if not instance.is_approved:
        return  # only update when approved

    bill_type = bill.bill_type
    organization = bill.organization
    bill_rcvr_org = instance.bill_rcvr_org

    # --- AssetBillSummary (per organization + receiver + year + type)
    abs_obj, _ = AssetBillSummary.objects.get_or_create(
        organization=organization,
        bill_rcvr_org=bill_rcvr_org,
        bill_type=bill_type,
        year=bill.year,
        defaults={
            "total": Decimal(0.0),
            "payment": Decimal(0.0),
            "profit": 0,
            "currency": bill.currency,
        },
    )

    abs_obj.total += Decimal(bill.total)
    abs_obj.payment += Decimal(bill.payment)
    abs_obj.save()

    # --- AssetWholeBillSummary (per organization + type)
    awbs_obj, _ = AssetWholeBillSummary.objects.get_or_create(
        organization=organization,
        bill_type=bill_type,
        defaults={
            "total": Decimal(0.0),
            "payment": Decimal(0.0),
            "profit": 0,
            "currency": bill.currency,
        },
    )
    awbs_obj.total += Decimal(bill.total)
    awbs_obj.payment += Decimal(bill.payment)
    awbs_obj.save()



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
# --------------------------------------------------------
# SIGNAL: UPDATE STOCK WHEN BILL DETAIL DELETED
# --------------------------------------------------------
@receiver(post_delete, sender=Bill_detail)
def adjust_stock_on_delete(sender, instance, **kwargs):
    """Adjust stock when a Bill_detail record is deleted."""
    bill_type = instance.bill.bill_type
    stock, _ = Stock.objects.get_or_create(
        product=instance.product,
        organization=instance.bill.organization,
        defaults={"current_amount": Decimal(0)},
    )

    if bill_type == "SELLING":
        stock.current_amount += instance.item_amount
    elif bill_type == "PURCHASE":
        stock.current_amount -= instance.item_amount

    stock.save()

# --------------------------------------------------------
# SIGNAL: UPDATE STOCK BEFORE SAVING BILL DETAIL
# --------------------------------------------------------
@receiver(pre_save, sender=Bill_detail)
def revert_old_stock_on_update(sender, instance, **kwargs):
    """Revert stock impact of old values before saving new ones."""
    if not instance.pk:
        return

    old_instance = Bill_detail.objects.get(pk=instance.pk)
    old_amount = Decimal(old_instance.item_amount)
    bill_type = instance.bill.bill_type

    stock, _ = Stock.objects.get_or_create(
        product=instance.product,
        organization=instance.bill.organization,
        defaults={"current_amount": Decimal(0)},
    )

    if bill_type in ["SELLING", "LOSSDEGRADE"]:
        stock.current_amount += old_amount  # revert previous deduction
        if bill_type == "LOSSDEGRADE" and hasattr(stock, "loss_amount"):
            stock.loss_amount -= old_amount
    elif bill_type == "PURCHASE":
        stock.current_amount -= old_amount  # revert previous addition

    stock.save()

# --------------------------------------------------------
# SIGNAL: UPDATE PRODUCT PRICE & STOCK AFTER BILL DETAIL SAVE
# --------------------------------------------------------
@receiver(post_save, sender=Bill_detail)
def update_product_price_and_stock(sender, instance, **kwargs):
    """Update product price and stock after saving Bill_detail."""
    product = instance.product
    bill_type = instance.bill.bill_type
    organization = instance.bill.organization
    new_amount = Decimal(instance.item_amount)

    # --- Update product price info
    pd_obj, _ = Product_Detail.objects.get_or_create(
        product=product,
        organization=organization,
        defaults={"current_amount": 0},
    )

    if bill_type == "PURCHASE":
        pd_obj.purchased_price = instance.item_price
    elif bill_type == "SELLING":
        pd_obj.selling_price = instance.item_price
    pd_obj.save()

    # --- Update stock quantities
    stock, _ = Stock.objects.get_or_create(
        product=product,
        organization=organization,
        defaults={"current_amount": Decimal(0)},
    )

    if bill_type in ["SELLING", "LOSSDEGRADE"]:
        stock.current_amount -= new_amount
        if bill_type == "LOSSDEGRADE" and hasattr(stock, "loss_amount"):
            stock.loss_amount += new_amount
    elif bill_type == "PURCHASE":
        stock.current_amount += new_amount

    stock.save()