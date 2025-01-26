"""File processors implementation."""
from typing import Dict
from .core import FileProcessor

class MCPPdfProcessor(FileProcessor):
    """PDF processor using MCP pdf-processor-server."""
    def can_process(self, filename: str) -> bool:
        return filename.lower().endswith('.pdf')

    def process(self, filepath: str) -> Dict:
        print(f"<use_mcp_tool>")
        print(f"<server_name>pdf-processor-server</server_name>")
        print(f"<tool_name>analyze_pdf</tool_name>")
        print(f"<arguments>")
        print(f'{{"filepath": "{filepath}"}}')
        print(f"</arguments>")
        print(f"</use_mcp_tool>")
        return {"type": "pdf", "processed": True}

class MCPEmailProcessor(FileProcessor):
    """Email processor using MCP email-processor-server."""
    def can_process(self, filename: str) -> bool:
        return filename.lower().endswith('.eml')

    def process(self, filepath: str) -> Dict:
        print(f"<use_mcp_tool>")
        print(f"<server_name>email-processor-server</server_name>")
        print(f"<tool_name>process_email</tool_name>")
        print(f"<arguments>")
        print(f'{{"filepath": "{filepath}"}}')
        print(f"</arguments>")
        print(f"</use_mcp_tool>")
        return {"type": "email", "processed": True}

def sheets_logger(filename: str, category: str, metadata: Dict):
    """Google Sheets logging using MCP google-sheets-server."""
    print(f"<use_mcp_tool>")
    print(f"<server_name>google-sheets-server</server_name>")
    print(f"<tool_name>append_row</tool_name>")
    print(f"<arguments>")
    print(f'{{"values": ["{filename}", "{category}", "{str(metadata)}"]}}')
    print(f"</arguments>")
    print(f"</use_mcp_tool>")
