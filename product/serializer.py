from rest_framework import serializers
from .models import Product,Product_Detail,Stock,Unit
from .stock_utils import get_stock_for_scope
from configuration.models import Organization
class ProductDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model=Product_Detail
        fields="__all__"
class StockUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model=Stock
        fields= ['id','organization', 'product', 'branch',
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

    def _get_stock(self, obj):
        if getattr(self, '_stock_product_id', None) == obj.id and hasattr(self, 'stock'):
            return self.stock

        organization_id = self.context.get('organization')
        if organization_id is None:
            self.stock = Stock(purchasing_amount=0, selling_amount=0, current_amount=0, loss_amount=0)
            self._stock_product_id = obj.id
            return self.stock
        
        organization = Organization.objects.get(id=int(organization_id))
        try:
            branch = obj.product_detail.branch if obj.product_detail else None
        except Product_Detail.DoesNotExist:
            branch = None
        if branch and branch.organization_id != organization.id:
            branch = None

        self.stock = get_stock_for_scope(
            product=obj,
            organization=organization,
            branch=branch,
            align_branch=True,
        )
        if self.stock.branch_id != (branch.id if branch else None):
            self.stock.save(update_fields=['branch'])

        self._stock_product_id = obj.id
        return self.stock

    def get_purchase_amount(self,obj):
        return self._get_stock(obj).purchasing_amount
    def get_img(self,obj):
        request=self.context.get("request",None)
        if obj.img and hasattr(obj.img,"url"):
            if request:
                return request.build_absolute_uri(obj.img.url)
            else:
                return obj.img.url
        return None
    def get_selling_amount(self,obj):
        return self._get_stock(obj).selling_amount
    def get_category(self,obj):
        return obj.category.name
    def get_current_amount(self,obj):
        return self._get_stock(obj).current_amount
    def get_loss_amount(self,obj):
        return self._get_stock(obj).loss_amount
  
class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model=Unit
        fields="__all__"
