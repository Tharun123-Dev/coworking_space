from rest_framework import serializers
from .models import Workspace, WorkspaceCategory

class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = '__all__'
class WorkspaceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceCategory
        fields = "__all__"