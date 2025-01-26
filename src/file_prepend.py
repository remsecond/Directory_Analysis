import os
import argparse

def rename_files(folder_path, court_files=None, email_files=None, agree_files=None):
    if not os.path.exists(folder_path):
        raise FileNotFoundError(f"Directory not found: {folder_path}")

    # Process court documents
    if court_files:
        for filename in court_files:
            if os.path.exists(os.path.join(folder_path, filename)):
                old_path = os.path.join(folder_path, filename)
                new_filename = "COURT_" + filename
                new_path = os.path.join(folder_path, new_filename)
                os.rename(old_path, new_path)
                print(f"Renamed: {filename} -> {new_filename}")

    # Process email documents
    if email_files:
        for filename in email_files:
            if os.path.exists(os.path.join(folder_path, filename)):
                old_path = os.path.join(folder_path, filename)
                new_filename = "EMAIL_" + filename
                new_path = os.path.join(folder_path, new_filename)
                os.rename(old_path, new_path)
                print(f"Renamed: {filename} -> {new_filename}")

    # Process agreement documents
    if agree_files:
        for filename in agree_files:
            if os.path.exists(os.path.join(folder_path, filename)):
                old_path = os.path.join(folder_path, filename)
                new_filename = "AGREE_" + filename
                new_path = os.path.join(folder_path, new_filename)
                os.rename(old_path, new_path)
                print(f"Renamed: {filename} -> {new_filename}")

def main():
    parser = argparse.ArgumentParser(description='Prepend category prefixes to document files')
    parser.add_argument('--input_dir', required=True, help='Input directory containing the files')
    parser.add_argument('--court', nargs='*', help='List of court document files')
    parser.add_argument('--email', nargs='*', help='List of email document files')
    parser.add_argument('--agree', nargs='*', help='List of agreement document files')

    args = parser.parse_args()
    
    rename_files(
        args.input_dir,
        court_files=args.court,
        email_files=args.email,
        agree_files=args.agree
    )

if __name__ == "__main__":
    main()
