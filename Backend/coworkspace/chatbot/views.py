from google import genai
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response

client = genai.Client(api_key=settings.GEMINI_API_KEY)

@api_view(['POST'])
def chatbot(request):
    try:
        message = request.data.get("message")

        if not message:
            return Response({"error": "Message required"}, status=400)

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=message
        )

        reply = response.text

        return Response({
            "reply": reply
        })

    except Exception as e:
        print("CHATBOT ERROR:", str(e))
        return Response({"error": str(e)}, status=500)