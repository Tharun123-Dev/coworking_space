from django.urls import path
from .views import create_lead, get_leads, get_users, create_user, delete_user, update_user, create_special_lead, owner_special_leads,update_special_lead,user_special_leads,admin_special_leads
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
    path("special/add/",create_special_lead),
      path("special/owner/",owner_special_leads),
      path("special/update/<int:id>/",update_special_lead),
      path("special/user/",user_special_leads),
      path("special/admin/",admin_special_leads),
        path('', include(router.urls)),

]