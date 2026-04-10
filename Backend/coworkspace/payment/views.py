import razorpay
import json
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def create_payment(request):
    try:
        print("REQUEST BODY:", request.body)

        data = json.loads(request.body)
        amount = int(data.get("amount", 500))

        print("AMOUNT:", amount)
        print("KEY:", settings.RAZORPAY_KEY_ID)

        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        order = client.order.create({
            "amount": amount * 100,
            "currency": "INR",
            "payment_capture": 1
        })

        print("ORDER CREATED:", order)

        return JsonResponse(order)

    except Exception as e:
        print("RAZORPAY ERROR:", str(e))
        return JsonResponse({"error": str(e)}, status=500)