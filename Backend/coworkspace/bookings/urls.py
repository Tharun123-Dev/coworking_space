from django.urls import path
from .views import add_to_cart,get_cart,remove_item,create_booking,clear_cart, owner_bookings,admin_bookings, my_orders, owner_revenue,cancel_request, owner_cancel_requests, approve_cancel

urlpatterns = [
    path('add/', add_to_cart),
    path('view/', get_cart),
    path('remove/<int:id>/', remove_item),
    path('create/', create_booking),
    path("clear/", clear_cart),
    path("owner/bookings/", owner_bookings),
    # path("booking-confirm/<int:id>/", confirm_booking),
    # path("booking-cancel/<int:id>/", cancel_booking),
    path("admin/bookings/",admin_bookings),
    path("myorders/",my_orders),
    path("owner/revenue/",owner_revenue),
    # path("booking/verify/<int:id>/", verify_booking),
       # USER → SEND REQUEST
    path("booking/cancel-request/", cancel_request),

    # OWNER → SEE REQUESTS
    path("booking/owner/cancel-requests/", owner_cancel_requests),

    # OWNER → APPROVE
    path("booking/cancel-approve/<int:id>/", approve_cancel),


]