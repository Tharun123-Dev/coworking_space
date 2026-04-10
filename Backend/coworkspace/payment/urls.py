from django.urls import path
from .views import create_payment

urlpatterns = [
  path("payment/create/", create_payment),
]