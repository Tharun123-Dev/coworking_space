# accounts/urls.py
from django.urls import path
from .views import forgot_password,verify_otp,reset_password,register, login_view, create_owner,update_owner,delete_owner,get_owners

urlpatterns = [
    path('register/', register),
    path('login/', login_view),
    path('admin/create-owner/',create_owner),
    path("owners/", get_owners),
    path("owners/update/<int:id>/", update_owner),
    path("owners/delete/<int:id>/", delete_owner),
        path('forgot-password/', forgot_password),
    path('verify-otp/', verify_otp),
    path('reset-password/', reset_password),
]