from enum import unique
from unittest.util import _MAX_LENGTH
from django.db import models
from django.contrib.auth.models import User,Group
from django.core.validators import MaxValueValidator,MinValueValidator,FileExtensionValidator
# Create your models here.


class Currency(models.Model):
    currency=models.CharField(max_length=15)
    is_domestic=models.BooleanField(default=False)

    def __str__(self):
        return self.currency

class Languages(models.Model):
    language=models.CharField(max_length=30,unique=True)
    description=models.TextField()

    class Meta:
        verbose_name_plural =("Languages")

    def __str__(self):
        return self.language
    

class Language_Detail(models.Model):
    id_field=models.CharField(max_length=40,null=True,blank=True)
    src=models.CharField(max_length=15,null=True)
    dest=models.ForeignKey(Languages,on_delete=models.DO_NOTHING,null=True) 
    text=models.TextField(default=None)
    value=models.TextField(null=True) 
    class Meta:
        unique_together=(("id_field","src","dest","value"))
        verbose_name_plural =("Language Detail")



class Country(models.Model):
    name=models.CharField(max_length=20,unique=True)
    shortcut=models.CharField(max_length=5,unique=True)
    currency=models.CharField(max_length=5,default="Afg")

    class Meta:
        # db_table = 'book'
        verbose_name = 'Country'
        verbose_name_plural = 'Countries'

    def __str__(self):
        return self.name

class Location(models.Model):
    country=models.ForeignKey(Country,on_delete=models.CASCADE)
    state=models.CharField(max_length=20,unique=True)
    city=models.CharField(max_length=20,unique=True)  
    is_active=models.BooleanField(default=True)
    class Meta:
        unique_together=(("country","state","city"),)
    def __str__(self):
        return str(self.country)+'_'+self.state

class Organization(models.Model):  
    parent=models.ForeignKey("self",on_delete=models.CASCADE,to_field="name",null=True,blank=True)
    owner=models.OneToOneField(User,on_delete=models.CASCADE,unique=True)  
    name=models.CharField(max_length=20,unique=True)
    location=models.ForeignKey(Location,on_delete=models.CASCADE,null=True,to_field='city')
    # password=models.CharField(max_length=25)
    organization_type=models.CharField(max_length=25) 
    created_date=models.DateField()
    is_active=models.BooleanField(default=True)
    img=models.FileField(upload_to="Organization",validators=[FileExtensionValidator(allowed_extensions=['jpg','png','jpeg'])],null=True,blank=True)
    class Meta:
        unique_together=(("name","owner"),)
    
    def __str__(self):
        return self.name 
# class Sub_Organization(models.Model):
#     organization=models.ForeignKey(Organization,on_delete=models.CASCADE)
#     name=models.CharField(max_length=20)
#     user=models.OneToOneField(User,on_delete=models.CASCADE,unique=True)
#     created_date=models.DateField()
#     is_active=models.BooleanField(default=True)
#     class Meta:
#         unique_together=(("user","organization"),)

STATUS=((0,"CANCELLED"),(1,"CREATED"))    
class Role(models.Model):
    parent=models.ForeignKey("self",on_delete=models.CASCADE,blank=True,null=True)
    name=models.CharField(max_length=20,unique=True)
    created_by=models.OneToOneField(User,on_delete=models.CASCADE)
    organization=models.ForeignKey(Organization,on_delete=models.CASCADE,to_field="name")
    order=models.IntegerField()
    created_date=models.DateField()
    is_active=models.BooleanField(default=True)
    class Meta:
        unique_together=(("name","parent","organization"),)
# class Member_User(models.Model):
#     organization=models.ForeignKey(Organization,on_delete=models.CASCADE)
#     first_name=models.CharField(max_length=20)
#     last_name=models.CharField(max_length=20,null=True,blank=True)
#     father_name=models.CharField(max_length=20)
#     user=models.OneToOneField(User,on_delete=models.CASCADE,unique=True,to_field="username")
#     role=models.ForeignKey(Role,on_delete=models.DO_NOTHING,to_field="name",null=True,blank=True,default=None)
#     group=models.ForeignKey(Group,on_delete=models.DO_NOTHING,to_field="name")
#     created_date=models.DateField()
#     created_by=models.ForeignKey('self',on_delete=models.DO_NOTHING)
#     is_staff=models.BooleanField(default=True)
#     is_active=models.BooleanField(default=True)
#     class Meta:
#         unique_together=(("first_name","father_name","organization"),)




