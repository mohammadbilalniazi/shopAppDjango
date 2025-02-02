from rest_framework import serializers
from .models import Product,Product_Detail,Stock,Service , SubService,Unit,Store
from django.db.models import Sum
from bill.models import Bill_detail

class ProductDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model=Product_Detail
        fields="__all__"

class ProductSerializer(serializers.ModelSerializer): #serializers.ModelSerializer
    product_detail=ProductDetailSerializer()
    current_amount=serializers.SerializerMethodField()
    category=serializers.SerializerMethodField()
    purchase_amount=serializers.SerializerMethodField()
    selling_amount=serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields =['id','item_name','model','product_detail','category','purchase_amount','selling_amount','current_amount']

    def get_purchase_amount(self,obj):
        self.purchase_amount=Bill_detail.objects.filter(bill__bill_type="PURCHASE",product=obj).aggregate(Sum("item_amount"))['item_amount__sum']
        if self.purchase_amount==None:
            self.purchase_amount=0
        # all_bill_current_amt=purchase_amount-selling_amount
        return self.purchase_amount
    
    def get_selling_amount(self,obj):
        self.selling_amount=Bill_detail.objects.filter(bill__bill_type="SELLING",product=obj).aggregate(Sum("item_amount"))['item_amount__sum']
        if self.selling_amount==None:
            self.selling_amount=0
        self.all_bill_current_amt=self.purchase_amount-self.selling_amount
        return self.selling_amount
    def get_category(self,obj):
        return obj.category.name

    def get_current_amount(self,obj):
        if not self.context.get('store_id'):
            return 0
        store=Store.objects.get(id=int(self.context.get('store_id')))
        stock_query=Stock.objects.filter(store=store,product=obj)

        if stock_query.count()>0:
            stock=stock_query[0]
            stock_current_amount=stock.current_amount
            if self.all_bill_current_amt!=stock_current_amount:
                stock_current_amount=self.all_bill_current_amt
                stock.save()
        else:
            stock_current_amount=self.all_bill_current_amt
            obj=Stock(store=store,product=obj,current_amount=stock_current_amount)
            obj.save()
        # if all_bill_current_amt!==current_amount:
        #     print("product ",obj,"actaul all_bill_current_amt ",all_bill_current_amt)
        # return self.all_bill_current_amt
        return stock_current_amount

class SubServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model=SubService
        fields=["service","sub_service_name","detail","html_id","is_active"]



class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model=Unit
        fields="__all__"
        
class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model=Store
        fields="__all__"
# SubService=("service","detail","html_id","is_active")
# Service=("service_name","category","detail","html_id","service_incharger","is_active")
#     
class ServiceSerializer(serializers.ModelSerializer):
    subservice_set=SubServiceSerializer(many=True)
    class Meta:
        model=Service
        fields=["subservice_set","service_name","category","detail","html_id","service_incharger","is_active"]
