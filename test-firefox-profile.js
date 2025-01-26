import { spawn } from 'child_process';

const firefoxProfile = "C:\\Users\\robmo\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\nfc6dadr.default";
const url = "file:///C:/Users/robmo/Desktop/evidenceai/browser-test.html";

console.log('Launching Firefox with profile:', firefoxProfile);
console.log('Opening URL:', url);

try {
    const firefox = spawn('C:\\Program Files\\Mozilla Firefox\\firefox.exe', [
        '-profile', 
        firefoxProfile,
        url
    ], {
        detached: true,
        stdio: 'ignore'
    });

    firefox.unref();
    console.log('Firefox launched successfully');
} catch (error) {
    console.error('Error launching Firefox:', error);
}
