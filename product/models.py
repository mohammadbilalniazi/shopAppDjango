from django.db import models
from configuration.models import Languages,Location,Organization
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils.html import mark_safe
from django.conf import settings



# Create your models here.

class Store(models.Model):
    organization=models.OneToOneField(Organization,on_delete=models.DO_NOTHING,to_field="name",null=True,blank=True,default=None)
    name=models.CharField(max_length=50,unique=True)
    location=models.ForeignKey(Location,on_delete=models.CASCADE,null=True,blank=True)
    is_active=models.BooleanField(default=True)
    # admin=models.ForeignKey(User,on_delete=models.CASCADE,null=True,blank=True)
    class Meta:
        unique_together=("organization","name")
    def __str__(self):
        return f"{self.name}"


    
def resize(fieldfile_obj):
    from PIL import Image
    print("dir(fieldfile_obj.file)=",dir(fieldfile_obj)," name ",fieldfile_obj.name," path ",fieldfile_obj.path)
    img = Image.open(fieldfile_obj.path)
    amount = 2.3 # higher amount: more reduction. lower: less reduction
    width, height = img.size

    new_size = int(width // amount), int(height // amount)
    compressed = img.resize(new_size,Image.Resampling.LANCZOS)
    compressed.save()
    return compressed

def validate_image(fieldfile_obj):
    if not hasattr(fieldfile_obj,"file"):
        return fieldfile_obj
    filesize = fieldfile_obj.file.size
    megabyte_limit = 20.0
    if filesize > megabyte_limit*1024:
        fieldfile_obj=resize(fieldfile_obj)
        raise ValidationError("%s previous size and current size % Max file %s size is %s Kb and your size is %s kb" % (str(filesize),str(fieldfile_obj.file.size),str(fieldfile_obj.file.name),str(megabyte_limit),str(int(filesize/1024))))
    else:
        return fieldfile_obj
    
# Create your models here.

# from bill.views_bill import findOrganization
# def findorg(self):
#     # qs = super(Product, self).queryset(request)
#     organization=findOrganization(request)
#     print("organization ")
#     if request.user.is_superuser:
#         return qs
#     return qs.filter(organization=organization)
class Unit(models.Model):
    organization=models.ForeignKey(Organization,on_delete=models.DO_NOTHING,to_field="name",null=True,blank=True,default=None)
    name=models.CharField(max_length=20)
    description=models.CharField(max_length=100,null=True,blank=True)
    is_active=models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name}"
    
def Category_directory_path(instance, filename): 
    # file will be uploaded to MEDIA_ROOT / user_<id>/<filename>
    if filename:
        return 'Category/{}'.format(filename)
    else: 
        return filename
class Category(models.Model):
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=30,null=False, blank=False,unique=True)
    description=models.TextField(max_length=100,null=True,blank=True)
    img=models.ImageField(upload_to = Category_directory_path,null=True,blank=True)
    # img=models.ImageField(upload_to = Category_directory_path,null=True,blank=True,validators=[validate_image])
    is_active=models.BooleanField(default=True)
    
    def save(self):
        super().save()  # saving image first
        from PIL import Image
        if self.img:
            img = Image.open(self.img.path) # Open image using self
            if img.height > 300 or img.width > 600:
                new_img = (300, 600)
                img.thumbnail(new_img)
                img.save(self.img.path)  # saving image at the same path
     
    def __str__(self): 
        return f"{self.name}"  
    
    verbose_name_plural = "Category"

    def image_tag(self):
        # return mark_safe('<img src="/media/%s" width="150" height="150" />' % (self.img))
        if self.img:  
            # delete_file(self.img.path)
            return mark_safe(f'<img src = "{self.img.url}" width = "150"/>')
        else:
            return mark_safe('<p>no image</p>')
    
    image_tag.short_description = 'Image'

    def __str__(self):
        return self.name




def user_directory_path(instance, filename): 
    # file will be uploaded to MEDIA_ROOT / user_<id>/<filename>
    return 'Products/{}'.format(filename)
    # return 'Products'
def delete_file(img_path):
    import os
    complete_path=os.path.join(settings.BASE_DIR,img_path)
    print("os.path.join(settings.BASE_DIR,self.img.path)","=",complete_path," ",os.path.exists(complete_path))
    try:
        os.remove(complete_path)
    except Exception as e:
        print("e ",e)
 
def Products_directory_path(instance, filename): 
    # file will be uploaded to MEDIA_ROOT / user_<id>/<filename>
    if filename:
        return 'Products/{}'.format(filename)
    else:
        return filename

class Product(models.Model):
    item_name = models.CharField(max_length=50,null=False, blank=False)
    category=models.ForeignKey(Category,on_delete=models.DO_NOTHING,default=None)
    model=models.CharField(max_length=20,null=True,blank=True)
    barcode=models.CharField(max_length=25,null=True,blank=True)
    img=models.ImageField(upload_to='Products',null=True,blank=True)
    is_active=models.BooleanField(default=True,null=True)
    # def image_tag(self):
    #     # return mark_safe('<img src="/media/%s" width="150" height="150" />' % (self.img))
    #     if hasattr(self.img,"url"):  
    #         print('yes hasattr(self.img,"url")')
    #         # delete_file(self.img.path)
    #         # return mark_safe(f'<img src = "{self.img.url}" width = "150"/>')
    #     else:
    #         print('no hasattr(self.img,"url")')
    #         # return mark_safe('<p>no image</p>')
    
    # image_tag.short_description = 'Image'
    class Meta:
        unique_together=("item_name","model")
    def __str__(self): 
        return f"{self.item_name}"  
    verbose_name_plural = "اجناس"
    
class Product_Detail(models.Model): 
    product=models.OneToOneField(Product,on_delete=models.CASCADE,null=True,blank=True,unique=True)
    organization=models.ForeignKey(Organization,on_delete=models.DO_NOTHING,default=None,null=True,to_field="name")
    minimum_requirement=models.IntegerField(default=1)
    purchased_price= models.DecimalField(default=0,max_digits=22, decimal_places=2,null=True)
    selling_price=models.DecimalField(default=0,max_digits=22, decimal_places=2,null=True)
     
class Stock(models.Model):
    store=models.ForeignKey(Store,on_delete=models.DO_NOTHING)
    product=models.ForeignKey(Product,on_delete=models.CASCADE,null=True,blank=True)
    current_amount= models.DecimalField(default=0,max_digits=22, decimal_places=2)
    selling_amount= models.DecimalField(default=0,max_digits=22, decimal_places=2)
    purchasing_amount= models.DecimalField(default=0,max_digits=22, decimal_places=2)
    
    class Meta:
        unique_together=("store","product")

class Row_Column_Address(models.Model):
    product=models.OneToOneField(Product,on_delete=models.DO_NOTHING,null=True,blank=True,unique=True)
    row=models.IntegerField(null=True,blank=True)
    column=models.IntegerField(null=True,blank=True)

class Service(models.Model):
    name = models.CharField(max_length=50,null=False, blank=False)
    organization=models.ForeignKey(Organization,on_delete=models.DO_NOTHING,default=None,null=True)
    category=models.ForeignKey(Category,on_delete=models.DO_NOTHING,default=None)
    dest=models.ForeignKey(Languages,on_delete=models.DO_NOTHING,null=True) 
    detail=models.TextField(null=True,blank=True)
    html_id=models.CharField(max_length=50,null=False)
    img=models.ImageField(upload_to = user_directory_path,null=True,blank=True,validators=[validate_image])
    is_active=models.BooleanField(default=None,null=True)
    class Meta:
        unique_together=("name","organization")
    def __str__(self): 
        return f"{self.name}"  

class Service_Media(models.Model):
    service = models.ForeignKey(Service,on_delete=models.SET_NULL,null=True)
    uploader=models.ForeignKey(User,on_delete=models.SET_NULL,null=True)
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




