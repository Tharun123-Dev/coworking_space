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

from django.db import models

class Leadss(models.Model):

    name = models.CharField(
        max_length=100
    )

    email = models.EmailField()

    phone = models.CharField(
        max_length=15
    )

    team_size = models.CharField(
        max_length=20
    )

    message = models.TextField()

    workspace_type = models.CharField(
        max_length=50
    )

    # OFFER WORKSPACE NAME

    offer_workspace = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    # LOCATION

    preferred_location = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        default="New"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

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
from django.db import models
from django.contrib.auth.models import User


TEAM_CHOICES = (
    ("small", "Small Team"),
    ("medium", "Medium Team"),
    ("large", "Large Team"),
)

STATUS_CHOICES = (
    ("pending", "Pending"),
    ("contacted", "Contacted"),
    ("closed", "Closed"),
)


class CompanyLead(models.Model):

    team_size = models.CharField(
        max_length=20,
        choices=TEAM_CHOICES
    )

    name = models.CharField(
        max_length=90
    )

    email = models.EmailField(
        blank=True,
        null=True
    )

    phone = models.CharField(
        max_length=20
    )

    # ✅ LOCATION

    location = models.CharField(
        max_length=100
    )

    # ✅ NEW FIELD

    workspace_type = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    company = models.CharField(
        max_length=150,
        blank=True
    )

    message = models.TextField(
        blank=True
    )

    # ✅ ASSIGNED OWNER

    owner = models.ForeignKey(

        User,

        on_delete=models.SET_NULL,

        null=True,

        blank=True,

        related_name="company_leads"

    )

    status = models.CharField(

        max_length=20,

        choices=STATUS_CHOICES,

        default="pending"

    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return self.name

class BusinessEnterpriseLead(models.Model):

    STATUS = (
        ("pending","Pending"),
        ("contacted","Contacted"),
        ("closed","Closed"),
    )

    location = models.CharField(max_length=100)

    company_name = models.CharField(max_length=200)

    contact_person = models.CharField(max_length=100)

    email = models.EmailField()

    phone = models.CharField(max_length=20)

    team_size = models.CharField(max_length=50)

    move_in_date = models.CharField(max_length=100, blank=True)

    budget = models.CharField(max_length=100, blank=True)

    requirement = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)

class SupportTicket(models.Model):

    ISSUE_TYPES = [
        ("booking","Booking Issue"),
        ("payment","Payment Issue"),
        ("account","Account Issue"),
        ("refund","Refund Issue"),
        ("availability","Availability"),
        ("pricing","Pricing Issue"),
        ("technical","Technical Issue"),
        ("cancel","Cancel Booking"),
        ("modify","Modify Booking"),
        ("other","Other")
    ]

    STATUS = [
        ("open","Open"),
        ("in_progress","In Progress"),
        ("resolved","Resolved")
    ]

    user = models.ForeignKey(User,on_delete=models.CASCADE)

    booking_id = models.IntegerField(null=True, blank=True)
    special_id = models.IntegerField(null=True, blank=True)

    issue_type = models.CharField(max_length=50,choices=ISSUE_TYPES)

    message = models.TextField()

    admin_note = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="open"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.issue_type}"# models.py
# models.py

class ModernLead(models.Model):

    name = models.CharField(max_length=100)

    email = models.EmailField(
        blank=True,
        null=True
    )

    phone = models.CharField(max_length=15)

    company = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    preferred_location = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    message = models.TextField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ("new", "New"),
            ("contacted", "Contacted"),
            ("closed", "Closed"),
        ],
        default="new"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )
