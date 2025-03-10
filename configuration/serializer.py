from rest_framework.serializers import ModelSerializer
from .models import Location,Organization


    
class LocationSerializer(ModelSerializer):
    class Meta:
        model=Location
        fields="__all__"


class OrganizationSerializer(ModelSerializer):
    class Meta:
        model=Organization
        fields="__all__"
