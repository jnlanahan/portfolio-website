/**
 * Blog Series Test Suite
 * Tests all blog series functionality including CRUD operations and API endpoints
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

async function testBlogSeriesAPI() {
  log('Testing blog series API endpoints...');
  
  try {
    // Test GET all series
    log('Testing GET /api/blog/series');
    const getResponse = await fetch(`${BASE_URL}/api/blog/series`);
    if (!getResponse.ok) {
      throw new Error(`GET series failed: ${getResponse.status}`);
    }
    const series = await getResponse.json();
    log(`Found ${series.length} blog series`, 'success');
    
    // Test CREATE series
    log('Testing POST /api/admin/blog/series');
    const testSeries = {
      title: 'Test Series',
      slug: 'test-series',
      description: 'A test blog series for automated testing',
      coverImage: '',
      featured: false,
      published: true,
      position: 1
    };
    
    const createResponse = await fetch(`${BASE_URL}/api/admin/blog/series`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(testSeries)
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`CREATE series failed: ${createResponse.status} - ${errorText}`);
    }
    
    const createdSeries = await createResponse.json();
    log(`Created series with ID: ${createdSeries.id}`, 'success');
    
    // Test GET specific series
    log(`Testing GET /api/blog/series/${createdSeries.id}`);
    const getSpecificResponse = await fetch(`${BASE_URL}/api/blog/series/${createdSeries.id}`);
    if (!getSpecificResponse.ok) {
      throw new Error(`GET specific series failed: ${getSpecificResponse.status}`);
    }
    const specificSeries = await getSpecificResponse.json();
    log(`Retrieved series: ${specificSeries.title}`, 'success');
    
    // Test UPDATE series
    log(`Testing PUT /api/admin/blog/series/${createdSeries.id}`);
    const updateData = {
      title: 'Updated Test Series',
      description: 'Updated description for testing'
    };
    
    const updateResponse = await fetch(`${BASE_URL}/api/admin/blog/series/${createdSeries.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`UPDATE series failed: ${updateResponse.status} - ${errorText}`);
    }
    
    const updatedSeries = await updateResponse.json();
    log(`Updated series title: ${updatedSeries.title}`, 'success');
    
    // Test DELETE series
    log(`Testing DELETE /api/admin/blog/series/${createdSeries.id}`);
    const deleteResponse = await fetch(`${BASE_URL}/api/admin/blog/series/${createdSeries.id}`, {
      method: 'DELETE',
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      throw new Error(`DELETE series failed: ${deleteResponse.status} - ${errorText}`);
    }
    
    log('Series deleted successfully', 'success');
    
    return true;
  } catch (error) {
    logError('Blog series API test failed', error);
    return false;
  }
}

async function testBlogSeriesWithPosts() {
  log('Testing blog series with posts integration...');
  
  try {
    // Create a test series
    const testSeries = {
      title: 'Series with Posts',
      slug: 'series-with-posts',
      description: 'Testing series with blog posts',
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
    
    // Create a test blog post in the series
    const testPost = {
      title: 'Test Post in Series',
      slug: 'test-post-in-series',
      excerpt: 'A test post for series testing',
      content: '<p>This is a test post in a series</p>',
      published: true,
      featured: false,
      seriesId: createdSeries.id,
      seriesPosition: 1,
      tags: ['test'],
      readingTime: 2
    };
    
    const createPostResponse = await fetch(`${BASE_URL}/api/admin/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(testPost)
    });
    
    if (!createPostResponse.ok) {
      const errorText = await createPostResponse.text();
      throw new Error(`Failed to create test post: ${createPostResponse.status} - ${errorText}`);
    }
    
    const createdPost = await createPostResponse.json();
    log(`Created test post: ${createdPost.title}`, 'success');
    
    // Test getting series with posts
    const getSeriesWithPostsResponse = await fetch(`${BASE_URL}/api/blog/series/${createdSeries.id}`);
    if (!getSeriesWithPostsResponse.ok) {
      throw new Error(`Failed to get series with posts: ${getSeriesWithPostsResponse.status}`);
    }
    
    const seriesWithPosts = await getSeriesWithPostsResponse.json();
    log(`Series has ${seriesWithPosts.posts ? seriesWithPosts.posts.length : 0} posts`, 'success');
    
    // Cleanup
    await fetch(`${BASE_URL}/api/admin/blog/${createdPost.id}`, {
      method: 'DELETE',
      headers: { 'Cookie': sessionCookie }
    });
    
    await fetch(`${BASE_URL}/api/admin/blog/series/${createdSeries.id}`, {
      method: 'DELETE',
      headers: { 'Cookie': sessionCookie }
    });
    
    log('Series with posts test completed successfully', 'success');
    return true;
  } catch (error) {
    logError('Series with posts test failed', error);
    return false;
  }
}

async function testBlogSeriesValidation() {
  log('Testing blog series validation...');
  
  try {
    // Test creating series with missing required fields
    const invalidSeries = {
      // Missing title
      slug: 'invalid-series',
      description: 'Invalid series'
    };
    
    const response = await fetch(`${BASE_URL}/api/admin/blog/series`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(invalidSeries)
    });
    
    if (response.ok) {
      throw new Error('Validation should have failed for missing title');
    }
    
    log('Validation correctly rejected invalid series', 'success');
    
    // Test creating series with duplicate slug
    const firstSeries = {
      title: 'First Series',
      slug: 'duplicate-slug',
      description: 'First series with duplicate slug',
      featured: false,
      published: true,
      position: 1
    };
    
    const firstResponse = await fetch(`${BASE_URL}/api/admin/blog/series`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(firstSeries)
    });
    
    if (!firstResponse.ok) {
      throw new Error(`Failed to create first series: ${firstResponse.status}`);
    }
    
    const createdFirstSeries = await firstResponse.json();
    log(`Created first series: ${createdFirstSeries.title}`, 'success');
    
    // Try to create second series with same slug
    const secondSeries = {
      title: 'Second Series',
      slug: 'duplicate-slug',
      description: 'Second series with duplicate slug',
      featured: false,
      published: true,
      position: 2
    };
    
    const secondResponse = await fetch(`${BASE_URL}/api/admin/blog/series`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(secondSeries)
    });
    
    if (secondResponse.ok) {
      log('Warning: Duplicate slug was allowed (may need unique constraint)', 'warn');
    } else {
      log('Duplicate slug correctly rejected', 'success');
    }
    
    // Cleanup
    await fetch(`${BASE_URL}/api/admin/blog/series/${createdFirstSeries.id}`, {
      method: 'DELETE',
      headers: { 'Cookie': sessionCookie }
    });
    
    return true;
  } catch (error) {
    logError('Series validation test failed', error);
    return false;
  }
}

async function runAllTests() {
  log('Starting Blog Series Test Suite', 'info');
  
  const results = {
    adminLogin: false,
    seriesAPI: false,
    seriesWithPosts: false,
    seriesValidation: false
  };
  
  try {
    // Admin login test
    await adminLogin();
    results.adminLogin = true;
    
    // Run all tests
    results.seriesAPI = await testBlogSeriesAPI();
    results.seriesWithPosts = await testBlogSeriesWithPosts();
    results.seriesValidation = await testBlogSeriesValidation();
    
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
      log('All blog series tests passed! 🎉', 'success');
    } else {
      log('Some tests failed. Please check the errors above.', 'error');
    }
    
  } catch (error) {
    logError('Test suite failed', error);
  }
}

// Run the tests
runAllTests();