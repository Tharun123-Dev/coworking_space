from django.urls import path
from .views import delete_activity,clear_all_activities,recent_activities,get_workspaces,add_workspace,update_workspace,delete_workspace,get_categories, add_category, delete_category, update_category

urlpatterns = [
    path('', get_workspaces),
    path('add/', add_workspace),
    path('update/<int:id>/', update_workspace),
    path('delete/<int:id>/', delete_workspace),
    path('categories/', get_categories),

    # 🔹 ADMIN ACTIONS
    path('categories/add/', add_category),
    path('categories/update/<int:id>/', update_category),   # reuse or create new
    path('categories/delete/<int:id>/', delete_category),
    path("recent-activities/",recent_activities),
    path("recent-activities/delete/<int:id>/", delete_activity),
path("recent-activities/clear/", clear_all_activities),
]