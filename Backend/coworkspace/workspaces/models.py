from django.db import models
from django.contrib.auth.models import User
class Amenity(models.Model):
    ICON_CHOICES = [
        ("wifi", "WiFi 📶"),
        ("coffee", "Coffee ☕"),
        ("24hr", "24 Hour ⏰"),
        ("security", "Security 🛡️"),
        ("parking", "Parking 🅿️"),
        ("meeting", "Meeting 🏢"),
        ("games", "Games 🎮"),
        ("pantry", "Pantry 🍽️"),
        ("cleaning", "Cleaning 🧹"),
        ("support", "Support 💬"),
        ("ac", "AC ❄️"),
        ("printer", "Printer 🖨️"),
        ("locker", "Locker 🔐"),
        ("lounge", "Lounge 🛋️"),
        ("elevator", "Elevator 🛗"),
        ("reception", "Reception 🧑‍💼"),
        ("conference", "Conference 📊"),
        ("snacks", "Snacks 🍪"),
        ("water", "Water 🚰"),
        ("charging", "Charging 🔌"),
        ("cctv", "CCTV 📹"),
    ]

    name = models.CharField(max_length=100)

    # ✅ dropdown + manual support
    icon = models.CharField(
        max_length=50,
        choices=ICON_CHOICES,
        blank=True
    )

    # ✅ manual icon (optional)
    custom_icon = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    def get_icon(self):
        return self.custom_icon if self.custom_icon else self.icon

    def __str__(self):
        return self.name

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
    amenities = models.ManyToManyField(Amenity, blank=True)
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

class MonthlySlot(models.Model):
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    month = models.IntegerField()   # 1-12
    year = models.IntegerField()

    capacity = models.IntegerField(default=50)
    booked = models.IntegerField(default=0)

    price = models.DecimalField(max_digits=10, decimal_places=2)

    is_full = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.workspace.name} - {self.month}/{self.year}"

    






    