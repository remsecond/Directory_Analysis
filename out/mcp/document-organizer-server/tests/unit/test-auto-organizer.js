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
const chai_1 = require("chai");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const auto_organizer_js_1 = require("../../auto-organizer.js");
describe('AutoOrganizer', () => {
    const testDir = path.join(__dirname, '../fixtures/sample-files');
    const targetDir = path.join(__dirname, '../fixtures/organized');
    let organizer;
    before(async () => {
        organizer = new auto_organizer_js_1.AutoOrganizer();
        // Ensure target directory exists and is empty
        await fs_1.promises.mkdir(targetDir, { recursive: true });
        await cleanDirectory(targetDir);
    });
    after(async () => {
        // Clean up test output
        await cleanDirectory(targetDir);
    });
    it('should organize documents into structured folders', async () => {
        const result = await organizer.organizeDocuments(testDir, targetDir);
        (0, chai_1.expect)(result.success).to.be.true;
        (0, chai_1.expect)(result.metadata?.processedFiles).to.be.greaterThan(0);
        // Verify organized structure
        const files = await getAllFiles(targetDir);
        (0, chai_1.expect)(files.length).to.equal(result.metadata?.processedFiles);
        // Check metadata files were created
        const metadataFiles = files.filter(f => f.endsWith('.metadata.json'));
        (0, chai_1.expect)(metadataFiles.length).to.equal(result.metadata?.processedFiles);
    });
    it('should detect and handle duplicates', async () => {
        const result = await organizer.organizeDocuments(testDir, targetDir);
        (0, chai_1.expect)(result.success).to.be.true;
        (0, chai_1.expect)(result.metadata?.duplicatesFound).to.be.greaterThan(0);
    });
    it('should detect and handle versions', async () => {
        const result = await organizer.organizeDocuments(testDir, targetDir);
        (0, chai_1.expect)(result.success).to.be.true;
        (0, chai_1.expect)(result.metadata?.newVersions).to.be.greaterThan(0);
        // Verify version naming
        const files = await getAllFiles(targetDir);
        const versionedFiles = files.filter(f => f.match(/-v\d+\./));
        (0, chai_1.expect)(versionedFiles.length).to.be.greaterThan(0);
    });
});
async function cleanDirectory(dir) {
    try {
        const files = await fs_1.promises.readdir(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await fs_1.promises.stat(filePath);
            if (stats.isDirectory()) {
                await cleanDirectory(filePath);
                await fs_1.promises.rmdir(filePath);
            }
            else {
                await fs_1.promises.unlink(filePath);
            }
        }
    }
    catch (err) {
        // Directory might not exist
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }
}
async function getAllFiles(dir) {
    const files = [];
    async function traverse(currentDir) {
        const entries = await fs_1.promises.readdir(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                await traverse(fullPath);
            }
            else {
                files.push(fullPath);
            }
        }
    }
    await traverse(dir);
    return files;
}
//# sourceMappingURL=test-auto-organizer.js.map