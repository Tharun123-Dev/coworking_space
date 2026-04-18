from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import BasePermission
from rest_framework.permissions import IsAdminUser
from workspaces.models import ActivityLog

from .models import Workspace
from .serializers import WorkspaceSerializer, WorkspaceCategorySerializer, WorkspaceCategory


# 🔥 ADMIN + OWNER PERMISSION
class IsAdminOrOwner(BasePermission):
    def has_permission(self, request, view):

        if not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        if hasattr(request.user, "profile") and request.user.profile.role == "owner":
            return True

        return False


# ===========================
# GET WORKSPACES (VISIBLE TO ALL)
# ===========================
@api_view(['GET'])
def get_workspaces(request):

    city = request.GET.get("city")

    # 🔥 owner dashboard filter
    owner_only = request.GET.get("owner")

    if owner_only and request.user.is_authenticated:
        workspaces = Workspace.objects.filter(owner=request.user)

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


from workspaces.models import ActivityLog

@api_view(['POST'])
@permission_classes([IsAdminOrOwner])
def add_workspace(request):

    data = request.data.copy()

    serializer = WorkspaceSerializer(data=data)

    if serializer.is_valid():
        workspace = serializer.save(owner=request.user)   # ✅ store object

        # ===========================
        # ✅ ADD ACTIVITY LOG HERE
        # ===========================
        ActivityLog.objects.create(
            user=request.user,
            action="CREATE",
            model_name="Workspace",
            message=f"{request.user.username} added workspace {workspace.name}"
        )

        return Response(serializer.data)

    print(serializer.errors)
    return Response(serializer.errors, status=400)
# ===========================
# UPDATE WORKSPACE
# ===========================
from workspaces.models import ActivityLog

@api_view(['PUT'])
@permission_classes([IsAdminOrOwner])
def update_workspace(request, id):

    try:
        workspace = Workspace.objects.get(id=id)
    except Workspace.DoesNotExist:
        return Response({"error": "Workspace not found"}, status=404)

    # ADMIN can edit all
    if not request.user.is_superuser:
        if workspace.owner != request.user:
            return Response({"error": "Not allowed"}, status=403)

    serializer = WorkspaceSerializer(workspace, data=request.data)

    if serializer.is_valid():
        updated_workspace = serializer.save(owner=workspace.owner)

        # ✅ ADD LOG HERE (BEFORE RETURN)
        ActivityLog.objects.create(
            user=request.user,
            action="UPDATE",
            model_name="Workspace",
            message=f"{request.user.username} updated workspace {updated_workspace.name}"
        )

        return Response(serializer.data)

    return Response(serializer.errors, status=400)

# ===========================
# DELETE WORKSPACE
# ===========================
@api_view(['DELETE'])
@permission_classes([IsAdminOrOwner])
def delete_workspace(request, id):

    try:
        workspace = Workspace.objects.get(id=id)
    except Workspace.DoesNotExist:
        return Response({"error": "Workspace not found"}, status=404)

    # ADMIN delete all
    if request.user.is_superuser:
        pass

    # OWNER delete own
    else:
        if workspace.owner != request.user:
            return Response({"error": "Not allowed"}, status=403)

    workspace.delete()
    ActivityLog.objects.create(
    user=request.user,
    action="DELETE",
    model_name="Workspace",
    message=f"{request.user.username} deleted workspace {workspace.name}"
)
    return Response({"message": "Deleted"})


# ===========================
# ADD CATEGORY (ADMIN ONLY)
# ===========================
@api_view(['POST'])
@permission_classes([IsAdminOrOwner])
def add_category(request):

    serializer = WorkspaceCategorySerializer(data=request.data)

    if serializer.is_valid():
     category = serializer.save(owner=request.user)

     ActivityLog.objects.create(
        user=request.user,
        action="CREATE",
        model_name="Category",
        message=f"{request.user.username} added category {category.category}"
    )

    return Response(serializer.data)
    


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
     updated = serializer.save(owner=obj.owner)

    ActivityLog.objects.create(
        user=request.user,
        action="UPDATE",
        model_name="Category",
        message=f"{request.user.username} updated category {updated.category}"
    )

    return Response(serializer.data)


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

        
        name = obj.category

        obj.delete()

        ActivityLog.objects.create(
    user=request.user,
    action="DELETE",
    model_name="Category",
    message=f"{request.user.username} deleted category {name}"
)

        return Response(
            {"message": "Deleted successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

@api_view(['GET'])
@permission_classes([IsAdminUser])
def recent_activities(request):

    logs = ActivityLog.objects.all().order_by("-created_at")[:30]

    data = []

    for log in logs:

        role = "User"  # default

        if log.user:

            # ✅ ADMIN
            if log.user.is_superuser:
                role = "Admin"

            else:
                try:
                    profile = log.user.profile

                    # ✅ OWNER FIX (case insensitive)
                    if profile.role.lower() == "owner":
                        role = "Owner"
                    else:
                        role = "User"

                except:
                    role = "User"

        data.append({
            "id": log.id,
            "user": log.user.username if log.user else "System",
            "role": role,
            "action": log.action,
            "model_name": log.model_name,
            "message": log.message,
            "time": log.created_at.strftime("%d %b %Y %I:%M %p")
        })

    return Response(data)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ActivityLog

# DELETE SINGLE ACTIVITY
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_activity(request, id):
    try:
        activity = ActivityLog.objects.get(id=id)
        activity.delete()
        return Response({"message": "Deleted successfully"})
    except ActivityLog.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


# CLEAR ALL ACTIVITIES
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_all_activities(request):
    ActivityLog.objects.all().delete()
    return Response({"message": "All activities cleared"})