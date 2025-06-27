from rest_framework import serializers
from .models import Product,Product_Detail,Stock,Unit
from configuration.models import Organization
class ProductDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model=Product_Detail
        fields="__all__"
class StockUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model=Stock
        fields= ['id','organization', 'product',
            'current_amount', 'selling_amount', 'purchasing_amount']
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
        organization=Organization.objects.get(id=int(self.context.get('organization')))
        self.stock,_=Stock.objects.get_or_create(organization=organization,product=obj) 
        # self.all_purchasing_amount=Bill_detail.objects.filter(bill__bill_type="PURCHASE",product=obj).aggregate(Sum("item_amount"))['item_amount__sum']
        # if self.all_purchasing_amount is None:
        # self.all_purchasing_amount=0
        return self.stock.purchasing_amount
    
    def get_selling_amount(self,obj):
        # self.all_selling_amount=Bill_detail.objects.filter(bill__bill_type="SELLING",product=obj).aggregate(Sum("item_amount"))['item_amount__sum']
        # if self.all_selling_amount is None:
        #     self.all_selling_amount=0
        return self.stock.selling_amount
    def get_category(self,obj):
        return obj.category.name

    def get_current_amount(self,obj):
        # self.all_bill_current_amt=self.all_purchasing_amount-self.all_selling_amount
        # if self.all_bill_current_amt!=self.stock.current_amount:
        #     stock_current_amount=self.all_bill_current_amt
        #     self.stock.current_amount=stock_current_amount
        #     self.stock.save()
        return self.stock.current_amount
  

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model=Unit
        fields="__all__"
        
#    