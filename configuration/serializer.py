from rest_framework.serializers import ModelSerializer
from .models import *

class TranslationSerializer(ModelSerializer):
    class Meta:
        model=Language_Detail
        fields="__all__"
    
