import io
import os
import tempfile
import subprocess
import requests
import re
from PIL import Image as PILImage
from datetime import datetime, timedelta

def fetch_static_map(places, width=600, height=350):
    marker_strs = []
    for i, place in enumerate(places):
        lat, lon = place.get("coords", [None, None])
        if lat is not None and lon is not None:
            color = ["red", "blue", "green", "yellow", "purple"][i % 5]
            marker_strs.append(f"markers={lat},{lon},{color}{i+1}")
    
    if not marker_strs:
        return None
        
    markers = "&".join(marker_strs)
    center = f"{places[0]['coords'][0]},{places[0]['coords'][1]}"
    
    # Try multiple map services
    map_urls = [
        f"https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/{center},{13}/{width}x{height}?access_token=pk.your_token",
        f"https://maps.googleapis.com/maps/api/staticmap?center={center}&zoom=13&size={width}x{height}&{markers}",
        f"https://staticmap.openstreetmap.de/staticmap.php?center={center}&zoom=13&size={width}x{height}&{markers}"
    ]
    
    for url in map_urls:
        try:
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                return io.BytesIO(resp.content)
        except Exception as e:
            print(f"Could not fetch static map from {url}: {e}")
            continue
    
    print("All map services failed, continuing without map")
    return None

def markdown_to_latex(markdown_text):
    """Convert markdown to LaTeX with proper formatting for headers, bold, etc."""
    lines = markdown_text.split('\n')
    latex_content = []
    in_list = False
    
    for line in lines:
        line = line.strip()
        if not line:
            if in_list:
                latex_content.append('\\end{itemize}')
                in_list = False
            latex_content.append('')
            continue
            
        # Escape special LaTeX characters
        escaped_line = line.replace('&', '\\&').replace('%', '\\%').replace('$', '\\$').replace('#', '\\#')
        escaped_line = escaped_line.replace('_', '\\_').replace('{', '\\{').replace('}', '\\}')
        
        # Handle headers
        if line.startswith('# '):
            if in_list:
                latex_content.append('\\end{itemize}')
                in_list = False
            title = line[2:].strip()
            title = title.replace('&', '\\&').replace('%', '\\%').replace('$', '\\$').replace('#', '\\#')
            title = title.replace('_', '\\_').replace('{', '\\{').replace('}', '\\}')
            latex_content.append(f'\\section{{{title}}}')
        elif line.startswith('## '):
            if in_list:
                latex_content.append('\\end{itemize}')
                in_list = False
            title = line[3:].strip()
            title = title.replace('&', '\\&').replace('%', '\\%').replace('$', '\\$').replace('#', '\\#')
            title = title.replace('_', '\\_').replace('{', '\\{').replace('}', '\\}')
            latex_content.append(f'\\subsection{{{title}}}')
        elif line.startswith('### '):
            if in_list:
                latex_content.append('\\end{itemize}')
                in_list = False
            title = line[4:].strip()
            title = title.replace('&', '\\&').replace('%', '\\%').replace('$', '\\$').replace('#', '\\#')
            title = title.replace('_', '\\_').replace('{', '\\{').replace('}', '\\}')
            latex_content.append(f'\\subsubsection{{{title}}}')
        elif line.startswith('- ') or line.startswith('* '):
            if not in_list:
                latex_content.append('\\begin{itemize}')
                in_list = True
            item = line[2:].strip()
            item = item.replace('&', '\\&').replace('%', '\\%').replace('$', '\\$').replace('#', '\\#')
            item = item.replace('_', '\\_').replace('{', '\\{').replace('}', '\\}')
            # Handle bold text in list items
            item = handle_bold_text(item)
            latex_content.append(f'\\item {item}')
        else:
            if in_list:
                latex_content.append('\\end{itemize}')
                in_list = False
            if line:
                # Handle bold text and other formatting
                formatted_line = handle_bold_text(escaped_line)
                latex_content.append(formatted_line)
    
    if in_list:
        latex_content.append('\\end{itemize}')
    
    return '\n'.join(latex_content)

def handle_bold_text(text):
    """Handle **bold** and *italic* markdown formatting"""
    import re
    
    # Handle **bold** text
    text = re.sub(r'\*\*(.*?)\*\*', r'\\textbf{\1}', text)
    
    # Handle *italic* text (but not if it's part of **bold**)
    text = re.sub(r'(?<!\*)\*([^*]+?)\*(?!\*)', r'\\textit{\1}', text)
    
    return text

def get_template_config(template_id):
    """Get template-specific configurations"""
    templates = {
        'modern': {
            'name': 'Modern Professional',
            'primary': '0.15, 0.39, 0.92',      # #2563eb
            'secondary': '0.49, 0.23, 0.93',    # #7c3aed  
            'accent': '0.02, 0.59, 0.41',       # #059669
            'geometry': 'top=2cm, bottom=2cm, left=2.5cm, right=2.5cm',
            'font_package': '\\usepackage{lmodern}',
            'header_style': 'modern',
            'background': 'none'
        },
        'vintage': {
            'name': 'Vintage Explorer',
            'primary': '0.57, 0.25, 0.05',      # #92400e
            'secondary': '0.71, 0.32, 0.04',    # #b45309
            'accent': '0.02, 0.37, 0.27',       # #065f46
            'geometry': 'top=2.5cm, bottom=2.5cm, left=3cm, right=3cm',
            'font_package': '\\usepackage{mathptmx}',
            'header_style': 'vintage',
            'background': 'vintage'
        },
        'minimalist': {
            'name': 'Minimalist Zen',
            'primary': '0.22, 0.25, 0.32',      # #374151
            'secondary': '0.42, 0.45, 0.50',    # #6b7280
            'accent': '0.05, 0.65, 0.91',       # #0ea5e9
            'geometry': 'top=2cm, bottom=2cm, left=2cm, right=2cm',
            'font_package': '\\usepackage{helvet}\\renewcommand{\\familydefault}{\\sfdefault}',
            'header_style': 'minimalist',
            'background': 'none'
        }
    }
    return templates.get(template_id, templates['modern'])

def generate_latex_template(destination, date_range, budget, people, days, itinerary_content, map_image_path=None, template_id='modern'):
    """Generate LaTeX template with the selected theme"""
    
    template_config = get_template_config(template_id)
    
    map_section = ""
    if map_image_path:
        map_section = f"""
\\section{{Route Map}}
\\begin{{center}}
\\includegraphics[width=0.8\\textwidth]{{map.png}}
\\end{{center}}
\\vspace{{1em}}
"""

    # Simplified but effective LaTeX template with proper color usage
    latex_template = f"""
\\documentclass[11pt,a4paper]{{article}}
\\usepackage[utf8]{{inputenc}}
\\usepackage[T1]{{fontenc}}
\\usepackage{{geometry}}
\\usepackage{{graphicx}}
\\usepackage{{xcolor}}
\\usepackage{{titling}}
\\usepackage{{fancyhdr}}
\\usepackage{{tcolorbox}}
\\usepackage{{enumitem}}
\\usepackage{{setspace}}
\\usepackage{{parskip}}
{template_config['font_package']}

% Page geometry
\\geometry{{
    {template_config['geometry']},
    headheight=1.5cm,
    headsep=0.5cm
}}

% Define colors
\\definecolor{{primary}}{{rgb}}{{{template_config['primary']}}}
\\definecolor{{secondary}}{{rgb}}{{{template_config['secondary']}}}
\\definecolor{{accent}}{{rgb}}{{{template_config['accent']}}}
\\definecolor{{lightgray}}{{rgb}}{{0.95, 0.95, 0.95}}
\\definecolor{{darkgray}}{{rgb}}{{0.3, 0.3, 0.3}}

% Title styling
\\title{{
    {{\\color{{primary}}\\Huge\\bfseries Travel Itinerary}}\\\\
    {{\\color{{secondary}}\\Large {destination} Adventure}}
}}
\\date{{}}
\\author{{}}

% Header and footer
\\pagestyle{{fancy}}
\\fancyhf{{}}
\\fancyhead[L]{{\\color{{primary}}\\textbf{{Bagpack Travel Itinerary}}}}
\\fancyhead[R]{{\\color{{secondary}}{destination}}}
\\fancyfoot[C]{{\\color{{darkgray}}\\thepage}}
\\renewcommand{{\\headrulewidth}}{{2pt}}
\\renewcommand{{\\headrule}}{{\\color{{primary}}\\hrule height \\headrulewidth}}

% Section styling based on template
\\usepackage{{titlesec}}
""" + ("""
\\titleformat{\\section}
  {\\normalfont\\Large\\bfseries\\color{primary}}
  {\\thesection}{1em}{}
  [\\color{primary}\\titlerule]
""" if template_id == 'modern' else """
\\titleformat{\\section}
  {\\normalfont\\Large\\bfseries\\color{primary}}
  {\\thesection}{1em}{}
  [\\color{secondary}\\rule{\\textwidth}{2pt}]
""" if template_id == 'vintage' else """
\\titleformat{\\section}
  {\\normalfont\\Large\\bfseries\\color{primary}}
  {}{0em}{}
  [\\vspace{0.2em}\\color{primary}\\rule{\\textwidth}{0.5pt}\\vspace{0.3em}]
""") + f"""

\\titleformat{{\\subsection}}
  {{\\normalfont\\large\\bfseries\\color{{secondary}}}}
  {{\\thesubsection}}{{1em}}{{}}
\\titleformat{{\\subsubsection}}
  {{\\normalfont\\normalsize\\bfseries\\color{{accent}}}}
  {{\\thesubsubsection}}{{1em}}{{}}

% Custom info box
\\newtcolorbox{{infobox}}{{
    colback=lightgray,
    colframe=primary,
    boxrule=3pt,
    arc=8pt,
    left=15pt,
    right=15pt,
    top=15pt,
    bottom=15pt
}}

\\begin{{document}}

\\maketitle
\\thispagestyle{{fancy}}

% Trip Overview Box
\\begin{{infobox}}
\\begin{{center}}
\\textbf{{\\Large \\color{{primary}} Trip Overview}}
\\end{{center}}
\\vspace{{0.5em}}

\\noindent\\textbf{{\\color{{primary}}Destination:}} \\color{{darkgray}}{destination}\\\\
\\textbf{{\\color{{secondary}}Duration:}} \\color{{darkgray}}{days} {'day' if days == 1 else 'days'} ({date_range})\\\\
\\textbf{{\\color{{accent}}Travelers:}} \\color{{darkgray}}{people} {'person' if people == '1' else 'people'}\\\\
\\textbf{{\\color{{primary}}Budget:}} \\color{{darkgray}}₹{budget}\\\\
\\textbf{{\\color{{secondary}}Generated:}} \\color{{darkgray}}{datetime.now().strftime('%B %d, %Y at %I:%M %p')}
\\end{{infobox}}

\\vspace{{1em}}

{map_section}

% Main Content
{itinerary_content}

\\vspace{{2em}}

% Footer section
\\begin{{center}}
\\color{{darkgray}}
\\rule{{0.8\\textwidth}}{{0.5pt}}\\\\
\\vspace{{0.5em}}
\\textit{{Generated by Bagpack AI Travel Assistant}}\\\\
\\textit{{Template: \\color{{primary}}{template_config['name']}}}\\\\
\\textit{{Have a wonderful journey!}}
\\end{{center}}

\\end{{document}}
"""
    return latex_template

def create_itinerary_pdf(markdown_text, places=None, options=None, template_id='modern'):
    """Create PDF using LaTeX with the selected template"""
    
    # Extract information
    destination = "Your Destination"
    if places and len(places) > 0:
        destination = places[0].get('name', 'Your Destination').split(',')[0].strip()
    
    # Create date range
    start_date = datetime.now()
    days = 3  # default
    if options and options.get('days'):
        try:
            days = int(options['days'])
        except (ValueError, TypeError):
            days = 3
    
    end_date = start_date + timedelta(days=days-1)
    date_range = f"{start_date.strftime('%B %d')} - {end_date.strftime('%B %d, %Y')}"
    
    # Budget and people info
    budget = "Not specified"
    people = "1"
    if options:
        if options.get('budget'):
            budget = str(options['budget'])
        if options.get('people'):
            people = str(options['people'])
    
    # Convert markdown to LaTeX
    latex_content = markdown_to_latex(markdown_text)
    
    # Handle map image
    map_image_path = None
    temp_map_file = None
    if places and len(places) > 0:
        try:
            map_img_io = fetch_static_map(places)
            if map_img_io:
                temp_map_file = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
                pil_img = PILImage.open(map_img_io)
                pil_img.thumbnail((600, 400))
                pil_img.save(temp_map_file.name, format='PNG')
                map_image_path = temp_map_file.name
                print("Generated map image for LaTeX")
        except Exception as e:
            print(f"Could not generate map image: {e}")
    
    # Generate LaTeX document with selected template
    latex_doc = generate_latex_template(
        destination, date_range, budget, people, days, 
        latex_content, map_image_path, template_id
    )
    
    print(f"Attempting to generate PDF with template: {template_id}")
    
    # Check if pdflatex is available
    try:
        subprocess.run(['which', 'pdflatex'], capture_output=True, check=True)
        print("pdflatex found, proceeding with LaTeX compilation")
        
        # Compile LaTeX to PDF
        with tempfile.TemporaryDirectory() as temp_dir:
            # Write LaTeX file
            tex_file = os.path.join(temp_dir, 'itinerary.tex')
            with open(tex_file, 'w', encoding='utf-8') as f:
                f.write(latex_doc)
            
            print(f"LaTeX file written to: {tex_file}")
            
            # Copy map image to temp directory if it exists
            if map_image_path:
                import shutil
                temp_map_path = os.path.join(temp_dir, 'map.png')
                shutil.copy2(map_image_path, temp_map_path)
                print(f"Map image copied to: {temp_map_path}")
            
            # Compile with pdflatex (run twice for proper references)
            for i in range(2):
                print(f"LaTeX compilation pass {i+1}")
                result = subprocess.run([
                    'pdflatex', 
                    '-interaction=nonstopmode',
                    '-output-directory', temp_dir,
                    'itinerary.tex'
                ], capture_output=True, text=True, cwd=temp_dir)
                
                if result.returncode != 0:
                    print(f"LaTeX compilation error (pass {i+1}):")
                    print("STDOUT:", result.stdout)
                    print("STDERR:", result.stderr)
                    if i == 1:  # Only raise error on final pass
                        print("LaTeX compilation failed, falling back to simple PDF")
                        return create_simple_pdf_fallback(markdown_text, places, template_id)
            
            # Read the generated PDF
            pdf_file = os.path.join(temp_dir, 'itinerary.pdf')
            if os.path.exists(pdf_file):
                with open(pdf_file, 'rb') as f:
                    pdf_buffer = io.BytesIO(f.read())
                print(f"LaTeX PDF generated successfully with template: {template_id}")
                return pdf_buffer
            else:
                print("PDF file was not generated, falling back to simple PDF")
                return create_simple_pdf_fallback(markdown_text, places, template_id)
                
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("pdflatex not found, falling back to simple PDF")
        return create_simple_pdf_fallback(markdown_text, places, template_id)
    finally:
        # Clean up temporary map file
        if temp_map_file:
            try:
                os.unlink(temp_map_file.name)
            except:
                pass

def clean_text_for_reportlab(text):
    """Clean markdown text for reportlab processing"""
    import re
    
    # Remove markdown headers
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    
    # Fix double asterisks (bold) - ensure proper closing
    text = re.sub(r'\*\*([^*]+?)\*\*', r'<b>\1</b>', text)
    
    # Fix single asterisks (italic)
    text = re.sub(r'(?<!\*)\*([^*]+?)\*(?!\*)', r'<i>\1</i>', text)
    
    # Remove list markers
    text = re.sub(r'^[\*\-\+]\s+', '• ', text, flags=re.MULTILINE)
    
    # Clean up any remaining markdown
    text = re.sub(r'[`~]', '', text)
    
    # Escape ampersands that aren't part of HTML entities
    text = re.sub(r'&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)', '&amp;', text)
    
    return text

def create_simple_pdf_fallback(markdown_text, places=None, template_id='modern'):
    """Improved fallback PDF generation using reportlab"""
    print(f"Using fallback PDF generation with reportlab - template: {template_id}")
    
    try:
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.colors import HexColor
        from reportlab.lib.units import inch
        
        # Get template colors
        template_config = get_template_config(template_id)
        primary_color = template_config['primary'].replace(', ', ',').split(',')
        primary_rgb = tuple(float(x.strip()) for x in primary_color)
        primary_hex = "#{:02x}{:02x}{:02x}".format(
            int(primary_rgb[0] * 255),
            int(primary_rgb[1] * 255),
            int(primary_rgb[2] * 255)
        )
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4, 
            rightMargin=72, 
            leftMargin=72, 
            topMargin=72, 
            bottomMargin=18
        )
        
        # Create custom styles
        styles = getSampleStyleSheet()
        
        # Custom title style
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=HexColor(primary_hex),
            alignment=1  # Center alignment
        )
        
        # Custom heading style  
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            spaceBefore=12,
            spaceAfter=6,
            textColor=HexColor(primary_hex)
        )
        
        story = []
        
        # Add title
        story.append(Paragraph(f"🗺️ Your Bagpack Travel Itinerary", title_style))
        story.append(Paragraph(f"Template: {template_config['name']}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Clean the markdown text
        cleaned_text = clean_text_for_reportlab(markdown_text)
        
        # Process content line by line
        lines = cleaned_text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                story.append(Spacer(1, 6))
                continue
                
            try:
                if line.startswith('# '):
                    story.append(Paragraph(line[2:], heading_style))
                elif line.startswith('## '):
                    story.append(Paragraph(line[3:], heading_style))
                elif line.startswith('### '):
                    story.append(Paragraph(line[4:], heading_style))
                elif line.startswith('• '):
                    story.append(Paragraph(line, styles['Normal']))
                else:
                    # Regular paragraph
                    story.append(Paragraph(line, styles['Normal']))
                    story.append(Spacer(1, 6))
            except Exception as e:
                # If there's an error with a specific line, just add it as plain text
                print(f"Error processing line: {line[:50]}... - {e}")
                # Remove any HTML tags and add as plain text
                clean_line = re.sub(r'<[^>]+>', '', line)
                story.append(Paragraph(clean_line, styles['Normal']))
                story.append(Spacer(1, 6))
        
        # Add footer
        story.append(Spacer(1, 30))
        footer_text = f"Generated by Bagpack AI • Template: {template_config['name']} • Have a wonderful journey!"
        story.append(Paragraph(footer_text, styles['Normal']))
        
        doc.build(story)
        buffer.seek(0)
        print("Reportlab PDF generated successfully")
        return buffer
        
    except ImportError:
        print("Reportlab not available, creating minimal text response")
        # Create a minimal text response
        buffer = io.BytesIO()
        simple_content = f"Travel Itinerary\n\n{markdown_text}\n\nGenerated by Bagpack AI"
        buffer.write(simple_content.encode('utf-8'))
        buffer.seek(0)
        return buffer
    except Exception as e:
        print(f"Error in fallback PDF generation: {e}")
        # Create a minimal text response
        buffer = io.BytesIO()
        simple_content = f"Travel Itinerary\n\n{markdown_text}\n\nGenerated by Bagpack AI"
        buffer.write(simple_content.encode('utf-8'))
        buffer.seek(0)
        return buffer

# Remove the DOCX function entirely
def create_itinerary_docx(*args, **kwargs):
    """DOCX generation is no longer supported"""
    raise NotImplementedError("DOCX generation has been removed. Use PDF with LaTeX instead.")