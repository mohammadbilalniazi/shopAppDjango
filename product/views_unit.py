from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializer import UnitSerializer
from .models import Unit

        
@api_view(('GET','POST'))
def show(request,id="all"):
    print("id=",id)
    if request.method=="GET":
        if id=="all":
            query_set=Unit.objects.all().order_by('-pk')
        else:
            query_set=Unit.objects.filter(id=int(id))
        serializer=UnitSerializer(query_set,many=True)
    else:
        # print("request.data ",request.data)
        data=request.data
        # return Response(request.data)
        serializer=UnitSerializer(data=data,many=True)
        if serializer.is_valid():
            serializer.save()
        # query_set=Unit.objects.create(request.data)
    return Response(serializer.data)




