import razorpay
import json
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def create_payment(request):
    data = json.loads(request.body)
    amount = int(data["amount"])

    client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET)
    )

    order = client.order.create({
        "amount": amount * 100,
        "currency": "INR",
        "payment_capture": 1
    })

    return JsonResponse(order)
import razorpay
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
import hmac
import hashlib

@api_view(['POST'])
def verify_payment(request):

    client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )

    data = request.data

    params_dict = {
        'razorpay_order_id': data['razorpay_order_id'],
        'razorpay_payment_id': data['razorpay_payment_id'],
        'razorpay_signature': data['razorpay_signature']
    }

    try:
        client.utility.verify_payment_signature(params_dict)
        return Response({"status": "success"})
    except:
        return Response({"status": "failed"})