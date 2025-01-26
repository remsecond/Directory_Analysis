import json
import os
import hashlib
from datetime import datetime
from typing import Dict, List, Set

def analyze_database() -> Dict:
    """Analyze the current state of the asset database"""
    with open('asset_database.json', 'r') as f:
        data = json.load(f)

    # Basic statistics
    stats = {
        "total_files": len(data),
        "file_types": sorted(list(set(item["file_type"] for item in data))),
        "fields_present": sorted(list(set().union(*(item.keys() for item in data)))),
        "files_by_type": {}
    }

    # Count files by type
    for item in data:
        file_type = item["file_type"]
        stats["files_by_type"][file_type] = stats["files_by_type"].get(file_type, 0) + 1

    return stats

def validate_database() -> Dict:
    """Validate the database integrity"""
    with open('asset_database.json', 'r') as f:
        data = json.load(f)

    validation_results = {
        "missing_files": [],
        "invalid_hashes": [],
        "missing_fields": [],
        "total_validated": len(data),
        "valid_entries": 0
    }

    required_fields = {
        "file_name", "file_path", "file_type",
        "sha256_hash", "date_modified", "tags",
        "ocr_text", "summary"
    }

    for item in data:
        is_valid = True
        
        # Check file existence
        if not os.path.exists(item["file_path"]):
            validation_results["missing_files"].append(item["file_path"])
            is_valid = False

        # Check required fields
        missing = required_fields - set(item.keys())
        if missing:
            validation_results["missing_fields"].append({
                "file": item["file_name"],
                "missing_fields": list(missing)
            })
            is_valid = False

        # Verify hash (if file exists)
        if os.path.exists(item["file_path"]):
            try:
                with open(item["file_path"], 'rb') as f:
                    current_hash = hashlib.sha256(f.read()).hexdigest()
                    if current_hash != item["sha256_hash"]:
                        validation_results["invalid_hashes"].append(item["file_path"])
                        is_valid = False
            except Exception as e:
                print(f"Error reading file {item['file_path']}: {str(e)}")
                is_valid = False

        if is_valid:
            validation_results["valid_entries"] += 1

    return validation_results

def print_report(stats: Dict, validation: Dict) -> None:
    """Print a formatted report of the analysis and validation results"""
    print("\n=== Asset Database Analysis Report ===\n")
    
    print("Database Statistics:")
    print(f"Total files indexed: {stats['total_files']}")
    print("\nFile types present:")
    for file_type in stats['file_types']:
        count = stats['files_by_type'][file_type]
        print(f"- {file_type}: {count} files")
    
    print("\nFields present in database:")
    for field in stats['fields_present']:
        print(f"- {field}")
    
    print("\nValidation Results:")
    print(f"Total entries validated: {validation['total_validated']}")
    print(f"Valid entries: {validation['valid_entries']}")
    
    if validation['missing_files']:
        print("\nMissing files:")
        for file in validation['missing_files']:
            print(f"- {file}")
    
    if validation['invalid_hashes']:
        print("\nFiles with invalid hashes:")
        for file in validation['invalid_hashes']:
            print(f"- {file}")
    
    if validation['missing_fields']:
        print("\nEntries with missing fields:")
        for entry in validation['missing_fields']:
            print(f"- {entry['file']}: missing {', '.join(entry['missing_fields'])}")

def main():
    """Run database analysis and validation"""
    try:
        stats = analyze_database()
        validation = validate_database()
        print_report(stats, validation)
    except FileNotFoundError:
        print("Error: asset_database.json not found")
    except json.JSONDecodeError:
        print("Error: Invalid JSON format in asset_database.json")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
