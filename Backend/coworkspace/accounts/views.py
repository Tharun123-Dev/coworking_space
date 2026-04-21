from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework import status
from.models import Profile
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from .models import Profile
from .email_service import send_owner_email
from .serializers import RegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from workspaces.models import ActivityLog

# REGISTER
@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        # ✅ CREATE ACTIVITY
        # ActivityLog.objects.create(
        #     user=user,
        #     action="CREATE",
        #     model_name="User",
        #     message=f"{user.username} registered as a new user"
        # )

        return Response({
            "message": "User registered successfully"
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework_simplejwt.tokens import RefreshToken
from .models import Profile

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({
            "error": "Username and password required"
        }, status=400)

    user = authenticate(username=username, password=password)

    if user:
        refresh = RefreshToken.for_user(user)

        profile, created = Profile.objects.get_or_create(user=user)

        # ✅ ADMIN FIX
        if user.is_superuser:
            profile.role = "admin"
            profile.save()

        # ✅ ADD ACTIVITY LOG
        # ActivityLog.objects.create(
        #     user=user,
        #     action="LOGIN",
        #     model_name="User",
        #     message=f"{user.username} logged in"
        # )

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



@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_owner(request):

    print("DATA:", request.data)

    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not username or not email or not password:
        return Response({"error": "All fields required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    # ✅ CREATE USER
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    # ✅ SET OWNER ROLE
    profile = Profile.objects.get(user=user)
    profile.role = "owner"
    profile.save()

    print("USER CREATED")

    # ✅ SEND EMAIL
    try:
        from .email_service import send_owner_email
        send_owner_email(email, username, password)
        print("EMAIL SENT")

    except Exception as e:
        print("EMAIL ERROR:", str(e))

    # ✅ ADD ACTIVITY LOG (IMPORTANT)
    ActivityLog.objects.create(
        user=request.user,  # admin who created owner
        action="CREATE",
        model_name="Owner",
        message=f"{request.user.username} created new owner {username}"
    )

    return Response({
        "message": "Owner created successfully"
    })
    
@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_owners(request):

    owners = Profile.objects.filter(role="owner")

    data = []
    for o in owners:
        data.append({
            "id": o.user.id,
            "username": o.user.username,
            "email": o.user.email
        })

    return Response(data)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_owner(request, id):

    user = User.objects.get(id=id)

    user.username = request.data.get("username", user.username)
    user.email = request.data.get("email", user.email)

    password = request.data.get("password")
    if password:
        user.set_password(password)

    user.save()

    return Response({"message": "Owner updated"})
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_owner(request, id):

    user = User.objects.get(id=id)
    user.delete()

    return Response({"message": "Owner deleted"})

