from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Review
from .serializers import ReviewSerializer
from workspaces.models import Workspace


# ADD REVIEW (ONLY LOGGED USER)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_review(request):

    rating = request.data.get("rating")
    comment = request.data.get("comment")

    if not rating or not comment:
        return Response ({"error":"all fields are required"}, status=400)
    #  CREATE REVIEW
    Review.objects.create(
        user=request.user,
    
        rating=rating,
        comment=comment
    )

    return Response({"message": "Review added 🎉"})


#  GET REVIEWS (PUBLIC)
@api_view(['GET'])
def get_reviews(request):

    reviews = Review.objects.all().order_by('-created_at')

    serializer = ReviewSerializer(reviews, many=True)

    return Response(serializer.data)