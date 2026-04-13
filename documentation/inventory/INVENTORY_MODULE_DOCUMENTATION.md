Inventory Module Documentation

1. Module Scope

Inventory management in this project is implemented primarily through:
- product/models.py (Stock and Product_Detail)
- product/views_stock.py (stock update and list)
- product/views_product.py (stock creation during product save)
- configuration/Branch integration

The inventory design is organization-aware and branch-aware.

2. Inventory Data Models

Stock

```python
class Stock(models.Model):
    organization=models.ForeignKey(Organization,on_delete=models.CASCADE,default=None,blank=True,null=True)
    branch=models.ForeignKey('configuration.Branch',on_delete=models.CASCADE,null=True,blank=True)
    product=models.ForeignKey(Product,on_delete=models.CASCADE,null=True,blank=True)
    current_amount= models.DecimalField(default=0,max_digits=22, decimal_places=2)
    selling_amount= models.DecimalField(default=0,max_digits=22, decimal_places=2)
    purchasing_amount= models.DecimalField(default=0,max_digits=22, decimal_places=2)
    loss_amount= models.DecimalField(default=0,max_digits=22, decimal_places=2)

    class Meta:
        unique_together=("organization","product","branch")
```

Branch-organization consistency is enforced:

```python
def clean(self):
    if self.branch and self.organization and self.branch.organization != self.organization:
        raise ValidationError("Selected branch does not belong to the selected organization.")
```

Product_Detail
Contains organization-specific product settings used by stock flow.

```python
class Product_Detail(models.Model):
    product=models.OneToOneField(Product,on_delete=models.CASCADE,null=True,blank=True,unique=True)
    organization=models.ForeignKey(Organization,on_delete=models.DO_NOTHING,default=None,blank=True,null=True)
    branch=models.ForeignKey('configuration.Branch',on_delete=models.SET_NULL,null=True,blank=True)
    minimum_requirement=models.IntegerField(default=1)
    purchased_price= models.DecimalField(default=0,max_digits=22, decimal_places=2,null=True)
    selling_price=models.DecimalField(default=0,max_digits=22, decimal_places=2,null=True)
```

3. Stock Update API

From product/views_stock.py:

```python
@csrf_exempt
@api_view(['POST'])
def update(request):
    data = request.data.copy()
    current_amount = request.data.get('current_amount', 0)
    product_id = request.data.get('product_id', None)
    organization_id = request.data.get('organization_id', None)
    branch_id = request.data.get('branch_id', None)

    product = Product.objects.get(id=int(product_id))
    organization = Organization.objects.get(id=int(organization_id))

    # Resolve optional branch, validated against organization
    branch = None
    if branch_id:
        try:
            branch = Branch.objects.get(
                id=int(branch_id),
                organization=organization,
                is_active=True
            )
        except Branch.DoesNotExist:
            pass  # branch is optional

    data['product'] = product.id
    data['organization'] = organization.id
    data['branch'] = branch.id if branch else None
    data['current_amount'] = current_amount

    stock, _ = Stock.objects.get_or_create(
        product=product,
        organization=organization,
        branch=branch,
        defaults={'current_amount': 0}
    )
    serializer = StockUpdateSerializer(stock, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

Behavior summary:
- Accepts product, organization, and optional branch
- Validates branch belongs to the given organization before assigning it
- Creates stock row if missing using get_or_create
- Performs partial update through serializer and returns saved data

4. Stock Listing And Branch Filtering

From product/views_stock.py:

```python
@login_required(login_url='/admin')
def list_stocks(request):
    self_organization, user_orgs = find_userorganization(request)

    if self_organization is not None:
        branches = Branch.objects.filter(organization=self_organization, is_active=True)
        stock_query = Stock.objects.filter(organization=self_organization).select_related('product', 'branch')
    else:
        branches = Branch.objects.filter(organization__in=user_orgs, is_active=True)
        stock_query = Stock.objects.filter(organization__in=user_orgs).select_related('product', 'branch')
```

This supports multi-organization users while preserving access boundaries.

5. Inventory Initialization In Product Workflow

From product/views_product.py:

```python
stock, created = Stock.objects.get_or_create(
    product=product,
    organization=org_for_product,
    branch=branch_for_product,
    defaults={'current_amount': stock_detail.get("current_amount", 0)}
)

if not created:
    stock.current_amount = stock_detail.get("current_amount", stock.current_amount)
    stock.save()
```

This guarantees stock existence whenever a product is created or updated.

6. Main Routes

Registered in shop/urls.py:

```python
path('stock/update/', views_stock.update, name='update_stock')
path('stock/list/', views_stock.list_stocks, name='stock_list')
```

7. Thesis Discussion Points

1. Explain inventory as an organization-plus-branch keyed entity.
2. Discuss lazy initialization using get_or_create for resilient operations.
3. Analyze validation rules that prevent cross-organization branch mismatch.
4. Show how inventory is integrated into product lifecycle instead of isolated CRUD.
