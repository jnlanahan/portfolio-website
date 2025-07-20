import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyMigration() {
  console.log('🔍 Verifying migration results...\n');
  
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable not set');
    process.exit(1);
  }
  
  try {
    const db = postgres(DATABASE_URL);
    const drizzleDb = drizzle(db, { schema });
    
    console.log('📊 Checking database tables...\n');
    
    // Check each table
    const checks = [
      { name: 'Projects', table: schema.projects },
      { name: 'Top Five Lists', table: schema.topFiveLists },
      { name: 'Top Five List Items', table: schema.topFiveListItems },
      { name: 'Carousel Images', table: schema.carouselImages },
      { name: 'Chatbot Documents', table: schema.chatbotDocuments },
      { name: 'Admins', table: schema.admins },
      { name: 'Contact Submissions', table: schema.contactSubmissions }
    ];
    
    for (const { name, table } of checks) {
      try {
        const count = await drizzleDb.select().from(table);
        console.log(`✅ ${name}: ${count.length} records`);
      } catch (error) {
        console.log(`❌ ${name}: Error - ${error.message}`);
      }
    }
    
    console.log('\n📁 Checking file directories...\n');
    
    const projectRoot = path.join(__dirname, '..');
    const directories = [
      'uploads/carousel',
      'uploads/projects', 
      'uploads/chatbot',
      'uploads/resumes',
      'chroma_db'
    ];
    
    for (const dir of directories) {
      const dirPath = path.join(projectRoot, dir);
      try {
        const files = await fs.readdir(dirPath);
        console.log(`✅ ${dir}: ${files.length} files`);
      } catch (error) {
        console.log(`❌ ${dir}: Directory not found`);
      }
    }
    
    console.log('\n🔧 Checking ChromaDB status...\n');
    
    const chromaServicePath = path.join(projectRoot, 'server', 'langchainChatbotService.ts');
    try {
      const content = await fs.readFile(chromaServicePath, 'utf-8');
      const isEnabled = !content.includes('// await initializeChromaDB()');
      console.log(`${isEnabled ? '✅' : '❌'} ChromaDB initialization: ${isEnabled ? 'Enabled' : 'Disabled'}`);
      
      const usesSafePath = content.includes("safePath('chroma_db')");
      console.log(`${usesSafePath ? '✅' : '❌'} Safe path usage: ${usesSafePath ? 'Yes' : 'No'}`);
    } catch (error) {
      console.log('❌ Could not check ChromaDB service file');
    }
    
    // Check if data looks correct
    console.log('\n📋 Sample data check...\n');
    
    try {
      const projects = await drizzleDb.select().from(schema.projects);
      if (projects.length > 0) {
        console.log(`✅ First project: "${projects[0].title}"`);
        console.log(`   Media files: ${projects[0].mediaFiles?.length || 0}`);
      }
    } catch (error) {
      console.log('❌ Could not check project data');
    }
    
    try {
      const topLists = await drizzleDb.select().from(schema.topFiveLists);
      if (topLists.length > 0) {
        console.log(`✅ First top 5 list: "${topLists[0].title}"`);
      }
    } catch (error) {
      console.log('❌ Could not check top 5 lists');
    }
    
    console.log('\n🎉 Migration verification complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy to Railway (git push)');
    console.log('2. Test the live application');
    console.log('3. Verify all features work as expected');
    
    await db.end();
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

// Run verification
verifyMigration();