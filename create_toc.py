from fpdf import FPDF
import os

print("Converting table of contents to PDF...")
try:
    # Read the HTML file
    with open('exhibit_summary_table.html', 'r', encoding='utf-8') as file:
        html_content = file.read()
    
    # Create PDF
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Extract text from HTML (simple approach)
    lines = []
    current_line = ""
    in_tag = False
    
    for char in html_content:
        if char == '<':
            in_tag = True
        elif char == '>':
            in_tag = False
        elif not in_tag:
            if char == '\n':
                if current_line.strip():
                    lines.append(current_line.strip())
                current_line = ""
            else:
                current_line += char
    
    if current_line.strip():
        lines.append(current_line.strip())
    
    # Write content to PDF
    for line in lines:
        if line.strip():
            pdf.multi_cell(0, 10, txt=line)
    
    # Save PDF
    pdf.output("00_Table_of_Contents.pdf")
    print("Successfully created 00_Table_of_Contents.pdf")

except Exception as e:
    print(f"Error: {str(e)}")

input("Press Enter to continue...")
