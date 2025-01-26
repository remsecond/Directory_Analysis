const { execSync } = require('child_process');
const { logGitOperation } = require('./sync-logger');

function getChangedFiles() {
    try {
        const output = execSync('git status --porcelain').toString();
        return output.split('\n')
            .filter(line => line.trim())
            .map(line => line.slice(3).trim());
    } catch (error) {
        return [];
    }
}

function gitSync() {
    const errors = [];
    let changedFiles = [];
    
    try {
        // Get list of changed files before committing
        changedFiles = getChangedFiles();
        
        if (changedFiles.length > 0) {
            // Add all changes
            execSync('git add .', { stdio: 'inherit' });
            
            // Create commit with timestamp
            const timestamp = new Date().toISOString();
            execSync(`git commit -m "Update ${timestamp}"`, { stdio: 'inherit' });
            
            // Push changes
            execSync('git push', { stdio: 'inherit' });
            
            console.log(`\nCommitted ${changedFiles.length} files`);
            changedFiles.forEach(file => console.log(`- ${file}`));
        } else {
            console.log('\nNo changes to commit');
        }
        
    } catch (error) {
        const errorMsg = `Git operation failed: ${error.message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
    }
    
    // Log the operation
    logGitOperation(changedFiles, errors);
    
    return {
        success: errors.length === 0,
        files: changedFiles,
        errors
    };
}

// Execute if run directly
if (require.main === module) {
    gitSync();
}

module.exports = gitSync;
