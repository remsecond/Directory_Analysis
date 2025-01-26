import os
from typing import Dict, List, Optional, Callable
from datetime import datetime
from .folder_analyzer import FolderAnalyzer
from .document_processor import DocumentProcessor

class BatchDocumentProcessor:
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        self.folder_analyzer = FolderAnalyzer(base_dir)
        self.document_processor = DocumentProcessor(base_dir)
        self.progress_callback = None

    def set_progress_callback(self, callback: Callable[[str, float], None]):
        """Set a callback function to receive progress updates"""
        self.progress_callback = callback

    def update_progress(self, message: str, percentage: float):
        """Update processing progress"""
        if self.progress_callback:
            self.progress_callback(message, percentage)

    def preview_folder(self, folder_path: str, recursive: bool = True) -> Dict:
        """Preview a folder's contents and compare with previous processing"""
        summary, changes = self.folder_analyzer.compare_with_previous(folder_path, recursive)
        
        preview = {
            'folder_path': folder_path,
            'summary': summary,
            'changes': changes,
            'needs_processing': len(changes) > 0 or summary.get('is_first_time', False)
        }
        
        if not preview['needs_processing']:
            preview['message'] = (
                f"No changes detected since last processing on {summary['last_processed']}. "
                "Processing can be skipped."
            )
        else:
            if summary.get('is_first_time', False):
                preview['message'] = (
                    f"First time processing this folder. Found {summary['total_files']} files "
                    f"({self.format_size(summary['total_size'])})."
                )
            else:
                preview['message'] = (
                    f"Changes detected since {summary['last_processed']}:\n"
                    f"- {summary['new_files']} new files\n"
                    f"- {summary['modified_files']} modified files\n"
                    f"- {summary['deleted_files']} deleted files"
                )
        
        return preview

    def process_folder(self, folder_path: str, recursive: bool = True, 
                      selected_files: Optional[List[str]] = None) -> Dict:
        """Process a folder and its contents"""
        # Get current state
        fingerprint = self.folder_analyzer.generate_folder_fingerprint(folder_path, recursive)
        total_files = len(selected_files) if selected_files else fingerprint['file_count']
        processed_files = 0
        
        try:
            # Process each file
            for root, _, files in os.walk(folder_path):
                if not recursive and root != folder_path:
                    continue
                    
                for file in files:
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, folder_path)
                    
                    # Skip if not in selected files
                    if selected_files and rel_path not in selected_files:
                        continue
                        
                    try:
                        # Process the document
                        self.document_processor.store_document(file_path)
                        processed_files += 1
                        
                        # Update progress
                        progress = (processed_files / total_files) * 100
                        self.update_progress(
                            f"Processing {rel_path} ({processed_files}/{total_files})",
                            progress
                        )
                        
                    except Exception as e:
                        print(f"Error processing {file_path}: {str(e)}")
                
                if not recursive:
                    break
            
            # Store processing record
            record_id = self.folder_analyzer.store_processing_record(
                folder_path, fingerprint, 'success'
            )
            
            return {
                'status': 'success',
                'processed_files': processed_files,
                'total_files': total_files,
                'record_id': record_id
            }
            
        except Exception as e:
            # Store processing record with error status
            self.folder_analyzer.store_processing_record(
                folder_path, fingerprint, 'error'
            )
            
            raise Exception(f"Error processing folder: {str(e)}")

    @staticmethod
    def format_size(size_bytes: int) -> str:
        """Format file size in human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024
        return f"{size_bytes:.1f} PB"
