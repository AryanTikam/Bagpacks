import io
from datetime import datetime, timedelta
from html import unescape

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
from xml.sax.saxutils import escape


def get_template_config(template_id):
    templates = {
        "modern": {
            "name": "Modern Professional",
            "primary": colors.HexColor("#2563EB"),
            "secondary": colors.HexColor("#7C3AED"),
            "accent": colors.HexColor("#059669"),
            "page_bg": colors.HexColor("#F8FAFC"),
            "title_font": "Helvetica-Bold",
            "body_font": "Helvetica",
        },
        "vintage": {
            "name": "Vintage Explorer",
            "primary": colors.HexColor("#8B5E3C"),
            "secondary": colors.HexColor("#B07D52"),
            "accent": colors.HexColor("#355E3B"),
            "page_bg": colors.HexColor("#FCF7EF"),
            "title_font": "Times-Bold",
            "body_font": "Times-Roman",
        },
        "minimalist": {
            "name": "Minimalist Zen",
            "primary": colors.HexColor("#1F2937"),
            "secondary": colors.HexColor("#4B5563"),
            "accent": colors.HexColor("#0891B2"),
            "page_bg": colors.white,
            "title_font": "Helvetica-Bold",
            "body_font": "Helvetica",
        },
    }
    return templates.get(template_id, templates["modern"])


def to_text(value, default="Not specified"):
    if value is None:
        return default
    text = str(value).strip()
    return text if text else default


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
        budget_text = f"INR {budget_number:,}"
    except (TypeError, ValueError):
        budget_text = to_text(budget)

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

    styles = {
        "title": ParagraphStyle(
            "title",
            parent=base["Title"],
            fontName=theme["title_font"],
            fontSize=28,
            leading=32,
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
            fontSize=9,
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

    return styles


def render_inline(node):
    if isinstance(node, NavigableString):
        return escape(unescape(str(node)))

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
        item = ListItem(item_para)
        items.append(item)

        for nested in nested_lists:
            nested_flowable = list_flowable_from_tag(nested, styles, level + 1)
            if nested_flowable:
                items.append(nested_flowable)

    if not items:
        return None

    ordered = list_tag.name.lower() == "ol"
    bullet_type = "1" if ordered else "bullet"

    return ListFlowable(
        items,
        bulletType=bullet_type,
        start="1",
        leftIndent=14 + (level * 12),
        bulletFontName="Helvetica",
        bulletFontSize=9,
        bulletOffsetY=2,
        spaceBefore=3,
        spaceAfter=6,
    )


def markdown_to_flowables(markdown_text, styles):
    if markdown2 is None or BeautifulSoup is None:
        flowables = []
        for line in (markdown_text or "").splitlines():
            stripped = line.strip()
            if not stripped:
                flowables.append(Spacer(1, 4))
                continue
            if stripped.startswith("### "):
                flowables.append(Paragraph(escape(stripped[4:]), styles["h3"]))
            elif stripped.startswith("## "):
                flowables.append(Paragraph(escape(stripped[3:]), styles["h2"]))
            elif stripped.startswith("# "):
                flowables.append(Paragraph(escape(stripped[2:]), styles["h1"]))
            elif stripped.startswith(("- ", "* ")):
                flowables.append(Paragraph(f"- {escape(stripped[2:])}", styles["body_left"]))
            else:
                flowables.append(Paragraph(escape(stripped), styles["body"]))

        if not flowables:
            flowables.append(Paragraph("No itinerary content available.", styles["body"]))
        return flowables

    html = markdown2.markdown(
        markdown_text or "",
        extras=["fenced-code-blocks", "tables", "strike", "cuddled-lists"],
    )

    soup = BeautifulSoup(html, "html.parser")
    root_nodes = soup.contents
    flowables = []

    for node in root_nodes:
        if isinstance(node, NavigableString):
            text = str(node).strip()
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
        elif name in ("p", "div"):
            p = paragraph_from_tag(node, styles["body"])
            if p:
                flowables.append(p)
        elif name in ("ul", "ol"):
            lst = list_flowable_from_tag(node, styles)
            if lst:
                flowables.append(lst)
        elif name == "blockquote":
            p = paragraph_from_tag(node, styles["body_left"])
            if p:
                quote_table = Table([[p]], colWidths=[170 * mm])
                quote_table.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F3F4F6")),
                            ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#D1D5DB")),
                            ("LEFTPADDING", (0, 0), (-1, -1), 8),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                            ("TOPPADDING", (0, 0), (-1, -1), 6),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                        ]
                    )
                )
                flowables.append(quote_table)
                flowables.append(Spacer(1, 3))
        else:
            p = paragraph_from_tag(node, styles["body"])
            if p:
                flowables.append(p)

    if not flowables:
        flowables.append(Paragraph("No itinerary content available.", styles["body"]))

    return flowables


def draw_page_chrome(theme, destination):
    def _drawer(pdf_canvas, doc):
        width, height = A4

        pdf_canvas.saveState()

        # Soft page tint
        pdf_canvas.setFillColor(theme["page_bg"])
        pdf_canvas.rect(0, 0, width, height, stroke=0, fill=1)

        # Top accent band
        pdf_canvas.setFillColor(theme["primary"])
        pdf_canvas.rect(0, height - 24, width, 24, stroke=0, fill=1)

        # Sub-accent strip for visual depth
        pdf_canvas.setFillColor(theme["accent"])
        pdf_canvas.rect(0, height - 28, width * 0.28, 4, stroke=0, fill=1)

        # Header text
        pdf_canvas.setFillColor(colors.white)
        pdf_canvas.setFont("Helvetica-Bold", 9)
        pdf_canvas.drawString(16, height - 17, "Bagpack Travel Itinerary")

        # Footer text + page number
        pdf_canvas.setFillColor(colors.HexColor("#4B5563"))
        pdf_canvas.setFont("Helvetica", 8)
        pdf_canvas.drawString(16, 14, f"Destination: {destination}")
        pdf_canvas.drawRightString(width - 16, 14, f"Page {doc.page}")

        pdf_canvas.restoreState()

    return _drawer


def build_summary_block(destination, meta, styles, theme):
    data = [
        [
            Paragraph("<b>Destination</b>", styles["meta"]),
            Paragraph(escape(destination), styles["meta"]),
        ],
        [
            Paragraph("<b>Duration</b>", styles["meta"]),
            Paragraph(f"{meta['days']} day(s) ({meta['date_range']})", styles["meta"]),
        ],
        [
            Paragraph("<b>Travelers</b>", styles["meta"]),
            Paragraph(f"{meta['people']} person(s)", styles["meta"]),
        ],
        [
            Paragraph("<b>Budget</b>", styles["meta"]),
            Paragraph(escape(meta["budget"]), styles["meta"]),
        ],
        [
            Paragraph("<b>Generated</b>", styles["meta"]),
            Paragraph(escape(meta["generated_at"]), styles["meta"]),
        ],
    ]

    table = Table(data, colWidths=[42 * mm, 128 * mm])
    table.setStyle(
        TableStyle(
            [
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
        )
    )
    return table


def create_minimal_valid_pdf(message="Your itinerary is ready."):
    buffer = io.BytesIO()
    pdf_canvas = canvas.Canvas(buffer, pagesize=A4)
    pdf_canvas.setFont("Helvetica-Bold", 14)
    pdf_canvas.drawString(40, A4[1] - 60, "Travel Itinerary")
    pdf_canvas.setFont("Helvetica", 10)
    pdf_canvas.drawString(40, A4[1] - 82, message)
    pdf_canvas.save()
    buffer.seek(0)
    return buffer


def create_itinerary_pdf(markdown_text, places=None, options=None, template_id="modern"):
    """Generate a themed PDF from markdown without LaTeX dependencies."""

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

        story = []
        story.append(Paragraph("Travel Itinerary", styles["title"]))
        story.append(Paragraph(f"{escape(destination)} Adventure", styles["subtitle"]))
        story.append(build_summary_block(destination, meta, styles, theme))
        story.append(Spacer(1, 8))

        content = markdown_to_flowables(markdown_text, styles)
        story.extend(content)

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
