from django.urls import path
from .views import create_quotation_lead,admin_offer_leads,admin_offer_workspace_leads,createe_lead,owner_offer_leads,update_offer_lead_status,create_modern_lead,admin_customisation_leads,update_customisation_lead_status,owner_customisation_leads,create_ticket,update_ticket,admin_tickets,user_tickets,create_lead, get_leads, get_users, create_user, delete_user, update_user,create_special_lead, owner_special_leads,update_special_lead,user_special_leads,admin_special_leads,create_company_lead,admin_company_leads,assign_owner,owner_company_leads,update_company_status,create_business_enterprise_lead,admin_business_leads,update_business_status
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet

router = DefaultRouter()
router.register('leadss', LeadViewSet)
urlpatterns = [
    path(
    "leadss/",
    createe_lead
),
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
    path("company/add/",create_company_lead),
   path("company/owner/", owner_company_leads),
   path("company/admin/", admin_company_leads),
   path("company/status/<int:id>/", update_company_status),
    path("company/assign/<int:id>/", assign_owner),
    path("business/add/", create_business_enterprise_lead),
    path("business/admin/", admin_business_leads),
    path("business/status/<int:id>/", update_business_status),
    path("tickets/create/", create_ticket),
    path("tickets/user/", user_tickets),
    path("tickets/admin/", admin_tickets),
    path("tickets/update/<int:id>/", update_ticket),
    # urls.py

path(
    "modern-leads/owner/",
    owner_customisation_leads
),

path(
    "modern-lead/status/<int:id>/",
    update_customisation_lead_status
),

path(
    "modern-leads/admin/",
    admin_customisation_leads
),
    
        path(
        "modern-lead/create/",
        create_modern_lead
    ),
    path(
    "offers/leads/owner/",
    owner_offer_leads
),

path(
    "offers/leads/status/<int:id>/",
    update_offer_lead_status
),

path(
    "offers/admin/leads/<int:id>/",
    admin_offer_workspace_leads
),
path(
    "offers/admin/leads/",
    admin_offer_leads
),
path(
    "quotation/create/",
    create_quotation_lead
),

]