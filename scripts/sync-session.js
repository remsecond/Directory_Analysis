const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// First, run sync-docs to get latest state
console.log('Getting latest documentation...');
execSync('sync-docs.bat', { stdio: 'inherit' });

// Then analyze docs to understand current state
console.log('\nAnalyzing current state...');
const analyzeResult = require('./analyze-docs.js');

// Create session files
const timestamp = new Date().toISOString();
const sessionDir = 'session_logs';

// Ensure session directory exists
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir);
}

// Create session summary
const sessionSummary = [
    `# Session Started ${timestamp}`,
    '',
    '## Current State',
    '- Files analyzed: ' + analyzeResult.files.length,
    '- Actionable items found: ' + analyzeResult.insights.length,
    '',
    '## Recent Changes',
    ...analyzeResult.insights.slice(0, 5).map(i => `- ${i}`),
    '',
    '## Next Steps',
    ...analyzeResult.insights
        .filter(i => i.toLowerCase().includes('todo') || i.toLowerCase().includes('next'))
        .map(i => `- ${i}`),
].join('\n');

// Write session summary
const summaryPath = path.join(sessionDir, `SESSION_${timestamp.replace(/[:.]/g, '-')}.md`);
fs.writeFileSync(summaryPath, sessionSummary);

console.log(`\nSession summary created: ${summaryPath}`);
console.log('\nReady to start new session!');
