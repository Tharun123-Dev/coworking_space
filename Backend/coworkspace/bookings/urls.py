from django.urls import path
from .views import add_to_cart,get_cart,remove_item,create_booking,clear_cart

urlpatterns = [
    path('add/', add_to_cart),
    path('view/', get_cart),
    path('remove/<int:id>/', remove_item),
    path('create/', create_booking),
    path("clear/", clear_cart),

]