from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import BasePermission
from rest_framework.permissions import IsAdminUser
from workspaces.models import ActivityLog
from django.shortcuts import get_object_or_404
from .models import Workspace
from .serializers import WorkspaceSerializer, WorkspaceCategorySerializer, WorkspaceCategory, AmenitySerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Workspace,WorkspaceSlot,MonthlySlot
from bookings.models import Booking


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
    owner_only = request.GET.get("owner")

    # ✅ BASE QUERY (OPTIMIZED FOR AMENITIES)
    workspaces = Workspace.objects.all().prefetch_related("amenities")

    # ✅ OWNER FILTER
    if owner_only and request.user.is_authenticated:
        workspaces = workspaces.filter(owner=request.user)

    # ✅ CITY FILTER
    if city:
        workspaces = workspaces.filter(city__icontains=city)

    # ✅ SERIALIZE
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

@api_view(['POST'])
@permission_classes([IsAdminOrOwner])
def add_workspace(request):

    data = request.data.copy()

    # ✅ GET AMENITIES FROM REQUEST
    amenities_ids = data.pop("amenities", [])

    serializer = WorkspaceSerializer(data=data)

    if serializer.is_valid():
        workspace = serializer.save(owner=request.user)

        # ✅ SET AMENITIES
        if amenities_ids:
            workspace.amenities.set(amenities_ids)

        # ✅ LOG
        ActivityLog.objects.create(
            user=request.user,
            action="CREATE",
            model_name="Workspace",
            message=f"{request.user.username} added workspace {workspace.name}"
        )

        return Response(WorkspaceSerializer(workspace).data)

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

    if not request.user.is_superuser:
        if workspace.owner != request.user:
            return Response({"error": "Not allowed"}, status=403)

    data = request.data.copy()

    # ✅ GET AMENITIES
    amenities_ids = data.pop("amenities", [])

    serializer = WorkspaceSerializer(workspace, data=data)

    if serializer.is_valid():
        updated_workspace = serializer.save(owner=workspace.owner)

        # ✅ UPDATE AMENITIES
        if amenities_ids is not None:
            updated_workspace.amenities.set(amenities_ids)

        ActivityLog.objects.create(
            user=request.user,
            action="UPDATE",
            model_name="Workspace",
            message=f"{request.user.username} updated workspace {updated_workspace.name}"
        )

        return Response(WorkspaceSerializer(updated_workspace).data)

    return Response(serializer.errors, status=400)

from .models import Amenity
@api_view(['GET'])
def get_amenities(request):
    amenities = Amenity.objects.all()
    serializer = AmenitySerializer(amenities, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def add_amenity(request):
    serializer = AmenitySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Amenity

@api_view(['DELETE'])
def delete_amenity(request, id):
    try:
        amenity = Amenity.objects.get(id=id)
        amenity.delete()
        return Response({"message": "Deleted"})
    except Amenity.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
    


from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Amenity
from .serializers import AmenitySerializer

@api_view(['PUT'])
def update_amenity(request, id):
    try:
        amenity = Amenity.objects.get(id=id)
    except Amenity.DoesNotExist:
        return Response({"error": "Amenity not found"}, status=404)

    serializer = AmenitySerializer(amenity, data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=400)


@api_view(['PUT'])
@permission_classes([IsAdminOrOwner])
def toggle_workspace(request, id):

    workspace = get_object_or_404(Workspace, id=id, owner=request.user)

    workspace.is_available = not workspace.is_available
    workspace.save()

    return Response({
        "message": "Updated",
        "is_available": workspace.is_available
    })

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
            "time": log.created_at,
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_slot(request):

    workspace_id = request.data.get("workspace_id")
    date = request.data.get("date")
    slot_type = request.data.get("slot_type", "hour")

    # ✅ SAFE COMMON FIELDS
    try:
        interval = int(request.data.get("interval", 1))
        capacity = int(request.data.get("capacity", 50))
        price = int(request.data.get("price", 0))
    except:
        return Response({"error": "Invalid numeric values"}, status=400)

    workspace = get_object_or_404(Workspace, id=workspace_id)

    # 🔒 owner check
    if workspace.owner != request.user:
        return Response({"error": "Not allowed"}, status=403)

    created_slots = []

    # =========================
    # ✅ HOURLY SLOT
    # =========================
    if slot_type == "hour":

        start_time = request.data.get("start_time")
        end_time = request.data.get("end_time")

        if start_time is None or end_time is None:
            return Response(
                {"error": "start_time and end_time required"},
                status=400
            )

        try:
            start_time = int(start_time)
            end_time = int(end_time)
        except:
            return Response({"error": "Invalid time format"}, status=400)

        current = start_time

        while current < end_time:
            slot = WorkspaceSlot.objects.create(
                workspace=workspace,
                date=date,
                slot_type="hour",
                start_time=current,
                end_time=current + interval,
                capacity=capacity,
                price=price
            )
            created_slots.append(slot.id)
            current += interval

    # =========================
    # ✅ FULL DAY SLOT
    # =========================
    elif slot_type == "day":

        slot = WorkspaceSlot.objects.create(
            workspace=workspace,
            date=date,
            slot_type="day",
            capacity=capacity,
            price=price
        )
        created_slots.append(slot.id)

    else:
        return Response({"error": "Invalid slot_type"}, status=400)

    return Response({
        "message": "Slots created successfully",
        "slots_created": len(created_slots)
    })

@api_view(['GET'])
def get_workspace_slots(request, workspace_id):

    date = request.GET.get("date")

    slots = WorkspaceSlot.objects.filter(
        workspace_id=workspace_id,
        date=date
    )

    data = []

    for s in slots:
       data.append({
    "id": s.id,
    "slot_type": s.slot_type,

    # ✅ FIX HERE
  "start_time": (
    s.start_time.strftime("%H:%M")
    if hasattr(s.start_time, "strftime")
    else f"{s.start_time}:00" if s.start_time is not None else None
),

"end_time": (
    s.end_time.strftime("%H:%M")
    if hasattr(s.end_time, "strftime")
    else f"{s.end_time}:00" if s.end_time is not None else None
),

    "price": s.price,
    "capacity": s.capacity,
    "booked": s.booked_count,
    "is_full": s.is_full()
})

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_slots(request):

    slots = WorkspaceSlot.objects.filter(
        workspace__owner=request.user
    ).select_related("workspace").order_by("-id")

    data = []

    for s in slots:
        data.append({
            "id": s.id,
            "workspace_id": s.workspace.id,
            "workspace_name": s.workspace.name,

            "date": s.date,
            "slot_type": s.slot_type,

            "start_time": getattr(s, "start_time", ""),
            "end_time": getattr(s, "end_time", ""),

            "capacity": s.capacity,
            "price": s.price,
        })

    return Response(data)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import WorkspaceSlot


# ✅ UPDATE SLOT
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_slot(request, id):
    try:
        slot = WorkspaceSlot.objects.get(id=id, workspace__owner=request.user)

        slot.date = request.data.get("date", slot.date)
        slot.slot_type = request.data.get("slot_type", slot.slot_type)
        slot.start_time = request.data.get("start_time", slot.start_time)
        slot.end_time = request.data.get("end_time", slot.end_time)
        slot.capacity = request.data.get("capacity", slot.capacity)
        slot.price = request.data.get("price", slot.price)

        slot.save()

        return Response({"message": "Slot updated successfully"})

    except WorkspaceSlot.DoesNotExist:
        return Response({"error": "Slot not found"}, status=404)


# ✅ DELETE SLOT
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_slot(request, id):
    try:
        slot = WorkspaceSlot.objects.get(id=id, workspace__owner=request.user)
        slot.delete()
        return Response({"message": "Slot deleted successfully"})
    except WorkspaceSlot.DoesNotExist:
        return Response({"error": "Slot not found"}, status=404)
    
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import date
import calendar

@api_view(["GET"])
def workspace_month_status(request, workspace_id):
    year = int(request.GET.get("year"))
    month = int(request.GET.get("month"))

    days = calendar.monthrange(year, month)[1]

    data = {}

    for d in range(1, days + 1):
        current_date = f"{year}-{str(month).zfill(2)}-{str(d).zfill(2)}"

        slots = WorkspaceSlot.objects.filter(
            workspace_id=workspace_id,
            date=current_date
        )

        if not slots.exists():
            data[current_date] = "unreleased"
            continue

        all_full = all(s.booked >= s.capacity for s in slots)

        data[current_date] = "full" if all_full else "available"

    return Response(data)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_month_slots(request):
    workspace_id = request.data.get("workspace_id")
    months = request.data.get("months", [])
    year = request.data.get("year")
    capacity = request.data.get("capacity")
    price = request.data.get("price")

    for month in months:
        MonthlySlot.objects.create(
            workspace_id=workspace_id,
            month=month,
            year=year,
            capacity=capacity,
            price=price,
            created_by=request.user   # ✅ NOW WORKS
        )

    return Response({"message": "Monthly slots created"})
# views.py
@api_view(["GET"])
def get_month_slots(request, workspace_id):
    slots = MonthlySlot.objects.filter(workspace_id=workspace_id)

    data = [
        {
            "id": s.id,
            "month": s.month,
            "year": s.year,
            "price": s.price,
            "capacity": s.capacity,
            "booked": s.booked,
            "is_full": s.is_full,
        }
        for s in slots
    ]

    return Response(data)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_monthly_slots(request):
    slots = MonthlySlot.objects.filter(
        workspace__owner=request.user
    ).select_related("workspace")

    data = [
        {
            "id": s.id,
            "workspace_id": s.workspace.id,
            "workspace_name": s.workspace.name,
            "city": s.workspace.city,   # ✅ ADD THIS
            "location": s.workspace.location,  # ✅ OPTIONAL (better UI)
            "month": s.month,
            "year": s.year,
            "price": s.price,
            "capacity": s.capacity,
            "booked": s.booked,
            "is_full": s.is_full,
        }
        for s in slots
    ]

    return Response(data)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_monthly_slot(request, slot_id):
    slot = MonthlySlot.objects.get(id=slot_id, created_by=request.user)

    slot.capacity = request.data.get("capacity", slot.capacity)
    slot.price = request.data.get("price", slot.price)

    slot.save()

    return Response({"message": "Updated"})

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_monthly_slot(request, slot_id):
    slot = MonthlySlot.objects.get(id=slot_id, created_by=request.user)
    slot.delete()
    return Response({"message": "Deleted"})

from django.db import transaction
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_month_booking(request):
    slot_ids = request.data.get("slot_ids")   # LIST
    seats = int(request.data.get("seats", 1))
    payment_id = request.data.get("payment_id")

    if not slot_ids or not isinstance(slot_ids, list):
        return Response({"error": "slot_ids must be list"}, status=400)

    total_price = 0
    slots = []

    # VALIDATE ALL FIRST
    for slot_id in slot_ids:
        slot = MonthlySlot.objects.get(id=slot_id)

        if slot.booked + seats > slot.capacity:
            return Response({
                "error": f"{slot.month}/{slot.year} full"
            }, status=400)

        total_price += slot.price * seats
        slots.append(slot)

    # UPDATE ALL
    for slot in slots:
        slot.booked += seats

        if slot.booked >= slot.capacity:
            slot.is_full = True

        slot.save()

        Booking.objects.create(
            user=request.user,
            workspace=slot.workspace,
            seats=seats,
            total_price=slot.price * seats,
            payment_id=payment_id,
            booking_type="month",
            status="confirmed",
            month=slot.month,
            year=slot.year
        )

    return Response({
        "message": "Multi-month booking successful",
        "total_price": total_price
    })