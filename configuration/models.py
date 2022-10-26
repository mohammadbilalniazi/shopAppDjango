from enum import unique
from unittest.util import _MAX_LENGTH
from django.db import models
from django.contrib.auth.models import User,Group
from django.core.validators import MaxValueValidator,MinValueValidator
# Create your models here.

class Languages(models.Model):
    language=models.CharField(max_length=30,unique=True)
    description=models.TextField()

    class Meta:
        verbose_name_plural =("Languages")

    def __str__(self):
        return self.language
    

class Language_Detail(models.Model):
    id_field=models.CharField(max_length=30,null=True,blank=True)
    src=models.CharField(max_length=15,null=True)
    dest=models.ForeignKey(Languages,on_delete=models.DO_NOTHING,null=True) 
    text=models.TextField(default=None)
    value=models.TextField(null=True) 
    class Meta:
        unique_together=(("src","dest","text","value"))
        verbose_name_plural =("Language Detail")