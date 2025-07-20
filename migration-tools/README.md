# Migration Guide: Replit to Railway

This guide will help you migrate all your data from Replit to Railway, including:
- PostgreSQL database data (20 tables with projects, top 5 lists, etc.)
- Uploaded files (79 files: images, documents)
- ChromaDB vector database (AI chatbot intelligence)

## 🚀 Quick Start

1. **Get Replit database URL** from your Replit project's Secrets/Environment variables
2. **Export database**: `npx tsx migration-tools/01-export-replit-data.ts`
3. **Download files** from Replit (see Step 2 options below)
4. **Import to Railway**: `npx tsx migration-tools/03-import-to-railway.ts`
5. **Setup files & ChromaDB**: `npx tsx migration-tools/04-upload-files-chromadb.ts`
6. **Fix ChromaDB**: `npx tsx migration-tools/05-fix-chromadb.ts`
7. **Deploy**: `git add . && git commit -m "Migrate all data" && git push`
8. **Verify**: `npx tsx migration-tools/06-verify-migration.ts`

## Prerequisites

1. Access to your Replit project
2. Replit database connection string
3. Railway/Supabase database connection string
4. Node.js installed locally

## Step 1: Export Data from Replit

### 1.1 Get Replit Database URL
1. Go to your Replit project
2. Open Secrets/Environment variables (padlock icon)
3. Find `DATABASE_URL` or similar
4. Copy the PostgreSQL connection string

### 1.2 Run Export Script
```bash
cd migration-tools

# Set your Replit database URL
export REPLIT_DATABASE_URL="postgresql://user:password@host:port/database"

# Run the export
npx tsx 01-export-replit-data.ts
```

This creates a `replit-export/` folder with JSON files for each table.

## Step 2: Download Files from Replit

### Option A: Manual Download
1. Go to your Replit project
2. Download these folders:
   - `/uploads/carousel/`
   - `/uploads/chatbot/`
   - `/uploads/projects/`
   - `/uploads/resumes/`
   - `/chroma_db/`
3. Place them in `migration-tools/replit-files/`

### Option B: Create Export Endpoint (Recommended)
1. Add this temporary endpoint to your Replit `server/routes.ts`:

```typescript
app.get('/api/export/files', async (req, res) => {
  const archiver = require('archiver');
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  res.attachment('replit-files-export.zip');
  archive.pipe(res);
  
  archive.directory('uploads/', 'uploads');
  archive.directory('chroma_db/', 'chroma_db');
  
  await archive.finalize();
});
```

2. Visit: `https://your-project.username.repl.co/api/export/files`
3. Extract the ZIP to `migration-tools/replit-files/`

### Option C: Use Replit Shell
1. Open Shell in Replit
2. Run:
```bash
tar -czf backup.tar.gz uploads/ chroma_db/
```
3. Download `backup.tar.gz` from file explorer
4. Extract to `migration-tools/replit-files/`

## Step 3: Import to Railway/Supabase

### 3.1 Set Railway Database URL
```bash
# Get this from Railway dashboard or Supabase
export DATABASE_URL="postgresql://user:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

### 3.2 Run Import Script
```bash
npx tsx 03-import-to-railway.ts
```

## Step 4: Upload Files to Railway

### 4.1 Copy Files Locally
```bash
npx tsx 04-upload-files-chromadb.ts
```

This copies files from `replit-files/` to your project directories.

### 4.2 Fix ChromaDB
```bash
npx tsx 05-fix-chromadb.ts
```

This re-enables ChromaDB with proper path handling.

## Step 5: Deploy to Railway

1. Commit all changes:
```bash
git add .
git commit -m "Migrate data from Replit: database, files, and ChromaDB"
git push origin main
```

2. Railway will automatically redeploy

## Verification Checklist

After deployment, verify:
- [ ] Projects appear with images
- [ ] Top 5 lists display correctly
- [ ] Carousel images load
- [ ] Chatbot has full context (not basic responses)
- [ ] Admin panel works with existing credentials
- [ ] Contact form submissions are preserved
- [ ] Resume downloads work

## Troubleshooting

### Database Import Errors
- **Duplicate key errors**: Database already has data. Clear it first or skip existing tables.
- **Connection errors**: Check DATABASE_URL is correct and accessible.

### Missing Files
- Ensure all files were downloaded from Replit
- Check file paths in database match uploaded files
- Verify uploads/ directory structure matches original

### ChromaDB Issues
- If chatbot gives basic responses, ChromaDB may not be loaded
- Check logs for ChromaDB initialization errors
- Ensure chroma_db/ folder was copied correctly

### Railway-Specific Issues
- Set environment variables in Railway dashboard
- Ensure PORT is not hardcoded (use process.env.PORT)
- Check build logs in Railway dashboard

## Cleanup

After successful migration:
1. Remove the temporary export endpoint from Replit
2. Keep `migration-tools/` as backup
3. Document any custom changes made

## Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables are set
3. Ensure all files have correct permissions
4. Test locally before deploying