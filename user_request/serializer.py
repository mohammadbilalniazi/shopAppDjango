from django.http import HttpResponse
from rest_framework import serializers,response
from jalali_date import datetime2jalali, date2jalali
import datetime
from .models import Request,Services
from django.db.models import Sum
from django.contrib.auth.models import User

        
class ServicesSerializer(serializers.ModelSerializer):
    class Meta:
        model=Services
        fields='__all__'
        #fields=["id","user_id","total_present","total_absent","total_leave","status"]

class RequestSerializer(serializers.ModelSerializer):
    services_set = ServicesSerializer(many=True)
    class Meta:
        model=Request
        fields=["id","services_set","requester_name","requester_email","requester_contact"] #month===> kaifyath_haziri #month===> kaifyath_haziri
        #fields='__all__'
        # requester_name=models.CharField(max_length=30)
        # requester_email
    def create(self, validated_data):
        services_set = validated_data.pop('services_set')
        request = Request.objects.create(**validated_data)
        request.save()
        for service in services_set:
            h = Services.objects.create(request=request, **service)
            h.save()
        return request
