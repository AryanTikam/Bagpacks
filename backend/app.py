from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import json
import io
import os
from utils.gemini_chat import get_gemini_response
from utils.itinerary import create_itinerary_pdf
from utils.location import get_place_details

app = Flask(__name__)
CORS(app)

# Import the Node.js server routes by making HTTP requests
NODE_SERVER_URL = "http://localhost:3001"

@app.route('/api/destination/<place>', methods=['GET'])
def destination(place):
    data = get_place_details(place)
    return jsonify(data)

@app.route('/api/chat', methods=['POST'])
def chat():
    user_input = request.json.get("message")
    location = request.json.get("location")
    user_location = request.json.get("userLocation")
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
    days = request.json.get("days")
    budget = request.json.get("budget")
    people = request.json.get("people")
    template_id = request.json.get("template", "modern")  # Get template selection
    format_type = request.json.get("format", "pdf")
    
    # Force PDF format since DOCX is removed
    if format_type != "pdf":
        format_type = "pdf"
    
    personalization = ""
    if days:
        personalization += f"For {days} days. "
    if budget:
        personalization += f"Budget: ₹{budget}. "
    if people:
        personalization += f"For {people} people. "
    if user_location:
        start_point = f"Start from user's current location: {user_location}. "
    else:
        start_point = ""
    
    itinerary_text = get_gemini_response(
        f"{start_point}{personalization}Create a detailed travel itinerary for: {', '.join(selected_places)}. Suggest the best order, time to spend at each, and what to do at each place. Include tips and local insights.", ""
    )
    
    from utils.location import get_coordinates
    places_with_coords = []
    for name in selected_places:
        coords = get_coordinates(name)
        if coords:
            places_with_coords.append({"name": name, "coords": coords})
    
    options = {"days": days, "budget": budget, "people": people}
    
    # Only save adventure when itinerary is successfully generated
    auth_header = request.headers.get('Authorization')
    if auth_header and selected_places and itinerary_text:
        try:
            destination_name = selected_places[0] if selected_places else "Unknown"
            if len(selected_places) > 1:
                destination_name = f"{selected_places[0]} & {len(selected_places)-1} more"
            
            response = requests.post(f"{NODE_SERVER_URL}/api/adventures", 
                         json={
                             "destination": destination_name,
                             "places": places_with_coords,
                             "itinerary": {"text": itinerary_text},
                             "options": options
                         },
                         headers={"Authorization": auth_header},
                         timeout=5)
            print(f"Adventure saved with itinerary: {response.status_code}")
        except Exception as e:
            print(f"Failed to save adventure: {e}")
            pass
    
    # Handle preview request
    if request.args.get("preview") == "1":
        return jsonify({"reply": itinerary_text})
    
    # Generate PDF with LaTeX and selected template
    from utils.itinerary import create_itinerary_pdf
    pdf_buffer = create_itinerary_pdf(itinerary_text, places=places_with_coords, options=options, template_id=template_id)
    return send_file(
        pdf_buffer, 
        as_attachment=True, 
        download_name=f"itinerary_{template_id}.pdf",
        mimetype="application/pdf"
    )

if __name__ == '__main__':
    app.run(debug=True, port=5000)