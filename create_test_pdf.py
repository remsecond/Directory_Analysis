from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def create_pdf(output_path):
    # Create the PDF document
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Add a title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30
    )
    story.append(Paragraph("Test Document", title_style))
    
    # Add some content
    content = """
    This is a test document created using Python's reportlab library.
    It demonstrates basic PDF generation capabilities including:
    • Formatted text
    • Multiple paragraphs
    • Custom styling
    """
    
    story.append(Paragraph(content, styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Add a section with different styling
    story.append(Paragraph("Styled Section", styles['Heading2']))
    styled_content = """
    This section shows different text styling options.
    The content uses the stylesheet we created earlier.
    """
    story.append(Paragraph(styled_content, styles['Normal']))
    
    # Generate the PDF
    doc.build(story)

if __name__ == "__main__":
    create_pdf("test_output.pdf")
