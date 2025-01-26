// Import required modules
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Define target documents with priority weights and URLs
const targetDocuments = [
  // Priority 1 (40% of total downloads) - Core Financial & Tax Documents
  {
    priority: 1,
    category: 'Core Financial',
    documents: [
      {
        name: 'Starbucks 10-K 2023',
        url: 'https://www.sec.gov/ix?doc=/Archives/edgar/data/829224/000082922423000051/sbux-20231001.htm',
        weight: 10
      },
      {
        name: 'Starbucks 10-Q Latest',
        url: 'https://www.sec.gov/ix?doc=/Archives/edgar/data/829224/000082922424000006/sbux-20231231.htm',
        weight: 8
      },
      {
        name: 'OECD Transfer Pricing Guidelines',
        url: 'https://www.oecd.org/tax/transfer-pricing/oecd-transfer-pricing-guidelines-for-multinational-enterprises-and-tax-administrations-20769717.htm',
        weight: 10
      }
    ]
  },
  // Priority 2 (25% of total downloads) - Competitor & Benchmark Data
  {
    priority: 2,
    category: 'Competitor Analysis',
    documents: [
      {
        name: 'McDonalds 10-K',
        url: 'https://www.sec.gov/ix?doc=/Archives/edgar/data/63908/000006390824000014/mcd-20231231.htm',
        weight: 7
      },
      {
        name: 'Restaurant Brands (BK) 10-K',
        url: 'https://www.sec.gov/ix?doc=/Archives/edgar/data/1618756/000161875624000004/qsr-20231231.htm',
        weight: 6
      }
    ]
  },
  // Priority 3 (20% of total downloads) - Cost & Operations Data
  {
    priority: 3,
    category: 'Cost Structure',
    documents: [
      {
        name: 'ICO Coffee Price Data',
        url: 'https://www.ico.org/prices/pr-prices.pdf',
        weight: 5
      },
      {
        name: 'BLS Food Service Labor Data',
        url: 'https://www.bls.gov/iag/tgs/iag722.htm',
        weight: 5
      }
    ]
  },
  // Priority 4 (15% of total downloads) - Global Economic & Trade
  {
    priority: 4,
    category: 'Global Economics',
    documents: [
      {
        name: 'World Bank Economic Outlook',
        url: 'https://www.worldbank.org/en/publication/global-economic-prospects',
        weight: 4
      },
      {
        name: 'IMF Country Reports',
        url: 'https://www.imf.org/en/Publications/SPROLLS/world-economic-outlook-databases',
        weight: 4
      }
    ]
  }
];

// Function to download a document
async function downloadDocument(page, document, downloadPath) {
  try {
    console.log(`Downloading: ${document.name}`);
    await page.goto(document.url, { waitUntil: 'networkidle0' });

    // Different download logic based on site structure
    const filePath = path.join(downloadPath, `${document.name}.pdf`);
    if (document.url.includes('sec.gov')) {
      // SEC-specific download logic
      await page.pdf({ path: filePath });
    } else if (document.url.includes('oecd.org')) {
      // OECD-specific download logic
      await page.pdf({ path: filePath });
    } else {
      // Generic download logic
      await page.pdf({ path: filePath });
    }

    console.log(`Successfully downloaded: ${document.name}`);
  } catch (error) {
    console.error(`Error downloading ${document.name}:`, error);
  }
}

// Main function to orchestrate the scraping
async function main() {
  const browser = await puppeteer.launch({
    headless: false, // Set to true in production
    defaultViewport: null
  });

  const page = await browser.newPage();

  // Create downloads directory if it doesn't exist
  const downloadPath = path.join(__dirname, 'downloads');
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath);
  }

  // Download documents based on priority and weight
  for (const priorityGroup of targetDocuments) {
    console.log(`Processing ${priorityGroup.category} documents...`);

    for (const doc of priorityGroup.documents) {
      await downloadDocument(page, doc, downloadPath);
    }
  }

  await browser.close();

  // Track downloaded files
  const downloadedFiles = [];
  fs.readdirSync(downloadPath).forEach(file => {
    downloadedFiles.push(file);
  });
  console.log('Downloaded files:', downloadedFiles);
}

// Add error handling and execute the script
main().catch(console.error);
