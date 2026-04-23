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
    
class ActivityLog(models.Model):
    ACTIONS = [
        ("CREATE", "Create"),
        ("UPDATE", "Update"),
        ("DELETE", "Delete"),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=10, choices=ACTIONS)
    model_name = models.CharField(max_length=50)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message 
    
class WorkspaceSlot(models.Model):

    SLOT_TYPE = [
        ("hour", "Hourly"),
        ("day", "Full Day"),
    ]

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="slots"   # ✅ ADD THIS
    )

    date = models.DateField()

    slot_type = models.CharField(max_length=10, choices=SLOT_TYPE)

    start_time = models.IntegerField(null=True, blank=True)
    end_time = models.IntegerField(null=True, blank=True)

    capacity = models.IntegerField(default=50)
    booked_count = models.IntegerField(default=0)

    price = models.IntegerField()

    def is_full(self):
        return self.booked_count >= self.capacity
    

    






    