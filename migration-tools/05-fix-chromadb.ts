import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixChromaDB() {
  console.log('🔧 Fixing ChromaDB for Railway deployment...\n');
  
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
      "import { Document } from '@langchain/core/documents';\nimport { safePath } from './utils/paths.js';"
    );
    console.log('✅ Added safePath import');
  }
  
  // Write the updated file
  await fs.writeFile(chromaServicePath, content);
  console.log('\n✅ ChromaDB fixes applied!');
  console.log('\n📋 Next steps:');
  console.log('1. Commit and push these changes');
  console.log('2. Railway will redeploy automatically');
  console.log('3. Your chatbot should now have full context from ChromaDB');
}

fixChromaDB().catch(console.error);
