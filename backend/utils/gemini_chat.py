# --- utils/gemini_chat.py ---
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.0-flash")

def get_gemini_response(message, location=None):
    prompt = f"You are a travel assistant for India. Location: {location or 'unspecified'}.\nUser: {message}\nGive detailed and friendly travel suggestions."
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error: {str(e)}"
