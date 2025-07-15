/**
 * Test Content Status System
 * Tests draft vs published content filtering
 */

import fetch from 'node-fetch';

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const symbols = { info: '💡', success: '✅', error: '❌', warn: '⚠️' };
  console.log(`${symbols[type]} [${timestamp}] ${message}`);
}

async function testContentSystem() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    // Test public portfolio endpoint (should only show published projects)
    log('Testing public portfolio endpoint...');
    const portfolioResponse = await fetch(`${baseUrl}/api/portfolio`);
    const projects = await portfolioResponse.json();
    
    if (portfolioResponse.ok) {
      log(`✓ Public portfolio endpoint works - returned ${projects.length} projects`);
      
      // Check if all projects are published (no drafts)
      const drafts = projects.filter(p => p.published === false);
      const statusProjects = projects.filter(p => p.status && p.status !== 'published');
      
      if (drafts.length === 0) {
        log('✓ No drafts found in public portfolio (published field check)');
      } else {
        log(`⚠️ Found ${drafts.length} draft projects in public portfolio`);
      }
      
      log(`✓ Status field distribution: ${statusProjects.length} non-published status projects`);
      
      // Show status breakdown
      const statusBreakdown = projects.reduce((acc, p) => {
        acc[p.status || 'undefined'] = (acc[p.status || 'undefined'] || 0) + 1;
        return acc;
      }, {});
      log(`Status breakdown: ${JSON.stringify(statusBreakdown)}`);
      
    } else {
      log(`❌ Public portfolio endpoint failed: ${portfolioResponse.status}`);
    }
    
    // Test public blog endpoint (should only show published posts)
    log('\nTesting public blog endpoint...');
    const blogResponse = await fetch(`${baseUrl}/api/blog`);
    const posts = await blogResponse.json();
    
    if (blogResponse.ok) {
      log(`✓ Public blog endpoint works - returned ${posts.length} posts`);
      
      // Check if all posts are published (no drafts)
      const drafts = posts.filter(p => p.published === false);
      const statusPosts = posts.filter(p => p.status && p.status !== 'published');
      
      if (drafts.length === 0) {
        log('✓ No drafts found in public blog (published field check)');
      } else {
        log(`⚠️ Found ${drafts.length} draft posts in public blog`);
      }
      
      log(`✓ Status field distribution: ${statusPosts.length} non-published status posts`);
      
      if (posts.length > 0) {
        const statusBreakdown = posts.reduce((acc, p) => {
          acc[p.status || 'undefined'] = (acc[p.status || 'undefined'] || 0) + 1;
          return acc;
        }, {});
        log(`Status breakdown: ${JSON.stringify(statusBreakdown)}`);
      }
      
    } else {
      log(`❌ Public blog endpoint failed: ${blogResponse.status}`);
    }
    
    log('\n🎉 Content status system test completed!');
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'error');
  }
}

// Run the test
testContentSystem();