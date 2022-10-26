from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializer import *
from .models import *

@api_view(('GET','POST'))
def show(request,id="all"):
    print("id=",id)
    if id=="all":
        query_set=Product.objects.all().order_by('-pk')
    else:
        query_set=Product.objects.filter(id=int(id))

    serializer=ProductSerializer(query_set,many=True)

    return Response(serializer.data)


@api_view(['GET'])
def select_service(request,html_id="all",dest=None):  
    print("########id=",html_id)
    if html_id=="all":
        query_set=Service.objects.all().order_by('-pk')
    else:
        language_obj=Languages.objects.get(language=dest)
        query_set=Service.objects.filter(html_id=str(html_id),dest=language_obj)

    serializer=ServiceSerializer(query_set,many=True)

    return Response(serializer.data)




