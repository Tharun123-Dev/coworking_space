from django.urls import path
from .views import create_lead, get_leads, get_users, create_user, delete_user, update_user
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet

router = DefaultRouter()
router.register('leadss', LeadViewSet)
urlpatterns = [
    path('add/', create_lead),
    path("all/",get_leads),
     path('users/all/', get_users),
    path('users/create/', create_user),
    path('users/delete/<int:id>/', delete_user),
    path('users/update/<int:id>/',update_user ),
      path('', include(router.urls)),
]