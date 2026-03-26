from django.urls import path
from .views import get_workspaces,add_workspace,update_workspace,delete_workspace,get_categories, add_category, delete_category, update_category

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
]