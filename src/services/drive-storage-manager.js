const { google } = require('googleapis');
require('dotenv').config();

class DriveStorageManager {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  async createFolder(name, parentId = null) {
    const folderMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder'
    };

    if (parentId) {
      folderMetadata.parents = [parentId];
    }

    const folder = await this.drive.files.create({
      requestBody: folderMetadata,
      fields: 'id, name'
    });

    return folder.data;
  }

  async uploadFile(filePath, name, parentId = null) {
    const fileMetadata = {
      name
    };

    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const media = {
      body: require('fs').createReadStream(filePath)
    };

    const file = await this.drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name'
    });

    return file.data;
  }

  async moveFile(fileId, newParentId) {
    // Get current parents
    const file = await this.drive.files.get({
      fileId,
      fields: 'parents'
    });

    // Remove old parents and add new parent
    await this.drive.files.update({
      fileId,
      removeParents: file.data.parents.join(','),
      addParents: newParentId,
      fields: 'id, parents'
    });
  }

  async listFiles(folderId, pageSize = 100) {
    const query = folderId ? `'${folderId}' in parents` : null;
    
    const response = await this.drive.files.list({
      q: query,
      pageSize,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime)'
    });

    return response.data.files;
  }

  async deleteFile(fileId) {
    await this.drive.files.delete({
      fileId
    });
  }

  async searchFiles(query, pageSize = 100) {
    const response = await this.drive.files.list({
      q: query,
      pageSize,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime)'
    });

    return response.data.files;
  }

  async getFolderStructure() {
    return {
      root: process.env.ROOT_FOLDER_ID,
      incoming: process.env.INCOMING_FOLDER_ID,
      processing: process.env.PROCESSING_FOLDER_ID,
      completed: process.env.COMPLETED_FOLDER_ID,
      archive: process.env.ARCHIVE_FOLDER_ID
    };
  }
}

module.exports = DriveStorageManager;
