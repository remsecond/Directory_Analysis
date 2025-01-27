const { execSync } = require('child_process');
const path = require('path');

/**
 * Shows Windows native folder picker dialog and returns selected path
 * @returns {Promise<string|null>} Selected folder path or null if cancelled
 */
async function getFolderPath() {
  try {
    const command = `powershell -noprofile -command "$f=new-object -com shell.application; $p=$f.BrowseForFolder(0,'Select Folder',0,0).self.path; if($p){$p}else{''}"`;
    const result = execSync(command, { encoding: 'utf8' }).trim();
    return result || null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  getFolderPath
};
