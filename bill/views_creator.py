from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializer import UserSerializer
# from .models import Purchaser
from django.contrib.auth.models import User

@api_view(('GET','POST'))
def show(request,id="all"):
    print("id=",id)
    if id=="all":
        query_set=User.objects.all().order_by('-pk')
    else:
        query_set=User.objects.filter(id=int(id))

    serializer=UserSerializer(query_set,many=True)

    return Response(serializer.data)

