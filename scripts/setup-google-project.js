const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupGoogleProject() {
  try {
    console.log('Setting up Google Cloud project for EvidenceAI...\n');

    // 1. Create or select project
    console.log('Step 1: Project Setup');
    console.log('--------------------');
    const projectId = await prompt('Enter your Google Cloud project ID (or press Enter to create new): ');

    if (!projectId) {
      console.log('\nPlease follow these steps:');
      console.log('1. Go to https://console.cloud.google.com/');
      console.log('2. Create a new project');
      console.log('3. Copy the project ID');
      console.log('\nThen run this script again with your project ID.');
      process.exit(0);
    }

    // 2. Enable APIs
    console.log('\nStep 2: Enabling Required APIs');
    console.log('-----------------------------');
    console.log('Please enable these APIs in the Google Cloud Console:');
    console.log('1. Google Drive API (https://console.cloud.google.com/apis/library/drive.googleapis.com)');
    await prompt('\nPress Enter once you have enabled the APIs...');

    // 3. Create OAuth credentials
    console.log('\nStep 3: OAuth Credentials Setup');
    console.log('------------------------------');
    console.log('Please create OAuth credentials:');
    console.log('1. Go to https://console.cloud.google.com/apis/credentials');
    console.log('2. Click "Create Credentials" > "OAuth client ID"');
    console.log('3. Choose "Desktop app" as the application type');
    console.log('4. Name it "EvidenceAI Desktop Client"');
    console.log('5. Download the client credentials JSON file');
    
    const credentialsPath = await prompt('\nEnter the path to your downloaded credentials JSON file: ');
    
    if (!fs.existsSync(credentialsPath)) {
      console.error('Error: Credentials file not found');
      process.exit(1);
    }

    // 4. Update environment variables
    console.log('\nStep 4: Updating Environment Configuration');
    console.log('---------------------------------------');
    
    const credentials = JSON.parse(fs.readFileSync(credentialsPath));
    const clientId = credentials.installed.client_id;
    const clientSecret = credentials.installed.client_secret;

    // Create or update .env file
    const envPath = path.join(process.cwd(), '.env');
    const envExample = path.join(process.cwd(), '.env.example');
    
    if (!fs.existsSync(envPath) && fs.existsSync(envExample)) {
      fs.copyFileSync(envExample, envPath);
    }

    let envContent = fs.existsSync(envPath) 
      ? fs.readFileSync(envPath, 'utf8')
      : '';

    envContent = envContent
      .replace(/GOOGLE_CLIENT_ID=.*$/m, `GOOGLE_CLIENT_ID=${clientId}`)
      .replace(/GOOGLE_CLIENT_SECRET=.*$/m, `GOOGLE_CLIENT_SECRET=${clientSecret}`)
      .replace(/PROJECT_ID=.*$/m, `PROJECT_ID=${projectId}`);

    fs.writeFileSync(envPath, envContent);

    console.log('\nConfiguration updated successfully!');
    console.log('\nNext Steps:');
    console.log('1. Run setup-google-drive.bat to complete the setup');
    console.log('2. Follow the browser prompts to authorize the application');
    console.log('3. Add the provided folder IDs to your .env file');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setupGoogleProject();
