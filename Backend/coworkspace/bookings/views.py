from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Cart, CartItem
from workspaces.models import Workspace
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from .models import Booking, CancelRequest
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
    total_price=total_price,

    # ✅ ADD THESE
    payment_id=request.data.get("payment_id"),
    payment_status="PAID"
)
    print("RECEIVED PAYMENT ID:", request.data.get("payment_id"))
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
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, id):

    import razorpay
    from django.conf import settings
    from rest_framework.response import Response

    try:
        booking = Booking.objects.get(id=id)
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=404)

    # ✅ only owner can cancel
    if booking.owner != request.user:
        return Response({"error": "Not allowed"}, status=403)

    # ✅ already cancelled
    if booking.status == "cancelled":
        return Response({"message": "Already cancelled"})

    booking.status = "cancelled"

    print("PAYMENT ID:", booking.payment_id)

    # 💰 FIXED REFUND LOGIC
    if booking.payment_status != "REFUNDED":

        if booking.payment_id:

            # ✅ CHECK OTHER BOOKINGS WITH SAME PAYMENT
            already_refunded = Booking.objects.filter(
                payment_id=booking.payment_id,
                payment_status="REFUNDED"
            ).exclude(id=booking.id).exists()

            if already_refunded:
                print("Refund already done for this payment_id ✅")
                booking.payment_status = "REFUNDED"

            else:
                try:
                    client = razorpay.Client(
                        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET)
                    )

                    refund = client.payment.refund(booking.payment_id)
                    print("REFUND RESPONSE:", refund)

                    booking.payment_status = "REFUNDED"

                except Exception as e:
                    print("REFUND ERROR:", e)
                    return Response({"error": "Refund failed"}, status=500)

        else:
            print("NO PAYMENT ID FOUND ❌")

    else:
        print("Already refunded ✅")

    # ✅ ALWAYS SET REFUND AMOUNT
    booking.refund_amount = booking.total_price

    booking.save()

    print("FINAL STATUS:", booking.payment_status)
    print("REFUND AMOUNT:", booking.refund_amount)

    return Response({
        "message": "Booking cancelled & refunded",
        "payment_status": booking.payment_status,
        "refund_amount": booking.refund_amount
    })
# ==============================
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
"payment_status": getattr(b, "payment_status", "PAID"),  # ✅ ADD
  "refund_amount": getattr(b, "refund_amount", 0),


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

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from bookings.models import Booking
import razorpay
from django.conf import settings

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def verify_booking(request, id):

    try:
        booking = Booking.objects.get(id=id)
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=404)

    # ✅ only owner can verify
    if booking.owner != request.user:
        return Response({"error": "Not allowed"}, status=403)

    # ❌ already cancelled
    if booking.status == "cancelled":
        return Response({"error": "Cannot verify cancelled booking"})

    booking.status = "confirmed"
    booking.payment_status = "VERIFIED"
    booking.save()

    return Response({"message": "Booking verified successfully"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_request(request):

    booking_id = request.data.get("booking_id")
    reason = request.data.get("reason")

    booking = Booking.objects.get(id=booking_id)

    CancelRequest.objects.create(
        booking=booking,
        user=request.user,
        reason=reason
    )

    return Response({"message": "Request sent"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_cancel_requests(request):

    requests = CancelRequest.objects.filter(
        booking__owner=request.user
    )

    data = [
        {
            "id": r.id,
            "workspace": r.booking.workspace.name,
            "user": r.user.username,
            "amount": r.booking.total_price,
            "reason": r.reason,
            "status": r.status
        }
        for r in requests
    ]

    return Response(data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def approve_cancel(request, id):

    req = CancelRequest.objects.get(id=id)

    req.status = "APPROVED"
    req.save()

    booking = req.booking
    booking.status = "cancelled"

    # REFUND
    if booking.payment_id:
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET)
        )

        client.payment.refund(booking.payment_id)
        booking.refund_amount = booking.total_price
        booking.payment_status = "REFUNDED"

    booking.save()

    return Response({"message": "Cancelled & Refunded"})