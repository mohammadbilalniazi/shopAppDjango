from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializer import ProductSerializer
from .models import Product

@api_view(('GET','POST'))
def show(request,id=None):
    print("id=",id)
    if id==None:
        query_set=Product.objects.all().order_by('-pk')
    else:
        query_set=Product.objects.filter(id=int(id))

    serializer=ProductSerializer(query_set,many=True)

    return Response(serializer.data)


