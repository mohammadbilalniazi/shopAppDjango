from django.db import models
from configuration.models import Organization
from django.contrib.auth.models import User
# Create your models here.
class OrganizationUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    img= models.FileField(
        upload_to="OrganizationUser",
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.organization.name}"