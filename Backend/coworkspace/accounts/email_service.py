import requests
from django.conf import settings


def send_owner_email(to_email, username, password):

    response = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "from": settings.EMAIL_FROM,
            "to": ["anjali.tharun9949@gmail.com"],
            "subject": "Owner Account Created",
            "html": f"""
                <h2>Owner Account Created</h2>
                <p>Username: {username}</p>
                <p>Password: {password}</p>
            """,
        },
    )

    # print("EMAIL STATUS:", response.status_code)
    # print("EMAIL RESPONSE:", response.text)