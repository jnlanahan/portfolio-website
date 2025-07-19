# Supabase Database Setup Instructions

## Steps to Set Up Your Database in Supabase

### 1. Access Supabase SQL Editor
- Log into your Supabase project
- Go to the SQL Editor (left sidebar)

### 2. Run the Schema
- Copy the entire contents of `supabase-schema.sql`
- Paste it into the SQL Editor
- Click "Run" to execute

### 3. Get Your Database Credentials
After the schema is created:
1. Go to Settings → Database
2. Copy the following:
   - **Connection string**: Under "Connection string" section, copy the URI
   - **Direct connection**: You'll see values for Host, Database name, Port, User, Password

### 4. Update Your Local .env File
Create a `.env` file in your project root (copy from `.env.example`):

```env
# Replace with your Supabase connection string
DATABASE_URL=postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:5432/postgres

# Individual PostgreSQL credentials (from Direct connection)
PGHOST=aws-0-[region].pooler.supabase.com
PGPORT=5432
PGDATABASE=postgres
PGUSER=postgres.[your-project-ref]
PGPASSWORD=[your-password]

# Keep your existing secrets
SESSION_SECRET=[your-session-secret]
ADMIN_USERNAME=[your-admin-username]
ADMIN_PASSWORD=[your-admin-password]
OPENAI_API_KEY=[your-openai-key]
LANGCHAIN_PROJECT_ID=[your-langchain-project-id]
LANGCHAIN_API_KEY=[your-langchain-api-key]
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_PROJECT=[your-langchain-project]
LANGCHAIN_TRACING_V2=true
GMAIL_USER=[your-gmail]
GMAIL_APP_PASSWORD=[your-gmail-app-password]
```

### 5. Test Database Connection Locally
```bash
npm run dev
```

The application should connect to your new Supabase database.

### 6. Migrate Existing Data (If Needed)
If you have existing data in your Neon database that you want to preserve:
1. Export data from Neon using pg_dump or their export feature
2. Import into Supabase using the SQL Editor

## Important Notes
- Supabase uses connection pooling by default
- The free tier includes 500MB database storage
- Enable Row Level Security (RLS) for production use
- Consider setting up database backups in Supabase dashboard

## Troubleshooting
- If connection fails, check that your IP is allowed in Supabase (Settings → Database → Connection Pooling)
- Ensure you're using the correct connection string format
- Check that all environment variables are properly set