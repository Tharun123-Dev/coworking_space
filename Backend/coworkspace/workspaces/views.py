from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Workspace
from .serializers import WorkspaceSerializer,WorkspaceCategorySerializer,WorkspaceCategory
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

@api_view(['GET'])

def get_workspaces(request):
    city = request.GET.get('city')

    if city:
        workspaces = Workspace.objects.filter(city__icontains=city)
    else:
        workspaces = Workspace.objects.all()

    serializer = WorkspaceSerializer(workspaces, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_categories(request):
    category = request.GET.get('type')

    if category:
        data = WorkspaceCategory.objects.filter(category=category)
    else:
        data = WorkspaceCategory.objects.all()

    serializer = WorkspaceCategorySerializer(data, many=True)
    return Response(serializer.data)
from rest_framework.permissions import IsAdminUser

# ✅ ADD WORKSPACE
@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_workspace(request):
    print("DATA RECEIVED:", request.data)  # 🔥 DEBUG

    serializer = WorkspaceSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        print("SAVED SUCCESSFULLY")  # 🔥 DEBUG
        return Response(serializer.data)

    print("ERROR:", serializer.errors)  # 🔥 DEBUG
    return Response(serializer.errors)

# ✅ UPDATE WORKSPACE
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_workspace(request, id):
    workspace = Workspace.objects.get(id=id)
    serializer = WorkspaceSerializer(workspace, data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors)


# ✅ DELETE WORKSPACE
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_workspace(request, id):
    workspace = Workspace.objects.get(id=id)
    workspace.delete()
    return Response({"message": "Deleted"})

@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_category(request):
    serializer = WorkspaceCategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors)
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_category(request, id):
    obj = WorkspaceCategory.objects.get(id=id)
    serializer = WorkspaceCategorySerializer(obj, data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors)


from rest_framework import status


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
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