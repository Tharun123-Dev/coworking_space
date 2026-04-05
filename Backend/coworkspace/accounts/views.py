from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework import status
from.models import Profile

from .serializers import RegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken

# REGISTER
@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({
            "message": "User registered successfully"
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# LOGIN
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Profile

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    # ✅ Validate input
    if not username or not password:
        return Response({
            "error": "Username and password required"
        }, status=400)

    user = authenticate(username=username, password=password)

    if user:
        refresh = RefreshToken.for_user(user)

        # ✅ Get or create profile
        profile, created = Profile.objects.get_or_create(user=user)

        # 🔥 IMPORTANT FIX (ADD THIS)
        if user.is_superuser:
            profile.role = "admin"
            profile.save()

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username,
            "is_admin": user.is_superuser,
            "role": profile.role,
        })

    return Response({
        "error": "Invalid credentials ❌"
    }, status=401)

from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from .models import Profile

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_owner(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    # 🔴 Validation
    if not username or not email or not password:
        return Response({"error": "All fields required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    # ✅ Create user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    # ✅ Assign role = owner
    profile = Profile.objects.get(user=user)
    profile.role = "owner"
    profile.save()

    return Response({"message": "Owner created successfully"})