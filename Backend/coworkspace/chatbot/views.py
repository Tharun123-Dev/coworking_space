from  google import genai
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response

genai.configure(api_key=settings.GEMINI_API_KEY)

@api_view(['POST'])
def chatbot(request):
    try:
        message = request.data.get("message")

        if not message:
            return Response({"error": "Message required"}, status=400)

        # ✅ FINAL WORKING MODEL
        model = genai.GenerativeModel("models/gemini-flash-latest") 

        response = model.generate_content(message)

        return Response({
            "reply": response.text
        })

    except Exception as e:
        print("CHATBOT ERROR:", str(e))
        return Response({"error": str(e)}, status=500)
