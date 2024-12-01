from django import forms
from jalali_date.fields import JalaliDateField
from jalali_date.widgets import AdminJalaliDateWidget
from jalali_date import date2jalali
from datetime import datetime
from .models import Bill
import pytz



class Bill_Form(forms.Form):
    start_date = forms.CharField(label='شروع', max_length=100,widget=forms.TextInput(attrs={"placeholder":"شروع"}))
    end_date = forms.CharField(label='ختم', max_length=100,widget=forms.TextInput(attrs={"placeholder":"ختم"}))
    def __init__(self,*args, **kwargs):
        super(Bill_Form,self).__init__(*args,**kwargs)
        date=pytz.timezone("Asia/Kabul").localize(datetime.now()).strftime('%Y-%m-%d')
        date=datetime.strptime(date,'%Y-%m-%d')
        date_hijri=date2jalali(date)
        today=date_hijri
        year=date_hijri.strftime("%Y")
        month=date_hijri.strftime("%m")
        if int(month)<10: # need to add 0  for example int(9)== 9  so we should change to 09
            start_date_initial_value=year+"-"+"0"+str(int(month))+"-01"
        else:
            start_date_initial_value=year+"-"+str(int(month))+"-01"
        self.fields["start_date"]=JalaliDateField(label="شروع",widget=AdminJalaliDateWidget)

        self.fields["start_date"].widget.attrs['onchange']='date_change()'
        self.fields["start_date"].widget.attrs['onkeypress']='mappTranslation()'
        self.fields["start_date"].widget.attrs['id']='start_date_input'
        self.fields["start_date"].initial=start_date_initial_value


        self.fields["end_date"]=JalaliDateField(label="ختم",widget=AdminJalaliDateWidget)
        # self.fields["end_date"].widget.attrs['tabindex']="2"
        self.fields["end_date"].widget.attrs['onchange']='date_change()'
        
        self.fields["end_date"].widget.attrs['onkeypress']='mappTranslation()'
        
        self.fields["end_date"].widget.attrs['id']="end_date_input"
        self.fields["end_date"].initial=today
        
        self.fields["date"]=JalaliDateField(label="ختم",widget=AdminJalaliDateWidget)
        self.fields["date"].widget.attrs['id']="date"
        self.fields['date'].initial=today
    