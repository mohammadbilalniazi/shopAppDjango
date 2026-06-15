from dataclasses import fields
from django import forms
# from django.db import models
# from matplotlib import widgets
from jalali_date.fields import JalaliDateField, SplitJalaliDateTimeField,JalaliDateTimeField
from jalali_date.widgets import AdminJalaliDateWidget,AdminSplitJalaliDateTime
from jalali_date import datetime2jalali, date2jalali
from datetime import datetime
from .models import Organization, Branch, Location
from django.contrib.auth.models import User


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


class BranchForm(forms.ModelForm):
    class Meta:
        model = Branch
        fields = ['name', 'code', 'location', 'address', 'phone', 'email', 'manager', 'description']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter branch name',
                'required': True
            }),
            'code': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter branch code',
                'required': True
            }),
            'location': forms.Select(attrs={
                'class': 'form-control'
            }),
            'address': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Enter branch address'
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter phone number'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter email address'
            }),
            'manager': forms.Select(attrs={
                'class': 'form-control'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Enter branch description'
            }),
        }

    def __init__(self, *args, organization=None, **kwargs):
        super(BranchForm, self).__init__(*args, **kwargs)
        self.organization = organization
        
        # Filter locations to active ones
        self.fields['location'].queryset = Location.objects.filter(is_active=True)
        self.fields['location'].empty_label = "Select Location"
        
        # Filter manager to users who are part of the organization
        if organization:
            from user.models import OrganizationUser
            org_users = OrganizationUser.objects.filter(
                organization=organization,
                is_active=True,
                role__in=['admin', 'superuser', 'owner']
            ).select_related('user')
            user_ids = [org_user.user.id for org_user in org_users]
            self.fields['manager'].queryset = User.objects.filter(id__in=user_ids, is_active=True)
        else:
            self.fields['manager'].queryset = User.objects.filter(is_active=True)
        
        self.fields['manager'].empty_label = "Select Manager"

    def clean_code(self):
        code = self.cleaned_data.get('code')
        if code:
            code = code.upper().strip()
        return code

    def clean_name(self):
        name = self.cleaned_data.get('name')
        if name:
            name = name.strip()
        return name

    def clean(self):
        cleaned_data = super().clean()
        organization = self.organization or getattr(self.instance, 'organization', None)
        if not organization:
            return cleaned_data

        name = cleaned_data.get('name')
        code = cleaned_data.get('code')
        branch_id = self.instance.pk if self.instance else None

        if name:
            duplicate_name = Branch.objects.filter(
                organization=organization,
                name__iexact=name,
            )
            if branch_id:
                duplicate_name = duplicate_name.exclude(pk=branch_id)
            if duplicate_name.exists():
                self.add_error('name', 'A branch with this name already exists for this organization.')

        if code:
            duplicate_code = Branch.objects.filter(
                organization=organization,
                code__iexact=code,
            )
            if branch_id:
                duplicate_code = duplicate_code.exclude(pk=branch_id)
            if duplicate_code.exists():
                self.add_error('code', 'A branch with this code already exists for this organization.')

        return cleaned_data
