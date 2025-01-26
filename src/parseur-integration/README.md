# Parseur Integration for EvidenceAI

This integration uses Parseur's document processing capabilities to automatically extract data from various document types and organize them according to their content.

## Features

- Automatic document type detection and routing
- Intelligent data extraction for:
  - Court Orders (case numbers, dates, order types)
  - Mediation Documents (participants, dates, agreements)
  - Correspondence (emails, OFW messages)
  - Reports and Forms
- Organized file storage based on document type and date
- Comprehensive tracking in Google Sheets
- Error handling with notifications

## Prerequisites

1. Parseur account with API access
2. Google Drive and Google Sheets access
3. Zapier account
4. Node.js installed (for setup and testing)

## Setup Instructions

1. Clone or download this directory
2. Run the setup script:
   ```bash
   setup.bat
   ```
3. When prompted, enter:
   - Your Parseur API key
   - Google Sheets tracking document ID

The setup script will:
- Install required dependencies
- Configure Parseur mailboxes for each document type
- Save configuration to .env file
- Verify the setup with test documents

## Mailbox Configuration

The integration creates four specialized mailboxes in Parseur:

1. **Orders Mailbox**
   - Processes court orders and legal documents
   - Extracts: document type, case number, date, content

2. **Mediation Mailbox**
   - Handles mediation agreements and related documents
   - Extracts: document type, participants, date, terms

3. **Correspondence Mailbox**
   - Processes emails and OFW messages
   - Extracts: sender, recipients, date, thread ID, content

4. **Reports Mailbox**
   - Handles various reports and forms
   - Extracts: report type, author, date, case reference

## Zapier Flow

The integration uses a single Zapier flow that:

1. Monitors input folder for new files
2. Creates tracking entry in Google Sheets
3. Sends document to appropriate Parseur mailbox
4. Updates tracking with extracted data
5. Moves processed file to categorized storage
6. Handles any errors with notifications

Configuration file: `zapier_flows/parseur_integration.json`

## Testing

Run the test script to verify the integration:
```bash
node test.js
```

This will:
- Test each mailbox with sample documents
- Verify data extraction
- Validate file organization
- Check error handling

## File Organization

Processed files are automatically organized into:

```
processed/
  ├── Orders/
  │   └── YYYY/MM/
  ├── Mediation/
  │   └── YYYY/MM/
  ├── Correspondence/
  │   └── YYYY/MM/
  └── Reports/
      └── YYYY/MM/
```

## Error Handling

- Failed documents are moved to `processing/errors/`
- Error details are logged in Google Sheets
- Email notifications sent to admin
- Automatic retry for transient failures

## Monitoring

Track processing status in:
1. Google Sheets tracking document
2. Parseur dashboard
3. Automation logs sheet

## Troubleshooting

Common issues and solutions:

1. **Document Not Processed**
   - Check file format is supported
   - Verify Parseur mailbox rules
   - Check error logs

2. **Missing Extracted Data**
   - Review document format
   - Check confidence thresholds
   - Adjust extraction rules

3. **File Organization Issues**
   - Verify date format in documents
   - Check folder permissions
   - Review category detection rules

## Support

For issues or questions:
1. Check error logs in Google Sheets
2. Review Parseur processing history
3. Contact system administrator

## Maintenance

Regular maintenance tasks:
1. Monitor error rates
2. Review extraction accuracy
3. Update mailbox rules as needed
4. Clean up error folder
5. Verify Google Sheets integration
