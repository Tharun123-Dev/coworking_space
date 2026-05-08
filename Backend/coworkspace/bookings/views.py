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
from workspaces.models import MonthlySlot
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from workspaces.models import WorkspaceSlot, MonthlySlot
from .models import Booking

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from workspaces.models import (
    WorkspaceSlot,
    MonthlySlot,
    AdditionalAmenity
)
from .models import Booking


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):

    try:

        user = request.user

        print("REQUEST DATA:", request.data)

        booking_type = request.data.get(
            "booking_type",
            "day"
        )

        # ==================================
        # ✅ ADDITIONAL AMENITIES
        # ==================================

        amenities = request.data.get(
            "amenities",
            []
        )

        amenity_total = 0

        amenity_data = []

        for a in amenities:

            amenity = AdditionalAmenity.objects.filter(
                id=a.get("amenity_id")
            ).first()

            if amenity:

                try:

                    persons = int(
                        a.get("persons", 1)
                    )

                except:

                    persons = 1

                # ✅ FIX DECIMAL ISSUE

                price = float(
                    amenity.price
                )

                total = (
                    price
                    *
                    persons
                )

                amenity_total += total

                amenity_data.append({

                    "title":
                    amenity.title,

                    "price":
                    price,

                    "persons":
                    persons,

                    "total":
                    total

                })

        # =========================
        # ✅ DAY BOOKING
        # =========================

        if booking_type == "day":

            slot_id = request.data.get(
                "slot_id"
            )

            if not slot_id:

                return Response({

                    "error":
                    "slot_id required"

                }, status=400)

            try:

                seats = int(
                    request.data.get(
                        "seats",
                        1
                    )
                )

            except:

                return Response({

                    "error":
                    "Invalid seats"

                }, status=400)

            if seats < 1:

                return Response({

                    "error":
                    "Seats must be at least 1"

                }, status=400)

            slot = get_object_or_404(
                WorkspaceSlot,
                id=slot_id
            )

            available = (
                slot.capacity
                -
                slot.booked_count
            )

            if seats > available:

                return Response({

                    "error":
                    f"Only {available} seats left"

                }, status=400)

            booking = Booking.objects.create(

                user=user,

                slot=slot,

                workspace=slot.workspace,

                owner=slot.workspace.owner,

                date=slot.date,

                seats=seats,

                total_price=

                float(
                    slot.price * seats
                )

                +

                float(
                    amenity_total
                ),

                payment_status="VERIFIED",

                status="confirmed",

                amenities=amenity_data

            )

            slot.booked_count += seats

            slot.save()

        # =========================
        # ✅ MONTH BOOKING
        # =========================

        elif booking_type == "month":

            monthly_slots = request.data.get(
                "monthly_slots",
                []
            )

            if not monthly_slots:

                return Response({

                    "error":
                    "monthly_slots required"

                }, status=400)

            if not isinstance(
                monthly_slots,
                list
            ):

                return Response({

                    "error":
                    "monthly_slots must be a list"

                }, status=400)

            total_price = 0

            workspace = None

            validated_slots = []

            for slot_obj in monthly_slots:

                try:

                    mid = int(
                        slot_obj.get(
                            "monthly_slot_id"
                        )
                    )

                except (
                    TypeError,
                    ValueError
                ):

                    return Response({

                        "error":
                        "Invalid monthly_slot_id"

                    }, status=400)

                try:

                    slot_seats = int(
                        slot_obj.get(
                            "seats",
                            1
                        )
                    )

                except (
                    TypeError,
                    ValueError
                ):

                    return Response({

                        "error":
                        f"Invalid seats for slot {mid}"

                    }, status=400)

                if slot_seats < 1:

                    return Response({

                        "error":
                        f"Seats must be at least 1 for slot {mid}"

                    }, status=400)

                mslot = get_object_or_404(
                    MonthlySlot,
                    id=mid
                )

                if workspace is None:

                    workspace = mslot.workspace

                available = (
                    mslot.capacity
                    -
                    mslot.booked
                )

                if slot_seats > available:

                    return Response({

                        "error":
                        f"{mslot.month}/{mslot.year} only {available} seats left"

                    }, status=400)

                total_price += (

                    float(mslot.price)

                    *

                    slot_seats

                )

                validated_slots.append(

                    (
                        mslot,
                        slot_seats
                    )

                )

            if workspace is None:

                return Response({

                    "error":
                    "Could not determine workspace"

                }, status=400)

            booking = Booking.objects.create(

                user=user,

                workspace=workspace,

                owner=workspace.owner,

                date=timezone.now().date(),

                seats=sum(
                    s for _, s
                    in validated_slots
                ),

                total_price=

                float(total_price)

                +

                float(amenity_total),

                payment_status="VERIFIED",

                status="confirmed",

                booking_type="month",

                amenities=amenity_data

            )

            for mslot, slot_seats in validated_slots:

                mslot.booked += slot_seats

                mslot.save()

        else:

            return Response({

                "error":
                "Invalid booking type"

            }, status=400)

        return Response({

            "message":
            "Booking successful",

            "booking_id":
            booking.id

        }, status=201)

    except Exception as e:

        print("🔥 ERROR:", str(e))

        return Response({

            "error": str(e)

        }, status=500)
# ===============================
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import json

from .models import Cart, CartItem
from workspaces.models import WorkspaceSlot, MonthlySlot

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):

    try:

        user = request.user

        data = request.data

        print("REQUEST DATA:", data)

        slot_id = data.get("slot_id")

        monthly_slot_ids = data.get(
            "monthly_slot_ids",
            []
        )

        booking_type = data.get(
            "booking_type",
            "day"
        )

        # ==================================
        # ✅ ADDITIONAL AMENITIES
        # ==================================

        amenities = data.get(
            "amenities",
            []
        )

        amenity_total = 0

        amenity_data = []

        for a in amenities:

            amenity = AdditionalAmenity.objects.filter(
                id=a.get("amenity_id")
            ).first()

            if amenity:

                try:

                    persons = int(
                        a.get("persons", 1)
                    )

                except:

                    persons = 1

                # ✅ FIX DECIMAL ISSUE

                price = float(
                    amenity.price
                )

                total = (
                    price
                    *
                    persons
                )

                amenity_total += total

                amenity_data.append({

                    "title":
                    amenity.title,

                    "price":
                    price,

                    "persons":
                    persons,

                    "total":
                    total

                })

        # ==================================
        # ✅ SAFE SEATS
        # ==================================

        try:

            seats = int(
                data.get("seats", 1)
            )

        except:

            return Response({

                "error":
                "Invalid seats"

            }, status=400)

        if seats < 1:

            return Response({

                "error":
                "Seats must be at least 1"

            }, status=400)

        # ==================================
        # ✅ DAY BOOKING
        # ==================================

        if booking_type == "day":

            if not slot_id:

                return Response({

                    "error":
                    "slot_id required"

                }, status=400)

            slot = WorkspaceSlot.objects.filter(
                id=slot_id
            ).first()

            if not slot:

                return Response({

                    "error":
                    "Invalid slot"

                }, status=404)

            available = (
                slot.capacity
                -
                slot.booked_count
            )

            if seats > available:

                return Response({

                    "error":
                    f"Only {available} seats left"

                }, status=400)

            booking = Booking.objects.create(

                user=user,

                slot=slot,

                workspace=slot.workspace,

                owner=slot.workspace.owner,

                date=slot.date,

                seats=seats,

                total_price=

                float(
                    slot.price * seats
                )

                +

                float(
                    amenity_total
                ),

                payment_status="VERIFIED",

                status="confirmed",

                amenities=amenity_data

            )

            slot.booked_count += seats

            slot.save()

        # ==================================
        # ✅ MONTH BOOKING
        # ==================================

        elif booking_type == "month":

            if not monthly_slot_ids:

                return Response({

                    "error":
                    "monthly_slot_ids required"

                }, status=400)

            try:

                monthly_slot_ids = [

                    int(mid)

                    for mid in monthly_slot_ids

                ]

            except:

                return Response({

                    "error":
                    "Invalid monthly_slot_ids"

                }, status=400)

            workspace = None

            total_price = 0

            validated_slots = []

            for mid in monthly_slot_ids:

                mslot = get_object_or_404(
                    MonthlySlot,
                    id=mid
                )

                if workspace is None:

                    workspace = mslot.workspace

                available = (
                    mslot.capacity
                    -
                    mslot.booked
                )

                if seats > available:

                    return Response({

                        "error":
                        f"{mslot.month}/{mslot.year} only {available} seats left"

                    }, status=400)

                total_price += (

                    float(mslot.price)

                    *

                    seats

                )

                validated_slots.append(
                    mslot
                )

            booking = Booking.objects.create(

                user=user,

                workspace=workspace,

                owner=workspace.owner,

                seats=seats,

                total_price=

                float(total_price)

                +

                float(
                    amenity_total
                ),

                payment_status="VERIFIED",

                status="confirmed",

                booking_type="month",

                amenities=amenity_data

            )

            for mslot in validated_slots:

                mslot.booked += seats

                mslot.save()

        else:

            return Response({

                "error":
                "Invalid booking type"

            }, status=400)

        return Response({

            "message":
            "Booking created successfully",

            "booking_id":
            booking.id

        }, status=201)

    except Exception as e:

        print("🔥 ERROR:", str(e))

        return Response({

            "error":
            str(e)

        }, status=500)

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
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Booking
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Booking


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_bookings(request):

    bookings = Booking.objects.all().order_by("-id")

    data = []

    for b in bookings:

        slot = getattr(
            b,
            "slot",
            None
        )

        # =========================
        # ✅ FORCE CORRECT TYPE
        # =========================

        booking_type = (
            b.booking_type or ""
        ).lower()

        # =========================
        # ✅ SLOT LOGIC
        # =========================

        if booking_type == "month":

            slot_type = "Monthly"

            slot_time = "Monthly Booking"

        elif (
            slot
            and
            slot.slot_type == "hour"
        ):

            slot_type = "Hourly"

            slot_time = (
                f"{slot.start_time}"
                f" - "
                f"{slot.end_time}"
            )

        else:

            slot_type = "Full Day"

            slot_time = "Full Day"

        data.append({

            "id":
            b.id,

            # 👤 USERS

            "owner":
            b.owner.username
            if b.owner else "",

            "user":
            b.user.username
            if b.user else "",

            # 🏢 WORKSPACE

            "workspace":
            b.workspace.name
            if b.workspace else "",

            "location":
            getattr(
                b.workspace,
                "location",
                ""
            ),

            "city":
            getattr(
                b.workspace,
                "city",
                ""
            ),

            # 🕒 SLOT INFO

            "slot_type":
            slot_type,

            "slot_time":
            slot_time,

            "booking_type":
            booking_type,

            # 📅 BOOKING

            "date":
            b.date,

            "price":
            b.total_price,

            "total_price":
            b.total_price,

            "status":
            b.status,

            # ✅ AMENITIES

            "amenities":
            getattr(
                b,
                "amenities",
                []
            ),

            # 💳 PAYMENT

            "payment_status":
            getattr(
                b,
                "payment_status",
                "PAID"
            ),

            "refund_amount":
            getattr(
                b,
                "refund_amount",
                0
            ),

              "image": (
                b.workspace.image.url
                if hasattr(b.workspace.image, "url")
                else b.workspace.image
            ),

        })

    return Response(data)
from rest_framework.response import Response
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_bookings(request):

    try:

        bookings = Booking.objects.filter(
            owner=request.user
        ).select_related(
            "workspace"
        ).order_by("-id")

        data = []

        for b in bookings:

            data.append({

                "id":
                b.id,

                "user":
                b.user.username
                if b.user else "",

                "workspace":
                b.workspace.name
                if b.workspace else "",

                "location":
                b.workspace.location
                if b.workspace else "",

                "image":
                b.workspace.image
                if b.workspace else "",

                "city":
                b.workspace.city
                if b.workspace else "",

                "date":
                getattr(
                    b,
                    "date",
                    ""
                ),

                "slot_type":
                getattr(
                    b,
                    "booking_type",
                    "day"
                ),

                "slot_time":

                (
                    f"{b.slot.start_time}"
                    f" - "
                    f"{b.slot.end_time}"
                )

                if hasattr(b, "slot")
                and b.slot

                else "Monthly",

                "total_price":
                b.total_price,

                "status":
                b.status,

                # ✅ ADD THIS

                "amenities":
                getattr(
                    b,
                    "amenities",
                    []
                ),

            })

        return Response(data)

    except Exception as e:

        return Response({

            "error":
            str(e)

        }, status=500)
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
        "slot"
    ).order_by("-id")

    data = []

    for b in bookings:

        slot = getattr(
            b,
            "slot",
            None
        )

        # ✅ NORMALIZE TYPE

        booking_type = (
            b.booking_type or ""
        ).lower()

        # =========================
        # ✅ SLOT LOGIC
        # =========================

        if booking_type == "month":

            slot_type = "Monthly"

            slot_time = "Monthly Booking"

        elif (
            slot
            and
            getattr(
                slot,
                "slot_type",
                ""
            ) == "hour"
        ):

            slot_type = "Hourly"

            slot_time = (
                f"{slot.start_time}"
                f" - "
                f"{slot.end_time}"
            )

        else:

            slot_type = "Full Day"

            slot_time = "Full Day"

        data.append({

            "id":
            b.id,

            # 👤 USERS

            "owner":

            b.workspace.owner.username

            if (
                b.workspace
                and
                b.workspace.owner
            )

            else "",

            "user":
            b.user.username
            if b.user else "",

            # 🏢 WORKSPACE

            "workspace":
            b.workspace.name
            if b.workspace else "",

            "location":
            b.workspace.location
            if b.workspace else "",

            "city":
            getattr(
                b.workspace,
                "city",
                ""
            ),

            # 📅 BOOKING

            "date":
            b.date,

            # 🕒 SLOT

            "slot_type":
            slot_type,

            "slot_time":
            slot_time,

            "booking_type":
            booking_type,

            # 💰 PRICE

            "price":
            b.total_price,

            "total_price":
            b.total_price,

            # ✅ AMENITIES

            "amenities":
            getattr(
                b,
                "amenities",
                []
            ),

            # 📌 STATUS

            "status":
            b.status,

            # 💳 PAYMENT

            "payment_status":
            getattr(
                b,
                "payment_status",
                "PAID"
            ),

            "refund_amount":
            getattr(
                b,
                "refund_amount",
                0
            ),

            # 🖼 SAFE IMAGE

               "image": (
                b.workspace.image.url
                if hasattr(b.workspace.image, "url")
                else b.workspace.image
            ),

        })

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):

    bookings = Booking.objects.filter(
        user=request.user
    ).order_by("-id")

    data = []

    for b in bookings:

        workspace = b.workspace

        slot = b.slot

        # =========================
        # ✅ SLOT LOGIC FIX
        # =========================

        if b.booking_type == "month":

            slot_type = "Monthly"

            slot_time = "Monthly Booking"

        elif slot:

            if slot.slot_type == "hour":

                slot_type = "Hourly"

                slot_time = (
                    f"{slot.start_time}"
                    f" - "
                    f"{slot.end_time}"
                )

            else:

                slot_type = "Full Day"

                slot_time = "Full Day"

        else:

            slot_type = "Full Day"

            slot_time = "Full Day"

        data.append({

            "id": b.id,

            # ✅ WORKSPACE INFO

            "workspace":
            workspace.name
            if workspace else "",

            "location":
            workspace.location
            if workspace else "",

            "city":
            getattr(
                workspace,
                "city",
                ""
            ),

            "area":
            getattr(
                workspace,
                "area",
                ""
            ),

            # ✅ SLOT INFO

            "slot_type":
            slot_type,

            "slot_time":
            slot_time,

            "booking_type":
            b.booking_type,

            # ✅ DATE

            "date":
            b.date,

            # ✅ PRICE

            "price":
            b.total_price,

            "total_price":
            b.total_price,

            # ✅ AMENITIES

            "amenities":
            getattr(
                b,
                "amenities",
                []
            ),

            # ✅ STATUS

            "status":
            b.status,

            "payment_status":
            getattr(
                b,
                "payment_status",
                "PAID"
            ),

            "refund_amount":
            getattr(
                b,
                "refund_amount",
                0
            ),

            # ✅ IMAGE FIX

            "image":

            (

                workspace.image.url

                if hasattr(
                    workspace.image,
                    "url"
                )

                else workspace.image

            )

            if workspace else ""

        })

    return Response(data)


from django.db.models import Sum

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_revenue(request):

    bookings = Booking.objects.filter(
        owner=request.user
    )

    # ✅ TOTAL REVENUE

    total = bookings.aggregate(
        total=Sum("total_price")
    )["total"] or 0

    # ✅ CONFIRMED REVENUE

    confirmed = bookings.filter(
        status="confirmed"
    ).aggregate(
        total=Sum("total_price")
    )["total"] or 0

    # ✅ CANCELLED BOOKINGS

    cancelled = bookings.filter(
        status="cancelled"
    ).count()

    # ✅ AMENITIES REVENUE

    amenities_revenue = 0

    for booking in bookings:

        amenities = getattr(
            booking,
            "amenities",
            []
        )

        for a in amenities:

            amenities_revenue += (
                a.get("total", 0)
            )

    return Response({

        "total_revenue":
        total,

        "confirmed_revenue":
        confirmed,

        "cancelled_count":
        cancelled,

        # ✅ NEW

        "amenities_revenue":
        amenities_revenue

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

