import io
import os
import tempfile
import subprocess
import requests
from PIL import Image as PILImage
from datetime import datetime, timedelta

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

def markdown_to_latex(markdown_text):
    """Convert markdown to LaTeX with better formatting"""
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
        line = line.replace('&', '\\&').replace('%', '\\%').replace('$', '\\$').replace('#', '\\#')
        line = line.replace('_', '\\_').replace('{', '\\{').replace('}', '\\}')
        
        if line.startswith('# '):
            if in_list:
                latex_content.append('\\end{itemize}')
                in_list = False
            title = line[2:].strip()
            latex_content.append(f'\\section{{{title}}}')
        elif line.startswith('## '):
            if in_list:
                latex_content.append('\\end{itemize}')
                in_list = False
            title = line[3:].strip()
            latex_content.append(f'\\subsection{{{title}}}')
        elif line.startswith('### '):
            if in_list:
                latex_content.append('\\end{itemize}')
                in_list = False
            title = line[4:].strip()
            latex_content.append(f'\\subsubsection{{{title}}}')
        elif line.startswith('- ') or line.startswith('* '):
            if not in_list:
                latex_content.append('\\begin{itemize}')
                in_list = True
            item = line[2:].strip()
            latex_content.append(f'\\item {item}')
        elif line.startswith('**') and line.endswith('**') and len(line) > 4:
            if in_list:
                latex_content.append('\\end{itemize}')
                in_list = False
            text = line[2:-2]
            latex_content.append(f'\\textbf{{{text}}}')
        else:
            if in_list:
                latex_content.append('\\end{itemize}')
                in_list = False
            if line:
                latex_content.append(line)
    
    if in_list:
        latex_content.append('\\end{itemize}')
    
    return '\n'.join(latex_content)

def generate_latex_template(destination, date_range, budget, people, days, itinerary_content, map_image_path=None):
    """Generate a beautiful LaTeX template with modern styling"""
    
    # Choose a color theme based on destination
    color_themes = {
        'default': {
            'primary': '0.2, 0.4, 0.8',      # Blue
            'secondary': '0.8, 0.4, 0.2',    # Orange
            'accent': '0.2, 0.6, 0.4'        # Green
        },
        'mountain': {
            'primary': '0.2, 0.5, 0.3',      # Forest Green
            'secondary': '0.6, 0.4, 0.2',    # Brown
            'accent': '0.3, 0.6, 0.8'        # Sky Blue
        },
        'beach': {
            'primary': '0.0, 0.5, 0.8',      # Ocean Blue
            'secondary': '1.0, 0.8, 0.2',    # Sand Yellow
            'accent': '0.2, 0.8, 0.6'        # Turquoise
        },
        'city': {
            'primary': '0.3, 0.3, 0.3',      # Dark Gray
            'secondary': '0.8, 0.2, 0.2',    # Red
            'accent': '0.2, 0.6, 0.8'        # Blue
        }
    }
    
    # Select theme based on destination keywords
    theme = color_themes['default']
    destination_lower = destination.lower()
    if any(word in destination_lower for word in ['mountain', 'hill', 'trek', 'himalaya']):
        theme = color_themes['mountain']
    elif any(word in destination_lower for word in ['beach', 'coast', 'island', 'sea']):
        theme = color_themes['beach']
    elif any(word in destination_lower for word in ['delhi', 'mumbai', 'bangalore', 'city']):
        theme = color_themes['city']
    
    map_section = ""
    if map_image_path:
        map_section = f"""
\\section{{Route Map}}
\\begin{{center}}
\\includegraphics[width=0.8\\textwidth]{{{map_image_path}}}
\\end{{center}}
\\vspace{{1em}}
"""

    latex_template = f"""
\\documentclass[11pt,a4paper]{{article}}
\\usepackage[utf8]{{inputenc}}
\\usepackage[T1]{{fontenc}}
\\usepackage{{geometry}}
\\usepackage{{graphicx}}
\\usepackage{{xcolor}}
\\usepackage{{titling}}
\\usepackage{{fancyhdr}}
\\usepackage{{tikz}}
\\usepackage{{tcolorbox}}
\\usepackage{{fontawesome5}}
\\usepackage{{enumitem}}
\\usepackage{{amsmath}}
\\usepackage{{setspace}}
\\usepackage{{parskip}}

% Page geometry
\\geometry{{
    top=2cm,
    bottom=2cm,
    left=2.5cm,
    right=2.5cm,
    headheight=1.5cm,
    headsep=0.5cm
}}

% Define colors
\\definecolor{{primary}}{{rgb}}{{{theme['primary']}}}
\\definecolor{{secondary}}{{rgb}}{{{theme['secondary']}}}
\\definecolor{{accent}}{{rgb}}{{{theme['accent']}}}
\\definecolor{{lightgray}}{{rgb}}{{0.95, 0.95, 0.95}}
\\definecolor{{darkgray}}{{rgb}}{{0.3, 0.3, 0.3}}

% Custom title style
\\pretitle{{\\begin{{center}}\\LARGE\\bfseries\\color{{primary}}}}
\\posttitle{{\\par\\end{{center}}\\vspace{{0.5em}}}}
\\preauthor{{\\begin{{center}}\\large\\color{{secondary}}}}
\\postauthor{{\\end{{center}}}}
\\predate{{\\begin{{center}}\\large\\color{{darkgray}}}}
\\postdate{{\\par\\end{{center}}}}

% Header and footer
\\pagestyle{{fancy}}
\\fancyhf{{}}
\\fancyhead[L]{{\\color{{primary}}\\textbf{{Bagpack Travel Itinerary}}}}
\\fancyhead[R]{{\\color{{secondary}}{destination}}}
\\fancyfoot[C]{{\\color{{darkgray}}\\thepage}}
\\renewcommand{{\\headrulewidth}}{{2pt}}
\\renewcommand{{\\headrule}}{{\\hbox to\\headwidth{{\\color{{primary}}\\leaders\\hrule height \\headrulewidth\\hfill}}}}

% Custom section styles
\\usepackage{{titlesec}}
\\titleformat{{\\section}}
  {{\\normalfont\\Large\\bfseries\\color{{primary}}}}
  {{\\thesection}}{{1em}}{{}}
  [\\color{{primary}}\\titlerule]
\\titleformat{{\\subsection}}
  {{\\normalfont\\large\\bfseries\\color{{secondary}}}}
  {{\\thesubsection}}{{1em}}{{}}
\\titleformat{{\\subsubsection}}
  {{\\normalfont\\normalsize\\bfseries\\color{{accent}}}}
  {{\\thesubsubsection}}{{1em}}{{}}

% Custom boxes
\\tcbuselibrary{{skins}}
\\newtcolorbox{{infobox}}{{
    colback=lightgray,
    colframe=primary,
    boxrule=2pt,
    arc=5pt,
    left=10pt,
    right=10pt,
    top=10pt,
    bottom=10pt
}}

% Document content
\\title{{\\Huge Travel Itinerary\\\\\\large {destination} Adventure}}
\\author{{\\faUser\\ {people} {'Person' if people == '1' else 'People'} \\quad \\faCalendarAlt\\ {days} {'Day' if days == 1 else 'Days'} \\quad \\faRupeeSign\\ {budget}}}
\\date{{{date_range}}}

\\begin{{document}}

\\maketitle
\\thispagestyle{{fancy}}

% Trip Overview Box
\\begin{{infobox}}
\\begin{{center}}
\\textbf{{\\Large \\color{{primary}} Trip Overview}}
\\end{{center}}
\\vspace{{0.5em}}
\\begin{{itemize}}[leftmargin=2em]
\\item[\\faMapMarkerAlt] \\textbf{{Destination:}} {destination}
\\item[\\faCalendarAlt] \\textbf{{Duration:}} {days} {'day' if days == 1 else 'days'} ({date_range})
\\item[\\faUsers] \\textbf{{Travelers:}} {people} {'person' if people == '1' else 'people'}
\\item[\\faRupeeSign] \\textbf{{Budget:}} ₹{budget}
\\item[\\faClock] \\textbf{{Generated:}} {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
\\end{{itemize}}
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
\\textit{{Have a wonderful journey!}}
\\end{{center}}

\\end{{document}}
"""
    return latex_template

def create_itinerary_pdf(markdown_text, places=None, options=None):
    """Create PDF using LaTeX with beautiful theming"""
    
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
    
    # Generate LaTeX document
    latex_doc = generate_latex_template(
        destination, date_range, budget, people, days, 
        latex_content, map_image_path
    )
    
    # Compile LaTeX to PDF
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # Write LaTeX file
            tex_file = os.path.join(temp_dir, 'itinerary.tex')
            with open(tex_file, 'w', encoding='utf-8') as f:
                f.write(latex_doc)
            
            # Copy map image to temp directory if it exists
            if map_image_path:
                import shutil
                temp_map_path = os.path.join(temp_dir, 'map.png')
                shutil.copy2(map_image_path, temp_map_path)
                # Update LaTeX to use local path
                latex_doc = latex_doc.replace(map_image_path, 'map.png')
                with open(tex_file, 'w', encoding='utf-8') as f:
                    f.write(latex_doc)
            
            # Compile with pdflatex (run twice for proper references)
            for i in range(2):
                result = subprocess.run([
                    'pdflatex', 
                    '-interaction=nonstopmode',
                    '-output-directory', temp_dir,
                    tex_file
                ], capture_output=True, text=True, cwd=temp_dir)
                
                if result.returncode != 0:
                    print(f"LaTeX compilation error (pass {i+1}):")
                    print(result.stdout)
                    print(result.stderr)
                    if i == 1:  # Only raise error on final pass
                        raise Exception(f"LaTeX compilation failed: {result.stderr}")
            
            # Read the generated PDF
            pdf_file = os.path.join(temp_dir, 'itinerary.pdf')
            if os.path.exists(pdf_file):
                with open(pdf_file, 'rb') as f:
                    pdf_buffer = io.BytesIO(f.read())
                print("LaTeX PDF generated successfully")
                return pdf_buffer
            else:
                raise Exception("PDF file was not generated")
                
    except FileNotFoundError:
        print("pdflatex not found. Falling back to simple PDF generation.")
        return create_simple_pdf_fallback(markdown_text, places)
    except Exception as e:
        print(f"LaTeX compilation failed: {e}")
        return create_simple_pdf_fallback(markdown_text, places)
    finally:
        # Clean up temporary map file
        if temp_map_file:
            try:
                os.unlink(temp_map_file.name)
            except:
                pass

def create_simple_pdf_fallback(markdown_text, places=None):
    """Fallback PDF generation using reportlab if LaTeX fails"""
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    story.append(Paragraph("🗺️ Your Bagpack Itinerary", styles['Title']))
    story.append(Spacer(1, 12))
    
    # Add content
    lines = markdown_text.split('\n')
    for line in lines:
        if line.strip():
            story.append(Paragraph(line, styles['Normal']))
            story.append(Spacer(1, 6))
    
    doc.build(story)
    buffer.seek(0)
    return buffer

# Remove the DOCX function entirely
def create_itinerary_docx(*args, **kwargs):
    """DOCX generation is no longer supported"""
    raise NotImplementedError("DOCX generation has been removed. Use PDF with LaTeX instead.")