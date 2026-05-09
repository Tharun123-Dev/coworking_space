from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.db import IntegrityError
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from .models import SpecialLead
from workspaces.models import WorkspaceCategory
from .models import Lead
from .serializers import LeadSerializer,SpecialLeadSerializer,SupportTicketSerializer
from accounts.models import Profile
from .models import BusinessEnterpriseLead,SupportTicket
from bookings.models import Booking
from datetime import datetime
from workspaces.models import ActivityLog
from workspaces.models import OfferWorkspace
@api_view(["POST"])
def createe_lead(request):

    data = request.data

    Leadss.objects.create(

        name=data.get("name"),

        email=data.get("email"),

        phone=data.get("phone"),

        team_size=data.get(
            "team_size"
        ),

        message=data.get(
            "message"
        ),

        workspace_type=data.get(
            "workspace_type"
        ),

        preferred_location=data.get(
            "preferred_location"
        ),

        offer_workspace=data.get(
            "offer_workspace"
        ),
    )

    return Response({
        "message":
        "Lead created successfully"
    })

@api_view(['POST'])
def create_lead(request):
    try:
        serializer = LeadSerializer(data=request.data)

        if serializer.is_valid():
            lead = serializer.save()

            # ✅ SEND EMAIL
            send_mail(
                "New Lead Received",
                f"New lead from {lead.name}\nEmail: {lead.email}",
                settings.EMAIL_HOST_USER,
                ["anjali.tharun9949@gmail.com"],
                fail_silently=True
            )

            # ✅ ADD ACTIVITY LOG (IMPORTANT)
            ActivityLog.objects.create(
                user=request.user if request.user.is_authenticated else None,
                action="CREATE",
                model_name="Lead",
                message=f"{lead.name} submitted a new lead request"
            )

            return Response({"message": "Lead saved"})

        return Response(serializer.errors, status=400)

    except IntegrityError:
        return Response({"error": "Email already exists"}, status=400)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_leads(request):
    leads = Lead.objects.all().order_by('-created_at')
    serializer = LeadSerializer(leads, many=True)
    return Response(serializer.data)


from accounts.models import Profile

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
            "phone": user.profile.phone if hasattr(user, 'profile') else "",
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



from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import SpecialLead
from workspaces.models import WorkspaceCategory


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_special_lead(request):

    category_id = request.data.get("category")

    if not category_id:
        return Response({"error": "Category required"}, status=400)

    try:
        category = WorkspaceCategory.objects.get(id=int(category_id))
    except WorkspaceCategory.DoesNotExist:
        return Response({"error": "Invalid category"}, status=404)
    
    # print(category)
    # print(category.owner)
    # ✅ FIX: check owner exists
    if not category.owner:
        return Response({"error": "No owner assigned to this category"}, status=400)

    lead = SpecialLead.objects.create(
        user=request.user,
        category=category,
        owner=category.owner,  # safe now
        name=request.data.get("name"),
        email=request.data.get("email"),
        phone=request.data.get("phone"),
        company=request.data.get("company"),
        message=request.data.get("message"),
    )

    # ✅ ACTIVITY LOG
    from workspaces.models import ActivityLog
    ActivityLog.objects.create(
        user=request.user,
        action="CREATE",
        model_name="SpecialLead",
        message=f"{request.user.username} requested {category.category}"
    )

    return Response({"message": "Lead created successfully"})
@api_view(['POST'])
def add_special_lead(request):
    try:
        category_id = request.data.get("category")

        category = WorkspaceCategory.objects.get(id=category_id)

        serializer = SpecialLeadSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(
                category=category,
                owner=category.owner
            )
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    except WorkspaceCategory.DoesNotExist:
        return Response(
            {"error": "Category not found"},
            status=404
        )
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_special_leads(request):
    leads = SpecialLead.objects.filter(owner=request.user).order_by("-created_at")

    data = []

    for l in leads:
        data.append({
            "id": l.id,
            "name": l.name,
            "email": l.email,
            "phone": l.phone,
            "company": l.company,
            "message": l.message,
            "category": l.category.category,
            "created": l.created_at,
            "status":l.status,
              "image": (
        l.category.image.url
        if hasattr(l.category.image, "url")
        else l.category.image
    ),
        })

    return Response(data)
from workspaces.models import ActivityLog

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_special_lead(request, id):
    try:
        lead = SpecialLead.objects.get(id=id, owner=request.user)

        old_status = lead.status   # ✅ store old value
        new_status = request.data.get("status")

        lead.status = new_status
        lead.save()

        # ===========================
        # ✅ ACTIVITY LOG
        # ===========================
        ActivityLog.objects.create(
            user=request.user,
            action="UPDATE",
            model_name="SpecialLead",
            message=f"{request.user.username} changed lead ({lead.category.category}) status from {old_status} → {new_status}"
        )

        return Response({
            "id": lead.id,
            "status": lead.status
        })

    except SpecialLead.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_special_leads(request):

    leads = SpecialLead.objects.filter(user=request.user).order_by("-created_at")

    data = []

    for l in leads:
        data.append({
            "id": l.id,
            "category": l.category.category,
            "name": l.name,
            "email": l.email,
            "phone": l.phone,
            "company": l.company,
            "message": l.message,
            "status": l.status,
            "created": l.created_at,
            "image":l.category.image if l.category.image else None
            

            
        })

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_special_leads(request):

    if not request.user.is_superuser:
        return Response({"error":"Admin only"}, status=403)

    leads = SpecialLead.objects.all().order_by("-created_at")

    data = []

    for l in leads:
        data.append({
            "id": l.id,
            "user": l.user.username,
            "owner": l.owner.username if l.owner else "-",
            "category": l.category.category,
            "company": l.company,
            "phone": l.phone,
            "email": l.email,
            "message": l.message,
            "status": l.status,
                      "image": (
        l.category.image.url
        if hasattr(l.category.image, "url")
        else l.category.image
    ),
        })

    return Response(data)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import CompanyLead


from accounts.models import Profile

@api_view(['POST'])
def create_company_lead(request):

    location = request.data.get(
        "location"
    )

    workspace_type = request.data.get(
        "workspace_type"
    )

    # ✅ FIND OWNER BASED ON LOCATION

    owner_profile = Profile.objects.filter(

        role="owner",

        location=location

    ).first()

    lead = CompanyLead.objects.create(

        team_size=request.data.get(
            "team_size"
        ),

        name=request.data.get(
            "name"
        ),

        email=request.data.get(
            "email"
        ),

        phone=request.data.get(
            "phone"
        ),

        company=request.data.get(
            "company"
        ),

        message=request.data.get(
            "message"
        ),

        # ✅ LOCATION

        location=location,

        # ✅ MAIN FIX

        workspace_type=
            workspace_type,

        # ✅ AUTO OWNER

        owner=(
            owner_profile.user
            if owner_profile
            else None
        )

    )

    # ✅ ACTIVITY LOG

    ActivityLog.objects.create(

        user=(
            request.user
            if request.user.is_authenticated
            else None
        ),

        action="CREATE",

        model_name="CompanyLead",

        message=(
            f"{lead.name} submitted "
            f"{workspace_type} lead "
            f"in {location}"
        )

    )

    return Response({

        "message":
        "Lead created"

    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_company_leads(request):

    leads = CompanyLead.objects.all().order_by("-created_at")

    data = []

    for l in leads:

        data.append({

            "id": l.id,

            "team_size":
                l.team_size,

            "name":
                l.name,

            "phone":
                l.phone,

            "email":
                l.email,

            "company":
                l.company,

            "message":
                l.message,

            # ✅ LOCATION

            "location":
                l.location,

            # ✅ WORKSPACE TYPE

            "workspace_type":

                getattr(
                    l,
                    "workspace_type",
                    ""
                ),

            # ✅ STATUS

            "status":
                l.status,

            # ✅ OWNER INFO

            "owner":
                l.owner.id
                if l.owner else None,

            "owner_name":
                l.owner.username
                if l.owner else None,

        })

    return Response(data)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def assign_owner(request, id):

    lead = CompanyLead.objects.get(id=id)

    owner_id = request.data.get("owner")

    owner = User.objects.get(id=owner_id)

    lead.owner = owner
    lead.status = "contacted"
    lead.save()

    return Response({"message":"Owner assigned"})
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_offer_leads(request):

    leads = Leadss.objects.all().order_by("-created_at")

    data = []

    from accounts.models import Profile

    for l in leads:

        owner_name = "-"

        profile = Profile.objects.filter(
            location__iexact=
            l.preferred_location
        ).first()

        if profile:

            owner_name = (
                profile.user.username
            )

        data.append({

            "id": l.id,

            "name": l.name,

            "email": l.email,

            "phone": l.phone,

            "workspace_type":
                l.workspace_type,

            "preferred_location":
                l.preferred_location,

            "team_size":
                l.team_size,

            "status":
                l.status,

            "owner_name":
                owner_name,

        })

    return Response(data)
@api_view(['GET'])
def get_owners(request):

    owners = Profile.objects.filter(role="owner")

    data = []

    for o in owners:
        data.append({
            "id":o.user.id,
            "username":o.user.username
        })

    return Response(data)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_company_leads(request):

    leads = CompanyLead.objects.filter(
        owner=request.user
    ).order_by("-created_at")

    data = []

    for l in leads:

        data.append({

            "id": l.id,

            "team_size":
                l.team_size,

            "name":
                l.name,

            "phone":
                l.phone,

            "email":
                l.email,

            "company":
                l.company,

            "message":
                l.message,

            # ✅ PREFERRED WORKSPACE TYPE

            "workspace_type":

                getattr(
                    l,
                    "workspace_type",
                    ""
                ),

            # ✅ LOCATION

            "preferred_location":

                getattr(
                    l,
                    "location",
                    ""
                )

                or

                getattr(
                    l,
                    "preferred_location",
                    ""
                ),

            # ✅ STATUS

            "status":
                l.status,

        })

    return Response(data)

@api_view(['PUT'])
def update_company_status(request,id):

    lead = CompanyLead.objects.get(id=id)

    lead.status = request.data.get("status")
    lead.save()

    return Response({"message":"updated"})

@api_view(['POST'])
def create_business_enterprise_lead(request):

    lead = BusinessEnterpriseLead.objects.create(
        location=request.data.get("location"),
        company_name=request.data.get("company_name"),
        contact_person=request.data.get("contact_person"),
        email=request.data.get("email"),
        phone=request.data.get("phone"),
        team_size=request.data.get("team_size"),
        move_in_date=request.data.get("move_in_date"),
        budget=request.data.get("budget"),
        requirement=request.data.get("requirement"),
    )

    # ===========================
    # ✅ ADD ACTIVITY LOG
    # ===========================
    ActivityLog.objects.create(
        user=request.user if request.user.is_authenticated else None,
        action="CREATE",
        model_name="BusinessLead",
        message=f"{lead.company_name} requested enterprise workspace in {lead.location}"
    )

    return Response({"message": "Lead created"})

@api_view(['GET'])
def admin_business_leads(request):

    leads = BusinessEnterpriseLead.objects.all().order_by("-id")

    data = []

    for l in leads:
        data.append({
            "id":l.id,
            "location":l.location,
            "company":l.company_name,
            "contact":l.contact_person,
            "email":l.email,
            "phone":l.phone,
            "team":l.team_size,
            "budget":l.budget,
            "status":l.status
        })

    return Response(data)

@api_view(['PUT'])
def update_business_status(request,id):

    lead = BusinessEnterpriseLead.objects.get(id=id)

    lead.status = request.data.get("status")
    lead.save()

    return Response({"message":"updated"})

from workspaces.models import ActivityLog  # adjust import path if needed

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_ticket(request):

    booking_id = request.data.get("booking_id")
    special_id = request.data.get("special_id")

    ticket = SupportTicket.objects.create(
        user=request.user,
        issue_type=request.data.get("issue_type"),
        message=request.data.get("message")
    )

    if booking_id:
        ticket.booking_id = booking_id

    if special_id:
        ticket.special_id = special_id

    ticket.save()

    # ✅ ADD THIS BLOCK (IMPORTANT)
    ActivityLog.objects.create(
        user=request.user,
        action="CREATE",
        model_name="Ticket",
        message=f"{request.user.username} raised a ticket ({ticket.issue_type})"
    )

    return Response({"message": "Ticket created"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_tickets(request):

    tickets = SupportTicket.objects.filter(
        user=request.user
    ).order_by("-created_at")

    data = []

    for t in tickets:

        workspace = "-"
        location = "-"
        booking_status = "-"
        date = "-"
        image = None   # ✅ IMPORTANT

        # ───── BOOKING TICKET ─────
        if t.booking_id:
            booking = Booking.objects.filter(id=t.booking_id).first()

            if booking:
                workspace = booking.workspace.name
                location = booking.workspace.location
                booking_status = booking.status
                date = booking.date.strftime("%d %b %Y")

                # ✅ SAFE IMAGE HANDLING
                image = (
                    booking.workspace.image.url
                    if hasattr(booking.workspace.image, "url")
                    else booking.workspace.image
                )

        # ───── SPECIAL REQUEST TICKET ─────
        elif t.special_id:
            special = SpecialLead.objects.filter(id=t.special_id).first()

            if special:
                workspace = special.category.category
                location = special.company or "-"
                booking_status = special.status
                date = special.created_at.strftime("%d %b %Y")

                # ✅ SAFE IMAGE
                image = (
                    special.category.image.url
                    if hasattr(special.category.image, "url")
                    else special.category.image
                )

        # ───── FINAL RESPONSE ─────
        data.append({
            "id": t.id,
            "workspace": workspace,
            "location": location,
            "booking_status": booking_status,
            "date": date,
            "issue_type": t.issue_type,
            "ticket_status": t.status,
            "admin_note": t.admin_note,

            # ✅ FIXED IMAGE
            "image": image
        })

    return Response(data)



@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_tickets(request):

    tickets = SupportTicket.objects.all().order_by("-created_at")

    serializer = SupportTicketSerializer(tickets,many=True)

    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_ticket(request,id):

    ticket = SupportTicket.objects.get(id=id)

    ticket.status = request.data.get("status")
    ticket.admin_note = request.data.get("admin_note")

    ticket.save()

    return Response({"message":"updated"})

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ModernLead
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def owner_customisation_leads(request):

    owner_location = request.user.profile.location

    leads = ModernLead.objects.filter(
        preferred_location=owner_location
    ).order_by("-id")

    data = []

    for l in leads:

        data.append({
            "id": l.id,

            "name": l.name,

            "email": l.email,

            "phone": l.phone,

            "company": l.company,

            "preferred_location":
                l.preferred_location,

            "message": l.message,

            "status": l.status,

            "date": l.created_at,
        })

    return Response(data)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_customisation_lead_status(
    request,
    id
):

    try:

        lead = ModernLead.objects.get(id=id)

        lead.status = request.data.get(
            "status"
        )

        lead.save()

        return Response({
            "message":
            "Status updated successfully"
        })

    except ModernLead.DoesNotExist:

        return Response(
            {"error": "Lead not found"},
            status=404
        )
    

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_customisation_leads(request):

    leads = ModernLead.objects.all().order_by("-id")

    data = []

    from accounts.models import Profile

    for l in leads:

        owner_name = "-"
        city = "-"

        profile = Profile.objects.filter(
            location__iexact=
            l.preferred_location
        ).first()

        if profile:
            owner_name = (
                profile.user.username
            )

            city = profile.location

        data.append({
            "id": l.id,

            "name": l.name,

            "email": l.email,

            "phone": l.phone,

            "company": l.company,

            "preferred_location":
                l.preferred_location,

            "message": l.message,

            "status": l.status,

            "date": l.created_at,

            "owner_name": owner_name,

            "city": city,
        })

    return Response(data)

from rest_framework.decorators import (
    api_view,
    permission_classes
)

from rest_framework.permissions import (
    IsAuthenticated,
    IsAdminUser
)

from rest_framework.response import Response

from .models import ModernLead
@api_view(["POST"])
def create_modern_lead(request):

    data = request.data

    ModernLead.objects.create(
        name=data.get("name"),

        email=data.get("email"),

        phone=data.get("phone"),

        company=data.get("company"),

        preferred_location=data.get(
            "preferred_location"
        ),

        message=data.get("message"),
    )

    return Response({
        "message":
        "Lead saved successfully"
    })
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def owner_offer_leads(request):

    owner_location = (
        request.user.profile.location
    )

    leads = Leadss.objects.filter(
        preferred_location=
        owner_location
    ).order_by("-id")

    data = []

    for l in leads:

        data.append({

            "id": l.id,

            "name": l.name,

            "phone": l.phone,

            "email": l.email,

            "team_size":
                l.team_size,

            "offer_workspace":
                l.offer_workspace,

            "preferred_location":
                l.preferred_location,

            "status":
                l.status,
        })

    return Response(data)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_offer_lead_status(
    request,
    id
):

    lead = Leadss.objects.get(id=id)

    lead.status = request.data.get(
        "status"
    )

    lead.save()

    return Response({
        "message":
        "Status updated"
    })
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_offer_workspace_leads(
    request,
    id
):

    workspace = OfferWorkspace.objects.get(
        id=id
    )

    leads = Leadss.objects.filter(
        preferred_location=
        workspace.area
    ).order_by("-id")

    data = []

    from accounts.models import Profile

    for l in leads:

        owner_name = "-"

        profile = Profile.objects.filter(
            location__iexact=
            l.preferred_location
        ).first()

        if profile:
            owner_name = (
                profile.user.username
            )

        data.append({

            "id": l.id,

            "owner_name":
                owner_name,

            "workspace_type":
                l.workspace_type,

            "offer_workspace":
                l.offer_workspace,

            "preferred_location":
                l.preferred_location,

            "name": l.name,

            "phone": l.phone,

            "email": l.email,

            "team_size":
                l.team_size,

            "status":
                l.status,
        })

    return Response(data)