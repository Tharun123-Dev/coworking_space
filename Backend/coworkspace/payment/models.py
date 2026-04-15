from django.db import models
from django.contrib.auth.models import User

class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    payment_id = models.CharField(max_length=200)
    order_id = models.CharField(max_length=200)
    amount = models.IntegerField()
    status = models.CharField(max_length=50, default="SUCCESS")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.payment_id