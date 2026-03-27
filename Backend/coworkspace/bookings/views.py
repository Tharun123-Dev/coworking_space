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

