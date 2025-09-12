from rest_framework import serializers
from .models import OrganizationUser
from django.contrib.auth.models import User

class OrganizationUserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationUser
        fields = '__all__'    

class OrganizationUserSerializer(serializers.ModelSerializer):
    img = serializers.SerializerMethodField()
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    username= serializers.CharField(source='user.username',read_only=True)
    organization=serializers.CharField(source='organization.name',read_only=True)
    class Meta:
        model = OrganizationUser
        fields = '__all__'
    def get_img(self, obj):
        request = self.context.get('request')
        if obj.img and hasattr(obj.img, 'url'):
            if request is not None: 
                return request.build_absolute_uri(obj.img.url)
            else:
                return obj.img.url
        return None
    


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields="__all__"