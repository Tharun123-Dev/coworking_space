from django.db import models

# Create your models here.
from django.db import models

class Workspace(models.Model):
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    price = models.IntegerField()
    description = models.TextField()
    image = models.URLField()

    def __str__(self):
        return self.name
    
class WorkspaceCategory(models.Model):
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