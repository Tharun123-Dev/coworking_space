from django.db import models

class Workspace(models.Model):
    WORKSPACE_TYPES = (
        ('coworking', 'Coworking'),
        ('private', 'Private Office'),
        ('meeting', 'Meeting Room'),
    )

    name = models.CharField(max_length=100)
    city = models.CharField(max_length=50)
    price = models.IntegerField()
    rating = models.FloatField()
    workspace_type = models.CharField(max_length=20, choices=WORKSPACE_TYPES)

    amenities = models.JSONField()  # ["wifi", "ac", "parking"]

    capacity = models.IntegerField()
    image = models.URLField()

    def __str__(self):
        return self.name