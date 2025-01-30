from bill.models import Bill_detail
from django.db.models import Sum
from django.http import JsonResponse
from product.models import Product,Stock,Store
from rest_framework.decorators import api_view
def generate_product_report(product_query,store):
    bill_detail_query=Bill_detail.objects.filter(bill__bill_description__store=store)
    for product in product_query:
        selling_amount=bill_detail_query.filter(product=product,bill__bill_type='SELLING').aggregate(Sum('item_amount'))['item_amount__sum']
        purchasing_amount=bill_detail_query.filter(product=product,bill__bill_type='PURCHASE').aggregate(Sum('item_amount'))['item_amount__sum']
        selling_return_amount=bill_detail_query.filter(product=product,bill__bill_type='SELLING').aggregate(Sum('return_qty'))['return_qty__sum']
        purchasing_return_amount=bill_detail_query.filter(product=product,bill__bill_type='PURCHASE').aggregate(Sum('return_qty'))['return_qty__sum']
        if selling_amount==None:
            selling_amount=0
        if purchasing_amount==None:
            purchasing_amount=0
        if purchasing_return_amount==None:
            purchasing_return_amount=0
        if selling_return_amount==None:
            selling_return_amount=0
        current_amount=(purchasing_amount-purchasing_return_amount)-(selling_amount-selling_return_amount)
        stock_query=Stock.objects.filter(product=product,store=store)
        if len(stock_query)>0:
            stock=stock_query[0]
        else: 
            stock=Stock(product=product,store=store) 
        # stock.current_amount=current_amount 
        stock.save()
    return True
@api_view(('GET',))
def generate_product_ihsaya_service(request,store_id):
    product_query=Product.objects.all()
    store=Store.objects.get(id=int(store_id))
    ok=generate_product_report(product_query,store)
    return JsonResponse({"ok":ok})
