"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoOrganizer = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
class AutoOrganizer {
    async organizeDocuments(sourcePath, targetPath, recursive = false, updateSheet = true) {
        try {
            // Ensure paths exist
            await fs_1.promises.access(sourcePath);
            await fs_1.promises.mkdir(targetPath, { recursive: true });
            const organizedFiles = [];
            const errors = [];
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
                    const stats = await fs_1.promises.stat(file);
                    if (!stats.isFile())
                        continue;
                    // Calculate file hash for duplicate/version detection
                    const fileContent = await fs_1.promises.readFile(file);
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
                    await fs_1.promises.mkdir(destFolder, { recursive: true });
                    // Generate organized filename with metadata
                    const destName = this.generateFileName(file, isNewVersion);
                    const destPath = path.join(destFolder, destName);
                    // Copy file and update metadata
                    await fs_1.promises.copyFile(file, destPath);
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
                }
                catch (err) {
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
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to organize documents: ${error?.message || 'Unknown error'}`,
                errors: [error?.message || 'Unknown error']
            };
        }
    }
    async getFiles(dir, recursive) {
        const dirents = await fs_1.promises.readdir(dir, { withFileTypes: true });
        const files = [];
        for (const dirent of dirents) {
            const res = path.resolve(dir, dirent.name);
            if (dirent.isDirectory()) {
                if (recursive) {
                    files.push(...await this.getFiles(res, recursive));
                }
            }
            else {
                files.push(res);
            }
        }
        return files;
    }
    async checkDuplicate(targetPath, hash) {
        try {
            // Read metadata files in target directory recursively
            const allFiles = await this.getFiles(targetPath, true);
            for (const file of allFiles) {
                const metadataPath = `${file}.metadata.json`;
                try {
                    const metadataContent = await fs_1.promises.readFile(metadataPath, 'utf8');
                    const metadata = JSON.parse(metadataContent);
                    if (metadata.hash === hash) {
                        return true;
                    }
                }
                catch (err) {
                    // Metadata file doesn't exist or is invalid, continue checking
                    continue;
                }
            }
            return false;
        }
        catch (err) {
            return false; // In case of errors, assume no duplicate
        }
    }
    async checkNewVersion(targetPath, filePath) {
        try {
            const fileName = path.basename(filePath, path.extname(filePath));
            const baseNameMatch = fileName.match(/^(.+?)(?:-v\d+)?$/);
            if (!baseNameMatch)
                return false;
            const baseName = baseNameMatch[1];
            const allFiles = await this.getFiles(targetPath, true);
            // Check if any existing file matches the base name pattern
            return allFiles.some(file => {
                const existingName = path.basename(file, path.extname(file));
                const existingMatch = existingName.match(/^(.+?)(?:-v\d+)?$/);
                return existingMatch && existingMatch[1] === baseName;
            });
        }
        catch (err) {
            return false; // In case of errors, assume not a new version
        }
    }
    generateFileName(filePath, isNewVersion) {
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
    async updateMetadata(filePath, metadata) {
        const metadataPath = `${filePath}.metadata.json`;
        await fs_1.promises.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    }
    async updateGoogleSheet(filePath, metadata) {
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
            await (0, index_js_1.use_mcp_tool)('google-sheets', 'appendRow', {
                sheetName: 'Documents',
                rowData: row
            });
        }
        catch (err) {
            console.error('Failed to update Google Sheet:', err);
            // Don't throw - sheet updates are non-critical
        }
    }
    getTypeFolder(ext) {
        const typeMap = {
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
exports.AutoOrganizer = AutoOrganizer;
//# sourceMappingURL=auto-organizer.js.map