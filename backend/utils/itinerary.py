import io
import os
from datetime import datetime, timedelta
from html import unescape
from xml.sax.saxutils import escape

try:
    import markdown2
except ImportError:
    markdown2 = None

try:
    from bs4 import BeautifulSoup, NavigableString, Tag
except ImportError:
    BeautifulSoup = None
    NavigableString = str
    Tag = object

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BUNDLED_FONT_DIR = os.path.join(BASE_DIR, "..", "assets", "fonts")


def _register_first_available_font(candidates, alias):
    for path in candidates:
        if os.path.exists(path):
            try:
                pdfmetrics.registerFont(TTFont(alias, path))
                return alias
            except Exception:
                continue
    return None


def resolve_font_family():
    sans_regular = _register_first_available_font(
        [
            os.path.join(BUNDLED_FONT_DIR, "NotoSans-Regular.ttf"),
            "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/TTF/DejaVuSans.ttf",
        ],
        "BagpackSans",
    )
    sans_bold = _register_first_available_font(
        [
            os.path.join(BUNDLED_FONT_DIR, "NotoSans-Bold.ttf"),
            "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
        ],
        "BagpackSansBold",
    )
    serif_regular = _register_first_available_font(
        [
            os.path.join(BUNDLED_FONT_DIR, "NotoSerif-Regular.ttf"),
            "/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
            "/usr/share/fonts/TTF/DejaVuSerif.ttf",
        ],
        "BagpackSerif",
    )
    serif_bold = _register_first_available_font(
        [
            os.path.join(BUNDLED_FONT_DIR, "NotoSerif-Bold.ttf"),
            "/usr/share/fonts/truetype/noto/NotoSerif-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
            "/usr/share/fonts/TTF/DejaVuSerif-Bold.ttf",
        ],
        "BagpackSerifBold",
    )

    family = {
        "sans": sans_regular or "Helvetica",
        "sans_bold": sans_bold or "Helvetica-Bold",
        "serif": serif_regular or "Times-Roman",
        "serif_bold": serif_bold or "Times-Bold",
    }
    family["supports_rupee"] = sans_regular is not None
    return family


FONT_FAMILY = resolve_font_family()


def get_template_config(template_id):
    templates = {
        "modern": {
            "name": "Modern Professional",
            "primary": colors.HexColor("#2563EB"),
            "secondary": colors.HexColor("#7C3AED"),
            "accent": colors.HexColor("#059669"),
            "page_bg": colors.HexColor("#F8FAFC"),
            "title_font": FONT_FAMILY["sans_bold"],
            "body_font": FONT_FAMILY["sans"],
            "mood": "sleek",
        },
        "vintage": {
            "name": "Vintage Explorer",
            "primary": colors.HexColor("#8B5E3C"),
            "secondary": colors.HexColor("#B07D52"),
            "accent": colors.HexColor("#355E3B"),
            "page_bg": colors.HexColor("#FCF7EF"),
            "title_font": FONT_FAMILY["serif_bold"],
            "body_font": FONT_FAMILY["serif"],
            "mood": "classic",
        },
        "minimalist": {
            "name": "Minimalist Zen",
            "primary": colors.HexColor("#1F2937"),
            "secondary": colors.HexColor("#4B5563"),
            "accent": colors.HexColor("#0891B2"),
            "page_bg": colors.white,
            "title_font": FONT_FAMILY["sans_bold"],
            "body_font": FONT_FAMILY["sans"],
            "mood": "calm",
        },
        "sunset": {
            "name": "Sunset Pop",
            "primary": colors.HexColor("#E85D04"),
            "secondary": colors.HexColor("#F48C06"),
            "accent": colors.HexColor("#DC2F02"),
            "page_bg": colors.HexColor("#FFF5EB"),
            "title_font": FONT_FAMILY["sans_bold"],
            "body_font": FONT_FAMILY["sans"],
            "mood": "energetic",
        },
        "coastal": {
            "name": "Coastal Breeze",
            "primary": colors.HexColor("#0077B6"),
            "secondary": colors.HexColor("#0096C7"),
            "accent": colors.HexColor("#00B4D8"),
            "page_bg": colors.HexColor("#F0FAFF"),
            "title_font": FONT_FAMILY["sans_bold"],
            "body_font": FONT_FAMILY["sans"],
            "mood": "playful",
        },
        "noir": {
            "name": "Noir Editorial",
            "primary": colors.HexColor("#111827"),
            "secondary": colors.HexColor("#374151"),
            "accent": colors.HexColor("#9CA3AF"),
            "page_bg": colors.HexColor("#F9FAFB"),
            "title_font": FONT_FAMILY["serif_bold"],
            "body_font": FONT_FAMILY["serif"],
            "mood": "editorial",
        },
        "festival": {
            "name": "Festival Mosaic",
            "primary": colors.HexColor("#7E22CE"),
            "secondary": colors.HexColor("#DB2777"),
            "accent": colors.HexColor("#EA580C"),
            "page_bg": colors.HexColor("#FFFBF5"),
            "title_font": FONT_FAMILY["sans_bold"],
            "body_font": FONT_FAMILY["sans"],
            "mood": "festive",
        },
    }
    return templates.get(template_id, templates["modern"])


def to_text(value, default="Not specified"):
    if value is None:
        return default
    text = str(value).strip()
    return text if text else default


def normalize_currency(text):
    if FONT_FAMILY["supports_rupee"]:
        return text.replace("INR", "₹")
    return text.replace("₹", "INR ")


def infer_destination(places):
    if not places:
        return "Your Destination"
    first = places[0].get("name", "Your Destination")
    return first.split(",")[0].strip() or "Your Destination"


def compute_trip_meta(options):
    opts = options or {}

    try:
        days = int(opts.get("days", 3))
    except (TypeError, ValueError):
        days = 3

    days = max(1, days)

    try:
        people = int(opts.get("people", 1))
    except (TypeError, ValueError):
        people = 1

    people = max(1, people)

    budget = opts.get("budget")
    try:
        budget_number = int(str(budget).replace(",", ""))
        budget_text = normalize_currency(f"₹{budget_number:,}")
    except (TypeError, ValueError):
        budget_text = normalize_currency(to_text(budget))

    start = datetime.now()
    end = start + timedelta(days=days - 1)
    date_range = f"{start.strftime('%b %d')} - {end.strftime('%b %d, %Y')}"

    return {
        "days": days,
        "people": people,
        "budget": budget_text,
        "date_range": date_range,
        "generated_at": datetime.now().strftime("%B %d, %Y at %I:%M %p"),
    }


def build_styles(theme):
    base = getSampleStyleSheet()

    return {
        "title": ParagraphStyle(
            "title",
            parent=base["Title"],
            fontName=theme["title_font"],
            fontSize=30,
            leading=34,
            textColor=theme["primary"],
            alignment=TA_CENTER,
            spaceAfter=8,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            parent=base["Heading2"],
            fontName=theme["body_font"],
            fontSize=14,
            leading=18,
            textColor=theme["secondary"],
            alignment=TA_CENTER,
            spaceAfter=16,
        ),
        "h1": ParagraphStyle(
            "h1",
            parent=base["Heading1"],
            fontName=theme["title_font"],
            fontSize=18,
            leading=22,
            textColor=theme["primary"],
            spaceBefore=14,
            spaceAfter=6,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName=theme["title_font"],
            fontSize=15,
            leading=19,
            textColor=theme["secondary"],
            spaceBefore=10,
            spaceAfter=4,
        ),
        "h3": ParagraphStyle(
            "h3",
            parent=base["Heading3"],
            fontName=theme["title_font"],
            fontSize=13,
            leading=17,
            textColor=theme["accent"],
            spaceBefore=8,
            spaceAfter=3,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["BodyText"],
            fontName=theme["body_font"],
            fontSize=10.5,
            leading=15,
            textColor=colors.HexColor("#111827"),
            alignment=TA_JUSTIFY,
            spaceAfter=7,
        ),
        "body_left": ParagraphStyle(
            "body_left",
            parent=base["BodyText"],
            fontName=theme["body_font"],
            fontSize=10.5,
            leading=15,
            textColor=colors.HexColor("#111827"),
            alignment=TA_LEFT,
            spaceAfter=6,
        ),
        "meta": ParagraphStyle(
            "meta",
            parent=base["Normal"],
            fontName=theme["body_font"],
            fontSize=9.2,
            leading=12,
            textColor=colors.HexColor("#374151"),
            alignment=TA_LEFT,
        ),
        "footer": ParagraphStyle(
            "footer",
            parent=base["Normal"],
            fontName=theme["body_font"],
            fontSize=9,
            leading=12,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#4B5563"),
            spaceBefore=14,
        ),
    }


def render_inline(node):
    if isinstance(node, NavigableString):
        return normalize_currency(escape(unescape(str(node))))

    if not isinstance(node, Tag):
        return ""

    content = "".join(render_inline(child) for child in node.children)
    name = node.name.lower()

    if name in ("strong", "b"):
        return f"<b>{content}</b>"
    if name in ("em", "i"):
        return f"<i>{content}</i>"
    if name == "code":
        return f"<font name='Courier'>{content}</font>"
    if name == "br":
        return "<br/>"
    if name == "a":
        href = escape(node.get("href", "").strip())
        if href:
            return f"<link href='{href}'>{content}</link>"
        return content

    return content


def paragraph_from_tag(tag, style):
    markup = "".join(render_inline(child) for child in tag.children).strip()
    if not markup:
        return None
    return Paragraph(markup, style)


def callout_table(text, theme, style, icon="TIP"):
    label = Paragraph(f"<b>{escape(icon)}</b>", style)
    body = Paragraph(escape(normalize_currency(text)), style)
    table = Table([[label, body]], colWidths=[18 * mm, 152 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), theme["accent"]),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.white),
                ("BACKGROUND", (1, 0), (1, -1), colors.HexColor("#F8FAFC")),
                ("BOX", (0, 0), (-1, -1), 0.7, theme["accent"]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def list_flowable_from_tag(list_tag, styles, level=0):
    items = []

    for li in list_tag.find_all("li", recursive=False):
        fragments = []
        nested_lists = []

        for child in li.children:
            if isinstance(child, Tag) and child.name.lower() in ("ul", "ol"):
                nested_lists.append(child)
            else:
                fragments.append(render_inline(child))

        item_text = "".join(fragments).strip() or "Item"
        item_para = Paragraph(item_text, styles["body_left"])
        items.append(ListItem(item_para))

        for nested in nested_lists:
            nested_flowable = list_flowable_from_tag(nested, styles, level + 1)
            if nested_flowable:
                items.append(nested_flowable)

    if not items:
        return None

    ordered = list_tag.name.lower() == "ol"
    return ListFlowable(
        items,
        bulletType="1" if ordered else "bullet",
        start="1",
        leftIndent=14 + (level * 12),
        bulletFontName=styles["body_left"].fontName,
        bulletFontSize=9,
        bulletOffsetY=2,
        spaceBefore=3,
        spaceAfter=6,
    )


def _render_plain_markdown(markdown_text, styles, theme):
    flowables = []
    for line in (markdown_text or "").splitlines():
        stripped = normalize_currency(line.strip())
        if not stripped:
            flowables.append(Spacer(1, 4))
            continue

        lower = stripped.lower()
        if lower.startswith(("tip:", "pro tip:")):
            flowables.append(callout_table(stripped.split(":", 1)[1].strip(), theme, styles["body_left"], "TIP"))
            flowables.append(Spacer(1, 4))
            continue
        if lower.startswith(("budget:", "cost:")):
            flowables.append(callout_table(stripped.split(":", 1)[1].strip(), theme, styles["body_left"], "COST"))
            flowables.append(Spacer(1, 4))
            continue

        if stripped.startswith("### "):
            flowables.append(Paragraph(escape(stripped[4:]), styles["h3"]))
        elif stripped.startswith("## "):
            flowables.append(Paragraph(escape(stripped[3:]), styles["h2"]))
        elif stripped.startswith("# "):
            flowables.append(Paragraph(escape(stripped[2:]), styles["h1"]))
        elif stripped.startswith(("- ", "* ")):
            flowables.append(Paragraph(f"• {escape(stripped[2:])}", styles["body_left"]))
        else:
            flowables.append(Paragraph(escape(stripped), styles["body"]))

    if not flowables:
        flowables.append(Paragraph("No itinerary content available.", styles["body"]))

    return flowables


def markdown_to_flowables(markdown_text, styles, theme):
    if markdown2 is None or BeautifulSoup is None:
        return _render_plain_markdown(markdown_text, styles, theme)

    html = markdown2.markdown(
        markdown_text or "",
        extras=["fenced-code-blocks", "tables", "strike", "cuddled-lists"],
    )

    soup = BeautifulSoup(html, "html.parser")
    flowables = []

    for node in soup.contents:
        if isinstance(node, NavigableString):
            text = normalize_currency(str(node).strip())
            if text:
                flowables.append(Paragraph(escape(text), styles["body"]))
            continue

        if not isinstance(node, Tag):
            continue

        name = node.name.lower()

        if name == "h1":
            p = paragraph_from_tag(node, styles["h1"])
            if p:
                flowables.append(p)
        elif name == "h2":
            p = paragraph_from_tag(node, styles["h2"])
            if p:
                flowables.append(p)
        elif name == "h3":
            p = paragraph_from_tag(node, styles["h3"])
            if p:
                flowables.append(p)
        elif name in ("ul", "ol"):
            lst = list_flowable_from_tag(node, styles)
            if lst:
                flowables.append(lst)
        elif name == "blockquote":
            p = paragraph_from_tag(node, styles["body_left"])
            if p:
                flowables.append(callout_table(p.text, theme, styles["body_left"], "NOTE"))
                flowables.append(Spacer(1, 3))
        else:
            p = paragraph_from_tag(node, styles["body"])
            if p:
                txt = p.getPlainText().strip()
                lower = txt.lower()
                if lower.startswith(("tip:", "pro tip:")):
                    flowables.append(callout_table(txt.split(":", 1)[1].strip(), theme, styles["body_left"], "TIP"))
                    flowables.append(Spacer(1, 4))
                elif lower.startswith(("budget:", "cost:")):
                    flowables.append(callout_table(txt.split(":", 1)[1].strip(), theme, styles["body_left"], "COST"))
                    flowables.append(Spacer(1, 4))
                else:
                    flowables.append(p)

    if not flowables:
        flowables.append(Paragraph("No itinerary content available.", styles["body"]))

    return flowables


def draw_page_chrome(theme, destination):
    def _drawer(pdf_canvas, doc):
        width, height = A4

        pdf_canvas.saveState()

        pdf_canvas.setFillColor(theme["page_bg"])
        pdf_canvas.rect(0, 0, width, height, stroke=0, fill=1)

        mood = theme.get("mood")
        pdf_canvas.setFillColor(theme["primary"])
        pdf_canvas.rect(0, height - 24, width, 24, stroke=0, fill=1)

        pdf_canvas.setFillColor(theme["accent"])
        if mood in ("energetic", "playful"):
            pdf_canvas.circle(width - 22, height - 12, 16, stroke=0, fill=1)
        elif mood == "editorial":
            pdf_canvas.rect(0, height - 30, width * 0.55, 6, stroke=0, fill=1)
            pdf_canvas.rect(width * 0.62, height - 30, width * 0.38, 6, stroke=0, fill=1)
        elif mood == "festive":
            pdf_canvas.rect(0, height - 30, width, 2, stroke=0, fill=1)
            pdf_canvas.setFillColor(theme["secondary"])
            for x in (30, 80, 130, 180, 230):
                pdf_canvas.circle(x, height - 12, 3, stroke=0, fill=1)
            pdf_canvas.setFillColor(theme["accent"])
            for x in (55, 105, 155, 205):
                pdf_canvas.circle(x, height - 12, 3, stroke=0, fill=1)
        else:
            pdf_canvas.rect(0, height - 28, width * 0.28, 4, stroke=0, fill=1)

        pdf_canvas.setFillColor(colors.white)
        pdf_canvas.setFont(FONT_FAMILY["sans_bold"], 9)
        pdf_canvas.drawString(16, height - 17, "Bagpack Travel Itinerary")

        pdf_canvas.setFillColor(colors.HexColor("#4B5563"))
        pdf_canvas.setFont(FONT_FAMILY["sans"], 8)
        pdf_canvas.drawString(16, 14, f"Destination: {destination}")
        pdf_canvas.drawRightString(width - 16, 14, f"Page {doc.page}")

        pdf_canvas.restoreState()

    return _drawer


def build_summary_block(destination, meta, styles, theme):
    data = [
        [Paragraph("<b>Destination</b>", styles["meta"]), Paragraph(escape(destination), styles["meta"])],
        [Paragraph("<b>Duration</b>", styles["meta"]), Paragraph(f"{meta['days']} day(s) ({meta['date_range']})", styles["meta"])],
        [Paragraph("<b>Travelers</b>", styles["meta"]), Paragraph(f"{meta['people']} person(s)", styles["meta"])],
        [Paragraph("<b>Budget</b>", styles["meta"]), Paragraph(escape(meta["budget"]), styles["meta"])],
        [Paragraph("<b>Generated</b>", styles["meta"]), Paragraph(escape(meta["generated_at"]), styles["meta"])],
    ]

    table = Table(data, colWidths=[42 * mm, 128 * mm])
    table_style = [
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("BOX", (0, 0), (-1, -1), 0.9, theme["primary"]),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#E5E7EB")),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F9FAFB")),
    ]

    mood = theme.get("mood")
    if mood == "editorial":
        table_style.extend([
            ("BOX", (0, 0), (-1, -1), 1.6, theme["primary"]),
            ("LINEBELOW", (0, 0), (-1, 0), 1.2, theme["accent"]),
        ])
    elif mood == "festive":
        table_style.extend([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#FDF2F8")),
            ("BOX", (0, 0), (-1, -1), 1.2, theme["secondary"]),
        ])

    table.setStyle(TableStyle(table_style))
    return table


def create_minimal_valid_pdf(message="Your itinerary is ready."):
    msg = normalize_currency(message)
    buffer = io.BytesIO()
    pdf_canvas = canvas.Canvas(buffer, pagesize=A4)
    pdf_canvas.setFont(FONT_FAMILY["sans_bold"], 14)
    pdf_canvas.drawString(40, A4[1] - 60, "Travel Itinerary")
    pdf_canvas.setFont(FONT_FAMILY["sans"], 10)
    pdf_canvas.drawString(40, A4[1] - 82, msg)
    pdf_canvas.save()
    buffer.seek(0)
    return buffer


def create_itinerary_pdf(markdown_text, places=None, options=None, template_id="modern"):
    """Generate a themed PDF from markdown with robust fallback and Unicode support."""

    theme = get_template_config(template_id)
    styles = build_styles(theme)
    destination = infer_destination(places)
    meta = compute_trip_meta(options)

    try:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=18 * mm,
            rightMargin=18 * mm,
            topMargin=26 * mm,
            bottomMargin=18 * mm,
            title=f"{destination} itinerary",
            author="Bagpack",
        )

        story = [
            Paragraph("Travel Itinerary", styles["title"]),
            Paragraph(f"{escape(destination)} Adventure", styles["subtitle"]),
            build_summary_block(destination, meta, styles, theme),
            Spacer(1, 8),
        ]

        story.extend(markdown_to_flowables(markdown_text, styles, theme))
        story.append(Spacer(1, 8))
        story.append(
            Paragraph(
                f"Template: {theme['name']} | Generated by Bagpack AI",
                styles["footer"],
            )
        )

        chrome = draw_page_chrome(theme, destination)
        doc.build(story, onFirstPage=chrome, onLaterPages=chrome)

        buffer.seek(0)
        data = buffer.read()
        if not data.startswith(b"%PDF-"):
            return create_minimal_valid_pdf("PDF fallback: generated content was invalid.")

        return io.BytesIO(data)

    except Exception as exc:
        print(f"PDF generation failed, using minimal fallback: {exc}")
        return create_minimal_valid_pdf("PDF fallback was used due to rendering error.")


# Legacy API retained for compatibility.
def create_itinerary_docx(*args, **kwargs):
    raise NotImplementedError("DOCX generation has been removed. Use PDF generation.")
