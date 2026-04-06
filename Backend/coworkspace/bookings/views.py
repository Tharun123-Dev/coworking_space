from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Cart, CartItem
from workspaces.models import Workspace
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from .models import Booking
from django.shortcuts import get_object_or_404





@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):

    workspace_id = request.data.get('workspace_id')

    if not workspace_id:
        return Response({"error": "No workspace_id"}, status=400)

    workspace = get_object_or_404(Workspace, id=workspace_id)

    user = request.user
    duration = request.data.get('duration')
    date = request.data.get('date')

    total_price = workspace.price * int(duration)

    Booking.objects.create(
        user=user,
        workspace=workspace,
        duration=duration,
        date=date,
        total_price=total_price
    )
    #  CLEAR CART AFTER BOOKING
    cart = Cart.objects.filter(user=user).first()
    if cart:
     CartItem.objects.filter(cart=cart).delete()

    return Response({"message": "Booking successful"})
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart = Cart.objects.get(user=request.user)
    items = CartItem.objects.filter(cart=cart)

    data = []
    for item in items:
        data.append({
            "id": item.id,
            "workspace_id":item.workspace.id,
            "workspace": item.workspace.name,
            "price": item.workspace.price,
            "location": item.workspace.location,
            "image": item.workspace.image,
            "duration": item.duration
        })

    return Response(data)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_item(request, id):
    item = CartItem.objects.get(id=id)
    item.delete()
    return Response({"message": "Item removed"})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    cart = Cart.objects.filter(user=request.user).first()
    if cart:
        CartItem.objects.filter(cart=cart).delete()

    return Response({"message": "Cart cleared"})



# GET ALL BOOKINGS (ADMIN / OWNER)
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
            "status": getattr(b, "status", "pending")
        })

    return Response(data)


# OWNER CONFIRM BOOKING
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def confirm_booking(request, id):

    booking = Booking.objects.get(id=id)

    booking.status = "confirmed"
    booking.save()

    return Response({"message": "Booking confirmed"})


# OWNER CANCEL BOOKING
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, id):

    booking = Booking.objects.get(id=id)

    booking.status = "cancelled"
    booking.save()

    return Response({"message": "Booking cancelled"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_bookings(request):

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
            "total_price": b.total_price,
            "status": b.status
        })

    return Response(data)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def confirm_booking(request, id):

    booking = Booking.objects.get(id=id)

    booking.status = "confirmed"
    booking.save()

    return Response({"message": "Booking confirmed"})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, id):

    booking = Booking.objects.get(id=id)

    booking.status = "cancelled"
    booking.save()

    return Response({"message": "Booking cancelled"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_bookings(request):
    bookings = Booking.objects.all()

    data = []
    for b in bookings:
        data.append({
            "id": b.id,
            "user": b.user.username,
            "workspace": b.workspace.name,
            "date": b.date,
            "status": b.status
        })

    return Response(data)


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
            "status": b.status if b.status else "Pending"
        })

    return Response(data)