from rest_framework import viewsets
from .models import EnterpriseLead
from .serializers import EnterpriseLeadSerializer

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
        lead = serializer.save()

        # SEND EMAIL
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