from rest_framework.serializers import ModelSerializer
from .models import Location,Language_Detail,Organization

class TranslationSerializer(ModelSerializer):
    class Meta:
        model=Language_Detail
        fields="__all__"
    
class LocationSerializer(ModelSerializer):
    class Meta:
        model=Location
        fields="__all__"


class OrganizationSerializer(ModelSerializer):
    class Meta:
        model=Organization
        fields="__all__"
