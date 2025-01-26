import PyPDF2
import os

def extract_text(pdf_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            # Extract text and clean it
            page_text = page.extract_text()
            # Remove null bytes and normalize whitespace
            page_text = page_text.replace('\x00', '').replace('\r', '\n')
            # Normalize line endings
            page_text = '\n'.join(line.strip() for line in page_text.splitlines() if line.strip())
            text += page_text + '\n'
        return text

pdf_path = os.path.join('02_Incoming', 'Emails With Lisa to Date_Part1.pdf')
print(extract_text(pdf_path))
