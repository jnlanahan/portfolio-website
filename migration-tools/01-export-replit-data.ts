import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANT: Update this with your Replit database URL
const REPLIT_DATABASE_URL = process.env.REPLIT_DATABASE_URL || 'postgresql://USER:PASSWORD@HOST:PORT/DATABASE';

async function exportReplitData() {
  console.log('🚀 Starting Replit data export...\n');
  
  if (REPLIT_DATABASE_URL === 'postgresql://USER:PASSWORD@HOST:PORT/DATABASE') {
    console.error('❌ Please update REPLIT_DATABASE_URL with your actual Replit database connection string');
    console.log('\nTo find your Replit database URL:');
    console.log('1. Go to your Replit project');
    console.log('2. Open the Secrets tab (padlock icon)');
    console.log('3. Look for DATABASE_URL or similar');
    console.log('4. Copy the PostgreSQL connection string');
    console.log('5. Update this script or set REPLIT_DATABASE_URL environment variable');
    process.exit(1);
  }

  try {
    // Connect to Replit database
    const replitDb = postgres(REPLIT_DATABASE_URL);
    const db = drizzle(replitDb, { schema });
    
    // Create export directory
    const exportDir = path.join(__dirname, 'replit-export');
    await fs.mkdir(exportDir, { recursive: true });
    
    console.log('📁 Export directory created:', exportDir);
    
    // Export each table
    const tables = [
      { name: 'users', table: schema.users },
      { name: 'security_questions', table: schema.securityQuestions },
      { name: 'projects', table: schema.projects },
      { name: 'blog_series', table: schema.blogSeries },
      { name: 'blog_posts', table: schema.blogPosts },
      { name: 'contact_submissions', table: schema.contactSubmissions },
      { name: 'admins', table: schema.admins },
      { name: 'resume_content', table: schema.resumeContent },
      { name: 'top_five_lists', table: schema.topFiveLists },
      { name: 'top_five_list_items', table: schema.topFiveListItems },
      { name: 'chatbot_documents', table: schema.chatbotDocuments },
      { name: 'chatbot_training_sessions', table: schema.chatbotTrainingSessions },
      { name: 'chatbot_conversations', table: schema.chatbotConversations },
      { name: 'chatbot_training_progress', table: schema.chatbotTrainingProgress },
      { name: 'chatbot_evaluations', table: schema.chatbotEvaluations },
      { name: 'user_feedback', table: schema.userFeedback },
      { name: 'chatbot_learning_insights', table: schema.chatbotLearningInsights },
      { name: 'system_prompt_template', table: schema.systemPromptTemplate },
      { name: 'response_formatting_rules', table: schema.responseFormattingRules },
      { name: 'carousel_images', table: schema.carouselImages }
    ];
    
    for (const { name, table } of tables) {
      console.log(`\n📊 Exporting ${name}...`);
      
      try {
        const data = await db.select().from(table);
        const filePath = path.join(exportDir, `${name}.json`);
        
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ Exported ${data.length} records from ${name}`);
      } catch (error) {
        console.error(`❌ Error exporting ${name}:`, error);
      }
    }
    
    // Create metadata file
    const metadata = {
      exportDate: new Date().toISOString(),
      source: 'Replit',
      tables: tables.map(t => t.name),
      version: '1.0'
    };
    
    await fs.writeFile(
      path.join(exportDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log('\n✅ Database export completed!');
    console.log(`📁 Data exported to: ${exportDir}`);
    
    await replitDb.end();
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

// Run export
exportReplitData();