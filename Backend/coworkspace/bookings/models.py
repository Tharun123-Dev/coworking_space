from django.db import models
from django.contrib.auth.models import User
from workspaces.models import Workspace


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

    def __str__(self):
        return self.workspace.name

    # ITEM TOTAL
    def total_price(self):
        return self.workspace.price * self.duration * self.quantity


#  BOOKING (after checkout)
class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE
    )

    # ✅ OWNER LINKED
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="owner_bookings",
        null=True,
        blank=True
    )

    date = models.DateField()
    duration = models.IntegerField()

    total_price = models.IntegerField(default=0)

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

    def __str__(self):
        return f"{self.workspace.name} - {self.user.username}"