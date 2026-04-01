from rest_framework import serializers
from .models import EnterpriseLead

class EnterpriseLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnterpriseLead
        fields = "__all__"