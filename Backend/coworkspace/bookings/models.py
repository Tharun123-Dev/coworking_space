from django.db import models
from django.contrib.auth.models import User
from workspaces.models import Workspace
from django.utils import timezone
from datetime import timedelta
from workspaces.models import WorkspaceSlot


def cart_expiry():
        return timezone.now()+timedelta(days=1)
# CART (one cart per user)
class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)



    def __str__(self):
        return self.user.username

    # TOTAL CART AMOUNT
    def total_amount(self):
        return sum(item.total_price() for item in self.cartitem_set.all())


# CART ITEMS
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    
    duration = models.IntegerField(default=1)   # days or hours
    quantity = models.IntegerField(default=1)
    created_at=models.DateTimeField(auto_now_add=True)
    expires_at=models.DateTimeField(default=cart_expiry)

    def __str__(self):
        return self.workspace.name

    # ITEM TOTAL
    def total_price(self):
        return self.workspace.price * self.duration * self.quantity


class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    slot = models.ForeignKey(
    WorkspaceSlot,
    on_delete=models.CASCADE,
    null=True,
    blank=True
)
    seats=models.IntegerField(default=1)

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE
    )

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="owner_bookings",
        null=True,
        blank=True
    )

    date = models.DateField()
   

    total_price = models.IntegerField(default=0)

    payment_id = models.CharField(max_length=200, null=True, blank=True)
    payment_status = models.CharField(
    max_length=20,
    default="PENDING",
    choices=[
        ("PENDING", "Pending"),
        ("VERIFIED", "Verified"),
        ("REFUNDED", "Refunded")
    ]
)
    # ✅ ADD THIS FIELD (VERY IMPORTANT)
    refund_amount = models.IntegerField(default=0)

    status = models.CharField(
        max_length=20,
        default="pending",
        choices=[
            ("pending", "Pending"),
            ("confirmed", "Confirmed"),
            ("cancelled", "Cancelled")
        ]
    )

    created_at = models.DateTimeField(auto_now_add=True)

class CancelRequest(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        default="PENDING",
        choices=[
            ("PENDING", "Pending"),
            ("APPROVED", "Approved"),
            ("REJECTED", "Rejected")
        ]
    )

class Slot(models.Model):

    SLOT_TYPE = [
        ("HOURLY", "Hourly"),
        ("FULL_DAY", "Full Day"),
    ]

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    date = models.DateField()

    slot_type = models.CharField(max_length=20, choices=SLOT_TYPE)

    # Only for hourly slots
    time = models.CharField(max_length=20, null=True, blank=True)

    price = models.IntegerField()

    capacity = models.IntegerField(default=50)
    booked_count = models.IntegerField(default=0)

    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def is_full(self):
        return self.booked_count >= self.capacity

    def __str__(self):
        return f"{self.workspace.name} - {self.date} - {self.time or 'Full Day'}"