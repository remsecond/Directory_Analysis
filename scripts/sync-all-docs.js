const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Function to run shell command and handle errors
function runCommand(command) {
    try {
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error(`Error executing command: ${command}`);
        console.error(error.message);
        return false;
    }
}

async function syncDocs() {
    console.log('Starting documentation sync process...\n');

    // Step 1: Run consolidate-docs.js to gather all documentation
    console.log('1. Consolidating documentation...');
    if (!runCommand('node scripts/consolidate-docs.js')) {
        return;
    }

    // Step 2: Git commit and push
    console.log('\n2. Committing to Git...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    if (!runCommand('git add documentation/') ||
        !runCommand(`git commit -m "Documentation update ${timestamp}"`) ||
        !runCommand('git push')) {
        return;
    }

    // Step 3: Sync to Google Drive using MCP server
    console.log('\n3. Syncing to Google Drive...');
    const syncScript = `
        const fs = require('fs');
        const path = require('path');

        // Function to recursively get all files in a directory
        function getAllFiles(dirPath, arrayOfFiles = []) {
            const files = fs.readdirSync(dirPath);

            files.forEach(file => {
                const fullPath = path.join(dirPath, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    getAllFiles(fullPath, arrayOfFiles);
                } else {
                    arrayOfFiles.push(fullPath);
                }
            });

            return arrayOfFiles;
        }

        // Get all files in documentation directory
        const docFiles = getAllFiles('documentation');
        
        // Upload each file to Google Drive
        docFiles.forEach(file => {
            const relativePath = path.relative('documentation', file);
            process.stdout.write(\`Uploading \${relativePath}...\`);
            
            try {
                process.send({
                    type: 'use_mcp_tool',
                    data: {
                        server_name: 'google-drive',
                        tool_name: 'upload_file',
                        arguments: {
                            local_path: file,
                            drive_path: \`/EvidenceAI Documentation/\${relativePath}\`
                        }
                    }
                });
                console.log(' Done');
            } catch (error) {
                console.error(' Failed:', error.message);
            }
        });
    `;

    fs.writeFileSync('temp-sync.js', syncScript);
    runCommand('node temp-sync.js');
    fs.unlinkSync('temp-sync.js');

    console.log('\nDocumentation sync completed successfully!');
}

syncDocs().catch(console.error);
