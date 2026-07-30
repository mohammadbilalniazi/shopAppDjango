from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializer import UnitSerializer
from .models import Unit

        
from django.shortcuts import render
from django.http import JsonResponse
import json

def _parse_json_body(request):
    try:
        if request.content_type and 'application/json' in request.content_type:
            return json.loads(request.body.decode()) if request.body else {}
        return request.POST.dict()
    except Exception:
        return {}

def show(request, id="all"):
    # GET: return JSON when ?json=1 else render HTML page
    if request.method == "GET":
        if id == "all":
            query_set = Unit.objects.all().order_by('-pk')
        else:
            query_set = Unit.objects.filter(id=int(id))
        serializer = UnitSerializer(query_set, many=True)
        wants_json = (
            request.GET.get('json')
            or 'application/json' in request.headers.get('Accept', '')
            or request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        )
        if wants_json:
            return JsonResponse(serializer.data, safe=False)
        return render(request, 'configurations/unit_show.html', {'units': query_set})

    # POST: create units (accept JSON or form)
    data = _parse_json_body(request)
    # support creating a single unit or list
    if isinstance(data, dict):
        serializer = UnitSerializer(data=data)
    else:
        serializer = UnitSerializer(data=data, many=True)

    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, safe=False)
    return JsonResponse({'errors': serializer.errors}, status=400)




