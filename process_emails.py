import os
import sys
import json
import shutil
import re
from datetime import datetime
from typing import Dict, List
import PyPDF2

# Define folder paths
INCOMING_FOLDER = "02_Incoming"
PROCESSING_FOLDER = "03_Processing"
COMPLETED_FOLDER = "04_Completed"
METADATA_FOLDER = "05_Metadata"
OUTPUTS_FOLDER = "06_Outputs"

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text content from a PDF file."""
    try:
        with open(pdf_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                # Extract text and clean it
                page_text = page.extract_text()
                # Remove null bytes and normalize whitespace
                page_text = page_text.replace('\x00', '').replace('\r', '\n')
                # Normalize line endings
                page_text = '\n'.join(line.strip() for line in page_text.splitlines() if line.strip())
                text += page_text + '\n'
            return text
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {str(e)}")
        return ""

def extract_email_metadata(text: str) -> List[Dict]:
    """Extract email metadata using enhanced regex patterns."""
    emails = []
    
    # Split text into potential email blocks using a more robust pattern
    email_blocks = re.split(r'\n\s*(?=Subject:|From:)', text)
    
    for block in email_blocks:
        if not block.strip():
            continue
            
        email_data = {
            "sender": "",
            "recipients": [],
            "datetime": "",
            "subject": "",
            "keywords": [],
            "sentiment": "neutral",
            "actionable_items": [],
            "summary": block.strip()  # Store original text as fallback summary
        }
        
        # Extract subject with improved handling
        subject_match = re.search(r'Subject:\s*([^\n]+)', block, re.I)
        if subject_match:
            subject = subject_match.group(1).strip()
            # Clean up any line breaks in the subject
            subject = re.sub(r'\s+', ' ', subject)
            email_data["subject"] = subject
        
        # Extract sender with improved email address handling
        from_match = re.search(r'From:\s*([^<\n]*?)(?:\s*<([^>]+)>)?(?=\n|$)', block, re.I)
        if from_match:
            name = from_match.group(1).strip()
            email = from_match.group(2) if from_match.group(2) else ""
            email_data["sender"] = f"{name} <{email}>" if email else name
        
        # Extract recipients with improved handling
        to_match = re.search(r'To:\s*([^\n]+)', block, re.I)
        if to_match:
            recipients_text = to_match.group(1)
            # Split by comma but handle email addresses in brackets
            recipients = []
            current = ""
            in_bracket = False
            for char in recipients_text:
                if char == '<':
                    in_bracket = True
                elif char == '>':
                    in_bracket = False
                elif char == ',' and not in_bracket:
                    if current.strip():
                        recipients.append(current.strip())
                    current = ""
                else:
                    current += char
            if current.strip():
                recipients.append(current.strip())
            email_data["recipients"] = recipients
        
        # Extract date with improved pattern matching
        date_patterns = [
            r'Date Sent:\s*([^\n]+)',
            r'Date:\s*([^\n]+)',
            r'Sent:\s*([^\n]+)'
        ]
        for pattern in date_patterns:
            date_match = re.search(pattern, block, re.I)
            if date_match:
                email_data["datetime"] = date_match.group(1).strip()
                break
        
        # Extract potential action items
        action_patterns = [
            r'(?:need|must|should|please|kindly)\s+[^.!?]*[.!?]',
            r'(?:review|send|update|complete|schedule|confirm)\s+[^.!?]*[.!?]',
            r'(?:follow.?up|todo|to.do|action.?item)[^.!?]*[.!?]',
            r'(?:can|could|would)\s+you\s+[^.!?]*[.!?]'
        ]
        
        action_items = []
        for pattern in action_patterns:
            matches = re.findall(pattern, block, re.I)
            for match in matches:
                if len(match.strip()) > 15:  # Ignore very short matches
                    action_items.append(match.strip())
        
        email_data["actionable_items"] = list(set(action_items))  # Remove duplicates
        
        # Extract keywords
        # First, get all potential content by removing headers
        content = re.sub(r'(?:From|To|Subject|Date|Sent):\s*[^\n]+\n', '', block)
        
        # Extract words with basic cleanup
        words = re.findall(r'\b[A-Za-z]+\b', content)
        
        # Common words to exclude
        common_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'from', 'up', 'about', 'into', 'over', 'after', 'this', 'that', 'these',
            'those', 'who', 'what', 'where', 'when', 'why', 'how', 'all', 'any', 'both',
            'each', 'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very',
            'can', 'will', 'just', 'should', 'now', 'email', 'subject', 'date', 'sent'
        }
        
        # Process keywords
        keyword_freq = {}
        for word in words:
            word = word.strip().lower()
            if (len(word) > 3 and 
                word not in common_words and 
                not word.isdigit() and 
                not re.match(r'^[A-Za-z]$', word)):
                keyword_freq[word] = keyword_freq.get(word, 0) + 1
        
        # Sort by frequency and keep top keywords
        sorted_keywords = sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)
        email_data["keywords"] = [k for k, _ in sorted_keywords[:10]]
        
        # Generate summary if not already set
        if not email_data["summary"] or email_data["summary"] == block.strip():
            # Clean the content
            content_lines = [
                line.strip() for line in block.split('\n')
                if not re.match(r'^(From|To|Subject|Date|Sent):', line)
                and line.strip()
                and not re.match(r'^[<>]', line)  # Remove email brackets
                and not re.match(r'^-{3,}$', line)  # Remove separator lines
            ]
            content = ' '.join(content_lines)
            
            # Split into sentences
            sentences = re.split(r'[.!?]+\s+', content)
            
            # Select first few sentences for summary
            summary_sentences = []
            for sentence in sentences[:3]:
                if len(sentence) > 20:  # Skip very short sentences
                    summary_sentences.append(sentence)
            
            if summary_sentences:
                email_data["summary"] = '. '.join(summary_sentences) + '.'
        
        emails.append(email_data)
    
    return emails

def analyze_document(text: str) -> Dict:
    """Analyze the document content using regex patterns."""
    try:
        # Extract individual emails
        emails = extract_email_metadata(text)
        
        # Extract key topics (words that appear frequently)
        words = re.findall(r'\b\w+\b', text.lower())
        common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'subject', 'date', 'email'}
        word_freq = {}
        for word in words:
            if len(word) > 3 and word not in common_words:
                word_freq[word] = word_freq.get(word, 0) + 1
        key_topics = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]
        key_topics = [topic[0] for topic in key_topics] if key_topics else []
    
        # Extract decisions (sentences with decision-related words)
        decision_words = r'decide|agree|approve|confirm|finalize|conclude|resolved|determined'
        decisions = re.findall(f'[^.!?]*(?:{decision_words})[^.!?]*[.!?]', text, re.I)
        decisions = [d.strip() for d in decisions] if decisions else []
        
        # Extract action items (sentences with action-related words)
        action_words = r'need|must|should|please|review|send|update|complete|schedule|confirm|follow.?up|todo|to.do'
        action_items = re.findall(f'[^.!?]*(?:{action_words})[^.!?]*[.!?]', text, re.I)
        action_items = [a.strip() for a in action_items] if action_items else []
    
        # Create timeline from email dates
        timeline_events = []
        for email in emails:
            if email.get("datetime"):
                timeline_events.append({
                    "date": email["datetime"],
                    "event": f"Email from {email.get('sender', 'Unknown')}: {email.get('subject', 'No subject')}"
                })
        timeline_events = sorted(timeline_events, key=lambda x: x["date"]) if timeline_events else []
        
        # Determine overall tone
        tone_words = {
            'positive': r'thank|appreciate|great|good|excellent|pleased|happy|agree|success|wonderful|perfect',
            'negative': r'unfortunately|sorry|concern|issue|problem|disagree|difficult|bad|wrong|fail',
            'urgent': r'urgent|asap|immediate|emergency|critical|priority|important'
        }
        
        tone_counts = {tone: len(re.findall(pattern, text, re.I)) for tone, pattern in tone_words.items()}
        max_tone = max(tone_counts.items(), key=lambda x: x[1]) if tone_counts else ('neutral', 0)
        overall_tone = max_tone[0] if max_tone[1] > 0 else "neutral"
        
        # Generate context
        first_email = emails[0] if emails else {}
        last_email = emails[-1] if emails else {}
        context = f"Email thread between {first_email.get('sender', 'Unknown')} and {', '.join(first_email.get('recipients', ['Unknown']))} "
        context += f"from {first_email.get('datetime', 'Unknown')} to {last_email.get('datetime', 'Unknown')}. "
        context += f"Main topic: {first_email.get('subject', 'Unknown')}"
        
        # Create document summary
        doc_summary = {
            "key_topics": key_topics,
            "decisions": decisions,
            "action_items": action_items,
            "timeline": timeline_events,
            "overall_tone": overall_tone,
            "context": context
        }
        
        return {
            "emails": emails,
            "document_summary": doc_summary
        }
    except Exception as e:
        print(f"Error in analyze_document: {str(e)}")
        # Return a minimal valid structure
        return {
            "emails": [],
            "document_summary": {
                "key_topics": [],
                "decisions": [],
                "action_items": [],
                "timeline": [],
                "overall_tone": "neutral",
                "context": "Error analyzing document"
            }
        }

def save_metadata(metadata: Dict, filename: str) -> None:
    """Save metadata to a JSON file."""
    try:
        output_path = os.path.join(METADATA_FOLDER, f"{filename}_metadata.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving metadata: {str(e)}")

def save_summary(metadata: Dict, filename: str) -> None:
    """Generate and save a human-readable summary."""
    try:
        output_path = os.path.join(OUTPUTS_FOLDER, f"{filename}_summary.txt")
        
        # Format the summary
        summary = []
        summary.append("EMAIL ANALYSIS SUMMARY")
        summary.append("=" * 20 + "\n")
        
        # Document-level summary
        doc_summary = metadata.get("document_summary", {})
        summary.append("DOCUMENT OVERVIEW")
        summary.append("-" * 16)
        summary.append(f"Overall Tone: {doc_summary.get('overall_tone', 'N/A')}")
        summary.append(f"Context: {doc_summary.get('context', 'N/A')}\n")
        
        summary.append("Key Topics:")
        for topic in doc_summary.get("key_topics", []):
            summary.append(f"- {topic}")
        summary.append("")
        
        summary.append("Key Decisions:")
        for decision in doc_summary.get("decisions", []):
            summary.append(f"- {decision}")
        summary.append("")
        
        summary.append("Timeline:")
        for event in doc_summary.get("timeline", []):
            summary.append(f"- {event}")
        summary.append("\n")
        
        # Individual email summaries
        summary.append("EMAIL DETAILS")
        summary.append("-" * 12)
        for i, email in enumerate(metadata.get("emails", []), 1):
            summary.append(f"\nEmail {i}:")
            summary.append(f"From: {email.get('sender', 'N/A')}")
            summary.append(f"To: {', '.join(email.get('recipients', ['N/A']))}")
            summary.append(f"Date: {email.get('datetime', 'N/A')}")
            summary.append(f"Subject: {email.get('subject', 'N/A')}")
            summary.append(f"Sentiment: {email.get('sentiment', 'N/A')}")
            
            summary.append("\nKeywords:")
            for keyword in email.get("keywords", []):
                summary.append(f"- {keyword}")
            
            summary.append("\nActionable Items:")
            for item in email.get("actionable_items", []):
                summary.append(f"- {item}")
            
            summary.append(f"\nSummary: {email.get('summary', 'N/A')}")
            summary.append("-" * 40)
        
        # Write to file
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(summary))
            
    except Exception as e:
        print(f"Error saving summary: {str(e)}")

def process_file(filename: str) -> None:
    """Process a single PDF file."""
    try:
        # Construct file paths
        incoming_path = os.path.join(INCOMING_FOLDER, filename)
        processing_path = os.path.join(PROCESSING_FOLDER, filename)
        completed_path = os.path.join(COMPLETED_FOLDER, filename)

        # Move file to processing folder
        shutil.move(incoming_path, processing_path)
        print(f"Processing: {filename}")

        # Extract text from PDF
        text_content = extract_text_from_pdf(processing_path)
        if not text_content:
            print(f"No text content extracted from {filename}")
            return

        # Analyze content
        analysis = analyze_document(text_content)
        if not analysis:
            print(f"No analysis generated for {filename}")
            return

        # Save outputs
        save_metadata(analysis, filename)
        save_summary(analysis, filename)

        # Move to completed folder
        shutil.move(processing_path, completed_path)
        print(f"Completed: {filename}")

    except Exception as e:
        print(f"Error processing {filename}: {str(e)}")

def main():
    """Main function to process all PDF files in the incoming folder."""
    print("Starting email processing workflow...")
    
    # Ensure all required folders exist
    for folder in [INCOMING_FOLDER, PROCESSING_FOLDER, COMPLETED_FOLDER, 
                  METADATA_FOLDER, OUTPUTS_FOLDER]:
        os.makedirs(folder, exist_ok=True)
    
    # Process each PDF file in the incoming folder
    pdf_files = [f for f in os.listdir(INCOMING_FOLDER) if f.endswith(".pdf")]
    print(f"Found {len(pdf_files)} PDF files in {INCOMING_FOLDER}")
    
    for filename in pdf_files:
        print(f"\nStarting to process: {filename}")
        process_file(filename)
    
    print("\nProcessing completed.")

if __name__ == "__main__":
    main()
