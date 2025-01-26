import { promises as fs } from 'fs';
import * as path from 'path';
import { use_mcp_tool } from '@modelcontextprotocol/sdk/client/index.js';

interface OrganizeResult {
  success: boolean;
  message: string;
  organizedFiles?: string[];
  errors?: string[];
  metadata?: {
    totalFiles: number;
    processedFiles: number;
    duplicatesFound: number;
    newVersions: number;
  };
}

export class AutoOrganizer {
  async organizeDocuments(
    sourcePath: string,
    targetPath: string,
    recursive: boolean = false,
    updateSheet: boolean = true
  ): Promise<OrganizeResult> {
    try {
      // Ensure paths exist
      await fs.access(sourcePath);
      await fs.mkdir(targetPath, { recursive: true });

      const organizedFiles: string[] = [];
      const errors: string[] = [];
      const metadata = {
        totalFiles: 0,
        processedFiles: 0,
        duplicatesFound: 0,
        newVersions: 0
      };

      const files = await this.getFiles(sourcePath, recursive);
      metadata.totalFiles = files.length;
      
      for (const file of files) {
        try {
          const stats = await fs.stat(file);
          if (!stats.isFile()) continue;

          // Calculate file hash for duplicate/version detection
          const fileContent = await fs.readFile(file);
          const hash = require('crypto').createHash('sha256').update(fileContent).digest('hex');
          
          // Get file metadata
          const ext = path.extname(file);
          const created = stats.birthtime;
          const modified = stats.mtime;
          
          // Check for duplicates and versions
          const isDuplicate = await this.checkDuplicate(targetPath, hash);
          const isNewVersion = !isDuplicate && await this.checkNewVersion(targetPath, file);
          
          if (isDuplicate) {
            metadata.duplicatesFound++;
            continue;
          }
          
          if (isNewVersion) {
            metadata.newVersions++;
          }
          
          // Create year/month/type folder structure
          const year = modified.getFullYear().toString();
          const month = (modified.getMonth() + 1).toString().padStart(2, '0');
          const typeFolder = this.getTypeFolder(ext);
          
          const destFolder = path.join(targetPath, year, month, typeFolder);
          await fs.mkdir(destFolder, { recursive: true });

          // Generate organized filename with metadata
          const destName = this.generateFileName(file, isNewVersion);
          const destPath = path.join(destFolder, destName);
          
          // Copy file and update metadata
          await fs.copyFile(file, destPath);
          await this.updateMetadata(destPath, {
            hash,
            created,
            modified,
            originalName: path.basename(file),
            isVersion: isNewVersion
          });
          
          organizedFiles.push(destPath);
          metadata.processedFiles++;
          
          // Update Google Sheet if requested
          if (updateSheet) {
            await this.updateGoogleSheet(destPath, {
              hash,
              created,
              modified,
              originalName: path.basename(file),
              isVersion: isNewVersion
            });
          }
        } catch (err: any) {
          errors.push(`Error processing ${file}: ${err?.message || 'Unknown error'}`);
        }
      }

      return {
        success: true,
        message: `Successfully organized ${metadata.processedFiles} files`,
        organizedFiles,
        errors: errors.length > 0 ? errors : undefined,
        metadata
      };

    } catch (error: any) {
      return {
        success: false,
        message: `Failed to organize documents: ${error?.message || 'Unknown error'}`,
        errors: [error?.message || 'Unknown error']
      };
    }
  }

  private async getFiles(dir: string, recursive: boolean): Promise<string[]> {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const dirent of dirents) {
      const res = path.resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        if (recursive) {
          files.push(...await this.getFiles(res, recursive));
        }
      } else {
        files.push(res);
      }
    }

    return files;
  }

  private async checkDuplicate(targetPath: string, hash: string): Promise<boolean> {
    try {
      // Read metadata files in target directory recursively
      const allFiles = await this.getFiles(targetPath, true);
      for (const file of allFiles) {
        const metadataPath = `${file}.metadata.json`;
        try {
          const metadataContent = await fs.readFile(metadataPath, 'utf8');
          const metadata = JSON.parse(metadataContent);
          if (metadata.hash === hash) {
            return true;
          }
        } catch (err) {
          // Metadata file doesn't exist or is invalid, continue checking
          continue;
        }
      }
      return false;
    } catch (err) {
      return false; // In case of errors, assume no duplicate
    }
  }

  private async checkNewVersion(targetPath: string, filePath: string): Promise<boolean> {
    try {
      const fileName = path.basename(filePath, path.extname(filePath));
      const baseNameMatch = fileName.match(/^(.+?)(?:-v\d+)?$/);
      if (!baseNameMatch) return false;
      
      const baseName = baseNameMatch[1];
      const allFiles = await this.getFiles(targetPath, true);
      
      // Check if any existing file matches the base name pattern
      return allFiles.some(file => {
        const existingName = path.basename(file, path.extname(file));
        const existingMatch = existingName.match(/^(.+?)(?:-v\d+)?$/);
        return existingMatch && existingMatch[1] === baseName;
      });
    } catch (err) {
      return false; // In case of errors, assume not a new version
    }
  }

  private generateFileName(filePath: string, isNewVersion: boolean): string {
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    
    if (!isNewVersion) {
      return `${baseName}${ext}`;
    }

    // Extract version number if it exists
    const versionMatch = baseName.match(/^(.+?)-v(\d+)$/);
    if (versionMatch) {
      const [, name, version] = versionMatch;
      const newVersion = parseInt(version) + 1;
      return `${name}-v${newVersion}${ext}`;
    }

    // First version
    return `${baseName}-v1${ext}`;
  }

  private async updateMetadata(filePath: string, metadata: any): Promise<void> {
    const metadataPath = `${filePath}.metadata.json`;
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private async updateGoogleSheet(filePath: string, metadata: any): Promise<void> {
    try {
      const row = {
        path: filePath,
        name: path.basename(filePath),
        type: this.getTypeFolder(path.extname(filePath)),
        created: metadata.created.toISOString(),
        modified: metadata.modified.toISOString(),
        hash: metadata.hash,
        isVersion: metadata.isVersion,
        originalName: metadata.originalName
      };

      await use_mcp_tool('google-sheets', 'appendRow', {
        sheetName: 'Documents',
        rowData: row
      });
    } catch (err) {
      console.error('Failed to update Google Sheet:', err);
      // Don't throw - sheet updates are non-critical
    }
  }

  private getTypeFolder(ext: string): string {
    const typeMap: { [key: string]: string } = {
      // Documents
      '.pdf': 'documents',
      '.doc': 'documents',
      '.docx': 'documents',
      '.txt': 'documents',
      '.rtf': 'documents',
      
      // Images
      '.jpg': 'images',
      '.jpeg': 'images',
      '.png': 'images',
      '.gif': 'images',
      '.bmp': 'images',
      
      // Spreadsheets
      '.xls': 'spreadsheets',
      '.xlsx': 'spreadsheets',
      '.csv': 'spreadsheets',
      
      // Presentations
      '.ppt': 'presentations',
      '.pptx': 'presentations',
      
      // Archives
      '.zip': 'archives',
      '.rar': 'archives',
      '.7z': 'archives',
      
      // Code
      '.js': 'code',
      '.ts': 'code',
      '.py': 'code',
      '.java': 'code',
      '.cpp': 'code',
      '.cs': 'code',
    };

    return typeMap[ext.toLowerCase()] || 'other';
  }
}
