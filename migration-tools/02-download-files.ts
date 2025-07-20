import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANT: Update this with your Replit project URL
const REPLIT_PROJECT_URL = 'https://YOUR-PROJECT-NAME.YOUR-USERNAME.repl.co';

interface FileToDownload {
  remotePath: string;
  localPath: string;
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(destPath).catch(() => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

async function downloadReplitFiles() {
  console.log('📥 Starting file download from Replit...\n');
  
  if (REPLIT_PROJECT_URL.includes('YOUR-PROJECT-NAME')) {
    console.error('❌ Please update REPLIT_PROJECT_URL with your actual Replit project URL');
    console.log('\nTo find your Replit project URL:');
    console.log('1. Go to your Replit project');
    console.log('2. Click the "Run" button');
    console.log('3. Copy the URL from the webview (e.g., https://portfolio.username.repl.co)');
    process.exit(1);
  }
  
  const downloadDir = path.join(__dirname, 'replit-files');
  
  // List all files to download based on the directory structure found
  const filesToDownload: FileToDownload[] = [];
  
  // Get list of files from the uploads directory
  const uploadDirs = ['carousel', 'chatbot', 'projects', 'resumes'];
  
  console.log('📋 Preparing download list...');
  console.log('\nNOTE: This script will attempt to download files from your Replit project.');
  console.log('If files are not publicly accessible, you may need to:');
  console.log('1. Download them manually from Replit');
  console.log('2. Use Replit\'s export feature');
  console.log('3. Set up a temporary API endpoint to list and serve files\n');
  
  // Create directories
  for (const dir of uploadDirs) {
    const dirPath = path.join(downloadDir, 'uploads', dir);
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
  
  // Create a file list for manual download
  const fileListPath = path.join(downloadDir, 'files-to-download.txt');
  const fileList = `Files to Download from Replit
================================

Please manually download these directories from your Replit project:

1. /uploads/carousel/ (15 files)
2. /uploads/chatbot/ (33 files)
3. /uploads/projects/ (30 files)
4. /uploads/resumes/ (1 file)
5. /chroma_db/ (all files)

Instructions:
1. Open your Replit project
2. Use the file explorer to navigate to each directory
3. Download the files to the corresponding folders in:
   ${downloadDir}

Alternative method:
1. In Replit, create a ZIP file of these directories
2. Download the ZIP file
3. Extract to ${downloadDir}
`;
  
  await fs.writeFile(fileListPath, fileList);
  console.log(`\n📝 Created download instructions: ${fileListPath}`);
  
  // Create a script to help with ChromaDB
  const chromaBackupScript = `#!/bin/bash
# ChromaDB Backup Script for Replit

echo "Creating ChromaDB backup..."
cd /home/runner/YOUR-PROJECT-NAME
tar -czf chroma_db_backup.tar.gz chroma_db/
echo "Backup created: chroma_db_backup.tar.gz"
echo "Download this file from Replit and extract to migration-tools/replit-files/"
`;
  
  const chromaScriptPath = path.join(downloadDir, 'backup-chromadb.sh');
  await fs.writeFile(chromaScriptPath, chromaBackupScript);
  console.log(`📝 Created ChromaDB backup script: ${chromaScriptPath}`);
}

// Alternative: Create an API endpoint helper
async function createDownloadEndpoint() {
  const endpointCode = `// Add this temporary endpoint to your Replit server/routes.ts

app.get('/api/export/files', async (req, res) => {
  const archiver = require('archiver');
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  res.attachment('replit-files-export.zip');
  archive.pipe(res);
  
  // Add directories
  archive.directory('uploads/', 'uploads');
  archive.directory('chroma_db/', 'chroma_db');
  
  await archive.finalize();
});

// Then visit: ${REPLIT_PROJECT_URL}/api/export/files
`;
  
  const endpointPath = path.join(__dirname, 'replit-files', 'export-endpoint.js');
  await fs.mkdir(path.dirname(endpointPath), { recursive: true });
  await fs.writeFile(endpointPath, endpointCode);
  console.log(`\n💡 Alternative: Add this endpoint to your Replit project for easy export`);
  console.log(`📝 Endpoint code saved to: ${endpointPath}`);
}

// Run download
downloadReplitFiles().then(() => createDownloadEndpoint());