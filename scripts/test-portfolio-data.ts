#!/usr/bin/env tsx

console.log("🧪 Testing portfolio data import...");

try {
  const { getPortfolio } = await import("../client/src/data/portfolio");
  const projects = getPortfolio();
  
  console.log(`✅ Successfully loaded ${projects.length} projects:`);
  projects.forEach((project, index) => {
    console.log(`${index + 1}. "${project.title}" (slug: ${project.slug})`);
  });
  
} catch (error) {
  console.error("❌ Error loading portfolio data:", error);
}