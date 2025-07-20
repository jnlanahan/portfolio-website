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

// Fix date fields that come as strings from JSON
function fixDateFields(data: any[], dateFields: string[]): any[] {
  return data.map(record => {
    const fixed = { ...record };
    for (const field of dateFields) {
      if (fixed[field] && typeof fixed[field] === 'string') {
        fixed[field] = new Date(fixed[field]);
      }
    }
    return fixed;
  });
}

async function importToRailway() {
  console.log('🚀 Starting data import to Railway/Supabase (FIXED VERSION)...\n');
  
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
    
    // Import tables with proper date field handling
    const importOrder = [
      // Independent tables first
      { name: 'admins', table: schema.admins, dateFields: ['createdAt'] },
      { name: 'users', table: schema.users, dateFields: [] },
      { name: 'security_questions', table: schema.securityQuestions, dateFields: ['createdAt', 'updatedAt'] },
      { name: 'blog_series', table: schema.blogSeries, dateFields: ['createdAt'] },
      { name: 'contact_submissions', table: schema.contactSubmissions, dateFields: ['createdAt'] },
      { name: 'resume_content', table: schema.resumeContent, dateFields: ['uploadedAt', 'updatedAt'] },
      { name: 'chatbot_documents', table: schema.chatbotDocuments, dateFields: ['uploadedAt'] },
      { name: 'chatbot_training_sessions', table: schema.chatbotTrainingSessions, dateFields: ['createdAt'] },
      { name: 'chatbot_training_progress', table: schema.chatbotTrainingProgress, dateFields: ['lastTrainingDate'] },
      { name: 'system_prompt_template', table: schema.systemPromptTemplate, dateFields: ['createdAt', 'updatedAt'] },
      { name: 'response_formatting_rules', table: schema.responseFormattingRules, dateFields: ['createdAt', 'updatedAt'] },
      { name: 'carousel_images', table: schema.carouselImages, dateFields: ['createdAt', 'updatedAt'] },
      { name: 'top_five_lists', table: schema.topFiveLists, dateFields: ['createdAt'] },
      { name: 'projects', table: schema.projects, dateFields: ['date', 'createdAt'] },
      
      // Dependent tables
      { name: 'blog_posts', table: schema.blogPosts, dateFields: ['date', 'createdAt'] },
      { name: 'top_five_list_items', table: schema.topFiveListItems, dateFields: ['createdAt'] },
      { name: 'chatbot_conversations', table: schema.chatbotConversations, dateFields: ['createdAt'] },
      { name: 'chatbot_evaluations', table: schema.chatbotEvaluations, dateFields: ['evaluatedAt'] },
      { name: 'user_feedback', table: schema.userFeedback, dateFields: ['createdAt'] },
      { name: 'chatbot_learning_insights', table: schema.chatbotLearningInsights, dateFields: ['createdAt'] }
    ];
    
    console.log('⚠️  WARNING: This will import data into your Railway database.');
    console.log('Make sure the database is empty or you may get duplicate key errors.\n');
    
    for (const { name, table, dateFields } of importOrder) {
      const filePath = path.join(exportDir, `${name}.json`);
      
      try {
        // Check if file exists
        await fs.access(filePath);
        
        console.log(`\n📊 Importing ${name}...`);
        let data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        
        if (data.length === 0) {
          console.log(`⏭️  No data to import for ${name}`);
          continue;
        }
        
        // Fix date fields
        data = fixDateFields(data, dateFields);
        
        // Import in batches to avoid issues
        const batchSize = 50;
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
      "SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1))",
      "SELECT setval('security_questions_id_seq', COALESCE((SELECT MAX(id) FROM security_questions), 1))",
      "SELECT setval('projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 1))",
      "SELECT setval('blog_series_id_seq', COALESCE((SELECT MAX(id) FROM blog_series), 1))",
      "SELECT setval('blog_posts_id_seq', COALESCE((SELECT MAX(id) FROM blog_posts), 1))",
      "SELECT setval('contact_submissions_id_seq', COALESCE((SELECT MAX(id) FROM contact_submissions), 1))",
      "SELECT setval('admins_id_seq', COALESCE((SELECT MAX(id) FROM admins), 1))",
      "SELECT setval('resume_content_id_seq', COALESCE((SELECT MAX(id) FROM resume_content), 1))",
      "SELECT setval('top_five_lists_id_seq', COALESCE((SELECT MAX(id) FROM top_five_lists), 1))",
      "SELECT setval('top_five_list_items_id_seq', COALESCE((SELECT MAX(id) FROM top_five_list_items), 1))",
      "SELECT setval('chatbot_documents_id_seq', COALESCE((SELECT MAX(id) FROM chatbot_documents), 1))",
      "SELECT setval('chatbot_training_sessions_id_seq', COALESCE((SELECT MAX(id) FROM chatbot_training_sessions), 1))",
      "SELECT setval('chatbot_conversations_id_seq', COALESCE((SELECT MAX(id) FROM chatbot_conversations), 1))",
      "SELECT setval('chatbot_training_progress_id_seq', COALESCE((SELECT MAX(id) FROM chatbot_training_progress), 1))",
      "SELECT setval('chatbot_evaluations_id_seq', COALESCE((SELECT MAX(id) FROM chatbot_evaluations), 1))",
      "SELECT setval('user_feedback_id_seq', COALESCE((SELECT MAX(id) FROM user_feedback), 1))",
      "SELECT setval('chatbot_learning_insights_id_seq', COALESCE((SELECT MAX(id) FROM chatbot_learning_insights), 1))",
      "SELECT setval('system_prompt_template_id_seq', COALESCE((SELECT MAX(id) FROM system_prompt_template), 1))",
      "SELECT setval('response_formatting_rules_id_seq', COALESCE((SELECT MAX(id) FROM response_formatting_rules), 1))",
      "SELECT setval('carousel_images_id_seq', COALESCE((SELECT MAX(id) FROM carousel_images), 1))"
    ];
    
    for (const query of sequenceUpdates) {
      try {
        await railwayDb.unsafe(query);
      } catch (error) {
        // Ignore errors for sequences that don't exist
      }
    }
    
    console.log('\n✅ Database import completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy your updated code to Railway');
    console.log('2. Test your application');
    console.log('3. Verify all data appears correctly');
    
    await railwayDb.end();
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run import
importToRailway();