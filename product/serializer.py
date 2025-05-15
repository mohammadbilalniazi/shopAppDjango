from rest_framework import serializers
from .models import Product,Product_Detail,Stock,Unit,Store
from django.db.models import Sum
from bill.models import Bill_detail

class ProductDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model=Product_Detail
        fields="__all__"
class ProductSerializer(serializers.ModelSerializer):
    product_detail = ProductDetailSerializer()
    current_amount = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    purchase_amount = serializers.SerializerMethodField()
    selling_amount = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'item_name', 'model', 'product_detail', 'category',
            'purchase_amount', 'selling_amount', 'current_amount'
        ]

    def get_purchase_amount(self, obj):
        return Bill_detail.objects.filter(
            bill__bill_type="PURCHASE", product=obj
        ).aggregate(Sum("item_amount"))["item_amount__sum"] or 0

    def get_selling_amount(self, obj):
        return Bill_detail.objects.filter(
            bill__bill_type="SELLING", product=obj
        ).aggregate(Sum("item_amount"))["item_amount__sum"] or 0

    def get_category(self, obj):
        return obj.category.name

    def get_current_amount(self, obj):
        store_id = self.context.get('store_id',None)
        if not store_id:
            return None  # optional: raise serializers.ValidationError("store_id is required")
        store = Store.objects.get(id=int(store_id))
        purchase_amount = self.get_purchase_amount(obj)
        selling_amount = self.get_selling_amount(obj)
        actual_amount = purchase_amount - selling_amount

        stock, created = Stock.objects.get_or_create(store=store, product=obj)
        if stock.current_amount != actual_amount:
            stock.current_amount = actual_amount
            stock.save()

        return stock.current_amount


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model=Unit
        fields="__all__"
        
class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model=Store
        fields="__all__"
