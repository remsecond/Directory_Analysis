import os
import glob
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def analyze_files(folder_path):
    # Create categories
    court_docs = []
    emails = []
    exhibits = []
    
    # Get all files in the folder
    files = glob.glob(os.path.join(folder_path, '*'))
    
    # Analyze each file
    for file_path in files:
        filename = os.path.basename(file_path)
        
        # Skip the table of contents file itself
        if filename.startswith('00_Table_of_Contents') or filename.startswith('Final_with_TOC'):
            continue
            
        # Simple classification based on filename and content
        if any(word in filename.lower() for word in ['court', 'motion', 'order', 'filing', 'complaint', 'answer']):
            court_docs.append(filename)
        elif any(word in filename.lower() for word in ['email', 'mail', 'correspondence']):
            emails.append(filename)
        else:
            exhibits.append(filename)
    
    # Create table of contents PDF
    toc_path = os.path.join(folder_path, "00_Table_of_Contents.pdf")
    doc = SimpleDocTemplate(toc_path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30
    )
    story.append(Paragraph("Table of Contents", title_style))
    
    # Add categories
    categories = [
        ("Court Documents", court_docs, "CD_"),
        ("Email Communications", emails, "EM_"),
        ("Exhibits", exhibits, "EX_")
    ]
    
    # Add description of naming convention
    story.append(Paragraph("Document Naming Convention:", styles['Heading2']))
    story.append(Spacer(1, 12))
    story.append(Paragraph("• CD_ : Court Documents (pleadings, motions, orders)", styles['Normal']))
    story.append(Paragraph("• EM_ : Email Communications", styles['Normal']))
    story.append(Paragraph("• EX_ : Exhibits and Other Documents", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Add document listings
    for title, items, prefix in categories:
        if items:
            # Category title
            story.append(Paragraph(title, styles['Heading2']))
            story.append(Spacer(1, 12))
            
            # Items
            for item in items:
                new_name = f"{prefix}{item}"
                story.append(Paragraph(f"• {item}", styles['Normal']))
                if not item.startswith(prefix):  # Only show rename suggestion if needed
                    story.append(Paragraph(f"    → Rename to: {new_name}", styles['Normal']))
            
            story.append(Spacer(1, 20))
    
    # Generate PDF
    doc.build(story)
    print(f"Created table of contents at: {toc_path}")

if __name__ == "__main__":
    folder_path = r"C:\Users\robmo\OneDrive\Desktop\Coquille Johnson\Combined"
    if os.path.exists(folder_path):
        analyze_files(folder_path)
    else:
        print(f"Could not find folder at: {folder_path}")
