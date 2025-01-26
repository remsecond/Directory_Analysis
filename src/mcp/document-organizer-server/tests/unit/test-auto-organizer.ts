import { expect } from 'chai';
import { promises as fs } from 'fs';
import * as path from 'path';
import { AutoOrganizer } from '../../auto-organizer.js';

describe('AutoOrganizer', () => {
  const testDir = path.join(__dirname, '../fixtures/sample-files');
  const targetDir = path.join(__dirname, '../fixtures/organized');
  let organizer: AutoOrganizer;

  before(async () => {
    organizer = new AutoOrganizer();
    // Ensure target directory exists and is empty
    await fs.mkdir(targetDir, { recursive: true });
    await cleanDirectory(targetDir);
  });

  after(async () => {
    // Clean up test output
    await cleanDirectory(targetDir);
  });

  it('should organize documents into structured folders', async () => {
    const result = await organizer.organizeDocuments(testDir, targetDir);
    
    expect(result.success).to.be.true;
    expect(result.metadata?.processedFiles).to.be.greaterThan(0);
    
    // Verify organized structure
    const files = await getAllFiles(targetDir);
    expect(files.length).to.equal(result.metadata?.processedFiles);
    
    // Check metadata files were created
    const metadataFiles = files.filter(f => f.endsWith('.metadata.json'));
    expect(metadataFiles.length).to.equal(result.metadata?.processedFiles);
  });

  it('should detect and handle duplicates', async () => {
    const result = await organizer.organizeDocuments(testDir, targetDir);
    
    expect(result.success).to.be.true;
    expect(result.metadata?.duplicatesFound).to.be.greaterThan(0);
  });

  it('should detect and handle versions', async () => {
    const result = await organizer.organizeDocuments(testDir, targetDir);
    
    expect(result.success).to.be.true;
    expect(result.metadata?.newVersions).to.be.greaterThan(0);
    
    // Verify version naming
    const files = await getAllFiles(targetDir);
    const versionedFiles = files.filter(f => f.match(/-v\d+\./));
    expect(versionedFiles.length).to.be.greaterThan(0);
  });
});

async function cleanDirectory(dir: string): Promise<void> {
  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        await cleanDirectory(filePath);
        await fs.rmdir(filePath);
      } else {
        await fs.unlink(filePath);
      }
    }
  } catch (err) {
    // Directory might not exist
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err;
    }
  }
}

async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  async function traverse(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }
  
  await traverse(dir);
  return files;
}
