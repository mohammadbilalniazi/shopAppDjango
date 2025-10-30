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
    loss_amount=serializers.SerializerMethodField()
    img=serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields =['id','item_name','model','img','product_detail','category','purchase_amount','selling_amount','current_amount','loss_amount']

    def get_purchase_amount(self,obj):
        organization_id = self.context.get('organization')
        if organization_id is None:
            # If no organization specified, return 0 or skip stock lookup
            self.stock = Stock(purchasing_amount=0, selling_amount=0, current_amount=0, loss_amount=0)
            return 0
        
        organization = Organization.objects.get(id=int(organization_id))
        self.stock, _ = Stock.objects.get_or_create(organization=organization, product=obj)
        return self.stock.purchasing_amount
    def get_img(self,obj):
        request=self.context.get("request",None)
        if obj.img and hasattr(obj.img,"url"):
            if request:
                return request.build_absolute_uri(obj.img.url)
            else:
                return obj.img.url
        return None
    def get_selling_amount(self,obj):
        return self.stock.selling_amount
    def get_category(self,obj):
        return obj.category.name
    def get_current_amount(self,obj):
        return self.stock.current_amount
    def get_loss_amount(self,obj):
        return self.stock.loss_amount
  
class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model=Unit
        fields="__all__"
        
#    