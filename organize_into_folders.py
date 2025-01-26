import os
import shutil

def create_folders_and_move_files(source_folder):
    # Create category folders
    categories = {
        'CD_': 'Court Documents',
        'EM_': 'Email Communications',
        'EX_': 'Exhibits'
    }
    
    # Create folders if they don't exist
    for folder_name in categories.values():
        folder_path = os.path.join(source_folder, folder_name)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
    
    # Move files to appropriate folders
    files = [f for f in os.listdir(source_folder) if os.path.isfile(os.path.join(source_folder, f))]
    moved_files = []
    
    for filename in files:
        # Skip TOC files
        if filename.startswith('00_Table_of_Contents') or filename.startswith('Final_with_TOC'):
            continue
            
        # Determine category and move file
        for prefix, folder_name in categories.items():
            if filename.startswith(prefix):
                source_path = os.path.join(source_folder, filename)
                dest_folder = os.path.join(source_folder, folder_name)
                dest_path = os.path.join(dest_folder, filename)
                shutil.move(source_path, dest_path)
                moved_files.append((filename, folder_name))
                break
    
    # Print summary
    if moved_files:
        print("\nFiles organized into folders:")
        for filename, folder in moved_files:
            print(f"{filename} → {folder}/")
    else:
        print("\nNo files needed to be moved.")

if __name__ == "__main__":
    folder_path = r"C:\Users\robmo\OneDrive\Desktop\Coquille Johnson\Combined"
    if os.path.exists(folder_path):
        print("Starting folder organization...")
        create_folders_and_move_files(folder_path)
        print("\nOrganization complete!")
    else:
        print(f"Could not find folder at: {folder_path}")
