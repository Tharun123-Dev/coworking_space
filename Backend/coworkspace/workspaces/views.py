from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import BasePermission

from .models import Workspace
from .serializers import WorkspaceSerializer, WorkspaceCategorySerializer, WorkspaceCategory


# 🔥 CUSTOM PERMISSION (ADMIN + OWNER)
class IsAdminOrOwner(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Admin allowed
        if user.is_superuser:
            return True

        # Owner allowed
        if hasattr(user, "profile") and user.profile.role == "owner":
            return True

        return False


# ===========================
# GET WORKSPACES (ALL USERS SEE ALL)
# ===========================
@api_view(['GET'])
def get_workspaces(request):
    city = request.GET.get('city')

    user = request.user

    # OWNER → only their workspaces
    if user.is_authenticated and hasattr(user, "profile") and user.profile.role == "owner":
        workspaces = Workspace.objects.filter(owner=user)

    # ADMIN → all
    elif user.is_authenticated and user.is_superuser:
        workspaces = Workspace.objects.all()

    # USERS → all visible
    else:
        if city:
            workspaces = Workspace.objects.filter(city__icontains=city)
        else:
            workspaces = Workspace.objects.all()

    serializer = WorkspaceSerializer(workspaces, many=True)
    return Response(serializer.data)

# ===========================
# GET CATEGORIES
# ===========================
@api_view(['GET'])
def get_categories(request):
    category = request.GET.get('type')

    if category:
        data = WorkspaceCategory.objects.filter(category=category)
    else:
        data = WorkspaceCategory.objects.all()

    serializer = WorkspaceCategorySerializer(data, many=True)
    return Response(serializer.data)


# ===========================
# ADD WORKSPACE (OWNER BASED)
# ===========================
@api_view(['POST'])
@permission_classes([IsAdminOrOwner])
def add_workspace(request):
    print("DATA RECEIVED:", request.data)

    serializer = WorkspaceSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(owner=request.user)   # ✅ OWNER ATTACHED
        print("SAVED SUCCESSFULLY")
        return Response(serializer.data)

    print("ERROR:", serializer.errors)
    return Response(serializer.errors, status=400)


# ===========================
# UPDATE WORKSPACE (ONLY OWNER)
# ===========================
@api_view(['PUT'])
@permission_classes([IsAdminOrOwner])
def update_workspace(request, id):
    try:
        workspace = Workspace.objects.get(id=id)
    except Workspace.DoesNotExist:
        return Response({"error": "Workspace not found"}, status=404)

    # ✅ OWNER CAN EDIT ONLY THEIR WORKSPACE
    if not request.user.is_superuser:
        if workspace.owner != request.user:
            return Response({"error": "Not allowed"}, status=403)

    serializer = WorkspaceSerializer(workspace, data=request.data)

    if serializer.is_valid():
        serializer.save(owner=workspace.owner)
        return Response(serializer.data)

    return Response(serializer.errors, status=400)


# ===========================
# DELETE WORKSPACE (ONLY OWNER)
# ===========================
@api_view(['DELETE'])
@permission_classes([IsAdminOrOwner])
def delete_workspace(request, id):
    try:
        workspace = Workspace.objects.get(id=id)

        # ✅ OWNER CHECK
        if not request.user.is_superuser:
            if workspace.owner != request.user:
                return Response({"error": "Not allowed"}, status=403)

        workspace.delete()
        return Response({"message": "Deleted"})

    except Workspace.DoesNotExist:
        return Response({"error": "Workspace not found"}, status=404)


# ===========================
# ADD CATEGORY
# ===========================
@api_view(['POST'])
@permission_classes([IsAdminOrOwner])
def add_category(request):
    serializer = WorkspaceCategorySerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)


# ===========================
# UPDATE CATEGORY
# ===========================
@api_view(['PUT'])
@permission_classes([IsAdminOrOwner])
def update_category(request, id):
    try:
        obj = WorkspaceCategory.objects.get(id=id)
    except WorkspaceCategory.DoesNotExist:
        return Response({"error": "Category not found"}, status=404)

    serializer = WorkspaceCategorySerializer(obj, data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)


# ===========================
# DELETE CATEGORY
# ===========================
@api_view(['DELETE'])
@permission_classes([IsAdminOrOwner])
def delete_category(request, id):
    try:
        obj = WorkspaceCategory.objects.filter(id=id).first()

        if not obj:
            return Response(
                {"error": "Category not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        obj.delete()

        return Response(
            {"message": "Deleted successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )