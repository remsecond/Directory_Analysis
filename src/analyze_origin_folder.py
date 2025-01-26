import os
import json
import hashlib
from collections import defaultdict
from datetime import datetime
import mimetypes
import logging

class FolderAnalyzer:
    def __init__(self, base_dir="c:/Users/robmo/Desktop/evidenceai"):
        self.base_dir = base_dir
        self.input_dir = os.path.join(base_dir, "input")
        self.setup_logging()
        
    def setup_logging(self):
        logging.basicConfig(
            filename='folder_analysis.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def analyze_file(self, file_path):
        """Analyze a single file"""
        try:
            filename = os.path.basename(file_path)
            ext = os.path.splitext(filename)[1].lower()
            size = os.path.getsize(file_path)
            created = datetime.fromtimestamp(os.path.getctime(file_path))
            modified = datetime.fromtimestamp(os.path.getmtime(file_path))
            mime_type = mimetypes.guess_type(file_path)[0]
            
            # Calculate hash for duplicate detection
            hasher = hashlib.sha256()
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b''):
                    hasher.update(chunk)
            file_hash = hasher.hexdigest()
            
            return {
                'filename': filename,
                'extension': ext,
                'size': size,
                'created': created.isoformat(),
                'modified': modified.isoformat(),
                'mime_type': mime_type,
                'hash': file_hash,
                'path': file_path
            }
        except Exception as e:
            logging.error(f"Error analyzing {file_path}: {str(e)}")
            return None

    def analyze_directory(self, dir_path):
        """Analyze a directory recursively"""
        stats = {
            'file_count': 0,
            'total_size': 0,
            'extensions': defaultdict(int),
            'mime_types': defaultdict(int),
            'date_range': {'earliest': None, 'latest': None},
            'files': [],
            'potential_duplicates': [],
            'size_distribution': defaultdict(int)
        }
        
        hash_map = defaultdict(list)
        
        for root, _, files in os.walk(dir_path):
            for file in files:
                file_path = os.path.join(root, file)
                file_info = self.analyze_file(file_path)
                
                if file_info:
                    stats['file_count'] += 1
                    stats['total_size'] += file_info['size']
                    stats['extensions'][file_info['extension']] += 1
                    stats['mime_types'][file_info['mime_type']] += 1
                    
                    # Track for duplicate detection
                    hash_map[file_info['hash']].append(file_info)
                    
                    # Update date range
                    file_date = datetime.fromisoformat(file_info['modified'])
                    if not stats['date_range']['earliest'] or file_date < datetime.fromisoformat(stats['date_range']['earliest']):
                        stats['date_range']['earliest'] = file_info['modified']
                    if not stats['date_range']['latest'] or file_date > datetime.fromisoformat(stats['date_range']['latest']):
                        stats['date_range']['latest'] = file_info['modified']
                    
                    # Track size distribution
                    size_category = self.get_size_category(file_info['size'])
                    stats['size_distribution'][size_category] += 1
                    
                    stats['files'].append(file_info)
        
        # Find duplicates
        for file_hash, files in hash_map.items():
            if len(files) > 1:
                stats['potential_duplicates'].append(files)
        
        return stats

    def get_size_category(self, size):
        """Categorize file size"""
        KB = 1024
        MB = KB * 1024
        
        if size < KB:
            return "< 1 KB"
        elif size < 10 * KB:
            return "1-10 KB"
        elif size < 100 * KB:
            return "10-100 KB"
        elif size < MB:
            return "100 KB - 1 MB"
        elif size < 10 * MB:
            return "1-10 MB"
        elif size < 100 * MB:
            return "10-100 MB"
        else:
            return "> 100 MB"

    def suggest_categories(self, stats):
        """Suggest folder categories based on analysis"""
        suggestions = {
            'recommended_folders': [],
            'rationale': {}
        }
        
        # Analyze extensions
        if any(ext in ['.eml', '.msg'] for ext in stats['extensions']):
            suggestions['recommended_folders'].append('email')
            suggestions['rationale']['email'] = "Found email files (.eml, .msg)"
            
        if any(ext in ['.pdf', '.doc', '.docx'] for ext in stats['extensions']):
            suggestions['recommended_folders'].append('documents')
            suggestions['rationale']['documents'] = "Found document files (.pdf, .doc, .docx)"
            
        if any(ext in ['.jpg', '.jpeg', '.png', '.gif'] for ext in stats['extensions']):
            suggestions['recommended_folders'].append('images')
            suggestions['rationale']['images'] = "Found image files"
            
        if any(ext in ['.xls', '.xlsx', '.csv'] for ext in stats['extensions']):
            suggestions['recommended_folders'].append('spreadsheets')
            suggestions['rationale']['spreadsheets'] = "Found spreadsheet files"
            
        return suggestions

    def generate_report(self, stats, suggestions):
        """Generate analysis report"""
        report = {
            'summary': {
                'total_files': stats['file_count'],
                'total_size': stats['total_size'],
                'date_range': stats['date_range'],
                'unique_extensions': dict(stats['extensions']),
                'mime_types': dict(stats['mime_types']),
                'size_distribution': dict(stats['size_distribution'])
            },
            'duplicate_groups': len(stats['potential_duplicates']),
            'suggestions': suggestions,
            'timestamp': datetime.now().isoformat()
        }
        
        return report

    def load_rules(self):
        """Load file organization rules from config"""
        rules_path = os.path.join(self.base_dir, "config", "file_rules.json")
        try:
            with open(rules_path) as f:
                return json.load(f)
        except Exception as e:
            logging.error(f"Error loading rules: {str(e)}")
            raise

    def analyze_content(self, file_path):
        """Analyze file content for better categorization"""
        try:
            # For PDF files, check if it's an email export
            if file_path.lower().endswith('.pdf'):
                # Read first few KB to check for email patterns
                with open(file_path, 'rb') as f:
                    content = f.read(4096).decode('utf-8', errors='ignore').lower()
                    
                    # Check for common email headers
                    email_headers = [
                        'from:', 'to:', 'subject:', 'date:', 'sent:', 'received:',
                        'cc:', 'bcc:', 'reply-to:', 'forwarded message'
                    ]
                    
                    # Check for OFW specific patterns
                    ofw_patterns = [
                        'ofw message', 'ofw communication', 'our family wizard',
                        'message history', 'message report'
                    ]
                    
                    # Check for Gmail export patterns
                    gmail_patterns = [
                        'gmail', 'google mail', 'conversation history',
                        'email exchange', 'email thread'
                    ]
                    
                    # Count how many email headers we find
                    header_count = sum(1 for header in email_headers if header in content)
                    
                    # If we find multiple email headers, it's likely an email
                    if header_count >= 2:
                        return 'email'
                    
                    # Check for OFW or Gmail specific patterns
                    if any(pattern in content for pattern in ofw_patterns + gmail_patterns):
                        return 'email'
                        
            return None
        except Exception as e:
            logging.error(f"Error analyzing content of {file_path}: {str(e)}")
            return None

    def handle_duplicate(self, file_info, existing_files):
        """Handle duplicate files by adding version numbers or moving to archives"""
        base_name, ext = os.path.splitext(file_info['filename'])
        version = 1
        
        # Find highest existing version
        for existing in existing_files:
            if existing['hash'] == file_info['hash']:
                # Exact duplicate - move to archives/duplicates
                duplicates_dir = os.path.join(self.base_dir, "output", "archives", "duplicates")
                if not os.path.exists(duplicates_dir):
                    os.makedirs(duplicates_dir)
                else:
                    # Clean up existing files in duplicates directory
                    for file in os.listdir(duplicates_dir):
                        file_path = os.path.join(duplicates_dir, file)
                        if os.path.isfile(file_path):
                            os.remove(file_path)
                
                dest_path = os.path.join(duplicates_dir, file_info['filename'])
                if os.path.exists(file_info['path']):
                    try:
                        os.rename(file_info['path'], dest_path)
                        logging.info(f"Moved duplicate file to archives: {file_info['filename']}")
                    except FileExistsError:
                        # If file exists, try to create a versioned copy
                        version = 1
                        while True:
                            versioned_name = f"{base_name}_v{version}{ext}"
                            versioned_path = os.path.join(duplicates_dir, versioned_name)
                            if not os.path.exists(versioned_path):
                                os.rename(file_info['path'], versioned_path)
                                logging.info(f"Created versioned duplicate: {versioned_name}")
                                break
                            version += 1
                return None
            
            if existing['filename'].startswith(base_name + '_v'):
                try:
                    v = int(existing['filename'].split('_v')[1].split('.')[0])
                    version = max(version, v + 1)
                except ValueError:
                    continue
        
        # Create new filename with version
        new_filename = f"{base_name}_v{version}{ext}"
        logging.info(f"New version detected: {new_filename}")
        return new_filename

    def clean_output_directories(self):
        """Clean up all output directories"""
        output_dir = os.path.join(self.base_dir, "output")
        if os.path.exists(output_dir):
            for root, dirs, files in os.walk(output_dir, topdown=False):
                for name in files:
                    os.remove(os.path.join(root, name))
                for name in dirs:
                    dir_path = os.path.join(root, name)
                    if os.path.exists(dir_path):
                        os.rmdir(dir_path)
            os.rmdir(output_dir)

    def move_files(self, stats, suggestions):
        """Move files to appropriate output folders based on content and type"""
        output_dir = os.path.join(self.base_dir, "output")
        rules = self.load_rules()
        
        # Clean up and recreate output directories
        self.clean_output_directories()
        
        # Create output directories
        for folder in rules['folders']:
            folder_path = os.path.join(output_dir, folder)
            os.makedirs(folder_path)
        
        # Track files in each folder
        folder_files = defaultdict(list)
        
        # First pass - analyze all files
        for file_info in stats['files']:
            src_path = file_info['path']
            filename = file_info['filename']
            ext = file_info['extension'].lower()
            
            # Skip if file is not in input directory or its subdirectories
            if not src_path.startswith(self.input_dir):
                continue
                
            # Determine destination folder
            dest_folder = "other"
            
            # First check content
            content_type = self.analyze_content(src_path)
            if content_type:
                dest_folder = content_type
            
            # Then check filename patterns for PDFs
            elif ext == '.pdf':
                for pattern in rules['patterns']['email_pdf']:
                    if pattern.lower() in filename.lower():
                        dest_folder = 'email'
                        break
            
            # Finally check extensions
            if dest_folder == "other":
                for folder, extensions in rules['extensions'].items():
                    if ext in extensions:
                        dest_folder = folder
                        break
            
            # Check for duplicates/versions
            if folder_files[dest_folder]:
                new_filename = self.handle_duplicate(file_info, folder_files[dest_folder])
                if new_filename is None:
                    continue  # Skip exact duplicates
                filename = new_filename
            
            # Move file
            dest_path = os.path.join(output_dir, dest_folder, filename)
            if os.path.exists(src_path):
                try:
                    os.rename(src_path, dest_path)
                except FileExistsError:
                    # If file exists, try to create a versioned copy
                    base_name, ext = os.path.splitext(filename)
                    version = 1
                    while True:
                        versioned_name = f"{base_name}_v{version}{ext}"
                        versioned_path = os.path.join(output_dir, dest_folder, versioned_name)
                        if not os.path.exists(versioned_path):
                            os.rename(src_path, versioned_path)
                            filename = versioned_name
                            break
                        version += 1
                file_info['filename'] = filename  # Update filename if changed
                folder_files[dest_folder].append(file_info)
                logging.info(f"Moved {filename} to {dest_folder}")
            
        return True

    def run_analysis(self):
        """Run the complete analysis and organize files"""
        try:
            logging.info("Starting folder analysis")
            
            # Analyze current structure
            stats = self.analyze_directory(self.input_dir)
            
            # Generate suggestions
            suggestions = self.suggest_categories(stats)
            
            # Move files based on analysis
            self.move_files(stats, suggestions)
            
            # Create report
            report = self.generate_report(stats, suggestions)
            
            # Save report
            report_path = os.path.join(self.base_dir, "docs", "folder_analysis_report.json")
            with open(report_path, 'w') as f:
                json.dump(report, f, indent=2)
            
            # Save detailed stats
            stats_path = os.path.join(self.base_dir, "docs", "folder_analysis_details.json")
            with open(stats_path, 'w') as f:
                json.dump(stats, f, indent=2, default=str)
            
            logging.info("Analysis and organization completed successfully")
            print(f"\nFiles have been organized into categories.")
            print(f"Analysis reports saved to:")
            print(f"- {report_path}")
            print(f"- {stats_path}")
            
        except Exception as e:
            logging.error(f"Analysis failed: {str(e)}")
            raise

if __name__ == "__main__":
    analyzer = FolderAnalyzer()
    analyzer.run_analysis()
