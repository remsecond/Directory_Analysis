import os
import shutil

def rename_files(folder_path):
    # Create categories and their prefixes
    categories = {
        'court': 'CD_',  # Court Documents
        'motion': 'CD_',
        'order': 'CD_',
        'filing': 'CD_',
        'complaint': 'CD_',
        'answer': 'CD_',
        'email': 'EM_',  # Email Communications
        'mail': 'EM_',
        'correspondence': 'EM_'
    }
    
    # Get all files in the folder
    files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
    
    # Skip TOC files
    files = [f for f in files if not (f.startswith('00_Table_of_Contents') or f.startswith('Final_with_TOC'))]
    
    renamed_files = []
    for filename in files:
        original_path = os.path.join(folder_path, filename)
        
        # Skip if file already has a prefix
        if any(filename.startswith(prefix) for prefix in set(categories.values())):
            continue
            
        # Determine category
        prefix = 'EX_'  # Default to Exhibit
        for keyword, cat_prefix in categories.items():
            if keyword in filename.lower():
                prefix = cat_prefix
                break
        
        # Create new filename
        new_filename = f"{prefix}{filename}"
        new_path = os.path.join(folder_path, new_filename)
        
        # Rename file
        shutil.move(original_path, new_path)
        renamed_files.append((filename, new_filename))
    
    # Print summary
    if renamed_files:
        print("\nFiles renamed:")
        for old, new in renamed_files:
            print(f"{old} → {new}")
    else:
        print("\nNo files needed renaming.")

if __name__ == "__main__":
    folder_path = r"C:\Users\robmo\OneDrive\Desktop\Coquille Johnson\Combined"
    if os.path.exists(folder_path):
        print("Starting file renaming process...")
        rename_files(folder_path)
        print("\nRenaming complete!")
    else:
        print(f"Could not find folder at: {folder_path}")
