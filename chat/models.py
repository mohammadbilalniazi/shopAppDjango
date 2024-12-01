from django.db import models
from datetime import datetime
from django.utils import timezone

class Room(models.Model):
    name=models.CharField(max_length=100,unique=True)
    creator=models.CharField(null=True,blank=True,default=None,max_length=25)
    date_time=models.DateTimeField(null=True,blank=True)
    status=models.SmallIntegerField(default=1,choices=((1,'OPEN'),(2,'CLOSED'),(3,'CANCELED'),(4,'SUSPENDED')))

    def __str__(self):
        return self.name

    # class Meta:
    #     unique_together=(("nawa_sanad","year_hawala","hawala_no","mudeeriath","nawyath_sanad"),)

class Message(models.Model):
    value=models.CharField(max_length=1000) #message
    date=models.DateTimeField(blank=True)
    user=models.CharField(max_length=100) ######sender
    room=models.CharField(max_length=100)
    ##################new################
    replied_to=models.IntegerField(null=True,blank=True,default=None)
    room=models.ForeignKey(Room,null=True,blank=True,on_delete=models.CASCADE)
    def __str__(self):
        return self.value


# class Message(models.Model):
#     #subject = models.CharField(max_length=120, blank=True)
#     message = models.TextField()
#     #sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sender_messages', verbose_name=("Sender"),on_delete=models.DO_NOTHING)
#     sender = models.CharField(max_length=50)
#     #recipient = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='receiver_messages', null=True, blank=True, verbose_name=("Recipient"),on_delete=models.DO_NOTHING )
#     #parent_msg = models.ForeignKey('self', related_name='next_messages', null=True, blank=True, verbose_name=("Parent message"),on_delete=models.DO_NOTHING )
#     sent_at = models.DateTimeField()    
#     read_date= models.DateTimeField(null=True,blank=True)
#     replied_to=models.IntegerField(null=True,blank=True,default=None)
#     room=models.ForeignKey(Room,null=True,blank=True,on_delete=models.CASCADE)
#     class Meta:
#         verbose_name_plural = "پیام"
        
#     def __str__(self):
#         return f"{self.message}"
 
# class Reply(models.Model):
#     reply_message=models.TextField()
#     replier = models.ForeignKey(User,on_delete=models.DO_NOTHING,default=1)
#     replied_to_id= models.ForeignKey(Message,on_delete=models.CASCADE)
#     replied_at = models.DateField(default=datetime.now)
    
