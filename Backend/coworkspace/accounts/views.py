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
              "location": profile.location
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
    location = request.data.get("location")  # ✅ ADD THIS

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

    # ✅ SET OWNER ROLE + LOCATION
    profile = Profile.objects.get(user=user)
    profile.role = "owner"
    profile.location = location   # ✅ ADD THIS LINE
    profile.save()

    print("USER CREATED")

    # ✅ SEND EMAIL
    try:
        from .email_service import send_owner_email
        send_owner_email(email, username, password)
        print("EMAIL SENT")

    except Exception as e:
        print("EMAIL ERROR:", str(e))

    # ✅ ADD ACTIVITY LOG
    ActivityLog.objects.create(
        user=request.user,
        action="CREATE",
        model_name="Owner",
        message=f"{request.user.username} created new owner {username} in {location}"  # optional improvement
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
            "email": o.user.email,

            # ✅ ADD THIS
            "location": o.location
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

import random
from django.utils.timezone import now
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User

from datetime import timedelta
import random
from django.utils.timezone import now
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Profile


@api_view(['POST'])
def forgot_password(request):
    email = request.data.get("email")

    # 🔍 Find user
    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"error": "User with this email does not exist"}, status=404)

    # 🔍 Get profile
    profile = Profile.objects.filter(user=user).first()

    if not profile:
        return Response({"error": "Profile not found"}, status=404)

    # 🔢 Generate OTP
    otp = str(random.randint(100000, 999999))

    # ✅ SAVE OTP IN PROFILE (FIX)
    profile.otp = otp
    profile.otp_created_at = now()
    profile.is_otp_verified = False
    profile.save()

    # 🧪 DEBUG
    print("Saved OTP:", otp)

    # 📧 Send Email
    send_mail(
        "Reset Your Password",
        f"Your OTP is {otp}. It expires in 5 minutes.",
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )

    return Response({"message": "OTP sent successfully"})
from datetime import timedelta

from datetime import timedelta
from django.utils.timezone import now
from django.contrib.auth.models import User
from .models import Profile

from datetime import timedelta
from django.utils.timezone import now
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Profile

@api_view(['POST'])
def verify_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")

    if not email or not otp:
        return Response({"error": "Email and OTP required"}, status=400)

    # 🔍 Find user
    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "User not found"}, status=404)

    # 🔍 Get profile
    profile = Profile.objects.filter(user=user).first()
    if not profile:
        return Response({"error": "Profile not found"}, status=404)

    # 🧪 DEBUG (remove later if you want)
    print("DB OTP:", profile.otp)
    print("Entered OTP:", otp)

    # 🔐 OTP MATCH CHECK (FINAL FIX)
    if not profile.otp or str(profile.otp).strip() != str(otp).strip():
        return Response({"error": "Invalid OTP"}, status=400)

    # ⏰ EXPIRY CHECK (5 mins)
    if not profile.otp_created_at or now() - profile.otp_created_at > timedelta(minutes=5):
        return Response({"error": "OTP expired"}, status=400)

    # ✅ MARK VERIFIED
    profile.is_otp_verified = True
    profile.save()

    return Response({"message": "OTP verified successfully"})
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Profile


@api_view(['POST'])
def reset_password(request):
    email = request.data.get("email")
    new_password = request.data.get("password")

    if not email or not new_password:
        return Response({"error": "Email and password required"}, status=400)

    # 🔍 Find user
    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "User not found"}, status=404)

    # 🔍 Get profile
    profile = Profile.objects.filter(user=user).first()
    if not profile:
        return Response({"error": "Profile not found"}, status=404)

    # 🔐 Check OTP verified
    if not profile.is_otp_verified:
        return Response({"error": "OTP verification required"}, status=400)

    # 🔑 Set new password
    user.set_password(new_password)
    user.save()

    # 🧹 Clear OTP data
    profile.otp = None
    profile.is_otp_verified = False
    profile.save()

    return Response({"message": "Password reset successful"})