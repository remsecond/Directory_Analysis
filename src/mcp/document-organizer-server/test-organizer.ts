import { DocumentOrganizerServer } from './server.js';
import * as fs from 'fs/promises';
import * as path from 'path';

async function setupTestFiles() {
  const testDir = path.join(__dirname, 'test-files');
  const targetDir = path.join(__dirname, 'organized-files');

  // Clean up previous test files
  await fs.rm(testDir, { recursive: true, force: true });
  await fs.rm(targetDir, { recursive: true, force: true });

  // Create test directories
  await fs.mkdir(testDir, { recursive: true });
  await fs.mkdir(targetDir, { recursive: true });

  // Create test files with different types and dates
  const files = [
    {
      name: 'document1.pdf',
      content: 'Test PDF content',
      mtime: new Date('2024-01-15')
    },
    {
      name: 'image1.jpg',
      content: 'Test image content',
      mtime: new Date('2024-01-16')
    },
    {
      name: 'document2.pdf',
      content: 'Test PDF content 2',
      mtime: new Date('2024-02-01')
    }
  ];

  for (const file of files) {
    const filePath = path.join(testDir, file.name);
    await fs.writeFile(filePath, file.content);
    await fs.utimes(filePath, file.mtime, file.mtime);
  }

  return { testDir, targetDir };
}

async function verifyOrganizedFiles(targetDir: string, organizedFiles: string[]) {
  // Check if files exist in expected locations
  for (const file of organizedFiles) {
    try {
      await fs.access(file);
      console.log(`✓ File exists: ${file}`);

      // Check metadata
      const metadataPath = `${file}.metadata.json`;
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      console.log(`✓ Metadata verified for ${file}:`, metadata);
    } catch (err) {
      throw new Error(`Failed to verify file ${file}: ${err}`);
    }
  }

  // List all files in target directory
  const allFiles = await fs.readdir(targetDir, { recursive: true });
  console.log('All files in target directory:', allFiles);
}

async function runTests() {
  let server: DocumentOrganizerServer | null = null;

  try {
    console.log('Setting up test environment...');
    const { testDir, targetDir } = await setupTestFiles();

    console.log('Starting document organizer server...');
    server = new DocumentOrganizerServer();
    await server.start();

    console.log('Testing document organization...');
    const result = await server['organizer'].organizeDocuments(
      testDir,
      targetDir,
      true,
      true
    );

    console.log('Organization result:', JSON.stringify(result, null, 2));

    if (result.success) {
      await verifyOrganizedFiles(targetDir, result.organizedFiles || []);
      console.log('✓ All tests passed');
    } else {
      throw new Error(`Organization failed: ${result.message}`);
    }
  } catch (error) {
    console.error('✗ Test failed:', error);
    process.exit(1);
  } finally {
    if (server) {
      await server.stop();
    }
  }
}

// Run tests
runTests();
