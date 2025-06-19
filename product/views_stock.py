from .serializer import StockUpdateSerializer
from .models import Stock,Product
from configuration.models import Organization
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status

@csrf_exempt
@api_view(['POST'])
def update(request):
    data=request.data.copy()
    print("############data ",data)
    current_amount=request.data.get('current_amount',0)
    product_id=request.data.get('product_id',None)
    organization_id=request.data.get('organization_id',None)

    product=Product.objects.get(id=int(product_id))
    organization=Organization.objects.get(id=int(organization_id))
    data['product']=product.id
    data['organization']=organization.id
    data['current_amount']=current_amount
    stock,_=Stock.objects.get_or_create(product=product,organization=organization)
    serializer=StockUpdateSerializer(stock,data=data,partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    print("###########serializer errors",serializer.errors)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

    