# --- utils/location.py ---
import json
import re
import requests
from .gemini_chat import get_gemini_response

def get_coordinates(place):
    """Get coordinates using OpenStreetMap Nominatim API (free)"""
    try:
        # Using Nominatim API (OpenStreetMap's free geocoding service)
        url = f"https://nominatim.openstreetmap.org/search"
        params = {
            'q': f"{place}, India",
            'format': 'json',
            'limit': 1
        }
        headers = {
            'User-Agent': 'TravelApp/1.0'  # Required by Nominatim
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=5)
        data = response.json()
        
        if data:
            lat = float(data[0]['lat'])
            lon = float(data[0]['lon'])
            print(f"Got coordinates for {place}: [{lat}, {lon}]")
            return [lat, lon]
        else:
            print(f"No coordinates found for {place}")
            return None
            
    except Exception as e:
        print(f"Error getting coordinates: {e}")
        return None

def get_suggestions_from_gemini(place, coordinates):
    """Get tourist attractions from Gemini"""
    try:
        prompt = f"""
        For the location "{place}" in India (coordinates: {coordinates}), provide 5 popular tourist attractions/places to visit nearby.
        
        Return the response in this exact JSON format:
        [
            {{"name": "Attraction Name 1", "coords": [lat1, lon1]}},
            {{"name": "Attraction Name 2", "coords": [lat2, lon2]}},
            {{"name": "Attraction Name 3", "coords": [lat3, lon3]}},
            {{"name": "Attraction Name 4", "coords": [lat4, lon4]}},
            {{"name": "Attraction Name 5", "coords": [lat5, lon5]}}
        ]
        
        Only return the JSON array, no additional text.
        """
        
        response = get_gemini_response(prompt, place)
        print(f"Raw Gemini suggestions response: {response}")
        
        # Try to extract JSON array from the response
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if json_match:
            json_str = json_match.group()
            suggestions = json.loads(json_str)
            print(f"Parsed suggestions successfully: {suggestions}")
            return suggestions
        else:
            print("No JSON array found in Gemini response")
            return None
            
    except Exception as e:
        print(f"Error getting suggestions from Gemini: {e}")
        return None

def get_place_details(place):
    # Get coordinates from free geocoding API
    coordinates = get_coordinates(place)
    
    if not coordinates:
        # Fallback to Delhi coordinates
        coordinates = [28.6139, 77.2090]
        print(f"Using fallback coordinates for Delhi")
    
    # Get suggestions from Gemini
    suggestions = get_suggestions_from_gemini(place, coordinates)
    
    if not suggestions:
        # Generate fallback suggestions based on coordinates
        lat, lon = coordinates
        suggestions = [
            {"name": f"Popular attraction near {place}", "coords": [lat + 0.01, lon + 0.01]},
            {"name": f"Tourist spot in {place}", "coords": [lat - 0.01, lon + 0.01]},
            {"name": f"Local landmark in {place}", "coords": [lat + 0.01, lon - 0.01]},
            {"name": f"Cultural site near {place}", "coords": [lat - 0.01, lon - 0.01]},
            {"name": f"Scenic location in {place}", "coords": [lat, lon + 0.02]}
        ]
        print(f"Using fallback suggestions for {place}")
    
    return {
        "coordinates": coordinates,
        "suggestions": suggestions
    }