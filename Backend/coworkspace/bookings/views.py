from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Cart, CartItem
from workspaces.models import Workspace
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from .models import Booking
from django.shortcuts import get_object_or_404
from django.utils import timezone


# ===============================
# CREATE BOOKING (OWNER BASED)
# ===============================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):

    workspace_id = request.data.get('workspace_id')
    cart_item_id = request.data.get('cart_item_id')   # ADD THIS

    if not workspace_id:
        return Response({"error": "No workspace_id"}, status=400)

    workspace = get_object_or_404(Workspace, id=workspace_id)

    user = request.user
    duration = request.data.get('duration')
    date = request.data.get('date')

    total_price = workspace.price * int(duration)

    # ✅ OWNER AUTO ASSIGNED
    owner = workspace.owner

    Booking.objects.create(
        user=user,
        workspace=workspace,
        owner=owner,
        duration=duration,
        date=date,
        total_price=total_price
    )

   # REMOVE ONLY THAT ITEM
    if cart_item_id:
        CartItem.objects.filter(id=cart_item_id).delete()

    return Response({"message": "Booking successful"})


# ===============================
# ADD TO CART
# ===============================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    user = request.user
    workspace_id = request.data.get('workspace_id')
    duration = request.data.get('duration', 1)

    workspace = Workspace.objects.get(id=workspace_id)

    cart, created = Cart.objects.get_or_create(user=user)

    CartItem.objects.create(
        cart=cart,
        workspace=workspace,
        duration=duration
    )

    return Response({"message": "Added to cart"})


# ===============================
# GET CART
# ===============================



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):

    cart = Cart.objects.get(user=request.user)

    # ✅ remove expired items automatically
    CartItem.objects.filter(
        cart=cart,
        expires_at__lt=timezone.now()
    ).delete()

    items = CartItem.objects.filter(cart=cart)

    data = []
    for item in items:
        data.append({
            "id": item.id,
            "workspace_id": item.workspace.id,
            "workspace": item.workspace.name,
            "price": item.workspace.price,
            "location": item.workspace.location,
            "image": item.workspace.image,
            "duration": item.duration
        })

    return Response(data)


# ===============================
# REMOVE ITEM
# ===============================
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_item(request, id):
    try:
     item = CartItem.objects.get(id=id, cart__user=request.user)

     item.delete()
     return Response({"message": "Item removed"})
    except CartItem.DoesNotExist:
        return Response({"error": "Item not found"},status=404)


# ===============================
# CLEAR CART
# ===============================
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    cart = Cart.objects.filter(user=request.user).first()
    if cart:
        CartItem.objects.filter(cart=cart).delete()

    return Response({"message": "Cart cleared"})


# ===============================
# ADMIN ALL BOOKINGS
# ===============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_bookings(request):

    bookings = Booking.objects.all().order_by("-id")

    data = []

    for b in bookings:
        data.append({
            "id": b.id,
            
            "user": b.user.username,
            "workspace": b.workspace.name,
            "location": b.workspace.location,
            "date": b.date,
            "duration": b.duration,
            "price": b.total_price,
            "status": b.status
        })

    return Response(data)


# ===============================
# OWNER BOOKINGS (ONLY THEIR)
# ===============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_bookings(request):

    bookings = Booking.objects.filter(owner=request.user).order_by("-id")

    data = []

    for b in bookings:
        data.append({
            "id": b.id,
                # ✅ SAFE IMAGE FIX
    "image": (
        b.workspace.image.url
        if hasattr(b.workspace.image, "url")
        else b.workspace.image
    ),
            "user": b.user.username,
            "workspace": b.workspace.name,
            "location": b.workspace.location,
            "date": b.date,
            "duration": b.duration,
            "total_price": b.total_price,
            "status": b.status
        })

    return Response(data)


# ===============================
# CONFIRM BOOKING (OWNER)
# ===============================
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def confirm_booking(request, id):

    booking = Booking.objects.get(id=id)

    # ✅ only workspace owner can confirm
    if booking.owner != request.user:
        return Response({"error": "Not allowed"}, status=403)

    booking.status = "confirmed"
    booking.save()

    return Response({"message": "Booking confirmed"})


# ===============================
# CANCEL BOOKING (OWNER)
# ===============================
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, id):

    booking = Booking.objects.get(id=id)

    # ✅ only workspace owner can cancel
    if booking.owner != request.user:
        return Response({"error": "Not allowed"}, status=403)

    booking.status = "cancelled"
    booking.save()

    return Response({"message": "Booking cancelled"})


# ===============================
# ADMIN TRACK BOOKINGS
# ===============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_bookings(request):

    bookings = Booking.objects.select_related(
        "workspace",
        "workspace__owner",
        "user"
    ).order_by("-id")

    data = []

    for b in bookings:
        data.append({
            "id": b.id,
            
            "owner": b.workspace.owner.username if b.workspace and b.workspace.owner else "",
            "user": b.user.username if b.user else "",
            "workspace": b.workspace.name if b.workspace else "",
            "location": b.workspace.location if b.workspace else "",
            "date": b.date,
            "duration": b.duration,
            "price": b.total_price,
            "status": b.status,
             "image": (
                   b.workspace.image.url
                  if hasattr(b.workspace.image, "url")
               else b.workspace.image
                                        ),
            
            
        })

    return Response(data)


# ===============================
# USER MY ORDERS
# ===============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):

    bookings = Booking.objects.filter(user=request.user).order_by("-id")

    data = []
    for b in bookings:
       data.append({
    "id": b.id,
    "workspace": b.workspace.name,
    "location": b.workspace.location,
    "date": b.date,
    "duration": b.duration,
    "price": b.total_price,
    "status": b.status,

    # ✅ SAFE IMAGE FIX
    "image": (
        b.workspace.image.url
        if hasattr(b.workspace.image, "url")
        else b.workspace.image
    )
})
    return Response(data)
from django.db.models import Sum

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_revenue(request):

    bookings = Booking.objects.filter(owner=request.user)

    total = bookings.aggregate(total=Sum("total_price"))["total"] or 0

    confirmed = bookings.filter(status="confirmed").aggregate(
        total=Sum("total_price")
    )["total"] or 0

    pending = bookings.filter(status="pending").aggregate(
        total=Sum("total_price")
    )["total"] or 0

    cancelled = bookings.filter(status="cancelled").count()

    return Response({
        "total_revenue": total,
        "confirmed_revenue": confirmed,
        "pending_revenue": pending,
        "cancelled_count": cancelled
    })
