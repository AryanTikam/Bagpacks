# --- app.py ---
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import json
import io
from utils.gemini_chat import get_gemini_response
from utils.itinerary import create_itinerary_pdf
from utils.location import get_place_details

app = Flask(__name__)
CORS(app)

@app.route('/api/destination/<place>', methods=['GET'])
def destination(place):
    data = get_place_details(place)
    return jsonify(data)

@app.route('/api/chat', methods=['POST'])
def chat():
    user_input = request.json.get("message")
    location = request.json.get("location")
    user_location = request.json.get("userLocation")
    # Pass user_location to Gemini if available
    if user_location:
        location_info = f"{location} (User is at {user_location})"
    else:
        location_info = location
    reply = get_gemini_response(user_input, location_info)
    return jsonify({"reply": reply})

@app.route('/api/itinerary', methods=['POST'])
def itinerary():
    selected_places = request.json.get("places")
    user_location = request.json.get("userLocation")
    if user_location:
        start_point = f"Start from user's current location: {user_location}. "
    else:
        start_point = ""
    itinerary_text = get_gemini_response(
        f"{start_point}Create a detailed travel itinerary for: {', '.join(selected_places)}. Suggest the best order, time to spend at each, and what to do at each place. Include tips and local insights.", ""
    )
    # Get place details (with coordinates) for map
    from utils.location import get_coordinates
    places_with_coords = []
    for name in selected_places:
        coords = get_coordinates(name)
        if coords:
            places_with_coords.append({"name": name, "coords": coords})
    pdf = create_itinerary_pdf(itinerary_text, places=places_with_coords)
    # Return both text and PDF for frontend preview and download
    if request.args.get("preview") == "1":
        return jsonify({"reply": itinerary_text})
    return send_file(pdf, as_attachment=True, download_name="itinerary.pdf")

if __name__ == '__main__':
    app.run(debug=True)