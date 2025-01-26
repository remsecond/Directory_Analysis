#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const PARSEUR_API_KEY = process.env.PARSEUR_API_KEY;
const PARSEUR_API_URL = 'https://api.parseur.com/v1';

// Load mailbox configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'mailbox-config.json'), 'utf8'));

// Verify environment variables
function checkEnvironment() {
  const requiredVars = [
    'PARSEUR_API_KEY',
    'PARSEUR_ORDERS_MAILBOX_ID',
    'PARSEUR_MEDIATION_MAILBOX_ID',
    'PARSEUR_CORRESPONDENCE_MAILBOX_ID',
    'PARSEUR_REPORTS_MAILBOX_ID',
    'GOOGLE_SHEETS_ID'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('Please run setup.bat first');
    process.exit(1);
  }
}

// Verify Parseur API access
async function checkParseurAccess() {
  try {
    const response = await fetch(`${PARSEUR_API_URL}/mailboxes`, {
      headers: {
        'Authorization': `Token ${PARSEUR_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to access Parseur API: ${response.statusText}`);
    }

    const mailboxes = await response.json();
    console.log(`Connected to Parseur (${mailboxes.length} mailboxes available)`);
  } catch (error) {
    console.error('Failed to connect to Parseur:', error.message);
    process.exit(1);
  }
}

// Monitor mailbox processing status
async function monitorMailboxes() {
  try {
    const response = await fetch(`${PARSEUR_API_URL}/documents?status=processing`, {
      headers: {
        'Authorization': `Token ${PARSEUR_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to check processing status: ${response.statusText}`);
    }

    const documents = await response.json();
    if (documents.length > 0) {
      console.log(`Currently processing ${documents.length} documents:`);
      for (const doc of documents) {
        console.log(`- ${doc.original_filename} (started: ${new Date(doc.created_at).toLocaleString()})`);
      }
    }
  } catch (error) {
    console.error('Failed to check processing status:', error.message);
  }
}

// Start monitoring
async function startMonitoring() {
  console.log('Starting Parseur integration server...\n');
  
  // Initial checks
  checkEnvironment();
  await checkParseurAccess();

  console.log('\nMonitoring mailboxes for document processing...');
  console.log('Press Ctrl+C to stop\n');

  // Monitor every 30 seconds
  setInterval(monitorMailboxes, 30000);
  monitorMailboxes(); // Initial check
}

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down Parseur integration server...');
  process.exit(0);
});

// Start server if run directly
if (require.main === module) {
  startMonitoring().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = { startMonitoring, checkEnvironment, checkParseurAccess };
