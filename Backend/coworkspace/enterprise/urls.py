from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import admin_hyderabad_leads,update_hyderabad_lead_status,EnterpriseLeadViewSet, owner_hyderabad_leads

router = DefaultRouter()
router.register(r"enterprise-leads", EnterpriseLeadViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path(
    "hyderabad/owner/",
    owner_hyderabad_leads
),
path(
    "hyderabad/status/<int:pk>/",
    update_hyderabad_lead_status
),
path(
    "hyderabad/admin/",
    admin_hyderabad_leads
),
]