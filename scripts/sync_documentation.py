#!/usr/bin/env python3
"""
Documentation Synchronization Script
Syncs documentation between local directory, GitHub, and Google Drive
"""

import os
import sys
from google.oauth2.credentials import Credentials
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import pickle
import subprocess
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('sync_documentation.log'),
        logging.StreamHandler()
    ]
)

# If modifying these scopes, delete the file token.pickle
SCOPES = ['https://www.googleapis.com/auth/drive.file']
DOCS_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'documentation')
CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), 'credentials.json')
TOKEN_FILE = os.path.join(os.path.dirname(__file__), 'token.pickle')

def get_google_drive_service():
    """Get or refresh Google Drive credentials and build service."""
    creds = None
    
    # Load existing token if available
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)
    
    # Refresh token if expired
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
        except Exception as e:
            logging.error(f"Error refreshing credentials: {e}")
            creds = None
    
    # Get new credentials if none exist
    if not creds:
        if not os.path.exists(CREDENTIALS_FILE):
            logging.error("credentials.json not found. Please follow setup instructions.")
            sys.exit(1)
            
        try:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
            
            # Save credentials
            with open(TOKEN_FILE, 'wb') as token:
                pickle.dump(creds, token)
        except Exception as e:
            logging.error(f"Error getting new credentials: {e}")
            sys.exit(1)
    
    try:
        service = build('drive', 'v3', credentials=creds)
        return service
    except Exception as e:
        logging.error(f"Error building Drive service: {e}")
        sys.exit(1)

def get_or_create_folder(service, folder_name, parent_id=None):
    """Get or create a folder in Google Drive."""
    try:
        # Search for existing folder
        query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder'"
        if parent_id:
            query += f" and '{parent_id}' in parents"
        
        results = service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
        files = results.get('files', [])
        
        # Return existing folder if found
        if files:
            return files[0]['id']
        
        # Create new folder if not found
        folder_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        if parent_id:
            folder_metadata['parents'] = [parent_id]
        
        folder = service.files().create(body=folder_metadata, fields='id').execute()
        return folder.get('id')
        
    except Exception as e:
        logging.error(f"Error with folder '{folder_name}': {e}")
        return None

def upload_file(service, file_path, parent_id):
    """Upload or update a file in Google Drive."""
    try:
        file_name = os.path.basename(file_path)
        
        # Search for existing file
        query = f"name='{file_name}' and '{parent_id}' in parents"
        results = service.files().list(q=query, fields='files(id, name)').execute()
        files = results.get('files', [])
        
        file_metadata = {
            'name': file_name,
            'parents': [parent_id]
        }
        
        media = MediaFileUpload(
            file_path,
            mimetype='application/octet-stream',
            resumable=True
        )
        
        if files:
            # Update existing file
            file_id = files[0]['id']
            service.files().update(
                fileId=file_id,
                media_body=media
            ).execute()
            logging.info(f"Updated: {file_name}")
        else:
            # Upload new file
            service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id'
            ).execute()
            logging.info(f"Uploaded: {file_name}")
            
    except Exception as e:
        logging.error(f"Error uploading '{file_path}': {e}")

def sync_folder_to_drive(service, local_path, parent_id):
    """Recursively sync a local folder to Google Drive."""
    try:
        for item in os.listdir(local_path):
            item_path = os.path.join(local_path, item)
            
            if os.path.isdir(item_path):
                # Create/get folder in Drive
                folder_id = get_or_create_folder(service, item, parent_id)
                if folder_id:
                    # Recursively sync subfolder
                    sync_folder_to_drive(service, item_path, folder_id)
            else:
                # Upload file
                upload_file(service, item_path, parent_id)
                
    except Exception as e:
        logging.error(f"Error syncing folder '{local_path}': {e}")

def sync_to_github():
    """Sync documentation to GitHub repository."""
    try:
        # Change to documentation directory
        os.chdir(DOCS_FOLDER)
        
        # Add all changes
        subprocess.run(['git', 'add', '.'], check=True)
        
        # Commit changes
        try:
            subprocess.run(
                ['git', 'commit', '-m', 'Updated documentation after session'],
                check=True
            )
            logging.info("Changes committed to Git")
        except subprocess.CalledProcessError:
            logging.info("No changes to commit to Git")
            
        # Push changes
        subprocess.run(['git', 'push', 'origin', 'main'], check=True)
        logging.info("Changes pushed to GitHub")
        
    except subprocess.CalledProcessError as e:
        logging.error(f"Git operation failed: {e}")
    except Exception as e:
        logging.error(f"Error in GitHub sync: {e}")

def main():
    """Main synchronization function."""
    logging.info("Starting documentation synchronization")
    
    # Sync to GitHub
    sync_to_github()
    
    # Sync to Google Drive
    try:
        service = get_google_drive_service()
        
        # Get/create main documentation folder
        root_folder_id = get_or_create_folder(service, 'EvidenceAI Documentation')
        if root_folder_id:
            sync_folder_to_drive(service, DOCS_FOLDER, root_folder_id)
            logging.info("Documentation synced to Google Drive")
        else:
            logging.error("Failed to create/find root folder in Drive")
            
    except Exception as e:
        logging.error(f"Error in Google Drive sync: {e}")
    
    logging.info("Documentation synchronization complete")

if __name__ == '__main__':
    main()
