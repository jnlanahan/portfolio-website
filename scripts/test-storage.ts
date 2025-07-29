#!/usr/bin/env tsx

console.log("🧪 Testing storage directly...");

try {
  const { storage } = await import("../server/storage");
  
  console.log("📦 Getting all projects from storage...");
  const projects = await storage.getAllProjects();
  
  console.log(`✅ Found ${projects.length} projects in storage:`);
  projects.forEach((project, index) => {
    console.log(`${index + 1}. "${project.title}"`);
    console.log(`   Slug: ${project.slug}`);
    console.log(`   Status: ${project.status}`);
    console.log(`   Featured: ${project.featured}`);
    console.log('');
  });
  
  console.log("🔍 Testing published filter...");
  const publishedProjects = projects.filter(project => project.status === "published");
  console.log(`📊 Found ${publishedProjects.length} published projects`);
  
} catch (error) {
  console.error("❌ Error testing storage:", error);
}