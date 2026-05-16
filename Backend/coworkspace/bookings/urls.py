from django.urls import path
from .views import (
   admin_workspace_revenue, owner_workspace_revenue,add_to_cart, get_cart, remove_item, create_booking, clear_cart,
    owner_bookings, admin_bookings, my_orders, owner_revenue,
    cancel_request, owner_cancel_requests, approve_cancel,

    create_slots,
    get_slots,
)

urlpatterns = [

    # CART (old - keep for now)
    path('add/', add_to_cart),
    path('view/', get_cart),
    path('remove/<int:id>/', remove_item),
    path("clear/", clear_cart),

    # BOOKING (UPDATED → now slot-based)
    path('create/', create_booking),

    # OWNER
    path("owner/bookings/", owner_bookings),
    path("owner/revenue/", owner_revenue),
    path(
    "owner/workspace-revenue/<int:workspace_id>/",
    owner_workspace_revenue
),

    # ADMIN
    path("admin/bookings/", admin_bookings),

    # USER
    path("myorders/", my_orders),

    # CANCEL FLOW
    path("booking/cancel-request/", cancel_request),
    path("booking/owner/cancel-requests/", owner_cancel_requests),
    path("booking/cancel-approve/<int:id>/", approve_cancel),

    # ✅ NEW SLOT SYSTEM
    path("slots/create/", create_slots),
    path("slots/<int:workspace_id>/", get_slots),
    path(
    "admin/workspace-revenue/<int:workspace_id>/",
    admin_workspace_revenue
),
]