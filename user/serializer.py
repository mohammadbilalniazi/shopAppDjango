from rest_framework import serializers
from .models import OrganizationUser
from django.contrib.auth.models import User

class OrganizationUserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationUser
        fields = '__all__'
    
    def validate_user(self, value):
        """
        Ensure that a user can only belong to one organization.
        """
        # Skip validation if we're updating an existing instance
        if self.instance:
            return value
        
        # Check if the user already belongs to an organization
        if OrganizationUser.objects.filter(user=value).exists():
            raise serializers.ValidationError(
                "This user already belongs to an organization. One user can only belong to one organization."
            )
        return value    

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