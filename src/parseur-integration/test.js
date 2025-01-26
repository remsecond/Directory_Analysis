#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const PARSEUR_API_KEY = process.env.PARSEUR_API_KEY;
const PARSEUR_API_URL = 'https://api.parseur.com/v1';

// Sample test documents
const TEST_DOCS = {
  orders: {
    content: `TEMPORARY ORDER
Case Number: 23-1234-AB
Date: 2024-01-15

IT IS HEREBY ORDERED that...`,
    expectedFields: ['document_type', 'case_number', 'date']
  },
  mediation: {
    content: `MEDIATION AGREEMENT
Date: 2024-01-15

PRESENT:
John Doe
Jane Smith

The parties agree...`,
    expectedFields: ['document_type', 'date', 'participants']
  },
  correspondence: {
    content: `From: john@example.com
To: jane@example.com
Date: 2024-01-15
Thread-ID: ABC123

Message content...`,
    expectedFields: ['message_type', 'from', 'to', 'date', 'thread_id']
  }
};

async function getMailboxId(type) {
  const envVar = `PARSEUR_${type.toUpperCase()}_MAILBOX_ID`;
  const mailboxId = process.env[envVar];
  if (!mailboxId) {
    throw new Error(`Missing mailbox ID for type: ${type}. Ensure ${envVar} is set in .env file.`);
  }
  return mailboxId;
}

async function testMailbox(type, testDoc) {
  console.log(`\nTesting ${type} mailbox...`);
  
  try {
    const mailboxId = await getMailboxId(type);
    
    // Create test document
    const response = await fetch(`${PARSEUR_API_URL}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${PARSEUR_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mailbox_id: mailboxId,
        content: testDoc.content,
        metadata: {
          test: true,
          document_type: type
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create test document: ${response.statusText}`);
    }

    const doc = await response.json();
    console.log(`Created test document with ID: ${doc.id}`);

    // Wait for processing
    console.log('Waiting for processing...');
    let processed = false;
    let result;
    
    for (let i = 0; i < 10; i++) {
      const statusResponse = await fetch(`${PARSEUR_API_URL}/documents/${doc.id}`, {
        headers: {
          'Authorization': `Token ${PARSEUR_API_KEY}`
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error(`Failed to check document status: ${statusResponse.statusText}`);
      }

      result = await statusResponse.json();
      
      if (result.status === 'processed') {
        processed = true;
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (!processed) {
      throw new Error('Document processing timed out');
    }

    // Verify extracted fields
    console.log('\nVerifying extracted fields:');
    const missingFields = [];
    
    for (const field of testDoc.expectedFields) {
      if (result.extracted_data && result.extracted_data[field]) {
        console.log(`✓ ${field}: ${result.extracted_data[field]}`);
      } else {
        console.log(`✗ ${field}: Missing`);
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    console.log(`\n${type} mailbox test: PASSED`);
    return true;

  } catch (error) {
    console.error(`\n${type} mailbox test: FAILED`);
    console.error(error.message);
    return false;
  }
}

async function runTests() {
  console.log('Starting Parseur integration tests...\n');

  if (!PARSEUR_API_KEY) {
    console.error('Error: PARSEUR_API_KEY environment variable is required');
    process.exit(1);
  }

  let failures = 0;

  // Test each mailbox
  for (const [type, testDoc] of Object.entries(TEST_DOCS)) {
    if (!(await testMailbox(type, testDoc))) {
      failures++;
    }
  }

  console.log('\nTest summary:');
  console.log(`Total tests: ${Object.keys(TEST_DOCS).length}`);
  console.log(`Passed: ${Object.keys(TEST_DOCS).length - failures}`);
  console.log(`Failed: ${failures}`);

  if (failures > 0) {
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testMailbox, runTests };
