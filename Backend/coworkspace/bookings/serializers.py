from rest_framework import serializers
from .models import CartItem


class CartItemSerializer(serializers.ModelSerializer):

    # Workspace details (important for UI)
    workspace_name = serializers.CharField(source="workspace.name", read_only=True)
    location = serializers.CharField(source="workspace.location", read_only=True)
    price = serializers.IntegerField(source="workspace.price", read_only=True)
    image = serializers.CharField(source="workspace.image", read_only=True)

    # Total per item
    total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "workspace",
            "workspace_name",
            "location",
            "price",
            "image",
            "duration",
            "quantity",
            "total"
        ]

    # Calculate total
    def get_total(self, obj):
        return obj.workspace.price * obj.duration * obj.quantity