from rest_framework import serializers
from .models import OrganizationUser

class OrganizationUserSerializer(serializers.ModelSerializer):
    user=serializers.SerializerMethodField()
    organization=serializers.SerializerMethodField()
    class Meta:
        model=OrganizationUser
        fields=("organization","user","is_active","img")
    def get_user(self,obj):
        return obj.user.username
    def get_organization(self,obj):
        return obj.organization.name
    