from rest_framework import serializers
from .models import Workspace, WorkspaceCategory

from rest_framework import serializers
from .models import Workspace, Amenity

class AmenitySerializer(serializers.ModelSerializer):
    icon_display = serializers.SerializerMethodField()

    class Meta:
        model = Amenity
        fields = ["id", "name", "icon", "custom_icon", "icon_display"]

    def get_icon_display(self, obj):
        return obj.custom_icon if obj.custom_icon else obj.icon
    
class WorkspaceSerializer(serializers.ModelSerializer):
    amenities = AmenitySerializer(many=True, read_only=True)  # ✅ MUST

    class Meta:
        model = Workspace
        fields = "__all__"

class WorkspaceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceCategory
        fields = "__all__"

