from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Lead
from .serializers import LeadSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from .models import Lead
from .serializers import LeadSerializer
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.contrib.auth.hashers import make_password

@api_view(['POST'])
def create_lead(request):
    try:
        serializer = LeadSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Lead saved "})

        return Response(serializer.errors, status=400)

    except IntegrityError:
        return Response({"error": "Email already exists "}, status=400)




@api_view(['GET'])
@permission_classes([IsAdminUser])   # ONLY ADMIN CAN ACCESS
def get_leads(request):
    leads = Lead.objects.all().order_by('-created_at')
    serializer = LeadSerializer(leads, many=True)
    return Response(serializer.data)




@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_users(request):
    users = User.objects.all()

    data = []
    for user in users:
        data.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_admin": user.is_superuser
        })

    return Response(data)



@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_user(request):
    user = User.objects.create(
        username=request.data['username'],
        email=request.data['email'],
        password=make_password(request.data['password'])
    )


    return Response({"message": "User created"})

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, id):
    user = User.objects.get(id=id)
    user.delete()
    return Response({"message": "User deleted"})

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_user(request, id):
    try:
        user = User.objects.get(id=id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    # Update fields
    user.username = request.data.get("username", user.username)
    user.email = request.data.get("email", user.email)
    user.is_superuser = request.data.get("is_superuser", user.is_superuser)

    user.save()

    return Response({"message": "User updated successfully"})
from rest_framework import viewsets
from .models import Leadss
from .serializers import LeadssSerializer

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Leadss.objects.all().order_by('-created_at')
    serializer_class = LeadssSerializer

from django.core.mail import send_mail

send_mail(
    "New Lead Received",
    f"New lead from {Leadss.name}",
    "your_email@gmail.com",
    ["anjali.tharun9949@gmail.com"],
)