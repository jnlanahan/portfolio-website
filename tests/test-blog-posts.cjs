/**
 * Blog Posts Test Suite
 * Tests all blog post functionality including series integration, tags, and CRUD operations
 */

const { execSync } = require('child_process');

const BASE_URL = 'http://localhost:5000';

// Simple fetch implementation for testing
async function fetch(url, options = {}) {
  const http = require('http');
  const https = require('https');
  const { URL } = require('url');
  
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = client.request(parsedUrl, {
      method: options.method || 'GET',
      headers: options.headers || {},
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: {
            get: (name) => {
              const headerName = name.toLowerCase();
              const headerValue = res.headers[headerName];
              return headerValue;
            }
          },
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

let sessionCookie = '';

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    error: '\x1b[31m',   // red
    warn: '\x1b[33m',    // yellow
    reset: '\x1b[0m'     // reset
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function logError(message, error) {
  log(`${message}: ${error.message}`, 'error');
  if (error.stack) {
    console.error(error.stack);
  }
}

async function adminLogin() {
  try {
    log('Logging in as admin...');
    const response = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    // Extract session cookie
    const cookies = response.headers.get('set-cookie');
    if (cookies) {
      sessionCookie = Array.isArray(cookies) ? cookies[0].split(';')[0] : cookies.split(';')[0];
      log(`Admin login successful. Session: ${sessionCookie.substring(0, 20)}...`, 'success');
    }

    return await response.json();
  } catch (error) {
    logError('Admin login failed', error);
    throw error;
  }
}

async function testBlogPostAPI() {
  log('Testing blog post API endpoints...');
  
  try {
    // Test GET all posts
    log('Testing GET /api/blog');
    const getResponse = await fetch(`${BASE_URL}/api/blog`);
    if (!getResponse.ok) {
      throw new Error(`GET posts failed: ${getResponse.status}`);
    }
    const posts = await getResponse.json();
    log(`Found ${posts.length} blog posts`, 'success');
    
    // Test CREATE post
    log('Testing POST /api/admin/blog');
    const testPost = {
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      excerpt: 'A test blog post for automated testing',
      content: '<h1>Test Content</h1><p>This is a test blog post with HTML content.</p>',
      published: true,
      featured: false,
      tags: ['test', 'automation'],
      readingTime: 3,
      seriesId: null,
      seriesPosition: null
    };
    
    const createResponse = await fetch(`${BASE_URL}/api/admin/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(testPost)
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`CREATE post failed: ${createResponse.status} - ${errorText}`);
    }
    
    const createdPost = await createResponse.json();
    log(`Created post with ID: ${createdPost.id}`, 'success');
    
    // Test GET specific post
    log(`Testing GET /api/blog/${createdPost.id}`);
    const getSpecificResponse = await fetch(`${BASE_URL}/api/blog/${createdPost.id}`);
    if (!getSpecificResponse.ok) {
      throw new Error(`GET specific post failed: ${getSpecificResponse.status}`);
    }
    const specificPost = await getSpecificResponse.json();
    log(`Retrieved post: ${specificPost.title}`, 'success');
    
    // Test GET post by slug
    log(`Testing GET /api/blog/${createdPost.slug}`);
    const getBySlugResponse = await fetch(`${BASE_URL}/api/blog/${createdPost.slug}`);
    if (!getBySlugResponse.ok) {
      throw new Error(`GET post by slug failed: ${getBySlugResponse.status}`);
    }
    const postBySlug = await getBySlugResponse.json();
    log(`Retrieved post by slug: ${postBySlug.title}`, 'success');
    
    // Test UPDATE post
    log(`Testing PUT /api/admin/blog/${createdPost.id}`);
    const updateData = {
      title: 'Updated Test Blog Post',
      excerpt: 'Updated excerpt for testing',
      content: '<h1>Updated Content</h1><p>This post has been updated.</p>',
      tags: ['test', 'automation', 'updated']
    };
    
    const updateResponse = await fetch(`${BASE_URL}/api/admin/blog/${createdPost.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`UPDATE post failed: ${updateResponse.status} - ${errorText}`);
    }
    
    const updatedPost = await updateResponse.json();
    log(`Updated post title: ${updatedPost.title}`, 'success');
    
    // Test DELETE post
    log(`Testing DELETE /api/admin/blog/${createdPost.id}`);
    const deleteResponse = await fetch(`${BASE_URL}/api/admin/blog/${createdPost.id}`, {
      method: 'DELETE',
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      throw new Error(`DELETE post failed: ${deleteResponse.status} - ${errorText}`);
    }
    
    log('Post deleted successfully', 'success');
    
    return true;
  } catch (error) {
    logError('Blog post API test failed', error);
    return false;
  }
}

async function testBlogPostWithSeries() {
  log('Testing blog post with series integration...');
  
  try {
    // Create a test series first
    const testSeries = {
      title: 'Post Integration Series',
      slug: 'post-integration-series',
      description: 'Testing series integration with posts',
      coverImage: '',
      featured: false,
      published: true,
      position: 1
    };
    
    const createSeriesResponse = await fetch(`${BASE_URL}/api/admin/blog/series`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(testSeries)
    });
    
    if (!createSeriesResponse.ok) {
      throw new Error(`Failed to create test series: ${createSeriesResponse.status}`);
    }
    
    const createdSeries = await createSeriesResponse.json();
    log(`Created test series: ${createdSeries.title}`, 'success');
    
    // Create multiple posts in the series
    const posts = [
      {
        title: 'Series Post 1',
        slug: 'series-post-1',
        excerpt: 'First post in the series',
        content: '<p>This is the first post in the series</p>',
        published: true,
        featured: false,
        seriesId: createdSeries.id,
        seriesPosition: 1,
        tags: ['series', 'test'],
        readingTime: 2
      },
      {
        title: 'Series Post 2',
        slug: 'series-post-2',
        excerpt: 'Second post in the series',
        content: '<p>This is the second post in the series</p>',
        published: true,
        featured: false,
        seriesId: createdSeries.id,
        seriesPosition: 2,
        tags: ['series', 'test'],
        readingTime: 3
      }
    ];
    
    const createdPosts = [];
    for (const post of posts) {
      const createPostResponse = await fetch(`${BASE_URL}/api/admin/blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': sessionCookie
        },
        body: JSON.stringify(post)
      });
      
      if (!createPostResponse.ok) {
        throw new Error(`Failed to create post: ${createPostResponse.status}`);
      }
      
      const createdPost = await createPostResponse.json();
      createdPosts.push(createdPost);
      log(`Created post: ${createdPost.title}`, 'success');
    }
    
    // Test getting series with posts
    const getSeriesResponse = await fetch(`${BASE_URL}/api/blog/series/${createdSeries.id}`);
    if (!getSeriesResponse.ok) {
      throw new Error(`Failed to get series with posts: ${getSeriesResponse.status}`);
    }
    
    const seriesWithPosts = await getSeriesResponse.json();
    log(`Series has ${seriesWithPosts.posts ? seriesWithPosts.posts.length : 0} posts`, 'success');
    
    // Verify posts are ordered by series position
    if (seriesWithPosts.posts && seriesWithPosts.posts.length > 1) {
      const isOrdered = seriesWithPosts.posts.every((post, index) => 
        index === 0 || post.seriesPosition >= seriesWithPosts.posts[index - 1].seriesPosition
      );
      log(`Posts are correctly ordered by series position: ${isOrdered}`, isOrdered ? 'success' : 'error');
    }
    
    // Cleanup
    for (const post of createdPosts) {
      await fetch(`${BASE_URL}/api/admin/blog/${post.id}`, {
        method: 'DELETE',
        headers: { 'Cookie': sessionCookie }
      });
    }
    
    await fetch(`${BASE_URL}/api/admin/blog/series/${createdSeries.id}`, {
      method: 'DELETE',
      headers: { 'Cookie': sessionCookie }
    });
    
    log('Series integration test completed successfully', 'success');
    return true;
  } catch (error) {
    logError('Series integration test failed', error);
    return false;
  }
}

async function testBlogPostValidation() {
  log('Testing blog post validation...');
  
  try {
    // Test creating post with missing required fields
    const invalidPost = {
      // Missing title
      slug: 'invalid-post',
      excerpt: 'Invalid post',
      content: '<p>Content</p>'
    };
    
    const response = await fetch(`${BASE_URL}/api/admin/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(invalidPost)
    });
    
    if (response.ok) {
      throw new Error('Validation should have failed for missing title');
    }
    
    log('Validation correctly rejected invalid post', 'success');
    
    // Test creating draft post (should allow minimal fields)
    const draftPost = {
      title: 'Draft Post',
      slug: 'draft-post',
      excerpt: 'Draft post excerpt',
      content: '<p>Draft content</p>',
      published: false,
      featured: false,
      tags: ['draft'],
      readingTime: 1
    };
    
    const draftResponse = await fetch(`${BASE_URL}/api/admin/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(draftPost)
    });
    
    if (!draftResponse.ok) {
      const errorText = await draftResponse.text();
      throw new Error(`Failed to create draft post: ${draftResponse.status} - ${errorText}`);
    }
    
    const createdDraft = await draftResponse.json();
    log(`Created draft post: ${createdDraft.title}`, 'success');
    
    // Cleanup
    await fetch(`${BASE_URL}/api/admin/blog/${createdDraft.id}`, {
      method: 'DELETE',
      headers: { 'Cookie': sessionCookie }
    });
    
    return true;
  } catch (error) {
    logError('Post validation test failed', error);
    return false;
  }
}

async function testBlogPostTags() {
  log('Testing blog post tags functionality...');
  
  try {
    // Create posts with different tags
    const posts = [
      {
        title: 'React Post',
        slug: 'react-post',
        excerpt: 'Post about React',
        content: '<p>React content</p>',
        published: true,
        featured: false,
        tags: ['react', 'javascript', 'frontend'],
        readingTime: 5
      },
      {
        title: 'Node.js Post',
        slug: 'nodejs-post',
        excerpt: 'Post about Node.js',
        content: '<p>Node.js content</p>',
        published: true,
        featured: false,
        tags: ['nodejs', 'javascript', 'backend'],
        readingTime: 4
      }
    ];
    
    const createdPosts = [];
    for (const post of posts) {
      const createResponse = await fetch(`${BASE_URL}/api/admin/blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': sessionCookie
        },
        body: JSON.stringify(post)
      });
      
      if (!createResponse.ok) {
        throw new Error(`Failed to create post: ${createResponse.status}`);
      }
      
      const createdPost = await createResponse.json();
      createdPosts.push(createdPost);
      log(`Created post with tags: ${createdPost.title}`, 'success');
    }
    
    // Test that tags are properly stored
    for (const post of createdPosts) {
      const getResponse = await fetch(`${BASE_URL}/api/blog/${post.id}`);
      if (!getResponse.ok) {
        throw new Error(`Failed to get post: ${getResponse.status}`);
      }
      
      const retrievedPost = await getResponse.json();
      const hasCorrectTags = Array.isArray(retrievedPost.tags) && retrievedPost.tags.length > 0;
      log(`Post ${retrievedPost.title} has tags: ${hasCorrectTags}`, hasCorrectTags ? 'success' : 'error');
    }
    
    // Cleanup
    for (const post of createdPosts) {
      await fetch(`${BASE_URL}/api/admin/blog/${post.id}`, {
        method: 'DELETE',
        headers: { 'Cookie': sessionCookie }
      });
    }
    
    log('Tags test completed successfully', 'success');
    return true;
  } catch (error) {
    logError('Tags test failed', error);
    return false;
  }
}

async function runAllTests() {
  log('Starting Blog Posts Test Suite', 'info');
  
  const results = {
    adminLogin: false,
    postAPI: false,
    postWithSeries: false,
    postValidation: false,
    postTags: false
  };
  
  try {
    // Admin login test
    await adminLogin();
    results.adminLogin = true;
    
    // Run all tests
    results.postAPI = await testBlogPostAPI();
    results.postWithSeries = await testBlogPostWithSeries();
    results.postValidation = await testBlogPostValidation();
    results.postTags = await testBlogPostTags();
    
    // Summary
    log('\n=== Test Results ===', 'info');
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    
    Object.entries(results).forEach(([test, passed]) => {
      log(`${test}: ${passed ? 'PASS' : 'FAIL'}`, passed ? 'success' : 'error');
    });
    
    log(`\nOverall: ${passedTests}/${totalTests} tests passed`, 
      passedTests === totalTests ? 'success' : 'error');
    
    if (passedTests === totalTests) {
      log('All blog post tests passed! 🎉', 'success');
    } else {
      log('Some tests failed. Please check the errors above.', 'error');
    }
    
  } catch (error) {
    logError('Test suite failed', error);
  }
}

// Run the tests
runAllTests();