from django.db import models
from product.models import Product,Unit
from configuration.models import Organization,Location
from django.conf import settings
from common.date import current_shamsi_date
from django.dispatch import receiver
from product.models import Stock,Product_Detail
from asset.models import AssetBillSummary,AssetWholeBillSummary
from decimal import Decimal
from django.db.models.signals import pre_save, post_save, post_delete

STATUS=((0,"CANCELLED"),(1,"CREATED"))
bill_types=(("PURCHASE","PURCHASE"),("SELLING","SELLING"),("PAYMENT","PAYMENT"),("RECEIVEMENT","RECEIVEMENT"),("LOSSDEGRADE","LOSSDEGRADE"),("EXPENSE","EXPENSE"))
bill_types_update_with_bill_receiver2=['PURCHASE','SELLING','PAYMENT','RECEIVEMENT']
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

# ---------------------------------------------------
# Bill_Receiver2 Signal: Update summaries for approved bills
# ---------------------------------------------------
@receiver(post_save, sender=Bill_Receiver2)
def handle_bill_receiver(sender, instance, created, **kwargs):
    """
    Update asset summaries when Bill_Receiver2 is saved.
    Only processes bills of types: PURCHASE, SELLING, PAYMENT, RECEIVEMENT.
    
    This handles bills that involve two organizations (creator and receiver).
    Updates AssetBillSummary and AssetWholeBillSummary to track transactions
    between organizations.
    """
    bill = instance.bill
    bill_type = bill.bill_type
    
    # Only handle inter-organization bill types
    if bill_type not in bill_types_update_with_bill_receiver2:
        return
    
    # Skip if receiver organization is not set
    if not instance.bill_rcvr_org:
        return
    
    organization = bill.organization
    bill_rcvr_org = instance.bill_rcvr_org
    year = bill.year
    
    # For updates, handle receiver organization changes
    if not created:
        try:
            # Check if receiver org was changed
            old_receiver = Bill_Receiver2.objects.filter(pk=instance.pk).first()
            if old_receiver and old_receiver.bill_rcvr_org and old_receiver.bill_rcvr_org != bill_rcvr_org:
                # Remove from old receiver org summaries
                _rollback_receiver_summaries(
                    organization=organization,
                    bill_rcvr_org=old_receiver.bill_rcvr_org,
                    bill_type=bill_type,
                    year=year,
                    total=bill.total,
                    payment=bill.payment,
                    profit=bill.profit
                )
        except Exception:
            pass
    
    # Update summaries for current receiver organization
    _update_receiver_summaries(
        organization=organization,
        bill_rcvr_org=bill_rcvr_org,
        bill_type=bill_type,
        year=year,
        total=bill.total,
        payment=bill.payment,
        profit=bill.profit,
        is_create=created
    )


def _update_receiver_summaries(organization, bill_rcvr_org, bill_type, year, 
                                total, payment, profit, is_create=True):
    """
    Helper function to update AssetBillSummary and AssetWholeBillSummary
    for bills with receiver organizations.
    """
    # Update AssetBillSummary (per organization, receiver, bill_type, year)
    abs_obj, abs_created = AssetBillSummary.objects.get_or_create(
        organization=organization,
        bill_rcvr_org=bill_rcvr_org,
        bill_type=bill_type,
        year=year,
        defaults={
            'total': Decimal(0),
            'payment': Decimal(0),
            'profit': Decimal(0)
        }
    )
    
    if is_create or abs_created:
        abs_obj.total += Decimal(total)
        abs_obj.payment += Decimal(payment)
        abs_obj.profit += Decimal(profit)
    else:
        # For updates, set to current values (assuming bill was updated)
        abs_obj.total = Decimal(total)
        abs_obj.payment = Decimal(payment)
        abs_obj.profit = Decimal(profit)
    
    abs_obj.save()
    
    # Update AssetWholeBillSummary (aggregate across all years)
    awbs_obj, awbs_created = AssetWholeBillSummary.objects.get_or_create(
        organization=organization,
        bill_type=bill_type,
        defaults={
            'total': Decimal(0),
            'payment': Decimal(0),
            'profit': Decimal(0)
        }
    )
    
    if is_create or awbs_created:
        awbs_obj.total += Decimal(total)
        awbs_obj.payment += Decimal(payment)
        awbs_obj.profit += Decimal(profit)
    else:
        awbs_obj.total = Decimal(total)
        awbs_obj.payment = Decimal(payment)
        awbs_obj.profit = Decimal(profit)
    
    awbs_obj.save()


def _rollback_receiver_summaries(organization, bill_rcvr_org, bill_type, year,
                                   total, payment, profit):
    """
    Helper function to rollback summaries when receiver org changes or is deleted.
    """
    # Rollback AssetBillSummary
    try:
        abs_obj = AssetBillSummary.objects.get(
            organization=organization,
            bill_rcvr_org=bill_rcvr_org,
            bill_type=bill_type,
            year=year
        )
        abs_obj.total -= Decimal(total)
        abs_obj.payment -= Decimal(payment)
        abs_obj.profit -= Decimal(profit)
        abs_obj.save()
    except AssetBillSummary.DoesNotExist:
        pass
    
    # Rollback AssetWholeBillSummary
    try:
        awbs_obj = AssetWholeBillSummary.objects.get(
            organization=organization,
            bill_type=bill_type
        )
        awbs_obj.total -= Decimal(total)
        awbs_obj.payment -= Decimal(payment)
        awbs_obj.profit -= Decimal(profit)
        awbs_obj.save()
    except AssetWholeBillSummary.DoesNotExist:
        pass


@receiver(post_delete, sender=Bill_Receiver2)
def rollback_bill_receiver(sender, instance, **kwargs):
    """
    Rollback asset summaries when Bill_Receiver2 is deleted.
    """
    bill = instance.bill
    bill_type = bill.bill_type
    
    if bill_type not in bill_types_update_with_bill_receiver2:
        return
    
    if not instance.bill_rcvr_org:
        return
    
    _rollback_receiver_summaries(
        organization=bill.organization,
        bill_rcvr_org=instance.bill_rcvr_org,
        bill_type=bill_type,
        year=bill.year,
        total=bill.total,
        payment=bill.payment,
        profit=bill.profit
    )


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


# ---------------------------------------------------
# Bill Signal: Update Asset Summaries on Save
# ---------------------------------------------------
@receiver(post_save, sender=Bill)
def update_asset_bill_summary(sender, instance, created, **kwargs):
    """
    Update AssetBillSummary and AssetWholeBillSummary when a Bill is saved.
    Handles: LOSSDEGRADE and EXPENSE bill types only.
    For PURCHASE/SELLING/PAYMENT/RECEIVEMENT, see asset/models.py signals.
    """
    bill = instance
    bill_type = bill.bill_type

    # Only handle specific bill types here
    if bill_type not in ["LOSSDEGRADE", "EXPENSE"]:
        return
    
    organization = bill.organization
    year = bill.year
    
    # Calculate deltas for update operations
    if not created:
        # For updates, we need the previous values from DB
        try:
            old_bill = Bill.objects.get(pk=bill.pk)
            total_delta = bill.total - old_bill.total
            payment_delta = bill.payment - old_bill.payment
            profit_delta = bill.profit - old_bill.profit
        except Bill.DoesNotExist:
            # Fallback if old instance not found
            total_delta = bill.total
            payment_delta = bill.payment
            profit_delta = bill.profit
    else:
        # For new bills, the delta is the full amount
        total_delta = bill.total
        payment_delta = bill.payment
        profit_delta = bill.profit

    # Update AssetBillSummary (per organization, bill_type, year)
    abs_obj, _ = AssetBillSummary.objects.get_or_create(
        organization=organization,
        bill_rcvr_org=None,  # Direct bills have no receiver org
        bill_type=bill_type,
        year=year
    )
    abs_obj.total += Decimal(total_delta)
    abs_obj.payment += Decimal(payment_delta)
    abs_obj.profit += Decimal(profit_delta)
    abs_obj.save()

    # Update AssetWholeBillSummary (aggregate across all years)
    awbs_obj, _ = AssetWholeBillSummary.objects.get_or_create(
        organization=organization,
        bill_type=bill_type
    )
    awbs_obj.total += Decimal(total_delta)
    awbs_obj.payment += Decimal(payment_delta)
    awbs_obj.profit += Decimal(profit_delta)
    awbs_obj.save()


# ---------------------------------------------------
# Bill Signal: Rollback Asset Summaries on Delete
# ---------------------------------------------------
@receiver(post_delete, sender=Bill)
def rollback_asset_bill_summary(sender, instance, **kwargs):
    """
    Rollback AssetBillSummary and AssetWholeBillSummary when a Bill is deleted.
    Handles: LOSSDEGRADE and EXPENSE bill types.
    """
    bill = instance
    bill_type = bill.bill_type
    
    # Only handle specific bill types
    if bill_type not in ["LOSSDEGRADE", "EXPENSE"]:
        return
    
    organization = bill.organization
    year = bill.year

    # Rollback AssetBillSummary
    try:
        abs_obj = AssetBillSummary.objects.get(
            organization=organization,
            bill_rcvr_org=None,
            bill_type=bill_type,
            year=year,
        )
        abs_obj.total -= Decimal(bill.total)
        abs_obj.payment -= Decimal(bill.payment)
        abs_obj.profit -= Decimal(bill.profit)
        abs_obj.save()
    except AssetBillSummary.DoesNotExist:
        # Log or handle missing summary gracefully
        pass

    # Rollback AssetWholeBillSummary
    try:
        awbs_obj = AssetWholeBillSummary.objects.get(
            organization=organization,
            bill_type=bill_type,
        )
        awbs_obj.total -= Decimal(bill.total)
        awbs_obj.payment -= Decimal(bill.payment)
        awbs_obj.profit -= Decimal(bill.profit)
        awbs_obj.save()
    except AssetWholeBillSummary.DoesNotExist:
        # Log or handle missing summary gracefully
        pass


# ---------------------------------------------------
# Bill_detail Signal: Revert Stock Before Update
# ---------------------------------------------------
@receiver(pre_save, sender=Bill_detail)
def revert_old_stock_before_update(sender, instance, **kwargs):
    """
    Before updating a Bill_detail, revert the stock changes from its previous state.
    This ensures we can apply the new values cleanly in post_save.
    """
    if not instance.pk:
        return  # New instance, nothing to revert
    
    try:
        old_instance = Bill_detail.objects.get(pk=instance.pk)
    except Bill_detail.DoesNotExist:
        return
    
    bill_type = old_instance.bill.bill_type
    organization = old_instance.bill.organization
    product = old_instance.product
    amount = Decimal(old_instance.item_amount)
    
    # Get or create stock record
    stock, _ = Stock.objects.get_or_create(
        product=product,
        organization=organization,
        defaults={"current_amount": Decimal(0)},
    )
    
    # Revert stock based on bill type
    if bill_type == "PURCHASE":
        stock.current_amount -= amount  # Remove previous purchase
    elif bill_type == "SELLING":
        stock.current_amount += amount  # Restore previous sale
    elif bill_type == "LOSSDEGRADE":
        stock.current_amount += amount  # Restore previous loss
        if hasattr(stock, "loss_amount"):
            stock.loss_amount -= amount
    
    stock.save()


# ---------------------------------------------------
# Bill_detail Signal: Rollback Stock on Delete
# ---------------------------------------------------
@receiver(post_delete, sender=Bill_detail)
def rollback_stock_on_delete(sender, instance, **kwargs):
    """
    Rollback stock when a Bill_detail is deleted.
    Reverses the stock impact of the deleted bill line item.
    """
    bill_type = instance.bill.bill_type
    organization = instance.bill.organization
    product = instance.product
    amount = Decimal(instance.item_amount)
    
    # Get or create stock record
    stock, _ = Stock.objects.get_or_create(
        product=product,
        organization=organization,
        defaults={"current_amount": Decimal(0)},
    )
    
    # Rollback stock based on bill type
    if bill_type == "PURCHASE":
        stock.current_amount -= amount  # Remove purchase
    elif bill_type == "SELLING":
        stock.current_amount += amount  # Restore stock from sale
    elif bill_type == "LOSSDEGRADE":
        stock.current_amount += amount  # Restore lost stock
        if hasattr(stock, "loss_amount"):
            stock.loss_amount -= amount
    
    stock.save()


# ---------------------------------------------------
# Bill_detail Signal: Update Stock and Product Price
# ---------------------------------------------------
@receiver(post_save, sender=Bill_detail)
def update_stock_and_price(sender, instance, created, **kwargs):
    """
    Update product stock levels and prices after Bill_detail is saved.
    
    - For PURCHASE: increases stock, updates purchase price
    - For SELLING: decreases stock, updates selling price  
    - For LOSSDEGRADE: decreases stock, tracks loss amount
    """
    bill_type = instance.bill.bill_type
    organization = instance.bill.organization
    product = instance.product
    amount = Decimal(instance.item_amount)
    price = Decimal(instance.item_price)

    # Update Product_Detail with latest prices
    pd_obj, _ = Product_Detail.objects.get_or_create(
        product=product,
        organization=organization
    )
    
    if bill_type == "PURCHASE":
        pd_obj.purchased_price = price
    elif bill_type == "SELLING":
        pd_obj.selling_price = price
    
    pd_obj.save()

    # Update Stock levels
    stock, _ = Stock.objects.get_or_create(
        product=product,
        organization=organization,
        defaults={"current_amount": Decimal(0)},
    )
    
    if bill_type == "PURCHASE":
        stock.current_amount += amount  # Add to inventory
    elif bill_type == "SELLING":
        stock.current_amount -= amount  # Remove from inventory
    elif bill_type == "LOSSDEGRADE":
        stock.current_amount -= amount  # Remove lost items
        if hasattr(stock, "loss_amount"):
            stock.loss_amount += amount  # Track total losses
    
    stock.save()
