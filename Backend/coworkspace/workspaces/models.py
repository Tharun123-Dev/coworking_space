from django.db import models
from django.contrib.auth.models import User


class Workspace(models.Model):
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="owner_workspaces"
    )

    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    price = models.IntegerField()
    description = models.TextField()
    image = models.URLField()

    def __str__(self):
        return self.name


from django.contrib.auth.models import User

class WorkspaceCategory(models.Model):

    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="category_owner"
    )

    CATEGORY_CHOICES = [
        ('day_pass', 'Day Pass'),
        ('meeting', 'Meeting Rooms'),
        ('fixed', 'Fixed Seats'),
        ('cabin', 'Cabins'),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField()

    image = models.URLField()

    hourly_price = models.IntegerField()
    daily_price = models.IntegerField()
    monthly_price = models.IntegerField()

    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name