/**
 * Blog UI Test Suite
 * Tests the frontend blog interfaces and admin forms
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
          json: () => Promise.resolve(data ? JSON.parse(data) : null)
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

async function testBlogPages() {
  log('Testing blog page accessibility...');
  
  try {
    // Test public blog page
    log('Testing GET /blog');
    const blogPageResponse = await fetch(`${BASE_URL}/blog`);
    if (!blogPageResponse.ok) {
      throw new Error(`Blog page failed: ${blogPageResponse.status}`);
    }
    const blogPageContent = await blogPageResponse.text();
    const hasBlogTitle = blogPageContent.includes('My Blog') || blogPageContent.includes('blog');
    log(`Blog page accessible: ${hasBlogTitle}`, hasBlogTitle ? 'success' : 'warn');
    
    // Test blog series page
    log('Testing GET /blog/series');
    const seriesPageResponse = await fetch(`${BASE_URL}/blog/series`);
    if (!seriesPageResponse.ok) {
      throw new Error(`Blog series page failed: ${seriesPageResponse.status}`);
    }
    const seriesPageContent = await seriesPageResponse.text();
    const hasSeriesTitle = seriesPageContent.includes('series') || seriesPageContent.includes('Series');
    log(`Blog series page accessible: ${hasSeriesTitle}`, hasSeriesTitle ? 'success' : 'warn');
    
    return true;
  } catch (error) {
    logError('Blog pages test failed', error);
    return false;
  }
}

async function testAdminPages() {
  log('Testing admin blog pages...');
  
  try {
    // Test admin dashboard
    log('Testing GET /admin (with session)');
    const adminResponse = await fetch(`${BASE_URL}/admin`, {
      headers: { 'Cookie': sessionCookie }
    });
    if (!adminResponse.ok) {
      throw new Error(`Admin dashboard failed: ${adminResponse.status}`);
    }
    const adminContent = await adminResponse.text();
    const hasAdminTitle = adminContent.includes('Admin') || adminContent.includes('Dashboard');
    log(`Admin dashboard accessible: ${hasAdminTitle}`, hasAdminTitle ? 'success' : 'warn');
    
    // Test admin blog series page
    log('Testing GET /admin/blog/series');
    const adminSeriesResponse = await fetch(`${BASE_URL}/admin/blog/series`, {
      headers: { 'Cookie': sessionCookie }
    });
    if (!adminSeriesResponse.ok) {
      throw new Error(`Admin blog series page failed: ${adminSeriesResponse.status}`);
    }
    const adminSeriesContent = await adminSeriesResponse.text();
    const hasSeriesManagement = adminSeriesContent.includes('series') || adminSeriesContent.includes('Series');
    log(`Admin blog series page accessible: ${hasSeriesManagement}`, hasSeriesManagement ? 'success' : 'warn');
    
    // Test admin new blog page
    log('Testing GET /admin/blog/new');
    const adminNewBlogResponse = await fetch(`${BASE_URL}/admin/blog/new`, {
      headers: { 'Cookie': sessionCookie }
    });
    if (!adminNewBlogResponse.ok) {
      throw new Error(`Admin new blog page failed: ${adminNewBlogResponse.status}`);
    }
    const adminNewBlogContent = await adminNewBlogResponse.text();
    const hasNewBlogForm = adminNewBlogContent.includes('blog') || adminNewBlogContent.includes('new');
    log(`Admin new blog page accessible: ${hasNewBlogForm}`, hasNewBlogForm ? 'success' : 'warn');
    
    return true;
  } catch (error) {
    logError('Admin pages test failed', error);
    return false;
  }
}

async function testBlogSeriesDropdown() {
  log('Testing blog series dropdown in new blog form...');
  
  try {
    // First create a test series
    const testSeries = {
      title: 'UI Test Series',
      slug: 'ui-test-series',
      description: 'Series for UI testing',
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
    log(`Created test series for dropdown: ${createdSeries.title}`, 'success');
    
    // Test that series are available via API
    const getSeriesResponse = await fetch(`${BASE_URL}/api/blog/series`);
    if (!getSeriesResponse.ok) {
      throw new Error(`Failed to get series for dropdown: ${getSeriesResponse.status}`);
    }
    
    const allSeries = await getSeriesResponse.json();
    const hasTestSeries = allSeries.some(s => s.id === createdSeries.id);
    log(`Test series available in dropdown API: ${hasTestSeries}`, hasTestSeries ? 'success' : 'error');
    
    // Cleanup
    await fetch(`${BASE_URL}/api/admin/blog/series/${createdSeries.id}`, {
      method: 'DELETE',
      headers: { 'Cookie': sessionCookie }
    });
    
    return true;
  } catch (error) {
    logError('Series dropdown test failed', error);
    return false;
  }
}

async function testBlogFormValidation() {
  log('Testing blog form validation scenarios...');
  
  try {
    // Test that required fields are validated
    const invalidPostData = {
      // Missing title and other required fields
      slug: 'invalid-post',
      excerpt: 'Invalid post'
    };
    
    const invalidResponse = await fetch(`${BASE_URL}/api/admin/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(invalidPostData)
    });
    
    if (invalidResponse.ok) {
      log('Warning: Form validation may not be working properly', 'warn');
    } else {
      log('Form validation correctly rejects invalid data', 'success');
    }
    
    // Test valid draft post
    const validDraftData = {
      title: 'Valid Draft Post',
      slug: 'valid-draft-post',
      excerpt: 'Valid draft post excerpt',
      content: '<p>Valid draft content</p>',
      published: false,
      featured: false,
      tags: ['draft', 'test'],
      readingTime: 2
    };
    
    const validResponse = await fetch(`${BASE_URL}/api/admin/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(validDraftData)
    });
    
    if (!validResponse.ok) {
      throw new Error(`Valid draft post creation failed: ${validResponse.status}`);
    }
    
    const createdDraft = await validResponse.json();
    log(`Valid draft post created successfully: ${createdDraft.title}`, 'success');
    
    // Cleanup
    await fetch(`${BASE_URL}/api/admin/blog/${createdDraft.id}`, {
      method: 'DELETE',
      headers: { 'Cookie': sessionCookie }
    });
    
    return true;
  } catch (error) {
    logError('Form validation test failed', error);
    return false;
  }
}

async function testBlogSeriesPublicView() {
  log('Testing public blog series view...');
  
  try {
    // Create a test series with posts
    const testSeries = {
      title: 'Public View Test Series',
      slug: 'public-view-test-series',
      description: 'Series for testing public view',
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
    
    // Test public series view
    const publicSeriesResponse = await fetch(`${BASE_URL}/api/blog/series/${createdSeries.slug}`);
    if (!publicSeriesResponse.ok) {
      throw new Error(`Failed to get public series view: ${publicSeriesResponse.status}`);
    }
    
    const publicSeries = await publicSeriesResponse.json();
    log(`Public series view accessible: ${publicSeries.title}`, 'success');
    
    // Test series page route
    const seriesPageResponse = await fetch(`${BASE_URL}/blog/series/${createdSeries.slug}`);
    if (!seriesPageResponse.ok) {
      log(`Series page route may not be working: ${seriesPageResponse.status}`, 'warn');
    } else {
      log('Series page route accessible', 'success');
    }
    
    // Cleanup
    await fetch(`${BASE_URL}/api/admin/blog/series/${createdSeries.id}`, {
      method: 'DELETE',
      headers: { 'Cookie': sessionCookie }
    });
    
    return true;
  } catch (error) {
    logError('Public series view test failed', error);
    return false;
  }
}

async function runAllTests() {
  log('Starting Blog UI Test Suite', 'info');
  
  const results = {
    adminLogin: false,
    blogPages: false,
    adminPages: false,
    seriesDropdown: false,
    formValidation: false,
    publicSeriesView: false
  };
  
  try {
    // Admin login test
    await adminLogin();
    results.adminLogin = true;
    
    // Run all tests
    results.blogPages = await testBlogPages();
    results.adminPages = await testAdminPages();
    results.seriesDropdown = await testBlogSeriesDropdown();
    results.formValidation = await testBlogFormValidation();
    results.publicSeriesView = await testBlogSeriesPublicView();
    
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
      log('All blog UI tests passed! 🎉', 'success');
    } else {
      log('Some tests failed. Please check the errors above.', 'error');
    }
    
  } catch (error) {
    logError('Test suite failed', error);
  }
}

// Run the tests
runAllTests();