from django.db import models
from configuration.models import Languages
from django.contrib.auth.models import User
# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=30,null=False, blank=False,unique=True)
    description=models.CharField(max_length=100,null=True,blank=True)
    is_active=models.BooleanField(default=True)
     
    def __str__(self): 
        return f"{self.name}"  
    
    verbose_name_plural = "Category"

class Product(models.Model):
    item_name = models.CharField(max_length=50,null=False, blank=False,unique=True)
    category=models.ForeignKey(Category,on_delete=models.DO_NOTHING,default=None)
    detail=models.CharField(max_length=200,null=True,blank=True)
    minimum_requirement=models.IntegerField()
    item_amount_available=models.IntegerField()
    row=models.IntegerField(null=True,blank=True)
    column=models.IntegerField(null=True,blank=True)
    purchased_price=models.IntegerField(default=None,null=True)
    selling_price=models.IntegerField(default=None,null=True)
     
    def __str__(self): 
        return f"{self.item_name}"  
    
    verbose_name_plural = "اجناس"


class Service(models.Model):
    service_name = models.CharField(max_length=50,null=False, blank=False)
    dest=models.ForeignKey(Languages,on_delete=models.DO_NOTHING,null=True) 
    category=models.ForeignKey(Category,on_delete=models.DO_NOTHING,default=None)
    detail=models.TextField(null=True,blank=True)
    html_id=models.CharField(max_length=50,null=False)
    service_incharger=models.ForeignKey(User,on_delete=models.SET_NULL,null=True)
    is_active=models.BooleanField(default=None,null=True)
    class Meta:
        unique_together=("dest","html_id")
    def __str__(self): 
        return f"{self.service_name}"  

class Service_Media(models.Model):
    service = models.ForeignKey(Service,on_delete=models.SET_NULL,null=True)
    uploader=models.ForeignKey(User,on_delete=models.SET_NULL,null=True)
    # title = models.CharField(max_length=150)
    file =  models.FileField(upload_to='uploads/%Y-%m-%d',unique=True)
    is_active=models.BooleanField(default=None,null=True)
     
    # Service=("service","uploader","file","is_active") 
    def __str__(self): 
        return f"{self.file}"  



    
class SubService(models.Model):
    service = models.ForeignKey(Service,on_delete=models.CASCADE,null=False, blank=False)
    # category=models.ForeignKey(Category,on_delete=models.DO_NOTHING,default=None)
    
    dest=models.ForeignKey(Languages,on_delete=models.DO_NOTHING,null=True) 
    sub_service_name = models.CharField(max_length=50,null=True)
    detail=models.TextField(null=True,blank=True)
    html_id=models.CharField(max_length=50,null=False, blank=False,unique=True)
    is_active=models.BooleanField(default=None,null=True)
      
    class Meta:
        unique_together=("sub_service_name","service","dest") 
    def __str__(self): 
        return f"{self.service}"  
    
    # SubService=("service","detail","html_id","is_active")
    # Service=("service_name","category","detail","html_id","service_incharger","is_active")

class SubService_Media(models.Model):
    service = models.ForeignKey(SubService,on_delete=models.SET_NULL,null=True)
    uploader=models.ForeignKey(User,on_delete=models.SET_NULL,null=True)
    # title = models.CharField(max_length=150)
    file =  models.FileField(upload_to='uploads/%Y-%m-%d',unique=True)
    is_active=models.BooleanField(default=None,null=True)
    
    # Service=("service","uploader","file","is_active") 
    def __str__(self): 
        return f"{self.file}" 



class Vendors(models.Model):
    name = models.CharField(max_length=50,null=False, blank=False,unique=True)
    account=models.CharField(max_length=30,null=True,blank=True)
    description=models.CharField(max_length=100,null=True,blank=True)
    address=models.CharField(max_length=100,null=True,blank=True)
    is_active=models.BooleanField(default=True)
     
    def __str__(self): 
        return f"{self.name}"  
    
    verbose_name_plural = "شرکت تولید کننده"

