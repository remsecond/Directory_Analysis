#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const PARSEUR_API_KEY = process.env.PARSEUR_API_KEY;
const PARSEUR_API_URL = 'https://api.parseur.com/v1';

async function createMailbox(config) {
  console.log(`Creating mailbox: ${config.name}`);
  
  try {
    // Create mailbox
    const response = await fetch(`${PARSEUR_API_URL}/mailboxes`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${PARSEUR_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: config.name,
        description: `Mailbox for processing ${config.name.toLowerCase()}`,
        settings: {
          ocr: config.global_settings.ocr,
          table_extraction: config.global_settings.table_extraction
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create mailbox: ${response.statusText}`);
    }

    const mailbox = await response.json();
    console.log(`Created mailbox ${config.name} with ID: ${mailbox.id}`);

    // Add parsing rules
    for (const rule of config.rules) {
      console.log(`Adding rule: ${rule.name}`);
      
      const ruleResponse = await fetch(`${PARSEUR_API_URL}/mailboxes/${mailbox.id}/rules`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${PARSEUR_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: rule.name,
          field: rule.field,
          pattern: rule.pattern,
          required: rule.required || false,
          confidence_threshold: rule.confidence || 0.7,
          multiple: rule.multiple || false
        })
      });

      if (!ruleResponse.ok) {
        throw new Error(`Failed to create rule ${rule.name}: ${ruleResponse.statusText}`);
      }
    }

    // Configure validation
    const validationResponse = await fetch(`${PARSEUR_API_URL}/mailboxes/${mailbox.id}/validation`, {
      method: 'PUT',
      headers: {
        'Authorization': `Token ${PARSEUR_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        required_fields: config.validation.required_fields,
        confidence_threshold: config.validation.confidence_threshold
      })
    });

    if (!validationResponse.ok) {
      throw new Error(`Failed to configure validation: ${validationResponse.statusText}`);
    }

    return mailbox.id;
  } catch (error) {
    console.error(`Error setting up mailbox ${config.name}:`, error);
    throw error;
  }
}

async function setupMailboxes() {
  try {
    // Load configuration
    const configPath = path.join(__dirname, 'mailbox-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // Create .env file with mailbox IDs
    let envContent = '';

    // Create each mailbox
    for (const mailbox of config.mailboxes) {
      const mailboxId = await createMailbox({
        ...mailbox,
        global_settings: config.global_settings
      });
      
      // Add mailbox ID to env content
      envContent += `PARSEUR_${mailbox.id.toUpperCase()}_MAILBOX_ID=${mailboxId}\n`;
    }

    // Write mailbox IDs to .env file
    fs.writeFileSync(path.join(__dirname, '.env'), envContent, 'utf8');
    console.log('Successfully created all mailboxes and saved IDs to .env file');

  } catch (error) {
    console.error('Failed to set up mailboxes:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  if (!PARSEUR_API_KEY) {
    console.error('Error: PARSEUR_API_KEY environment variable is required');
    process.exit(1);
  }

  setupMailboxes().catch(console.error);
}

module.exports = { setupMailboxes, createMailbox };
