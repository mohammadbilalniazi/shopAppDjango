from django.shortcuts import render
from django.http import JsonResponse
import json
from .serializer import LocationSerializer
from .models import Location, Country


def _parse_json_body(request):
    try:
        if request.content_type and 'application/json' in request.content_type:
            return json.loads(request.body.decode()) if request.body else {}
        return request.POST.dict()
    except Exception:
        return {}


def get_countries(request):
    """GET: Retrieve all countries
       POST: Create new country (expects JSON or form data)
    """
    if request.method == 'POST':
        try:
            data = _parse_json_body(request)
            name = data.get('name')
            shortcut = data.get('shortcut')
            currency = data.get('currency', 'Afg')

            if not name or not shortcut:
                return JsonResponse({"error": "Country name and shortcut are required"}, status=400)

            if Country.objects.filter(name=name).exists():
                return JsonResponse({"error": f"Country '{name}' already exists"}, status=400)

            if Country.objects.filter(shortcut=shortcut).exists():
                return JsonResponse({"error": f"Country with shortcut '{shortcut}' already exists"}, status=400)

            country = Country.objects.create(name=name, shortcut=shortcut, currency=currency)
            return JsonResponse({"message": "Country created successfully", "data": {"id": country.id, "name": country.name, "shortcut": country.shortcut, "currency": country.currency}}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    countries = Country.objects.all().order_by('name')
    data = [{"id": c.id, "name": c.name, "shortcut": c.shortcut} for c in countries]
    # If JSON explicitly requested, return JSON, otherwise render HTML page
    if request.GET.get('json'):
        return JsonResponse(data, safe=False)

    return render(request, 'configurations/country_show.html', {'countries': countries})


def show(request, id=None):
    """If `?json=1` is present (or POST), behave as API returning JSON.
       Otherwise render an HTML page for locations.
    """
    # Handle POST (creation) as API
    if request.method == 'POST':
        try:
            data = _parse_json_body(request)
            country_id = data.get('country')
            state = data.get('state')
            city = data.get('city')
            is_active = data.get('is_active', True)

            if not country_id or not state or not city:
                return JsonResponse({"error": "Country, State, and City are required"}, status=400)

            if Location.objects.filter(country_id=country_id, state=state, city=city).exists():
                return JsonResponse({"error": f"Location '{state}, {city}' already exists"}, status=400)

            location = Location.objects.create(country_id=country_id, state=state, city=city, is_active=is_active)
            serializer = LocationSerializer(location)
            return JsonResponse({"message": "Location created successfully", "data": serializer.data}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    # GET: either return JSON when requested, or render HTML
    if request.GET.get('json'):
        if id is None:
            queryset = Location.objects.all().order_by('-pk')
        else:
            queryset = Location.objects.filter(id=int(id))
        serializer = LocationSerializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)

    # Render HTML page for browser navigation
    return render(request, 'configurations/location_show.html', {})