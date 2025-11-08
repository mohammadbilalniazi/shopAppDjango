from django.db import models
from configuration.models import Organization
from django.contrib.auth.models import User
# Create your models here.
class OrganizationUser(models.Model):
    ROLE_CHOICES = (
        ('employee', 'Employee'),
        ('admin', 'Admin'),
        ('superuser','SuperUser'),
        ('owner','Owner')
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, unique=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    img = models.FileField(upload_to="OrganizationUser", null=True, blank=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='member')
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.organization.name}"

    class Meta:
        verbose_name = "Organization User"
        verbose_name_plural = "Organization Users"
        ordering = ['user__username']
    
    # delete the file and user when the instance is deleted
    def delete(self, *args, **kwargs):
        if self.img:
            self.img.delete()
        if self.user:
            self.user.delete()
        super().delete(*args, **kwargs)