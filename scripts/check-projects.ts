#!/usr/bin/env tsx

/**
 * Simple script to check what projects are in the database
 */

console.log("🔍 Checking current projects in database...");

try {
  // Try to use the storage directly
  const { storage } = await import("../server/storage");
  
  const projects = await storage.getAllProjects();
  
  console.log(`\n📊 Found ${projects.length} projects in database:\n`);
  
  projects.forEach((project, index) => {
    console.log(`${index + 1}. "${project.title}"`);
    console.log(`   Slug: ${project.slug || '❌ MISSING'}`);
    console.log(`   Featured: ${project.featured ? '⭐' : '➖'}`);
    console.log(`   Status: ${project.status || 'unknown'}`);
    console.log('');
  });
  
  const projectsWithoutSlugs = projects.filter(p => !p.slug);
  if (projectsWithoutSlugs.length > 0) {
    console.log(`⚠️  Warning: ${projectsWithoutSlugs.length} projects have missing slugs and won't have working "View Details" buttons`);
  }
  
} catch (error) {
  console.log("❌ Could not connect to database. Make sure DATABASE_URL is set and the server is running.");
  console.log("💡 Try: Open browser to http://localhost:3000/portfolio and check manually");
}