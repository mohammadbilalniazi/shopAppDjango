from rest_framework import serializers
from .models import OrganizationUser
from django.contrib.auth.models import User

class OrganizationUserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationUser
        fields = '__all__'
    
    def validate(self, attrs):
        """
        Allow a user to belong to multiple organizations, but only once per
        organization.
        """
        user = attrs.get("user", getattr(self.instance, "user", None))
        organization = attrs.get("organization", getattr(self.instance, "organization", None))

        if user and organization:
            duplicate = OrganizationUser.objects.filter(user=user, organization=organization)
            if self.instance:
                duplicate = duplicate.exclude(pk=self.instance.pk)
            if duplicate.exists():
                raise serializers.ValidationError(
                    "This user is already assigned to this organization."
                )

        return attrs    

class OrganizationUserSerializer(serializers.ModelSerializer):
    img = serializers.SerializerMethodField()
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    username= serializers.CharField(source='user.username',read_only=True)
    organization=serializers.CharField(source='organization.name',read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True, default=None)
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
