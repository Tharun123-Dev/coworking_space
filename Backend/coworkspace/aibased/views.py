from rest_framework.decorators import api_view
from rest_framework.response import Response
from aibased.models import Workspace

@api_view(['POST'])
def get_recommendations(request):
   
    data = request.data
    print(data)

    #  Get inputs safely
    city = data.get('city', '').strip()
    min_price = int(data.get('min_price', 0))
    max_price = int(data.get('max_price', 100000))
    rating = float(data.get('rating', 0))
    workspace_type = data.get('workspace_type', '').lower()
    amenities = data.get('amenities', [])
    capacity = int(data.get('capacity', 1))

    #  Normalize amenities
    amenities = [a.lower() for a in amenities]

    # Step 1: Filter (FIXED)
    workspaces = Workspace.objects.filter(
        city__icontains=city,
        price__gte=min_price,
        price__lte=max_price
    )

    print("FILTERED WORKSPACES:", workspaces)

    results = []

    #  Step 2: Scoring
    for ws in workspaces:
        score = 0

        # Rating
        if ws.rating >= rating:
            score += 2

        # Type (FIXED)
        if ws.workspace_type.lower() == workspace_type:
            score += 2

        # Amenities (FIXED)
        ws_amenities = [a.lower() for a in ws.amenities]
        for a in amenities:
            if a in ws_amenities:
                score += 1

        # Capacity
        if ws.capacity >= capacity:
            score += 1

        results.append({
            "id": ws.id,
            "name": ws.name,
            "city": ws.city,
            "price": ws.price,
            "rating": ws.rating,
            "image": ws.image,
            "score": score
        })

    #  Step 3: Sort
    results = sorted(results, key=lambda x: x['score'], reverse=True)
    for ws in Workspace.objects.all():
     print(ws.city, ws.price, type(ws.price))
    return Response(results)