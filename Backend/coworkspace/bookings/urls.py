from django.urls import path
from .views import add_to_cart,get_cart,remove_item,create_booking,clear_cart, owner_bookings, cancel_booking, confirm_booking,admin_bookings, my_orders

urlpatterns = [
    path('add/', add_to_cart),
    path('view/', get_cart),
    path('remove/<int:id>/', remove_item),
    path('create/', create_booking),
    path("clear/", clear_cart),
    path("owner/bookings/", owner_bookings),
    path("booking-confirm/<int:id>/", confirm_booking),
    path("booking-cancel/<int:id>/", cancel_booking),
    path("admin/bookings/",admin_bookings),
    path("myorders/",my_orders)

]