from django.urls import path
from .views import workspace_owner_details, assign_workspace_owner, delete_coupon,use_offer_coupon,public_offer_coupons,owner_offer_coupons,create_offer_coupon,create_additional_amenity,owner_additional_amenities,workspace_additional_amenities,update_additional_amenity,delete_additional_amenity,public_offer_workspaces,delete_offer_workspace,create_offer_workspace,owner_offer_workspaces,admin_offer_workspaces,approve_offer_workspace,update_offer_workspace,admin_workspaces,approve_workspace,reject_workspace,get_month_slots,create_month_booking,update_monthly_slot,delete_monthly_slot,create_month_slots,get_monthly_slots,update_amenity,delete_amenity,add_amenity,get_amenities,workspace_month_status,update_slot,delete_slot,owner_slots,create_slot, get_workspace_slots,toggle_workspace,delete_activity,clear_all_activities,recent_activities,get_workspaces,add_workspace,update_workspace,delete_workspace,get_categories, add_category, delete_category, update_category

urlpatterns = [
    path('', get_workspaces),
    path('add/', add_workspace),
    path('update/<int:id>/', update_workspace),
    path('delete/<int:id>/', delete_workspace),
    path('categories/', get_categories),
    path('toggle/<int:id>/',toggle_workspace),
    path('amenities/', get_amenities),
    # path("amenities/", get_amenities),
path("amenities/add/", add_amenity),
path("amenities/delete/<int:id>/", delete_amenity),
path("amenities/update/<int:id>/", update_amenity),

    # 🔹 ADMIN ACTIONS
    path('categories/add/', add_category),
    path('categories/update/<int:id>/', update_category),   # reuse or create new
    path('categories/delete/<int:id>/', delete_category),
    path("recent-activities/",recent_activities),
    path("recent-activities/delete/<int:id>/", delete_activity),
path("recent-activities/clear/", clear_all_activities),
path("slot/create/", create_slot),
path("slot/<int:workspace_id>/", get_workspace_slots),
path("slots/owner/", owner_slots),
path("slot/update/<int:id>/", update_slot),
path("slot/delete/<int:id>/", delete_slot),
path("workspaces/slot/<int:workspace_id>/month/", workspace_month_status),
path("month-slots/create/", create_month_slots),
path(
    "admin/workspaces/",
    admin_workspaces
),
path("month-booking/", create_month_booking),

path("monthly-slots/", get_monthly_slots),
   # all
path("month-slots/<int:workspace_id>/", get_month_slots),  # specific
path("monthly-slot/update/<int:slot_id>/", update_monthly_slot),
path("monthly-slot/delete/<int:slot_id>/", delete_monthly_slot),
path(
    "approve/<int:id>/",
    approve_workspace
),

path(
    "reject/<int:id>/",
    reject_workspace
),
   path(
        "offers/create/",
        create_offer_workspace
    ),

    path(
        "offers/owner/",
        owner_offer_workspaces
    ),

    path(
        "offers/admin/",
        admin_offer_workspaces
    ),

    path(
        "offers/approve/<int:id>/",
        approve_offer_workspace
    ),

    path(
        "offers/update/<int:id>/",
        update_offer_workspace
    ),

    path(
        "offers/delete/<int:id>/",
        delete_offer_workspace
    ),
     path(
        "offers/",
        public_offer_workspaces
    ),
    path(

    "additional-amenities/create/",

    create_additional_amenity

),
path(

    "additional-amenities/owner/",

    owner_additional_amenities

),
path(

    "additional-amenities/<int:workspace_id>/",

    workspace_additional_amenities

),
path(

    "additional-amenities/update/<int:id>/",

    update_additional_amenity

),
path(

    "additional-amenities/delete/<int:id>/",

    delete_additional_amenity

),
path(
    "offer-coupons/owner/",
    owner_offer_coupons
),

path(
    "offer-coupons/create/",
    create_offer_coupon
),
path(
    "offer-coupons/",
    public_offer_coupons
),
path(
    "offer-coupons/<int:pk>/use/",
    use_offer_coupon
),
path(
    "coupons/<int:id>/",
    delete_coupon
),
path(
    "workspace-owner-details/<int:workspace_id>/",
    workspace_owner_details
),
path(
    "assign-workspace-owner/",
    assign_workspace_owner
),
]