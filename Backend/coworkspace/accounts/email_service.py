from django.core.mail import send_mail
from django.conf import settings


def send_owner_email(email, username, password):

    send_mail(
        "Owner Account Created",

        f"""
Hello,

Your Owner account has been created successfully.

Login Details:

Username: {username}
Password: {password}

Please login using these credentials.

Thank You,
Coworking Team
""",

        settings.EMAIL_HOST_USER,

        [email],

        fail_silently=False,
    )