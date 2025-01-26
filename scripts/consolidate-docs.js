const fs = require('fs');
const path = require('path');

// Configuration
const sourceDirectories = [
    'docs',
    'simple-pdf-processor',
    'Directory_Analysis',
    'src/mcp',
    'evidenceai-cloud/docs'
];

const targetDirectory = 'documentation';
const excludePatterns = [
    'node_modules',
    '.git',
    'coverage',
    'dist'
];

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDirectory)) {
    fs.mkdirSync(targetDirectory);
    fs.mkdirSync(path.join(targetDirectory, 'current'));
    fs.mkdirSync(path.join(targetDirectory, 'archive'));
}

// Helper to check if path should be excluded
function shouldExclude(filePath) {
    return excludePatterns.some(pattern => filePath.includes(pattern));
}

// Helper to determine if file is documentation
function isDocumentationFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ['.md', '.txt', '.doc', '.docx'].includes(ext);
}

// Helper to create subdirectories
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Copy documentation files
function copyDocumentation(sourcePath, targetPath, isArchived = false) {
    const files = fs.readdirSync(sourcePath);
    
    files.forEach(file => {
        const sourceFilePath = path.join(sourcePath, file);
        const stats = fs.statSync(sourceFilePath);
        
        if (shouldExclude(sourceFilePath)) {
            return;
        }
        
        if (stats.isDirectory()) {
            copyDocumentation(sourceFilePath, targetPath, isArchived);
        } else if (isDocumentationFile(sourceFilePath)) {
            const relativePath = path.relative(process.cwd(), sourceFilePath);
            const targetFilePath = path.join(
                targetPath,
                isArchived ? 'archive' : 'current',
                relativePath
            );
            
            ensureDirectoryExists(path.dirname(targetFilePath));
            fs.copyFileSync(sourceFilePath, targetFilePath);
            
            console.log(`Copied: ${relativePath} -> ${targetFilePath}`);
        }
    });
}

// Main execution
console.log('Starting documentation consolidation...');

sourceDirectories.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`Processing directory: ${dir}`);
        copyDocumentation(dir, targetDirectory);
    }
});

// Create main index
const indexContent = `# EvidenceAI Documentation

This directory contains all documentation for the EvidenceAI project, organized into:

- /current/ - Current, actively maintained documentation
- /archive/ - Historical documentation for reference

## Navigation

- [Core Components](current/docs/CORE_COMPONENTS.md)
- [Getting Started](current/docs/START_HERE.md)
- [Architecture](current/docs/CURRENT_ARCHITECTURE.md)

## Historical Context

Historical documentation is preserved in the /archive/ directory for reference.
`;

fs.writeFileSync(path.join(targetDirectory, 'README.md'), indexContent);

console.log('Documentation consolidation complete.');
console.log(`All documentation is now available in the '${targetDirectory}' directory.`);
