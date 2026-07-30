from rest_framework import serializers
from .models import Bill_detail,Bill,Bill_Receiver2
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields="__all__"

class Bill_detail_Serializer(serializers.ModelSerializer):
    class Meta:
        model=Bill_detail
        fields='__all__'
        fields=["id","product","item_amount","item_price","return_qty","profit"]

       
class Bill_Receiver2_Serializer(serializers.ModelSerializer):
    bill_rcvr_org=serializers.SerializerMethodField()
    class Meta:
        model=Bill_Receiver2
        fields=['bill_rcvr_org', 'is_approved', 'approval_date', 'approval_user']

    def get_bill_rcvr_org(self,obj):
        return obj.bill_rcvr_org.name


class BillSearchSerializer(serializers.ModelSerializer):
    bill_receiver2=Bill_Receiver2_Serializer()
    organization=serializers.SerializerMethodField()
    is_approved=serializers.SerializerMethodField()
    can_approve=serializers.SerializerMethodField()
    class Meta:
        model=Bill  
        fields=["id","bill_receiver2","bill_type","bill_no","payment","date","organization","creator","total","currency","is_approved","can_approve"] #month===> kaifyath_haziri
    def get_organization(self,obj):
        return obj.organization.name
    def get_is_approved(self,obj):
        return bool(getattr(getattr(obj, "bill_receiver2", None), "is_approved", False))
    def get_can_approve(self,obj):
        request = self.context.get("request")
        if request is None:
            return False
        if not hasattr(obj, "bill_receiver2") or obj.bill_receiver2.is_approved:
            return False
        if request.user.is_superuser:
            return True
        from user.models import OrganizationUser
        org_ids = [obj.organization_id]
        receiver_org_id = getattr(obj.bill_receiver2, "bill_rcvr_org_id", None)
        if receiver_org_id:
            org_ids.append(receiver_org_id)
        return OrganizationUser.objects.filter(
            user=request.user,
            organization_id__in=org_ids,
            is_active=True,
            role__in=("admin", "superuser", "owner"),
        ).exists()
class Bill_Create_Serializer(serializers.ModelSerializer):
    bill_detail_set = Bill_detail_Serializer(many=True)
    bill_receiver2=Bill_Receiver2_Serializer()
    class Meta:
        model=Bill
        fields=["id","bill_receiver2","payment","date","creator","total"] #month===> kaifyath_haziri
    def create(self, validated_data):
        bill_detail_set = validated_data.pop('bill_detail_set')
        bill = Bill.objects.create(**validated_data)
        bill.save()
        for bill_detail in bill_detail_set:
            bill_detail_obj = Bill_detail.objects.create(bill=bill, **bill_detail)
            bill_detail_obj.save()
        return bill
