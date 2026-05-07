from django.db import models
from django.contrib.auth.models import User
class EnterpriseLead(models.Model):
    STATUS_CHOICES = [
        ("New", "New"),
        ("Contacted", "Contacted"),
        ("Interested", "Interested"),
        ("Converted", "Converted"),
    ]

    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    name = models.CharField(max_length=100)

    phone = models.CharField(max_length=15)

    email = models.EmailField()

    workspace_type = models.CharField(max_length=50)

    company_size = models.CharField(max_length=50)

    preferred_location = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    notes = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="New"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name