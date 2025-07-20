import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupFilesAndChromaDB() {
  console.log('📁 Setting up files and ChromaDB...\n');
  
  const sourceDir = path.join(__dirname, 'replit-files');
  const projectRoot = path.join(__dirname, '..');
  
  // Check if source files exist
  try {
    await fs.access(sourceDir);
  } catch {
    console.error(`❌ Source directory not found: ${sourceDir}`);
    console.log('Please download files from Replit first (see 02-download-files.ts)');
    process.exit(1);
  }
  
  console.log('📋 File migration plan:');
  console.log('1. Copy uploads/* to project uploads directory');
  console.log('2. Copy chroma_db/* to project chroma_db directory');
  console.log('3. Fix ChromaDB initialization\n');
  
  // 1. Copy uploads directory
  const uploadsSource = path.join(sourceDir, 'uploads');
  const uploadsDest = path.join(projectRoot, 'uploads');
  
  try {
    await fs.access(uploadsSource);
    console.log('📁 Copying uploads directory...');
    
    // Copy recursively
    await copyDirectory(uploadsSource, uploadsDest);
    console.log('✅ Uploads directory copied successfully');
  } catch (error) {
    console.log('⚠️  No uploads directory found in source');
  }
  
  // 2. Copy ChromaDB directory
  const chromaSource = path.join(sourceDir, 'chroma_db');
  const chromaDest = path.join(projectRoot, 'chroma_db');
  
  try {
    await fs.access(chromaSource);
    console.log('\n📁 Copying ChromaDB directory...');
    
    await copyDirectory(chromaSource, chromaDest);
    console.log('✅ ChromaDB directory copied successfully');
  } catch (error) {
    console.log('⚠️  No chroma_db directory found in source');
    console.log('   You may need to extract it from the backup archive');
  }
  
  // 3. Create ChromaDB fix
  console.log('\n🔧 Creating ChromaDB fix...');
  
  const chromaFixPath = path.join(__dirname, '05-fix-chromadb.ts');
  const chromaFixCode = `import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixChromaDB() {
  console.log('🔧 Fixing ChromaDB for Railway deployment...\\n');
  
  const projectRoot = path.join(__dirname, '..');
  const chromaServicePath = path.join(projectRoot, 'server', 'langchainChatbotService.ts');
  
  // Read the current file
  let content = await fs.readFile(chromaServicePath, 'utf-8');
  
  // Fix 1: Update ChromaDB initialization to use safePath
  console.log('📝 Updating ChromaDB initialization...');
  
  // Find the commented out initialization
  const commentedInit = content.includes('// await initializeChromaDB()');
  
  if (commentedInit) {
    // Uncomment the initialization
    content = content.replace('// await initializeChromaDB()', 'await initializeChromaDB()');
    console.log('✅ Uncommented ChromaDB initialization');
  }
  
  // Fix 2: Update the ChromaDB path in initialization
  const oldPath = "persistDirectory: './chroma_db'";
  const newPath = "persistDirectory: safePath('chroma_db')";
  
  if (content.includes(oldPath)) {
    content = content.replace(oldPath, newPath);
    console.log('✅ Updated ChromaDB path to use safePath');
  }
  
  // Fix 3: Ensure safePath is imported
  if (!content.includes("import { safePath }")) {
    content = content.replace(
      "import { Document } from '@langchain/core/documents';",
      "import { Document } from '@langchain/core/documents';\\nimport { safePath } from './utils/paths.js';"
    );
    console.log('✅ Added safePath import');
  }
  
  // Write the updated file
  await fs.writeFile(chromaServicePath, content);
  console.log('\\n✅ ChromaDB fixes applied!');
  console.log('\\n📋 Next steps:');
  console.log('1. Commit and push these changes');
  console.log('2. Railway will redeploy automatically');
  console.log('3. Your chatbot should now have full context from ChromaDB');
}

fixChromaDB().catch(console.error);
`;
  
  await fs.writeFile(chromaFixPath, chromaFixCode);
  console.log('✅ Created ChromaDB fix script: 05-fix-chromadb.ts');
  
  console.log('\n📋 Summary:');
  console.log('1. Files have been prepared for upload');
  console.log('2. Run 05-fix-chromadb.ts to re-enable ChromaDB');
  console.log('3. Commit and push all changes');
}

async function copyDirectory(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// Run setup
setupFilesAndChromaDB().catch(console.error);