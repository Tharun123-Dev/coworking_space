from django.contrib.auth.models import User
from django.db import models

class Profile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('owner', 'Owner'),
        ('user', 'User'),
    ]

    LOCATION_CHOICES = [
        ('Hitech City', 'Hitech City'),
        ('Madhapur', 'Madhapur'),
        ('Gachibowli', 'Gachibowli'),
        ('Kondapur', 'Kondapur'),
        ('Financial District', 'Financial District'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    phone = models.CharField(max_length=20, blank=True, null=True)

    # ✅ ADD THIS
    location = models.CharField(max_length=100, choices=LOCATION_CHOICES, null=True, blank=True)

    # OTP fields
    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)
    is_otp_verified = models.BooleanField(default=False)
    created_by = models.ForeignKey(

    User,

    on_delete=models.SET_NULL,

    null=True,

    blank=True,

    related_name="created_users"
)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)