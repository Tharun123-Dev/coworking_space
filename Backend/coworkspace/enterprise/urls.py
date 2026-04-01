from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EnterpriseLeadViewSet

router = DefaultRouter()
router.register(r"enterprise-leads", EnterpriseLeadViewSet)

urlpatterns = [
    path("", include(router.urls)),
]