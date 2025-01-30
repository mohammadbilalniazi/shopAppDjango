from django.http import HttpResponse,JsonResponse
from datetime import datetime
#from hawala.models import Hawala_Detail, Mudeeriath,Controller,Hawala
#from .forms import RequestForm,ServicesForm
from jalali_date import date2jalali
import pytz
from rest_framework import status
from hijridate import Hijri,Gregorian
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.template import loader
import json
# from shopapp.models import Log
from .models import Request
from .serializer import RequestSerializer
#from .serializer import ControllerIhsayaSerializer
import re
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from django.conf import settings
from django.core.mail import send_mail
import re

def clean(st):
    pattern="[\n\t\s]"
    return re.sub(pattern,"",st)

# @login_required(login_url='/')
#@permission_required('hawala.add_kitabkhana',login_url='/admin')
@api_view(('POST','GET'))
def request(request): 
    if request.method=="GET":
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        key="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"
        sg = SendGridAPIClient(key)

        email_data = Mail(
            from_email='mohammadbilalniazi2016@gmail.com ',
            to_emails="salam1a2b@gmail.com",
            subject="salam",
            plain_text_content="Testing sendgrid test_email_request",
            html_content="<strong>easy sendgrid</strong>"
        )
      
        
        try:
            response=sg.send(email_data)
            print("response.status_code=",response.status_code)
            print("response.body=",response.body)
            print("response.header=",response.headers)
            #send_mail(subject=subject,message=message,from_email=from_email,recipient_list=recipient_list)
            # sg.send(message)
            # send_mail(subject, message, sender, recipient,fail_silently=False)
        except Exception as e:
            print("e ",e)
            # log_obj=Log(log_type='exception',logger=request.user.username,log_table='controller',log_detail=e,log_date=date2jalali(datetime.strptime(datetime.now().strftime('%Y-%m-%d'),"%Y-%m-%d") ) )
            # log_obj.save()
        
    elif request.method=="GET":
        #serializer=Haziri_Serializer(data=data_haziri_detail)
        query_set=Request.objects.all().order_by('-pk')
        serializer=RequestSerializer(query_set,many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response({"message":"salame"}, status=status.HTTP_201_CREATED)
