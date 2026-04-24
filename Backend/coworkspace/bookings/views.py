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
from .models import Slot
from workspaces.models import ActivityLog   # adjust if path different

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Booking
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from workspaces.models import WorkspaceSlot
from .models import Booking

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):
    try:
        slot_id = request.data.get("slot_id")
        seats = int(request.data.get("seats", 1))

        if not slot_id:
            return Response({"error": "slot_id required"}, status=400)

        if seats < 1:
            return Response({"error": "Seats must be at least 1"}, status=400)

        slot = get_object_or_404(WorkspaceSlot, id=slot_id)

        available = slot.capacity - slot.booked_count

        if seats > available:
            return Response({"error": f"Only {available} seats left"}, status=400)

        workspace = slot.workspace
        user = request.user

        booking = Booking.objects.create(
            user=user,
            slot=slot,
            workspace=workspace,
            owner=workspace.owner,
            date=slot.date,
            seats=seats,
            total_price=slot.price * seats,
            payment_status="VERIFIED",
            status="confirmed"
        )

        slot.booked_count += seats
        slot.save()

        return Response({
            "message": "Booking successful",
            "booking_id": booking.id
        }, status=201)

    except ValueError:
        return Response({"error": "Invalid seats value"}, status=400)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
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
        slot = getattr(b, "slot", None)

        slot_type = "Full Day"
        slot_time = "Full Day"

        if slot:
            if slot.slot_type == "hour":
                slot_type = "Hourly"
                slot_time = f"{slot.start_time} - {slot.end_time}"
            else:
                slot_type = "Full Day"

        data.append({
            "id": b.id,

            "owner": b.owner.username if b.owner else "",
            "user": b.user.username if b.user else "",

            "workspace": b.workspace.name,
            "location": b.workspace.location,

            # ✅ REPLACE duration with SLOT
            "slot_type": slot_type,
            "slot_time": slot_time,

            "date": b.date,
            "price": b.total_price,
            "status": b.status,

            "payment_status": getattr(b, "payment_status", "PAID"),
            "refund_amount": getattr(b, "refund_amount", 0),

            "image": (
                b.workspace.image.url
                if hasattr(b.workspace.image, "url")
                else b.workspace.image
            )
        })

    return Response(data)
from rest_framework.response import Response
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_bookings(request):

    bookings = Booking.objects.filter(
        owner=request.user
    ).order_by("-id")

    data = []
    for b in bookings:
        workspace = b.workspace
        slot = b.slot

        # ✅ SLOT INFO
        slot_type = "Full Day"
        slot_time = "Full Day"

        if slot:
            if slot.slot_type == "hour":
                slot_type = "Hourly"
                slot_time = f"{slot.start_time} - {slot.end_time}"
            else:
                slot_type = "Full Day"
                slot_time = "Full Day"

        data.append({
            "id": b.id,

            # ✅ USER INFO (IMPORTANT)
            "user": b.user.username,

            # ✅ WORKSPACE
            "workspace": workspace.name if workspace else "",
            "location": workspace.location if workspace else "",

            # ✅ SLOT
            "slot_type": slot_type,
            "slot_time": slot_time,

            # ✅ DATE + PRICE
            "date": b.date,
            "total_price": b.total_price,

            # ✅ STATUS
            "status": b.status,
            "payment_status": b.payment_status,

            # ✅ IMAGE
               "image": (
                b.workspace.image.url
                if hasattr(b.workspace.image, "url")
                else b.workspace.image
            ),
        })

    return Response(data)
# ===============================
# CONFIRM BOOKING (OWNER)
# ===============================
# from workspaces.models import ActivityLog

# @api_view(['PUT'])
# @permission_classes([IsAuthenticated])
# def confirm_booking(request, id):

#     booking = Booking.objects.get(id=id)

#     if booking.owner != request.user:
#         return Response({"error": "Not allowed"}, status=403)

#     booking.status = "confirmed"
#     booking.save()

#     # ✅ ADD ACTIVITY LOG
#     ActivityLog.objects.create(
#         user=request.user,
#         action="UPDATE",
#         model_name="Booking",
#         message=f"{request.user.username} confirmed booking for {booking.workspace.name}"
#     )

#     return Response({"message": "Booking confirmed"})
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
    
    # ✅ ADD ACTIVITY LOG
    ActivityLog.objects.create(
        user=request.user,
        action="UPDATE",
        model_name="Booking",
        message=f"{request.user.username} cancel booking for {booking.workspace.name} and refunded ${booking.total_price}"
    )


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
        "user",
        "slot"   # ✅ important if slot exists
    ).order_by("-id")

    data = []

    for b in bookings:
        slot = getattr(b, "slot", None)

        slot_type = "Full Day"
        slot_time = "Full Day"

        if slot:
            if getattr(slot, "slot_type", "") == "hour":
                slot_type = "Hourly"
                slot_time = f"{slot.start_time} - {slot.end_time}"
            else:
                slot_type = "Full Day"

        data.append({
            "id": b.id,
            
            "owner": b.workspace.owner.username if b.workspace and b.workspace.owner else "",
            "user": b.user.username if b.user else "",
            "workspace": b.workspace.name if b.workspace else "",
            "location": b.workspace.location if b.workspace else "",
            "date": b.date,

            # ✅ FIXED (instead of duration)
            "slot_type": slot_type,
            "slot_time": slot_time,

            "price": b.total_price,
            "status": b.status,

            # ✅ SAME IMAGE (unchanged as you requested)
            "image": (
                b.workspace.image.url
                if hasattr(b.workspace.image, "url")
                else b.workspace.image
            ),
        })

    return Response(data)


# ===============================
# USER MY ORDERS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):

    bookings = Booking.objects.filter(user=request.user).order_by("-id")

    data = []
    for b in bookings:
        workspace = b.workspace
        slot = b.slot

        # ✅ SLOT TYPE
        slot_type = "Full Day"
        slot_time = "Full Day"

        if slot:
            if slot.slot_type == "hour":
                slot_type = "Hourly"
                slot_time = f"{slot.start_time} - {slot.end_time}"
            else:
                slot_type = "Full Day"
                slot_time = "Full Day"

        data.append({
            "id": b.id,

            # ✅ WORKSPACE INFO
            "workspace": workspace.name if workspace else "",
            "location": workspace.location if workspace else "",
            "city": getattr(workspace, "city", ""),
            "area": getattr(workspace, "area", ""),

            # ✅ SLOT INFO (IMPORTANT)
            "slot_type": slot_type,
            "slot_time": slot_time,

            # ✅ DATE
            "date": b.date,

            # ✅ PRICE
            "price": b.total_price,
            "total_price": b.total_price,

            # ✅ STATUS
            "status": b.status,
            "payment_status": getattr(b, "payment_status", "PAID"),
            "refund_amount": getattr(b, "refund_amount", 0),

           # ✅ SAFE IMAGE FIX
    "image": (
        b.workspace.image.url
        if hasattr(b.workspace.image, "url")
        else b.workspace.image
    )
        })

    return Response(data)

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

    cancelled = bookings.filter(status="cancelled").count()

    return Response({
        "total_revenue": total,
        "confirmed_revenue": confirmed,
        "cancelled_count": cancelled
    })

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from bookings.models import Booking
import razorpay
from django.conf import settings

# @api_view(['PUT'])
# @permission_classes([IsAuthenticated])
# def verify_booking(request, id):

#     try:
#         booking = Booking.objects.get(id=id)
#     except Booking.DoesNotExist:
#         return Response({"error": "Booking not found"}, status=404)

#     # ✅ only owner can verify
#     if booking.owner != request.user:
#         return Response({"error": "Not allowed"}, status=403)

#     # ❌ already cancelled
#     if booking.status == "cancelled":
#         return Response({"error": "Cannot verify cancelled booking"})

#     booking.status = "confirmed"
#     booking.payment_status = "VERIFIED"
#     booking.save()

#     # ✅ ADD ACTIVITY LOG
#     ActivityLog.objects.create(
#         user=request.user,
#         action="UPDATE",
#         model_name="Booking",
#         message=f"{request.user.username} verified booking for {booking.workspace.name}"
#     )

#     return Response({"message": "Booking verified successfully"})

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

    try:
        req = CancelRequest.objects.get(id=id)
    except CancelRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)

    req.status = "APPROVED"
    req.save()

    booking = req.booking
    booking.status = "cancelled"

    # 💰 REFUND
    if booking.payment_id:
        try:
            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET)
            )

            client.payment.refund(booking.payment_id)

            booking.refund_amount = booking.total_price
            booking.payment_status = "REFUNDED"

        except Exception as e:
            print("REFUND ERROR:", e)
            return Response({"error": "Refund failed"}, status=500)

    booking.save()

    # ✅ ADD ACTIVITY LOG (IMPORTANT)
    ActivityLog.objects.create(
        user=request.user,
        action="UPDATE",
        model_name="CancelRequest",
        message=f"{request.user.username} approved cancellation for {booking.workspace.name} and refunded ₹{booking.total_price}"
    )

    return Response({"message": "Cancelled & Refunded"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_slots(request):

    workspace_id = request.data.get("workspace_id")
    date = request.data.get("date")
    slot_type = request.data.get("slot_type")  # HOURLY / FULL_DAY
    capacity = int(request.data.get("capacity", 50))

    workspace = get_object_or_404(Workspace, id=workspace_id)

    # only owner can create
    if workspace.owner != request.user:
        return Response({"error": "Not allowed"}, status=403)

    created_slots = []

    # 🔹 HOURLY SLOTS
    if slot_type == "HOURLY":
        times = request.data.get("times", [])  # ["9-10", "10-11"]
        price = int(request.data.get("price"))

        for t in times:
            slot = Slot.objects.create(
                workspace=workspace,
                date=date,
                slot_type="HOURLY",
                time=t,
                price=price,
                capacity=capacity,
                created_by=request.user
            )
            created_slots.append(slot.id)

    # 🔹 FULL DAY SLOT
    elif slot_type == "FULL_DAY":
        price = int(request.data.get("price"))

        slot = Slot.objects.create(
            workspace=workspace,
            date=date,
            slot_type="FULL_DAY",
            price=price,
            capacity=capacity,
            created_by=request.user
        )
        created_slots.append(slot.id)

    return Response({"message": "Slots created", "ids": created_slots})

@api_view(['GET'])
def get_slots(request, workspace_id):

    date = request.GET.get("date")

    slots = Slot.objects.filter(workspace_id=workspace_id)

    if date:
        slots = slots.filter(date=date)

    data = []

    for s in slots:
        data.append({
            "id": s.id,
            "date": s.date,
            "time": s.time,
            "slot_type": s.slot_type,
            "price": s.price,
            "capacity": s.capacity,
            "booked": s.booked_count,
            "available": s.capacity - s.booked_count,
            "is_full": s.booked_count >= s.capacity
        })

    return Response(data)

