from django.http import HttpResponse,JsonResponse
from datetime import datetime
#from hawala.models import Hawala_Detail, Mudeeriath,Controller,Hawala
#from .forms import RequestForm,ServicesForm
from jalali_date import date2jalali
import pytz
from rest_framework import status
from hijri_converter import Hijri,Gregorian
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.template import loader
import json
# from shopapp.models import Log
from .models import Room
# from .serializer import ServicesSerializer,RequestSerializer
#from .serializer import ControllerIhsayaSerializer
import re
from django.contrib.auth.decorators import login_required,permission_required
from rest_framework.decorators import api_view
from django.conf import settings
from django.core.mail import send_mail
import re

def clean(st):
    pattern="[\n\t\s]"
    return re.sub(pattern,"",st)


def get_rooms(request):
    rooms=Room.objects.all()
    rooms=list(rooms.values())
    #print("get message=",messages," username ",messages[0].user," room_obj ",room_obj)
    return JsonResponse({"rooms":rooms})




# @login_required()
# #@permission_required('hawala.add_kitabkhana',login_url='/admin')
# @api_view(('POST','GET'))
# def request(request): 
#     ################################################### end Branch 1###############
#     if request.method=="POST":
#         print("request.data=",request.data)
#         print("test1")
#         # ######################################################mudeeriath############################
#         serializer=RequestSerializer(data=request.data)
#         #print("serializer=",serializer)
#         if serializer.is_valid():
#             print("serializer.validated_data=",serializer.validated_data)
#             serializer.save()
#             subject="السلام علیکم"
#             #from_email=settings.EMAIL_HOST_USER
#             sender=settings.EMAIL_HOST_USER
#             recipient_list=[request.data['requester_email'],]
#             recipient=[clean(request.data['requester_email'])]
#             message="Dear Requester. Kindly wait untill we call you for interview"
#             try:
#                 #send_mail(subject=subject,message=message,from_email=from_email,recipient_list=recipient_list)
#                 send_mail(subject, message, sender, recipient)
#             except Exception as e:
#                 log_obj=Log(log_type='exception',logger=request.user.username,log_table='controller',log_detail=e,log_date=date2jalali(datetime.strptime(datetime.now().strftime('%Y-%m-%d'),"%Y-%m-%d") ) )
#                 log_obj.save()
               
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         else:
#             print("ERROR")
#             print(serializer.errors)     
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
#     elif request.method=="GET":
#         #serializer=Haziri_Serializer(data=data_haziri_detail)
#         query_set=Request.objects.all().order_by('-pk')
#         serializer=RequestSerializer(query_set,many=True)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)

