from django.db import models
from product.models import Product,Unit
from configuration.models import Organization,Location
from django.core.exceptions import ValidationError
from django.conf import settings
from common.date import current_shamsi_date
from django.dispatch import receiver
from product.models import Product_Detail
from asset.models import AssetBillSummary,AssetWholeBillSummary
from decimal import Decimal
from django.db.models.signals import pre_save, post_save, post_delete
from product.stock_utils import get_stock_for_scope

STATUS=((0,"CANCELLED"),(1,"CREATED"))
bill_types=(("PURCHASE","PURCHASE"),("SELLING","SELLING"),("PAYMENT","PAYMENT"),("RECEIVEMENT","RECEIVEMENT"),("LOSSDEGRADE","LOSSDEGRADE"),("EXPENSE","EXPENSE"))
bill_types_update_with_bill_receiver2=['PURCHASE','SELLING','PAYMENT','RECEIVEMENT']
def get_year():
    return int(current_shamsi_date().split("-")[0])

def get_date():
    return current_shamsi_date()


def _to_decimal(value):
    if isinstance(value, Decimal):
        return value
    if value is None:
        return Decimal(0)
    return Decimal(str(value))


class Bill(models.Model):
    bill_no=models.IntegerField()
    bill_type=models.CharField(max_length=11,default="PURCHASE",choices=bill_types)  
    organization = models.ForeignKey(
        Organization, on_delete=models.PROTECT,null=True
    )  # New field
    branch = models.ForeignKey(
        'configuration.Branch', on_delete=models.SET_NULL, null=True, blank=True,
        help_text="Branch where this bill was created"
    )
    creator=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT,null=True,blank=True,related_name="creator_set")
    total=models.DecimalField(default=Decimal(0),max_digits=20,decimal_places=5)
    payment=models.DecimalField(default=Decimal(0),max_digits=20,decimal_places=5)
    year=models.SmallIntegerField(default=get_year)
    date=models.CharField(max_length=10,default=get_date)  
    profit=models.IntegerField(default=0)
    status=models.SmallIntegerField(choices=STATUS,default=0) # 0 created 1 approved 2 reversed  3  rejected
    currency=models.CharField(max_length=7,default="afg")
    shipment_location=models.ForeignKey(Location,on_delete=models.PROTECT,null=True,default=None)

    def clean(self):
        if self.branch and self.organization and self.branch.organization_id != self.organization_id:
            raise ValidationError("Selected branch does not belong to the selected organization.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

class Bill_Receiver2(models.Model):
    bill=models.OneToOneField(Bill,on_delete=models.CASCADE)
    bill_rcvr_org=models.ForeignKey(Organization,on_delete=models.PROTECT,null=True,blank=True)
    is_approved=models.BooleanField(default=False,null=True,blank=True)
    approval_date=models.DateField(null=True,blank=True)
    approval_user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT,null=True,blank=True,default=None)

# ---------------------------------------------------
# Summary recompute helper (single source of truth)
# ---------------------------------------------------
def _recompute_bill_summaries(organization, bill_type):
    """
    Rebuild AssetBillSummary and AssetWholeBillSummary for (organization,
    bill_type) directly from the Bill table.

    Recomputing from source (instead of incremental +=/set updates) keeps the
    Financial Summary and Organization Ledger correct no matter how bills are
    created, edited, approved, re-typed or deleted. The previous incremental
    logic overwrote aggregates with a single bill's value on update/approval,
    silently dropping every other bill's contribution.
    """
    if organization is None:
        return

    from django.db.models import Sum

    bills = Bill.objects.filter(organization=organization, bill_type=bill_type)

    # --- Aggregate summary across all years and receivers ---
    agg = bills.aggregate(total=Sum('total'), payment=Sum('payment'), profit=Sum('profit'))
    whole, _ = AssetWholeBillSummary.objects.get_or_create(
        organization=organization,
        bill_type=bill_type,
        defaults={'total': Decimal(0), 'payment': Decimal(0), 'profit': 0},
    )
    whole.total = _to_decimal(agg['total'])
    whole.payment = _to_decimal(agg['payment'])
    whole.profit = int(agg['profit'] or 0)
    whole.save()

    # --- Detail summary per (receiver org, year) ---
    groups = bills.values('year', 'bill_receiver2__bill_rcvr_org').annotate(
        total=Sum('total'), payment=Sum('payment'), profit=Sum('profit'),
    )
    live_keys = set()
    for g in groups:
        year = g['year']
        rcvr_id = g['bill_receiver2__bill_rcvr_org']
        live_keys.add((rcvr_id, year))
        detail, _ = AssetBillSummary.objects.get_or_create(
            organization=organization,
            bill_rcvr_org_id=rcvr_id,
            bill_type=bill_type,
            year=year,
            branch=None,
            defaults={'total': Decimal(0), 'payment': Decimal(0), 'profit': 0},
        )
        detail.total = _to_decimal(g['total'])
        detail.payment = _to_decimal(g['payment'])
        detail.profit = int(g['profit'] or 0)
        detail.save()

    # --- Zero out detail rows that no longer have any bills ---
    for stale in AssetBillSummary.objects.filter(organization=organization, bill_type=bill_type):
        if (stale.bill_rcvr_org_id, stale.year) not in live_keys:
            if stale.total or stale.payment or stale.profit:
                stale.total = Decimal(0)
                stale.payment = Decimal(0)
                stale.profit = 0
                stale.save()


# ---------------------------------------------------
# Bill_Receiver2 Signals: keep inter-org summaries in sync
# ---------------------------------------------------
@receiver(post_save, sender=Bill_Receiver2)
def handle_bill_receiver(sender, instance, created, **kwargs):
    """Recompute summaries when an inter-org bill's receiver record changes."""
    bill = instance.bill
    if bill is not None:
        _recompute_bill_summaries(bill.organization, bill.bill_type)


@receiver(post_delete, sender=Bill_Receiver2)
def rollback_bill_receiver(sender, instance, **kwargs):
    """Recompute summaries when an inter-org bill's receiver record is removed."""
    bill = getattr(instance, 'bill', None)
    if bill is not None:
        try:
            _recompute_bill_summaries(bill.organization, bill.bill_type)
        except Exception:
            pass


# ---------------------------------------------------
# Bill Signals: recompute summaries whenever a Bill changes
# ---------------------------------------------------
@receiver(post_save, sender=Bill)
def update_asset_bill_summary(sender, instance, created, **kwargs):
    """Recompute summaries for the saved bill's (organization, type)."""
    _recompute_bill_summaries(instance.organization, instance.bill_type)


@receiver(post_delete, sender=Bill)
def rollback_asset_bill_summary(sender, instance, **kwargs):
    """Recompute summaries after a Bill is deleted."""
    _recompute_bill_summaries(instance.organization, instance.bill_type)


class Bill_detail(models.Model):
    bill=models.ForeignKey(Bill,on_delete=models.CASCADE)
    product=models.ForeignKey(Product,on_delete=models.PROTECT,null=False, blank=False)
    unit=models.ForeignKey(Unit,on_delete=models.PROTECT,null=True, blank=True)
    item_amount =models.DecimalField(default=Decimal(0),max_digits=15,decimal_places=5)
    item_price=models.DecimalField(default=Decimal(0),max_digits=15,decimal_places=5)
    return_qty=models.IntegerField(null=True,blank=True)
    discount=models.IntegerField(default=0)
    profit=models.IntegerField(default=None,null=True)
    def __str__(self):
        return f"{self.id}"
    class Meta:
        # unique_together =("bill","product",)
        verbose_name_plural = "Bill detail"


# ---------------------------------------------------
# Bill_detail Signal: Revert Stock Before Update
# ---------------------------------------------------
def _bill_detail_net_qty(bill_detail):
    amount = Decimal(bill_detail.item_amount or 0)
    returns = Decimal(bill_detail.return_qty or 0)
    return amount - returns


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
    net_qty = _bill_detail_net_qty(old_instance)
    
    # Get or create stock record
    stock = get_stock_for_scope(
        product=product,
        organization=organization,
        branch=old_instance.bill.branch,
        defaults={"current_amount": Decimal(0)},
        align_branch=True,
    )
    
    # Revert stock based on bill type
    if bill_type == "PURCHASE":
        stock.current_amount -= net_qty  # Remove previous purchase quantity
    elif bill_type == "SELLING":
        stock.current_amount += net_qty  # Restore previous sale quantity
    elif bill_type == "LOSSDEGRADE":
        stock.current_amount += net_qty  # Restore previous loss quantity
        if hasattr(stock, "loss_amount"):
            stock.loss_amount -= net_qty
    
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
    net_qty = _bill_detail_net_qty(instance)
    
    # Get or create stock record
    stock = get_stock_for_scope(
        product=product,
        organization=organization,
        branch=instance.bill.branch,
        defaults={"current_amount": Decimal(0)},
        align_branch=True,
    )
    
    # Rollback stock based on bill type
    if bill_type == "PURCHASE":
        stock.current_amount -= net_qty  # Remove purchase quantity
    elif bill_type == "SELLING":
        stock.current_amount += net_qty  # Restore stock from sale
    elif bill_type == "LOSSDEGRADE":
        stock.current_amount += net_qty  # Restore lost stock
        if hasattr(stock, "loss_amount"):
            stock.loss_amount -= net_qty
    
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
    net_qty = _bill_detail_net_qty(instance)
    price = Decimal(instance.item_price)

    # Update Product_Detail with latest prices
    pd_obj, _ = Product_Detail.objects.get_or_create(
        product=product,
        defaults={"organization": organization}
    )
    if pd_obj.organization is None:
        pd_obj.organization = organization
    
    if bill_type == "PURCHASE":
        pd_obj.purchased_price = price
    elif bill_type == "SELLING":
        pd_obj.selling_price = price
    
    pd_obj.save()

    # Update Stock levels
    stock = get_stock_for_scope(
        product=product,
        organization=organization,
        branch=instance.bill.branch,
        defaults={"current_amount": Decimal(0)},
        align_branch=True,
    )
    
    if bill_type == "PURCHASE":
        stock.current_amount += net_qty  # Add net quantity to inventory
    elif bill_type == "SELLING":
        stock.current_amount -= net_qty  # Remove net quantity from inventory
    elif bill_type == "LOSSDEGRADE":
        stock.current_amount -= net_qty  # Remove lost net quantity
        if hasattr(stock, "loss_amount"):
            stock.loss_amount += net_qty  # Track total losses
    
    stock.save()


# ---------------------------------------------------
# LedgerAdjustment: Manual ledger correction record
# ---------------------------------------------------
class LedgerAdjustment(models.Model):
    """
    Manual adjustment to the running ledger between two organizations.
    Positive amount  => the opposite_org owes the organization more.
    Negative amount  => the organization owes the opposite_org more.
    Created by the organization owner/admin directly from the Ledger Summary page.
    """
    organization = models.ForeignKey(
        Organization, on_delete=models.PROTECT,
        related_name='ledger_adjustments_as_org'
    )
    opposite_org = models.ForeignKey(
        Organization, on_delete=models.PROTECT,
        related_name='ledger_adjustments_as_opposite'
    )
    amount = models.DecimalField(max_digits=20, decimal_places=5)
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT
    )
    date = models.CharField(max_length=10, default=get_date)
    year = models.SmallIntegerField(default=get_year)

    class Meta:
        ordering = ['date', 'id']

    def __str__(self):
        return f"Adj {self.organization} ↔ {self.opposite_org}: {self.amount}"
