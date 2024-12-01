from dataclasses import fields
from django import forms
# from django.db import models
# from matplotlib import widgets
from jalali_date.fields import JalaliDateField, SplitJalaliDateTimeField,JalaliDateTimeField
from jalali_date.widgets import AdminJalaliDateWidget,AdminSplitJalaliDateTime
from jalali_date import datetime2jalali, date2jalali
from datetime import datetime
from .models import Organization


import pytz

class OrganizationForm(forms.ModelForm):
    class Meta:
        model=Organization
        fields="__all__"
        # widgets = {
        # 'date_hawala': forms.DateInput(attrs={'id':'datepicker'}),
        # } 
        
    def __init__(self,*args,**kwargs):
        super(OrganizationForm,self).__init__(*args,**kwargs)
        
        #date=datetime.strptime(datetime.today().strftime("%Y-%m-%d"),"%Y-%m-%d")     # datetime.today()=datetime.datetime(2022, 5, 17, 3, 10, 9, 702688) then strftime===>'2022-05-17' the
        date=pytz.timezone('Asia/Kabul').localize(datetime.now()).strftime('%Y-%m-%d')
        date=datetime.strptime(date,"%Y-%m-%d")
        self.fields["created_date"]=JalaliDateField(label=("تاریخ حواله"),widget=AdminJalaliDateWidget)#,months=MONTH_CHOICES
        # self.fields['date_hawala'].widget.attrs.update({'class': 'jalali_date-date'})
        self.fields["created_date"].widget.attrs['tabindex']="4"
        self.fields["created_date"]=JalaliDateField(label=("تاریخ کنترول"),widget=AdminJalaliDateWidget)
        # self.fields['date_controll'].widget.attrs.update({'class': 'jalali_date-date'})
        self.fields["created_date"].initial=date2jalali(date)     #'2022-05-17' change to 1401-1-1
        # self.fields["date_controll"].widget.attrs['tabindex']="5"
        self.fields["created_date"].widget.attrs['disabled']=True 
        # self.fields["mustharadi_file"].widget.attrs['tabindex']="15"
    