import os
import shutil

source_dir = r"C:\Users\robmo\OneDrive\Desktop\New Coquille"
dest_dir = r"C:\Users\robmo\OneDrive\Desktop\New Coquille\New Files"

# Create destination directory if it doesn't exist
os.makedirs(dest_dir, exist_ok=True)

# Define keywords and their corresponding prefixes
prefix_map = {
    "motion": "LEGAL_",
    "court": "LEGAL_",
    "parenting plan": "LEGAL_",
    "income": "FINANCIAL_",
    "tax": "FINANCIAL_",
    "manipulation": "EVIDENCE_",
    "assessment": "EVALUATION_",
    "evaluation": "EVALUATION_",
    "email": "GENERAL_",
}

# Process each file in the source directory
for filename in os.listdir(source_dir):
    if filename == "New Files":  # Skip the destination directory
        continue
        
    source_path = os.path.join(source_dir, filename)
    if os.path.isfile(source_path):
        # Extract content from filename
        lower_filename = filename.lower()
        prefix = None
        
        # Determine prefix based on keywords in filename
        for keyword, mapped_prefix in prefix_map.items():
            if keyword in lower_filename:
                prefix = mapped_prefix
                break
        
        # Copy file with new name if prefix found
        if prefix:
            new_name = prefix + filename
            dest_path = os.path.join(dest_dir, new_name)
            shutil.copy2(source_path, dest_path)
            print(f"Copied: {filename} -> {new_name}")
        else:
            # If no keyword found, copy with GENERAL_ prefix
            new_name = "GENERAL_" + filename
            dest_path = os.path.join(dest_dir, new_name)
            shutil.copy2(source_path, dest_path)
            print(f"Copied: {filename} -> {new_name}")
