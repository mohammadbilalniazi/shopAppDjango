# from django.shortcuts import render
# from django.http import HttpResponse,HttpResponseRedirect
# from django.template import loader
# from datetime import datetime #,date 
# from django.contrib import messages
# from jalali_date import date2jalali,datetime2jalali
# # from jalali_date.admin import ModelAdminJalaliMixin, StackedInlineJalaliMixin, TabularInlineJalaliMixin	
# from django.contrib.auth.decorators import login_required,permission_required
# from .serializers import Haziri_Serializer,Haziri_Details_Serializer
# from hawala.models import Log
# from rest_framework.decorators import api_view
# from .models import Haziri_Details,Haziri
# from .forms import HaziriForm     
# from rest_framework import status
# from rest_framework.response import Response
# @login_required(login_url='/')
# #@permission_required('hawala.add_kitabkhana',login_url='/admin')
# @api_view(('POST','GET'))
# def form_save(request): 
#     ###############################################branch1###############################
#     #[{'user_id': '10', 'mudeeriath': '4', 'total_present': '1', 'month': '06', 'total_absent': '1', 'total_leave': '1', 'report_date': '1401-06-02'}] lenth 1 request.data[0]['user_id']
#     haziri_report_data=[]
#     ################################################### end Branch 1###############
#     if request.method=="POST":
#         print("request.data=",request.data)
#         print("test1")
#         # ######################################################mudeeriath############################
#         serializer=Haziri_Serializer(data=request.data)
#         #print("serializer=",serializer)
#         if serializer.is_valid():
#             print("serializer.validated_data=",serializer.validated_data)
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         else:
#             print("ERROR")
#             print(serializer.errors)     
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
#     elif request.method=="GET":
#         #serializer=Haziri_Serializer(data=data_haziri_detail)
#         query_set=Haziri.objects.all().order_by('-pk')
#         serializer=Haziri_Serializer(query_set,many=True)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)

