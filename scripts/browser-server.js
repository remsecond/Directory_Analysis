import { exec } from 'child_process';

const firefoxProfile = "C:\\Users\\robmo\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\nfc6dadr.default";

// Use PowerShell's Start-Process to launch Firefox
const command = `powershell -Command "Start-Process 'C:\\Program Files\\Mozilla Firefox\\firefox.exe' -ArgumentList '-profile','${firefoxProfile}','-no-remote','https://accounts.google.com'"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Error launching Firefox:', error);
    return;
  }
  console.log('Firefox launched with profile:', firefoxProfile);
});
