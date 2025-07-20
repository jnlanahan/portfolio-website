import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use your Railway/Supabase database URL
const RAILWAY_DATABASE_URL = process.env.DATABASE_URL || 'postgresql://USER:PASSWORD@HOST:PORT/DATABASE';

async function importToRailway() {
  console.log('🚀 Starting data import to Railway/Supabase...\n');
  
  if (RAILWAY_DATABASE_URL === 'postgresql://USER:PASSWORD@HOST:PORT/DATABASE') {
    console.error('❌ Please set DATABASE_URL environment variable or update RAILWAY_DATABASE_URL');
    console.log('\nYour Railway database URL should be in your Railway project variables');
    process.exit(1);
  }

  try {
    // Connect to Railway database
    const railwayDb = postgres(RAILWAY_DATABASE_URL);
    const db = drizzle(railwayDb, { schema });
    
    const exportDir = path.join(__dirname, 'replit-export');
    
    // Check if export directory exists
    try {
      await fs.access(exportDir);
    } catch {
      console.error(`❌ Export directory not found: ${exportDir}`);
      console.log('Please run 01-export-replit-data.ts first');
      process.exit(1);
    }
    
    // Read metadata
    const metadata = JSON.parse(
      await fs.readFile(path.join(exportDir, 'metadata.json'), 'utf-8')
    );
    
    console.log(`📊 Found export from ${metadata.exportDate}`);
    console.log(`📋 Tables to import: ${metadata.tables.length}\n`);
    
    // Import tables in order (respecting foreign key constraints)
    const importOrder = [
      // Independent tables first
      { name: 'admins', table: schema.admins },
      { name: 'users', table: schema.users },
      { name: 'security_questions', table: schema.securityQuestions },
      { name: 'blog_series', table: schema.blogSeries },
      { name: 'contact_submissions', table: schema.contactSubmissions },
      { name: 'resume_content', table: schema.resumeContent },
      { name: 'chatbot_documents', table: schema.chatbotDocuments },
      { name: 'chatbot_training_sessions', table: schema.chatbotTrainingSessions },
      { name: 'chatbot_training_progress', table: schema.chatbotTrainingProgress },
      { name: 'system_prompt_template', table: schema.systemPromptTemplate },
      { name: 'response_formatting_rules', table: schema.responseFormattingRules },
      { name: 'carousel_images', table: schema.carouselImages },
      { name: 'top_five_lists', table: schema.topFiveLists },
      { name: 'projects', table: schema.projects },
      
      // Dependent tables
      { name: 'blog_posts', table: schema.blogPosts },
      { name: 'top_five_list_items', table: schema.topFiveListItems },
      { name: 'chatbot_conversations', table: schema.chatbotConversations },
      { name: 'chatbot_evaluations', table: schema.chatbotEvaluations },
      { name: 'user_feedback', table: schema.userFeedback },
      { name: 'chatbot_learning_insights', table: schema.chatbotLearningInsights }
    ];
    
    console.log('⚠️  WARNING: This will import data into your Railway database.');
    console.log('Make sure the database is empty or you may get duplicate key errors.\n');
    
    for (const { name, table } of importOrder) {
      const filePath = path.join(exportDir, `${name}.json`);
      
      try {
        // Check if file exists
        await fs.access(filePath);
        
        console.log(`\n📊 Importing ${name}...`);
        const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        
        if (data.length === 0) {
          console.log(`⏭️  No data to import for ${name}`);
          continue;
        }
        
        // Import in batches to avoid issues
        const batchSize = 100;
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          await db.insert(table).values(batch);
          console.log(`  ✅ Imported ${Math.min(i + batchSize, data.length)}/${data.length} records`);
        }
        
        console.log(`✅ Successfully imported ${data.length} records to ${name}`);
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.log(`⏭️  Skipping ${name} (no export file found)`);
        } else if (error.code === '23505') {
          console.error(`❌ Duplicate key error in ${name} - table may already contain data`);
        } else {
          console.error(`❌ Error importing ${name}:`, error.message);
        }
      }
    }
    
    // Update sequences for tables with serial IDs
    console.log('\n🔧 Updating sequences...');
    const sequenceUpdates = [
      "SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))",
      "SELECT setval('security_questions_id_seq', (SELECT MAX(id) FROM security_questions))",
      "SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects))",
      "SELECT setval('blog_series_id_seq', (SELECT MAX(id) FROM blog_series))",
      "SELECT setval('blog_posts_id_seq', (SELECT MAX(id) FROM blog_posts))",
      "SELECT setval('contact_submissions_id_seq', (SELECT MAX(id) FROM contact_submissions))",
      "SELECT setval('admins_id_seq', (SELECT MAX(id) FROM admins))",
      "SELECT setval('resume_content_id_seq', (SELECT MAX(id) FROM resume_content))",
      "SELECT setval('top_five_lists_id_seq', (SELECT MAX(id) FROM top_five_lists))",
      "SELECT setval('top_five_list_items_id_seq', (SELECT MAX(id) FROM top_five_list_items))",
      "SELECT setval('chatbot_documents_id_seq', (SELECT MAX(id) FROM chatbot_documents))",
      "SELECT setval('chatbot_training_sessions_id_seq', (SELECT MAX(id) FROM chatbot_training_sessions))",
      "SELECT setval('chatbot_conversations_id_seq', (SELECT MAX(id) FROM chatbot_conversations))",
      "SELECT setval('chatbot_training_progress_id_seq', (SELECT MAX(id) FROM chatbot_training_progress))",
      "SELECT setval('chatbot_evaluations_id_seq', (SELECT MAX(id) FROM chatbot_evaluations))",
      "SELECT setval('user_feedback_id_seq', (SELECT MAX(id) FROM user_feedback))",
      "SELECT setval('chatbot_learning_insights_id_seq', (SELECT MAX(id) FROM chatbot_learning_insights))",
      "SELECT setval('system_prompt_template_id_seq', (SELECT MAX(id) FROM system_prompt_template))",
      "SELECT setval('response_formatting_rules_id_seq', (SELECT MAX(id) FROM response_formatting_rules))",
      "SELECT setval('carousel_images_id_seq', (SELECT MAX(id) FROM carousel_images))"
    ];
    
    for (const query of sequenceUpdates) {
      try {
        await railwayDb.unsafe(query);
      } catch (error) {
        // Ignore errors for empty tables
      }
    }
    
    console.log('\n✅ Database import completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Upload the files from replit-files/uploads/ to your Railway project');
    console.log('2. Upload the ChromaDB folder from replit-files/chroma_db/');
    console.log('3. Test your application');
    
    await railwayDb.end();
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run import
importToRailway();