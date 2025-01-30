# from csv import list_dialects
from re import S
from django.contrib import admin
# from django import forms
# from django.forms import ValidationError 
# from django.urls import reverse,path
# from django.utils.http import urlencode
# from requests import request
from .models import Services,Request
from django.utils.html import format_html
# from django.http import HttpResponseRedirect
#from django.urls import path 
# Register your models here.
# from django.forms import CheckboxSelectMultiple
 
from django.contrib import admin
# from jalali_date import datetime2jalali, date2jalali
# from jalali_date.admin import ModelAdminJalaliMixin, StackedInlineJalaliMixin, TabularInlineJalaliMixin	

from django.contrib import admin
# from django.contrib.auth.models import User
# from django.contrib.auth.admin import UserAdmin
from .models import * 


def get_model_fields(model):
    field_list=[field.name for field in model._meta.get_fields()]
    return field_list

# @admin.register(Services)
class ServicesAdmin(admin.ModelAdmin):
    list_display =("service","request")
    #list_display=get_model_fields(Services)  
    ("REJECTED","REJECTED"),("ACCEPTED","ACCEPTED"),("PENDING","PENDING")
# @admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    #list_display=get_model_fields(Request)
    list_display =("get_requester_name","requester_email","requester_contact","get_requests","status")
    list_editable=("status",)
    def get_requests(self,obj):
        obj=obj.services_set.all().values_list("service",flat=True)
        return list(obj)

    def get_requester_name(self,obj):
        if obj.status=="ACCEPTED":
            color="green"
        elif obj.status=="REJECTED":
            color="red"
        else:
            color="yellow" 
        return format_html("<b style='background-color:{}'>{}</b>".format(color,obj.requester_name))
    
    
    
    

