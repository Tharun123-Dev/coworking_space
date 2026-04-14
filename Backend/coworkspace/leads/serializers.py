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

from rest_framework import serializers
from .models import SupportTicket
from bookings.models import Booking
from .models import SpecialLead
from accounts.models import Profile


class SupportTicketSerializer(serializers.ModelSerializer):

    workspace = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    booking_status = serializers.SerializerMethodField()
    special_category = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()

    class Meta:
        model = SupportTicket
        fields = "__all__"

    def get_workspace(self, obj):
        if obj.booking_id:
            booking = Booking.objects.filter(id=obj.booking_id).first()
            if booking:
                return booking.workspace.name
        return None

    def get_location(self, obj):
        if obj.booking_id:
            booking = Booking.objects.filter(id=obj.booking_id).first()
            if booking:
                return booking.workspace.location
        return None

    def get_booking_status(self, obj):
        if obj.booking_id:
            booking = Booking.objects.filter(id=obj.booking_id).first()
            if booking:
                return booking.status
        return None

    def get_special_category(self, obj):
        if obj.special_id:
            special = SpecialLead.objects.filter(id=obj.special_id).first()
            if special:
                return special.category.category
        return None

    def get_username(self, obj):
        return obj.user.username

    def get_phone(self, obj):
        profile = Profile.objects.filter(user=obj.user).first()
        if profile:
            return profile.phone
        return None