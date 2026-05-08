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
    amenities = AmenitySerializer(many=True, read_only=True)

    # ✅ ADD THIS
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = "__all__"   # owner_name automatically included

    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name() or obj.owner.username
        return None

class WorkspaceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceCategory
        fields = "__all__"

from rest_framework import serializers
from .models import OfferWorkspace

class OfferWorkspaceSerializer(
    serializers.ModelSerializer
):

    owner_name = serializers.CharField(
        source="owner.username",
        read_only=True
    )

    class Meta:
        model = OfferWorkspace

        fields = "__all__"


from .models import AdditionalAmenity


class AdditionalAmenitySerializer(
    serializers.ModelSerializer
):

    workspace_name = serializers.CharField(

        source="workspace.name",

        read_only=True

    )

    owner_name = serializers.CharField(

        source="owner.username",

        read_only=True

    )

    class Meta:

        model = AdditionalAmenity

        fields = "__all__"