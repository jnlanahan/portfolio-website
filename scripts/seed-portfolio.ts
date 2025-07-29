#!/usr/bin/env tsx

/**
 * Seeds the database with portfolio projects from the hardcoded data
 * This ensures all projects have proper slugs and can be navigated to
 */

import { getPortfolio } from "../client/src/data/portfolio";

async function seedPortfolio() {
  console.log("🌱 Starting portfolio data seeding...");
  
  try {
    // Import the database and storage modules
    const { storage } = await import("../server/storage");
    
    // Get the hardcoded portfolio data
    const portfolioData = getPortfolio();
    
    console.log(`📦 Found ${portfolioData.length} projects to seed`);
    
    // Get existing projects to avoid duplicates
    const existingProjects = await storage.getAllProjects();
    const existingSlugs = new Set(existingProjects.map(p => p.slug).filter(Boolean));
    
    console.log(`📂 Found ${existingProjects.length} existing projects`);
    
    let seededCount = 0;
    let skippedCount = 0;
    
    for (const project of portfolioData) {
      // Skip if project with this slug already exists
      if (existingSlugs.has(project.slug)) {
        console.log(`⏭️  Skipping "${project.title}" - slug "${project.slug}" already exists`);
        skippedCount++;
        continue;
      }
      
      try {
        // Convert the portfolio data to the database format
        const insertData = {
          title: project.title,
          slug: project.slug,
          shortDescription: project.shortDescription,
          description: project.description,
          image: project.image,
          mediaFiles: project.gallery || [project.image],
          thumbnailIndex: 0,
          technologies: project.technologies,
          tags: [], // Add tags if needed
          demoUrl: project.demoUrl,
          codeUrl: project.codeUrl,
          featured: project.featured || false,
          status: "published" as const,
          date: new Date(project.date),
          client: null,
          customColor: "#007AFF"
        };
        
        const createdProject = await storage.createProject(insertData);
        console.log(`✅ Created project: "${createdProject.title}" with slug "${createdProject.slug}"`);
        seededCount++;
        
      } catch (error) {
        console.error(`❌ Failed to create project "${project.title}":`, error);
      }
    }
    
    console.log(`\n🎉 Seeding completed!`);
    console.log(`   📈 Created: ${seededCount} projects`);
    console.log(`   ⏭️  Skipped: ${skippedCount} projects`);
    console.log(`   📊 Total in database: ${existingProjects.length + seededCount} projects`);
    
  } catch (error) {
    console.error("💥 Error seeding portfolio data:", error);
    process.exit(1);
  }
}

// Run the seeding if this script is executed directly
seedPortfolio().then(() => {
  console.log("✨ Portfolio seeding completed successfully!");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Portfolio seeding failed:", error);
  process.exit(1);
});

export { seedPortfolio };