# ============================================================
# REPLACE: Backend/coworkspace/chatbot/urls.py
# ============================================================
 
from django.urls import path
from .views import chatbot, chatbot_data
 
urlpatterns = [
    path("chatbot/",      chatbot),        # existing AI chatbot (keep as-is)
    path("chatbot-data/", chatbot_data),   # NEW: live data for frontend chatbot
    
]
 