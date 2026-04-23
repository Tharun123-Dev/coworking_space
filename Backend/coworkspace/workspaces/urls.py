from django.urls import path
from .views import workspace_month_status,update_slot,delete_slot,owner_slots,create_slot, get_workspace_slots,toggle_workspace,delete_activity,clear_all_activities,recent_activities,get_workspaces,add_workspace,update_workspace,delete_workspace,get_categories, add_category, delete_category, update_category

urlpatterns = [
    path('', get_workspaces),
    path('add/', add_workspace),
    path('update/<int:id>/', update_workspace),
    path('delete/<int:id>/', delete_workspace),
    path('categories/', get_categories),
    path('toggle/<int:id>/',toggle_workspace),

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
]