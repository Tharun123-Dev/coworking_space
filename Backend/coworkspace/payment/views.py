import razorpay
import json
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
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




@api_view(['POST'])
def verify_payment(request):

    client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET)
    )

    try:
        client.utility.verify_payment_signature(request.data)
        return Response({"status": "success"})
    except Exception as e:
        print("VERIFY ERROR:", e)
        return Response({"status": "failed"})
    
   

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Payment
from django.contrib.auth.models import User

@api_view(['POST'])
def save_payment(request):
    try:
        payment = Payment.objects.create(
            user=request.user,
            payment_id=request.data.get("payment_id"),
            order_id=request.data.get("order_id"),
            amount=request.data.get("amount"),
            status="SUCCESS"
        )

        return Response({"status": "saved"})
    except Exception as e:
        print("SAVE ERROR:", e)
        return Response({"status": "failed"})
    
@api_view(['POST'])
def refund_payment(request):
    import razorpay
    from django.conf import settings
    from .models import Payment

    payment_id = request.data.get("payment_id")

    try:
        # Find payment in DB
        payment = Payment.objects.get(payment_id=payment_id)

        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET)
        )

        # Refund full amount
        refund = client.payment.refund(payment_id)

        # Update status
        payment.status = "REFUNDED"
        payment.save()

        return Response({"status": "refund_success"})

    except Payment.DoesNotExist:
        return Response({"status": "payment_not_found"})

    except Exception as e:
        print("REFUND ERROR:", e)
        return Response({"status": "refund_failed"})