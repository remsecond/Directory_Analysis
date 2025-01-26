const fs = require('fs');
const path = require('path');

const LOG_FILE = '.sync/sync_log.md';
const LOG_DIR = '.sync';

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

// Initialize log file if it doesn't exist
if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '# Sync Operation Log\n\n');
}

function appendToLog(entry) {
    const timestamp = new Date().toISOString();
    const logEntry = `\n## ${entry.type} (${timestamp})\n${entry.details}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
}

function logThoughtsOperation(files, insights) {
    const details = [
        '### Files Analyzed',
        files.map(f => `- ${f}`).join('\n'),
        '',
        '### Insights Found',
        insights.map(i => `- ${i}`).join('\n')
    ].join('\n');

    appendToLog({
        type: 'sync-thoughts',
        details
    });
}

function logDocsOperation(files, errors = []) {
    const details = [
        '### Files Updated',
        files.map(f => `- ${f}`).join('\n'),
        '',
        errors.length ? [
            '### Issues',
            errors.map(e => `- ${e}`).join('\n')
        ].join('\n') : ''
    ].join('\n');

    appendToLog({
        type: 'sync-docs',
        details
    });
}

function logGitOperation(files, errors = []) {
    const details = [
        '### Files Committed',
        files.map(f => `- ${f}`).join('\n'),
        '',
        errors.length ? [
            '### Issues',
            errors.map(e => `- ${e}`).join('\n')
        ].join('\n') : ''
    ].join('\n');

    appendToLog({
        type: 'sync-git',
        details
    });
}

module.exports = {
    logThoughtsOperation,
    logDocsOperation,
    logGitOperation
};
