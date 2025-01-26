"""Main document organizer script."""
from typing import List
from .core import DocumentOrganizer, PatternRule, ExtensionRule
from .processors import MCPPdfProcessor, MCPEmailProcessor, sheets_logger

def create_basic_organizer() -> DocumentOrganizer:
    """Create basic organizer with just file pattern rules."""
    organizer = DocumentOrganizer()

    # Add categorization rules
    rules: List[PatternRule] = [
        PatternRule('correspondence', ['trip', 'travel', 'permission', 'form']),
        PatternRule('court', ['parenting plan', 'eval', 'agreement']),
        PatternRule('financial', ['cash', 'sbux', 'premera']),
        PatternRule('ofw', ['ofw_messages_report']),
        PatternRule('email', ['email']),
    ]
    for rule in rules:
        organizer.add_rule(rule)

    # Add extension-based rules
    image_rule = ExtensionRule('misc', ['.png', '.jpg', '.jpeg', '.gif'])
    organizer.add_rule(image_rule)

    return organizer

def create_enhanced_organizer() -> DocumentOrganizer:
    """Create enhanced organizer with MCP capabilities."""
    organizer = create_basic_organizer()

    # Add MCP processors
    organizer.add_processor(MCPPdfProcessor())
    organizer.add_processor(MCPEmailProcessor())

    # Add Google Sheets logging
    organizer.add_post_move_hook(sheets_logger)

    return organizer

def main(enhanced: bool = False):
    """Run the document organizer."""
    if enhanced:
        print("Starting enhanced document organizer with MCP capabilities...")
        organizer = create_enhanced_organizer()
    else:
        print("Starting basic document organizer...")
        organizer = create_basic_organizer()

    organizer.organize_files('input')

if __name__ == "__main__":
    import sys
    enhanced = len(sys.argv) > 1 and sys.argv[1] == '--enhanced'
    main(enhanced)
