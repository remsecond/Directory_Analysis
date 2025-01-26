import os
from PyPDF2 import PdfMerger
import pdfkit

# Directory paths
combined_dir = r"C:\Users\robmo\OneDrive\Desktop\Coquille Johnson\Combined"

# Create Combined directory if it doesn't exist
os.makedirs(combined_dir, exist_ok=True)

# First, convert our HTML table of contents to PDF
toc_pdf_path = os.path.join(combined_dir, "00_Table_of_Contents.pdf")
pdfkit.from_file('exhibit_summary_table.html', toc_pdf_path)

# Initialize PDF merger
merger = PdfMerger()

# Add table of contents first
merger.append(toc_pdf_path)

# Define the order of files based on our categories
file_order = [
    # Court Documents
    "COURT_Johnson_Knutsen_Parenting_Plan_2018.pdf",
    "COURT_Johnson_Knutsen_Child_Support_Worksheet.pdf",
    "COURT_Coquille_Johnson_Declaration_2.pdf",
    "COURT_October_28th_Response.pdf",
    "COURT_Reply_Megan_Stanley_Edits.pdf",
    "COURT_Circumstances_Modification_Support.pdf",
    
    # Email Communications
    "EMAIL_Agreeing_Coparent_Mediation.pdf",
    "EMAIL_Folder_Schedule_8_Years.pdf",
    "EMAIL_Fwd_Pickup.pdf",
    "EMAIL_Pilot_Licensure_Schedule.pdf",
    "EMAIL_Sev_Leave_As_Is.pdf",
    "EMAIL_2nd_Ask_Ratify.pdf",
    "EMAIL_Agree_Change_Days.pdf",
    "EMAIL_Combined_Communications.pdf",
    
    # Agreements/Mediation
    "AGREE_Coparent_Mediation_Zoom.pdf",
    "AGREE_2024_NOV_25_Meeting.pdf"
]

# Add each file in order
for filename in file_order:
    filepath = os.path.join(combined_dir, filename)
    if os.path.exists(filepath):
        merger.append(filepath)
    else:
        print(f"Warning: File not found: {filename}")

# Write the final combined PDF
output_path = os.path.join(combined_dir, "Complete_Exhibits_Package.pdf")
merger.write(output_path)
merger.close()

print(f"Created complete exhibits package at: {output_path}")
