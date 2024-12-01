from rest_framework import serializers
from .models import Bill_detail,Bill,Bill_Description,Bill_Receiver2
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



       
class Bill_Description_Serializer(serializers.ModelSerializer):
    class Meta:
        model=Bill_Description
        fields='__all__'

class Bill_Receiver2_Serializer(serializers.ModelSerializer):
    bill_rcvr_org=serializers.SerializerMethodField()
    store=serializers.SerializerMethodField()
    class Meta:
        model=Bill_Receiver2
        fields=['bill_rcvr_org','store']

    def get_bill_rcvr_org(self,obj):
        return obj.bill_rcvr_org.name

    
    def get_store(self,obj):
        return obj.store.name


class Bill_search_Serializer(serializers.ModelSerializer):
    # bill_description=Bill_Description_Serializer()
    bill_receiver2=Bill_Receiver2_Serializer()
    class Meta:
        model=Bill  
        fields=["id","bill_receiver2","bill_type","bill_no","payment","date","organization","creator","total"] #month===> kaifyath_haziri

class Bill_Create_Serializer(serializers.ModelSerializer):
    bill_detail_set = Bill_detail_Serializer(many=True)
    bill_receiver2=Bill_Receiver2_Serializer()
    bill_description=Bill_Description_Serializer()
    class Meta:
        model=Bill
        # fields=["id","bill_detail_set","bill_description","payment","date","creator","total"] #month===> kaifyath_haziri
        fields=["id","bill_receiver2","payment","date","creator","total"] #month===> kaifyath_haziri

    def create(self, validated_data):
        bill_detail_set = validated_data.pop('bill_detail_set')
        bill_description = validated_data.pop('bill_description')
        bill = Bill.objects.create(**validated_data)
        bill.save()
        for bill_detail in bill_detail_set:
            bill_detail_obj = Bill_detail.objects.create(bill=bill, **bill_detail)
            bill_detail_obj.save()
        bill_description_obj=Bill_Description.objects.create(bill=bill,**bill_description)
        bill_description_obj.save()
        return bill
