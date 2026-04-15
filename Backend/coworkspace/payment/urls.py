from django.urls import path
from .views import create_payment,verify_payment,save_payment, refund_payment

urlpatterns = [
  path("payment/create/", create_payment),
  path("payment/verify/", verify_payment),
  path("payment/save/", save_payment),
  path("payment/refund/", refund_payment),
]