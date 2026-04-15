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



@api_view(['POST'])
def create_lead(request):
    try:
        serializer = LeadSerializer(data=request.data)

        if serializer.is_valid():
            lead = serializer.save()

            # ✅ SEND EMAIL AFTER SAVE (CORRECT)
            send_mail(
                "New Lead Received",
                f"New lead from {lead.name}\nEmail: {lead.email}",
                settings.EMAIL_HOST_USER,
                ["anjali.tharun9949@gmail.com"],
                fail_silently=True
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
    print(request.data)
    category_id = request.data.get("category")

    if not category_id:
        return Response({"error": "Category required"}, status=400)

    try:
        category = WorkspaceCategory.objects.get(id=int(category_id))
    except WorkspaceCategory.DoesNotExist:
        return Response({"error": "Invalid category"}, status=404)

    SpecialLead.objects.create(
        user=request.user,
        category=category,
        owner=category.owner,
        name=request.data.get("name"),
        email=request.data.get("email"),
        phone=request.data.get("phone"),
        company=request.data.get("company"),
        message=request.data.get("message")

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
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_special_lead(request, id):
    try:
        lead = SpecialLead.objects.get(id=id, owner=request.user)

        status = request.data.get("status")

        lead.status = status
        lead.save()

        return Response({
            "id": lead.id,
            "status": lead.status
        })

    except SpecialLead.DoesNotExist:
        return Response({"error":"Not found"},status=404)
    
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


@api_view(['POST'])
def create_company_lead(request):

    CompanyLead.objects.create(
        team_size=request.data.get("team_size"),
        name=request.data.get("name"),
        email=request.data.get("email"),
        phone=request.data.get("phone"),
        company=request.data.get("company"),
        message=request.data.get("message"),
    )

    return Response({"message": "Lead created"})

from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import permission_classes


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_company_leads(request):

    leads = CompanyLead.objects.all().order_by("-created_at")

    data = []

    for l in leads:
        data.append({
            "id": l.id,
            "team_size": l.team_size,
            "name": l.name,
            "phone": l.phone,
            "email": l.email,
            "company": l.company,
            "message": l.message,
            "status": l.status,
            "owner": l.owner.username if l.owner else None,
            "owner_name":l.owner.username if l.owner else None,
        })

    return Response(data)

from django.contrib.auth.models import User


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

    leads = CompanyLead.objects.filter(owner=request.user)

    data = list(leads.values())

    return Response(data)

@api_view(['PUT'])
def update_company_status(request,id):

    lead = CompanyLead.objects.get(id=id)

    lead.status = request.data.get("status")
    lead.save()

    return Response({"message":"updated"})

@api_view(['POST'])
def create_business_enterprise_lead(request):

    BusinessEnterpriseLead.objects.create(
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

    return Response({"message":"Lead created"})

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

        # booking ticket
        if t.booking_id:
            booking = Booking.objects.filter(id=t.booking_id).first()

            if booking:
                workspace = booking.workspace.name
                location = booking.workspace.location
                booking_status = booking.status
                date = booking.date.strftime("%d %b %Y")

        # special request ticket
        elif t.special_id:
            special = SpecialLead.objects.filter(id=t.special_id).first()

            if special:
                workspace = special.category.category
                location = special.company or "-"
                booking_status = special.status
                date = special.created_at.strftime("%d %b %Y")

        data.append({
            "id": t.id,
            
            "workspace": workspace,
            "location": location,
            "booking_status": booking_status,
            "date": date,
            "issue_type": t.issue_type,
            "ticket_status": t.status,
            "admin_note": t.admin_note,
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