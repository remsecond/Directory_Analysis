import fs from 'fs/promises';
import path from 'path';

const PROFILE_PATH = "C:\\Users\\robmo\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\nfc6dadr.default";

// Helper to parse preference value
function parsePreferenceValue(value) {
    try {
        return JSON.parse(value);
    } catch {
        return value.replace(/^"(.*)"$/, '$1');
    }
}

// Helper to format preference for output
function formatPreference(pref) {
    const match = pref.match(/user_pref\("([^"]+)",\s*([^)]+)\)/);
    if (!match) return null;
    const [_, name, rawValue] = match;
    return {
        name,
        value: parsePreferenceValue(rawValue)
    };
}

async function analyzeProfile() {
    console.log('Analyzing Firefox Profile:', PROFILE_PATH);
    
    try {
        // Read prefs.js for preferences
        const prefsPath = path.join(PROFILE_PATH, 'prefs.js');
        const prefs = await fs.readFile(prefsPath, 'utf8');
        
        // Parse and categorize preferences
        const allPrefs = prefs.match(/user_pref\("[^"]+",\s*[^)]+\)/g) || [];
        const prefsByCategory = {
            privacy: [],
            security: [],
            network: [],
            dom: [],
            browser: [],
            javascript: [],
            media: [],
            webgl: [],
            other: []
        };

        allPrefs.forEach(pref => {
            const formatted = formatPreference(pref);
            if (!formatted) return;

            if (formatted.name.startsWith('privacy.')) {
                prefsByCategory.privacy.push(formatted);
            } else if (formatted.name.startsWith('security.')) {
                prefsByCategory.security.push(formatted);
            } else if (formatted.name.startsWith('network.')) {
                prefsByCategory.network.push(formatted);
            } else if (formatted.name.startsWith('dom.')) {
                prefsByCategory.dom.push(formatted);
            } else if (formatted.name.startsWith('browser.')) {
                prefsByCategory.browser.push(formatted);
            } else if (formatted.name.startsWith('javascript.')) {
                prefsByCategory.javascript.push(formatted);
            } else if (formatted.name.startsWith('media.')) {
                prefsByCategory.media.push(formatted);
            } else if (formatted.name.startsWith('webgl.')) {
                prefsByCategory.webgl.push(formatted);
            } else {
                prefsByCategory.other.push(formatted);
            }
        });

        // Output preferences by category
        console.log('\nFirefox Profile Configuration Analysis');
        console.log('=====================================');
        
        Object.entries(prefsByCategory).forEach(([category, prefs]) => {
            if (prefs.length > 0) {
                console.log(`\n${category.toUpperCase()} Settings:`);
                prefs.forEach(({name, value}) => {
                    console.log(`${name}: ${value}`);
                });
            }
        });

        // Analyze important Puppeteer-relevant settings
        console.log('\nPuppeteer-Relevant Settings Analysis');
        console.log('==================================');
        
        const puppeteerRelevant = {
            'JavaScript Enabled': !prefsByCategory.javascript.some(p => p.name === 'javascript.enabled' && p.value === false),
            'Cookies Allowed': !prefsByCategory.network.some(p => p.name === 'network.cookie.cookieBehavior' && p.value !== 0),
            'Pop-ups Blocked': prefsByCategory.dom.some(p => p.name === 'dom.disable_open_during_load' && p.value === true),
            'Geolocation Enabled': !prefsByCategory.geo?.some(p => p.name === 'geo.enabled' && p.value === false),
            'WebGL Enabled': !prefsByCategory.webgl.some(p => p.name === 'webgl.disabled' && p.value === true)
        };

        Object.entries(puppeteerRelevant).forEach(([feature, enabled]) => {
            console.log(`${feature}: ${enabled ? 'Yes' : 'No'}`);
        });
        
        // Check for extensions
        const extensionsPath = path.join(PROFILE_PATH, 'extensions');
        try {
            const extensions = await fs.readdir(extensionsPath);
            console.log('\nInstalled Extensions:');
            extensions.forEach(ext => console.log(`- ${ext}`));
        } catch (err) {
            console.log('\nNo extensions installed');
        }
        
        // Check for custom configurations
        console.log('\nCustom Configurations:');
        const files = ['permissions.sqlite', 'cert9.db', 'content-prefs.sqlite', 'cookies.sqlite'];
        for (const file of files) {
            const exists = await fs.access(path.join(PROFILE_PATH, file))
                .then(() => true)
                .catch(() => false);
            console.log(`- ${file}: ${exists ? 'Present' : 'Not present'}`);
        }
    } catch (error) {
        console.error('Error analyzing profile:', error);
    }
}

analyzeProfile().catch(console.error);
