from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializer import *
from .models import Location

@api_view(('GET','POST'))
def show(request,id="all"):
    print("id=",id)
    if id=="all":
        query_set=Location.objects.all().order_by('-pk')
    else:
        query_set=Location.objects.filter(id=int(id))

    serializer=LocationSerializer(query_set,many=True)

    return Response(serializer.data) 