const fs = require('fs');
const path = require('path');
const { logDocsOperation } = require('./sync-logger');

// Function to get all documentation files
function getDocFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!item.startsWith('.') && !item.startsWith('node_modules')) {
                getDocFiles(fullPath, files);
            }
        } else if (item.endsWith('.md')) {
            files.push(fullPath);
        }
    });
    return files;
}

// Function to consolidate documentation
function consolidateDocs() {
    const errors = [];
    const updatedFiles = [];
    
    try {
        // Get all markdown files
        const docFiles = getDocFiles('.');
        
        // Process each file
        docFiles.forEach(file => {
            try {
                // Read and process file
                const content = fs.readFileSync(file, 'utf8');
                
                // Track updated file
                updatedFiles.push(file);
                
                // Here you would add any specific processing logic
                // For now, we're just tracking which files were processed
                
            } catch (err) {
                errors.push(`Error processing ${file}: ${err.message}`);
            }
        });

        // Log the operation
        logDocsOperation(updatedFiles, errors);

        // Print summary
        console.log(`\nProcessed ${updatedFiles.length} documentation files`);
        if (errors.length > 0) {
            console.log('\nErrors encountered:');
            errors.forEach(error => console.log(`- ${error}`));
        }

        return {
            success: errors.length === 0,
            updatedFiles,
            errors
        };

    } catch (err) {
        const error = `Failed to consolidate docs: ${err.message}`;
        errors.push(error);
        console.error(error);
        
        logDocsOperation([], [error]);
        
        return {
            success: false,
            updatedFiles: [],
            errors
        };
    }
}

// Execute if run directly
if (require.main === module) {
    consolidateDocs();
}

module.exports = consolidateDocs;
