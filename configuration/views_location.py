from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializer import *
from .models import Location, Country

@api_view(('GET', 'POST'))
def get_countries(request):
    """
    GET: Retrieve all countries
    POST: Create new country
    """
    if request.method == 'POST':
        try:
            data = request.data
            name = data.get('name')
            shortcut = data.get('shortcut')
            currency = data.get('currency', 'Afg')
            
            # Validation
            if not name or not shortcut:
                return Response(
                    {"error": "Country name and shortcut are required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if country already exists
            if Country.objects.filter(name=name).exists():
                return Response(
                    {"error": f"Country '{name}' already exists"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if Country.objects.filter(shortcut=shortcut).exists():
                return Response(
                    {"error": f"Country with shortcut '{shortcut}' already exists"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create new country
            country = Country.objects.create(
                name=name,
                shortcut=shortcut,
                currency=currency
            )
            
            return Response(
                {
                    "message": "Country created successfully", 
                    "data": {"id": country.id, "name": country.name, "shortcut": country.shortcut, "currency": country.currency}
                }, 
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # GET request
    countries = Country.objects.all().order_by('name')
    # Simple serialization
    data = [{"id": c.id, "name": c.name, "shortcut": c.shortcut} for c in countries]
    return Response(data)

@api_view(('GET','POST'))
def show(request,id="all"):
    """
    GET: Retrieve location(s)
    POST: Create new location
    """
    if request.method == 'POST':
        # Handle location creation
        try:
            data = request.data
            country_id = data.get('country')
            state = data.get('state')
            city = data.get('city')
            is_active = data.get('is_active', True)
            
            # Validation
            if not country_id or not state or not city:
                return Response(
                    {"error": "Country, State, and City are required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if location already exists
            if Location.objects.filter(country_id=country_id, state=state, city=city).exists():
                return Response(
                    {"error": f"Location '{state}, {city}' already exists"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create new location
            location = Location.objects.create(
                country_id=country_id,
                state=state,
                city=city,
                is_active=is_active
            )
            serializer = LocationSerializer(location)
            
            return Response(
                {"message": "Location created successfully", "data": serializer.data}, 
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # GET request - retrieve locations
    print("id=",id)
    if id=="all":
        query_set=Location.objects.all().order_by('-pk')
    else:
        query_set=Location.objects.filter(id=int(id))

    serializer=LocationSerializer(query_set,many=True)

    return Response(serializer.data) 