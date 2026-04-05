# accounts/urls.py
from django.urls import path
from .views import register, login_view, create_owner

urlpatterns = [
    path('register/', register),
    path('login/', login_view),
    path('admin/create-owner/',create_owner)
]