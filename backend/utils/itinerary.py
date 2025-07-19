import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import inch
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
import markdown2
import requests
from PIL import Image as PILImage
import os

# Register Unicode font
FONT_PATH = os.path.join(os.path.dirname(__file__), "fonts", "DejaVuSans.ttf")
pdfmetrics.registerFont(TTFont("DejaVuSans", FONT_PATH))

def fetch_static_map(places, width=600, height=350):
    marker_strs = []
    for i, place in enumerate(places):
        lat, lon = place.get("coords", [None, None])
        if lat is not None and lon is not None:
            color = ["red", "blue", "green", "yellow", "purple"][i % 5]
            marker_strs.append(f"markers={lat},{lon},{color}{i+1}")
    markers = "&".join(marker_strs)
    center = f"{places[0]['coords'][0]},{places[0]['coords'][1]}"
    url = f"https://staticmap.openstreetmap.de/staticmap.php?center={center}&zoom=13&size={width}x{height}&{markers}"
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            return io.BytesIO(resp.content)
    except Exception as e:
        print(f"Could not fetch static map: {e}")
    return None

def create_itinerary_pdf(markdown_text, places=None):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    # Use DejaVuSans for all styles
    for style_name in styles.byName:
        styles[style_name].fontName = "DejaVuSans"
    styles.add(ParagraphStyle(name='CenterTitle', parent=styles['Heading1'], alignment=TA_CENTER, fontName="DejaVuSans"))
    story = []

    story.append(Paragraph("🗺️ Your Bagpack Itinerary", styles['CenterTitle']))
    story.append(Spacer(1, 18))

    # Try to add map image, but continue if it fails
    if places:
        map_img_io = fetch_static_map(places)
        if map_img_io:
            try:
                pil_img = PILImage.open(map_img_io)
                pil_img.thumbnail((400, 250))
                img_io = io.BytesIO()
                pil_img.save(img_io, format='PNG')
                img_io.seek(0)
                story.append(Image(img_io, width=pil_img.width, height=pil_img.height))
                story.append(Spacer(1, 12))
            except Exception as e:
                print(f"Could not add map image to PDF: {e}")

    html = markdown2.markdown(markdown_text)
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")
    for elem in soup.contents:
        if elem.name == "h1":
            story.append(Paragraph(f"<b>{elem.text}</b>", styles['Heading1']))
        elif elem.name == "h2":
            story.append(Paragraph(f"<b>{elem.text}</b>", styles['Heading2']))
        elif elem.name == "h3":
            story.append(Paragraph(f"<b>{elem.text}</b>", styles['Heading3']))
        elif elem.name == "ul":
            for li in elem.find_all("li"):
                story.append(Paragraph(f"• {li.text}", styles['Normal']))
        elif elem.name == "ol":
            for idx, li in enumerate(elem.find_all("li"), 1):
                story.append(Paragraph(f"{idx}. {li.text}", styles['Normal']))
        elif elem.name == "p":
            story.append(Paragraph(elem.text, styles['Normal']))
        elif elem.name == "strong":
            story.append(Paragraph(f"<b>{elem.text}</b>", styles['Normal']))
        elif elem.name == "em":
            story.append(Paragraph(f"<i>{elem.text}</i>", styles['Normal']))
        story.append(Spacer(1, 6))

    doc.build(story)
    buffer.seek(0)
    return buffer