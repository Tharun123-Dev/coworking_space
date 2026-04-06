# accounts/urls.py
from django.urls import path
from .views import register, login_view, create_owner,update_owner,delete_owner,get_owners

urlpatterns = [
    path('register/', register),
    path('login/', login_view),
    path('admin/create-owner/',create_owner),
    path("owners/", get_owners),
    path("owners/update/<int:id>/", update_owner),
    path("owners/delete/<int:id>/", delete_owner),
]