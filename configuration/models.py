from django.db import models
from django.contrib.auth.models import User,Group
from django.core.validators import MaxValueValidator,RegexValidator,FileExtensionValidator
from django.core.exceptions import ValidationError
# Create your models here.


class Currency(models.Model):
    currency=models.CharField(max_length=15)
    is_domestic=models.BooleanField(default=False)

    def __str__(self):
        return self.currency


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
    owner = models.OneToOneField(User, on_delete=models.CASCADE, unique=True)
    name = models.CharField(max_length=20, unique=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, null=True, blank=True, related_name="city_set")
    organization_type = models.CharField(max_length=25)
    created_date = models.DateField()
    is_active = models.BooleanField(default=True)
    img = models.FileField(
        upload_to="Organization",
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'png', 'jpeg'])],
        null=True,
        blank=True
    )

    def __str__(self):
        return self.name

    
import uuid

def get_uuid():
    return uuid.uuid4()

def upload_location(instance, filename):
    return f'profiles/{instance.user.username}/{filename}'

class CustomUser(models.Model):
    ROLE_CHOICES = [
        ('EMPLOYEE', 'Employee'),
        ('MANAGER', 'Manager'),
        ('ADMIN', 'Admin'),
    ]
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='EMPLOYEE')
    father_name = models.CharField(max_length=20)
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=80, null=True, blank=True)
    user = models.OneToOneField(User, on_delete=models.DO_NOTHING)
    address = models.CharField(max_length=80, null=True, blank=True)
    jobTitle = models.CharField(max_length=50, null=True, blank=True)
    id_card = models.CharField(max_length=20, unique=True, blank=True, null=True)
    dob = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\d{4}-\d{2}-\d{2}$',
                message='Date of Birth must be in YYYY-MM-DD format',
                code='invalid_dob'
            )
        ]
    )
    mobile = models.CharField(max_length=20, unique=True)
    email = models.EmailField(max_length=50, blank=True, null=True)
    join_date = models.DateField(null=True, blank=True)
    uuid = models.UUIDField(default=get_uuid, unique=True, editable=False)
    photo = models.ImageField(upload_to=upload_location, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    organization = models.ForeignKey(Organization, on_delete=models.DO_NOTHING, null=True)

    class Meta:
        verbose_name_plural = "کاربر"
        constraints = [
            models.CheckConstraint(condition=models.Q(role__in=['EMPLOYEE', 'MANAGER', 'ADMIN']), name='valid_user_type'),
            models.UniqueConstraint(fields=['id_card'], name='unique_id_card'),
            models.UniqueConstraint(fields=['mobile'], name='unique_mobile'),
        ]

    def __str__(self):
        return f"{self.first_name} {self.father_name}"

STATUS=((0,"CANCELLED"),(1,"CREATED"))    
class Branch(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    branch_type=models.CharField(max_length=20,null=True,blank=True,default="main")
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="branches")
    location = models.ForeignKey(Location, on_delete=models.CASCADE, null=True, blank=True)
    address = models.TextField(max_length=200, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="managed_branches")
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="created_branches")
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    description = models.TextField(max_length=500, null=True, blank=True)
    
    class Meta:
        unique_together = (("name", "organization"), ("code", "organization"))
        verbose_name = "Branch"
        verbose_name_plural = "Branches"
        ordering = ['organization', 'name']
    
    def __str__(self):
        return f"{self.organization.name} - {self.name}"

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


# Automatically create a main Branch when a new Organization is created
from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=Organization)
def create_main_branch_for_organization(sender, instance, created, **kwargs):
    """Create a default main branch for each newly created Organization.

    Uses the organization's `owner` as `created_by`. If a main branch already
    exists for the organization, does nothing.
    """
    if not created:
        return

    # Avoid creating duplicate main branches
    try:
        existing = Branch.objects.filter(organization=instance, branch_type__iexact='main').exists()
    except Exception:
        existing = False

    if existing:
        return

    # Use the organization owner as created_by when available
    created_by_user = getattr(instance, 'owner', None)
    # Fallback: if owner is missing, skip creating branch (or could use a system user)
    if created_by_user is None:
        return

    # Generate a simple unique code for the branch
    branch_code = f"MAIN-{instance.id if instance.id else ''}".strip('-')

    Branch.objects.create(
        name='Main',
        code=branch_code or 'MAIN',
        branch_type='main',
        organization=instance,
        created_by=created_by_user,
    )




