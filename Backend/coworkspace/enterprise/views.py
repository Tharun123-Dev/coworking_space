from rest_framework import viewsets
from .models import EnterpriseLead
from .serializers import EnterpriseLeadSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated

class EnterpriseLeadViewSet(viewsets.ModelViewSet):
    queryset = EnterpriseLead.objects.all().order_by("-created_at")
    serializer_class = EnterpriseLeadSerializer

from rest_framework import viewsets
from .models import EnterpriseLead
from .serializers import EnterpriseLeadSerializer
from django.core.mail import send_mail
from django.conf import settings

class EnterpriseLeadViewSet(viewsets.ModelViewSet):
    queryset = EnterpriseLead.objects.all().order_by("-created_at")
    serializer_class = EnterpriseLeadSerializer
def perform_create(self, serializer):

    lead = serializer.save(
        owner=self.request.user
    )

    subject = "Thank you for contacting us!"

    message = f"""
Hello {lead.name},

Thank you for reaching out to our Hyderabad coworking team.

We have received your request for:
Workspace: {lead.workspace_type}
Company Size: {lead.company_size}

Our team will contact you shortly.

Regards,
Hyderabad Coworking Team
"""

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [lead.email],
        fail_silently=False,
    )
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_hyderabad_leads(request):

    owner_location = request.user.profile.location

    leads = EnterpriseLead.objects.filter(
        preferred_location=owner_location
    ).order_by("-created_at")

    data = []

    for l in leads:
        data.append({
            "id": l.id,
            "name": l.name,
            "phone": l.phone,
            "email": l.email,
            "workspace_type": l.workspace_type,
            "company_size": l.company_size,
            "preferred_location": l.preferred_location,
            "status": l.status,
            "created_at": l.created_at,
        })

    return Response(data)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_hyderabad_lead_status(request, pk):

    try:
        lead = EnterpriseLead.objects.get(id=pk)

        lead.status = request.data.get("status")
        lead.save()

        return Response({
            "message": "Status updated successfully"
        })

    except EnterpriseLead.DoesNotExist:
        return Response(
            {"error": "Lead not found"},
            status=404)
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_hyderabad_leads(request):

    leads = EnterpriseLead.objects.all().order_by("-created_at")

    data = []

    from accounts.models import Profile

    for l in leads:

        owner_name = "-"
        city = "-"

        # match owner by preferred location
        profile = Profile.objects.filter(
            location__iexact=l.preferred_location
        ).first()

        if profile:
            owner_name = profile.user.username
            city = profile.location

        data.append({
            "id": l.id,

            "name": l.name,

            "phone": l.phone,

            "email": l.email,

            "workspace_type": l.workspace_type,

            "company_size": l.company_size,

            "preferred_location": l.preferred_location,

            "status": l.status,

            "created_at": l.created_at,

            # owner details
            "owner_name": owner_name,

            "city": city,
        })

    return Response(data)