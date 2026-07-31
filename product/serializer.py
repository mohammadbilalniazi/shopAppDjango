from rest_framework import serializers
from .models import Product,Product_Detail,Stock,Unit
from .stock_utils import get_stock_for_scope
from configuration.models import Organization
from django.db.models import Sum


def _sum_or_zero(data, key):
    return data.get(key) or 0


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

        if branch is None:
            totals = Stock.objects.filter(
                product=obj,
                organization=organization,
            ).aggregate(
                current_amount=Sum('current_amount'),
                selling_amount=Sum('selling_amount'),
                purchasing_amount=Sum('purchasing_amount'),
                loss_amount=Sum('loss_amount'),
            )
            if any(value is not None for value in totals.values()):
                self.stock = Stock(
                    product=obj,
                    organization=organization,
                    current_amount=_sum_or_zero(totals, 'current_amount'),
                    selling_amount=_sum_or_zero(totals, 'selling_amount'),
                    purchasing_amount=_sum_or_zero(totals, 'purchasing_amount'),
                    loss_amount=_sum_or_zero(totals, 'loss_amount'),
                )
                self._stock_product_id = obj.id
                return self.stock

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
