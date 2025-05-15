from django.db import transaction
from .models import Bill, Bill_detail
from product.models import Stock,Store
from django.db.models import Sum
def update_all_stocks():
    print("Updating all stocks...")
    with transaction.atomic():  # Ensure atomicity for consistency
        # Iterate over all the bills
        for bill in Bill.objects.filter(bill_type__in=["PURCHASE", "SELLING"]):
            if hasattr(bill, 'bill_description') and bill.bill_description:
                    # Get the store associated with the bill
                store = bill.bill_description.store
                # For each bill, iterate over its details
                for bill_detail in Bill_detail.objects.filter(bill=bill):
                    try:
                        # Try to get the corresponding stock record
                        stock, created = Stock.objects.get_or_create(
                            store=store, product=bill_detail.product
                        )
                        # Defensive null handling
                        stock.current_amount = stock.current_amount or 0
                        stock.purchasing_amount = stock.purchasing_amount or 0
                        stock.selling_amount = stock.selling_amount or 0
                        # Update the stock based on the bill type
                        if bill.bill_type == "PURCHASE":
                            stock.current_amount += bill_detail.item_amount
                            stock.purchasing_amount += bill_detail.item_amount
                        elif bill.bill_type == "SELLING":
                            stock.current_amount -= bill_detail.item_amount
                            stock.selling_amount += bill_detail.item_amount       
                        # Save the updated stock
                        stock.save()

                    except Stock.DoesNotExist:
                        # In case stock doesn't exist (shouldn't happen with get_or_create)
                        print("Stock record not found for store:", store, "and product:", bill_detail.product)
            else:
                print("Bill description not found for bill:", bill.id)
def get_purchase_amount(obj):
    return Bill_detail.objects.filter(
        bill__bill_type="PURCHASE", product=obj
    ).aggregate(Sum("item_amount"))["item_amount__sum"] or 0

def get_selling_amount(obj):
    return Bill_detail.objects.filter(
        bill__bill_type="SELLING", product=obj
    ).aggregate(Sum("item_amount"))["item_amount__sum"] or 0

def get_current_amount(obj):
    store_id =None
    if not store_id:
        return None  # optional: raise serializers.ValidationError("store_id is required")

    store = Store.objects.get(id=int(store_id))

    purchase_amount = get_purchase_amount(obj)
    selling_amount = get_selling_amount(obj)
    actual_amount = purchase_amount - selling_amount

    stock, created = Stock.objects.get_or_create(store=store, product=obj)
    if stock.current_amount != actual_amount:
        stock.current_amount = actual_amount
        stock.save()

    return stock.current_amount