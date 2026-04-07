from django.db import models

class Lead(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    city = models.CharField(max_length=50, blank=True)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

from django.db import models

class Leadss(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    team_size = models.CharField(max_length=20)
    message = models.TextField()
    workspace_type = models.CharField(max_length=50)

    status = models.CharField(
        max_length=20,
        default="New"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


from django.db import models
from django.contrib.auth.models import User
from workspaces.models import WorkspaceCategory


class SpecialLead(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    category = models.ForeignKey(
        WorkspaceCategory,
        on_delete=models.CASCADE
    )

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="assigned_leads"
    )

    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    company = models.CharField(max_length=200)
    message = models.TextField()

    status = models.CharField(
        max_length=20,
        default="pending",
        choices=[
            ("pending","Pending"),
            ("contacted","Contacted"),
            ("confirmed","Confirmed"),
            ("cancelled","Cancelled")
        ]
    )

    created_at = models.DateTimeField(auto_now_add=True)