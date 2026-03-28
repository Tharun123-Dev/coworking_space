from django.urls import path
from .views import add_review, get_reviews

urlpatterns = [
    path('add/', add_review),                 # POST
    path('all/', get_reviews)  # GET
]