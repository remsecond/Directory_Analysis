"""Core document organization functionality."""
import os
from pathlib import Path
from typing import List, Dict, Callable
from abc import ABC, abstractmethod

class CategoryRule(ABC):
    """Abstract base class for category rules."""
    @abstractmethod
    def matches(self, filename: str) -> bool:
        """Check if file matches this category."""
        pass

    @abstractmethod
    def get_category(self) -> str:
        """Get the category name."""
        pass

class PatternRule(CategoryRule):
    """Rule that matches based on filename patterns."""
    def __init__(self, category: str, patterns: List[str]):
        self.category = category
        self.patterns = patterns

    def matches(self, filename: str) -> bool:
        lower_filename = filename.lower()
        return any(pattern in lower_filename for pattern in self.patterns)

    def get_category(self) -> str:
        return self.category

class ExtensionRule(CategoryRule):
    """Rule that matches based on file extensions."""
    def __init__(self, category: str, extensions: List[str]):
        self.category = category
        self.extensions = [ext.lower() for ext in extensions]

    def matches(self, filename: str) -> bool:
        return any(filename.lower().endswith(ext) for ext in self.extensions)

    def get_category(self) -> str:
        return self.category

class FileProcessor(ABC):
    """Abstract base class for file processors."""
    @abstractmethod
    def can_process(self, filename: str) -> bool:
        """Check if this processor can handle the file."""
        pass

    @abstractmethod
    def process(self, filepath: str) -> Dict:
        """Process the file and return metadata."""
        pass

class DocumentOrganizer:
    """Core document organization functionality."""
    def __init__(self):
        self.rules: List[CategoryRule] = []
        self.processors: List[FileProcessor] = []
        self.post_move_hooks: List[Callable] = []

    def add_rule(self, rule: CategoryRule):
        """Add a categorization rule."""
        self.rules.append(rule)

    def add_processor(self, processor: FileProcessor):
        """Add a file processor."""
        self.processors.append(processor)

    def add_post_move_hook(self, hook: Callable):
        """Add a hook to run after moving a file."""
        self.post_move_hooks.append(hook)

    def categorize_file(self, filename: str) -> str:
        """Determine category for a file."""
        for rule in self.rules:
            if rule.matches(filename):
                return rule.get_category()
        return 'misc'  # Default category

    def ensure_directories(self, base_path: str):
        """Create necessary directories."""
        for rule in self.rules:
            Path(os.path.join(base_path, rule.get_category())).mkdir(exist_ok=True)
        # Ensure misc directory exists
        Path(os.path.join(base_path, 'misc')).mkdir(exist_ok=True)

    def process_file(self, filepath: str) -> Dict:
        """Process a file with appropriate processor."""
        metadata = {}
        for processor in self.processors:
            if processor.can_process(filepath):
                metadata.update(processor.process(filepath))
        return metadata

    def organize_files(self, input_path: str):
        """Organize files in the input directory."""
        self.ensure_directories(input_path)
        
        files = [f for f in os.listdir(input_path) 
                if os.path.isfile(os.path.join(input_path, f)) and f != 'README.md']
        
        for filename in files:
            source_path = os.path.join(input_path, filename)
            
            # Process file
            metadata = self.process_file(source_path)
            
            # Determine category
            category = self.categorize_file(filename)
            
            # Create destination path
            dest_path = os.path.join(input_path, category, filename)
            
            try:
                # Move file
                os.rename(source_path, dest_path)
                print(f"Moved {filename} to {category}/")
                
                # Run post-move hooks
                for hook in self.post_move_hooks:
                    hook(filename, category, metadata)
                    
            except Exception as e:
                print(f"Error moving {filename}: {str(e)}")
