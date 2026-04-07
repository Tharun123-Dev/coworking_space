from rest_framework import serializers
from .models import Lead
from .models import SpecialLead

class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = '__all__'

from rest_framework import serializers
from .models import Leadss

class LeadssSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leadss
        fields = '__all__'
class SpecialLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecialLead
        fields = '__all__'
        read_only_field=["status","created_at","owner"]
