from django.db import models

STATUS_CHOICE=(("REJECTED","REJECTED"),("ACCEPTED","ACCEPTED"),("PENDING","PENDING"))

class Request(models.Model):
    requester_name=models.CharField(max_length=30)
    requester_email=models.CharField(max_length=50,null=True,blank=True)
    requester_contact=models.CharField(max_length=20,null=True,blank=True)
    status=models.CharField(max_length=20,default="PENDING",choices=STATUS_CHOICE,null=True,blank=True)
    #request_date=models.CharField(max_length=30)
    def __str__(self):
        return self.requester_name
    
class Services(models.Model):
    service=models.CharField(max_length=30)
    #service_starter=models.CharField(max_length=30)
    request=models.ForeignKey(Request,on_delete=models.DO_NOTHING,null=True)
    #start_date=models.DateField()
    
    def __str__(self):
        return self.service

    
    
    
