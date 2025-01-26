const fs = require('fs');
const path = require('path');
const logger = require('./sync-logger');

// Function to recursively get all markdown files
function getMarkdownFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!item.startsWith('.') && !item.startsWith('node_modules')) {
                getMarkdownFiles(fullPath, files);
            }
        } else if (item.endsWith('.md')) {
            files.push(fullPath);
        }
    });
    return files;
}

// Function to extract key points from markdown files
function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const filename = path.basename(filePath);
    const insights = [];

    // Look for TODO comments
    const todos = content.match(/TODO:(.+)/g);
    if (todos) {
        todos.forEach(todo => {
            insights.push(`- TODO from ${filename}: ${todo.replace('TODO:', '').trim()}`);
        });
    }

    // Look for section headers
    const headers = content.match(/^#+\s+(.+)$/gm);
    if (headers) {
        headers.forEach(header => {
            if (header.toLowerCase().includes('next') || 
                header.toLowerCase().includes('todo') || 
                header.toLowerCase().includes('pending')) {
                insights.push(`- Section in ${filename}: ${header.replace(/^#+\s+/, '')}`);
            }
        });
    }

    // Look for bullet points with action words
    const bullets = content.match(/^-\s+(.+)$/gm);
    if (bullets) {
        bullets.forEach(bullet => {
            if (bullet.match(/\b(implement|add|create|fix|update|improve|refactor|test)\b/i)) {
                insights.push(`- Action from ${filename}: ${bullet.replace(/^-\s+/, '')}`);
            }
        });
    }

    return insights;
}

// Main analysis
console.log('# Current State Analysis\n');
console.log('Generated from documentation analysis\n');

// Get all markdown files
const docFiles = getMarkdownFiles('.');

// Analyze each file
const allInsights = [];
docFiles.forEach(file => {
    const insights = analyzeFile(file);
    allInsights.push(...insights);
});

// Sort insights by priority (TODOs first, then sections, then actions)
allInsights.sort((a, b) => {
    const aIsTodo = a.includes('TODO');
    const bIsTodo = b.includes('TODO');
    if (aIsTodo && !bIsTodo) return -1;
    if (!aIsTodo && bIsTodo) return 1;
    return a.localeCompare(b);
});

// Log results
logger.logThoughtsSync(docFiles, allInsights);

// Print to console for immediate feedback
allInsights.forEach(insight => console.log(insight));
console.log(`\nAnalyzed ${docFiles.length} documentation files`);
console.log(`Found ${allInsights.length} actionable items`);

// Return data for potential programmatic use
return {
    files: docFiles,
    insights: allInsights
};
