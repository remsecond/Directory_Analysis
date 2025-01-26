# Document Scraper

A Node.js-based document scraping system that downloads and organizes financial and economic documents based on priority weights.

## Features

- Priority-based document downloading (weighted system)
- Site-specific download handling (SEC, OECD, etc.)
- Automatic file organization
- Error handling and logging
- Download tracking and reporting

## Document Categories

1. Core Financial & Tax Documents (40% priority)
   - SEC filings (10-K, 10-Q)
   - Tax guidelines and regulations

2. Competitor & Benchmark Data (25% priority)
   - Industry competitor filings
   - Market analysis reports

3. Cost & Operations Data (20% priority)
   - Commodity price data
   - Labor market statistics

4. Global Economic & Trade (15% priority)
   - Economic forecasts
   - International trade reports

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the scraper:
```bash
npm start
```

## Project Structure

- `scraper.js` - Main script containing document definitions and download logic
- `package.json` - Project configuration and dependencies
- `downloads/` - Directory where downloaded documents are stored (created automatically)

## Notes

- The script runs in non-headless mode by default (browser visible)
- Downloads are saved as PDFs in the downloads directory
- Each document has a priority weight that determines its processing order
- Site-specific download logic handles different document sources appropriately

## Future Enhancements

- Rate limiting for server-friendly downloads
- Authentication for protected documents
- Retry logic for failed downloads
- File validation and integrity checks
- Production mode with headless browser operation
