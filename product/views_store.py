from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializer import StoreSerializer
from .models import Store
from configuration.models import Organization
@api_view(('GET','POST'))
def show(request,id=None,organization="all"):
    print("id=",id)
    if request.method=="GET":
        if id==None or id=="" or id=="all":
            if organization=="all":
            
                query_set=Store.objects.all().order_by('-pk')
            else:
                organization=Organization.objects.get(id=int(organization))
                query_set=Store.objects.filter(organization=organization).order_by('-pk')
        else:
            query_set=Store.objects.filter(name=str(id))
            print("query_set=",query_set)
        serializer=StoreSerializer(query_set,many=True)
    else:
        # print("request.data ",request.data)
        data=request.data
        serializer=StoreSerializer(data=data,many=True)
        if serializer.is_valid(): 
            serializer.save()
    return Response(serializer.data)




