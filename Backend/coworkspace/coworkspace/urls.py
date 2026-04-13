from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include('accounts.urls')),
    path('api/workspaces/', include('workspaces.urls')),
    path('api/cart/', include('bookings.urls')),

    path('api/leads/', include('leads.urls')),
    path('api/reviews/', include('reviews.urls')),

    # keep generic api last
    path('api/', include('aibased.urls')),
    path('api/', include('enterprise.urls')),
    path('api/', include('chatbot.urls')),
    path('api/', include('payment.urls')),
]
   
    

   

