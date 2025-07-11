/**
 * Comprehensive Test Suite for Top 5 Lists Admin Functionality
 * Tests all CRUD operations, image uploads, and admin authentication
 */

import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_ADMIN = {
  username: 'admin',
  password: 'admin123'
};

// Test utilities
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

// HTTP request helper
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json().catch(() => ({}));
    
    return {
      success: response.ok,
      status: response.status,
      data,
      headers: response.headers
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test session management
let sessionCookie = '';

function setSessionCookie(headers) {
  const setCookie = headers.get('set-cookie');
  if (setCookie) {
    sessionCookie = setCookie.split(';')[0];
  }
}

function getRequestOptions(options = {}) {
  return {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      'Cookie': sessionCookie
    }
  };
}

// Test data
const testList = {
  title: 'Test Top 5 Programming Languages',
  icon: 'ri-code-line',
  color: '#3b82f6',
  mainImage: '',
  position: 1
};

const testItems = [
  {
    title: 'JavaScript',
    description: 'Versatile language for web development',
    link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    linkText: 'Learn JavaScript',
    position: 1
  },
  {
    title: 'Python',
    description: 'Great for data science and automation',
    link: 'https://python.org',
    linkText: 'Python Official',
    position: 2
  },
  {
    title: 'TypeScript',
    description: 'JavaScript with static typing',
    link: 'https://typescriptlang.org',
    linkText: 'TypeScript Docs',
    position: 3
  }
];

// Test functions
async function testAdminLogin() {
  log('Testing admin login...', 'info');
  
  const result = await makeRequest('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(TEST_ADMIN)
  });
  
  if (result.success) {
    setSessionCookie(result.headers);
    log('✓ Admin login successful', 'success');
    return true;
  } else {
    log(`✗ Admin login failed: ${result.data.error || 'Unknown error'}`, 'error');
    return false;
  }
}

async function testAuthCheck() {
  log('Testing authentication check...', 'info');
  
  const result = await makeRequest('/api/admin/check-auth', getRequestOptions());
  
  if (result.success) {
    log('✓ Authentication check passed', 'success');
    return true;
  } else {
    log(`✗ Authentication check failed: ${result.data.error || 'Unknown error'}`, 'error');
    return false;
  }
}

async function testListCreation() {
  log('Testing list creation...', 'info');
  
  const result = await makeRequest('/api/admin/top5-lists', getRequestOptions({
    method: 'POST',
    body: JSON.stringify(testList)
  }));
  
  if (result.success) {
    log('✓ List creation successful', 'success');
    return result.data.id;
  } else {
    log(`✗ List creation failed: ${result.data.error || 'Unknown error'}`, 'error');
    return null;
  }
}

async function testListRetrieval() {
  log('Testing list retrieval...', 'info');
  
  const result = await makeRequest('/api/admin/top5-lists', getRequestOptions());
  
  if (result.success) {
    log(`✓ Retrieved ${result.data.length} lists`, 'success');
    return result.data;
  } else {
    log(`✗ List retrieval failed: ${result.data.error || 'Unknown error'}`, 'error');
    return null;
  }
}

async function testItemCreation(listId) {
  log('Testing item creation...', 'info');
  
  const results = [];
  for (const item of testItems) {
    const result = await makeRequest(`/api/admin/top5-lists/${listId}/items`, getRequestOptions({
      method: 'POST',
      body: JSON.stringify(item)
    }));
    
    if (result.success) {
      log(`✓ Item "${item.title}" created successfully`, 'success');
      results.push(result.data);
    } else {
      log(`✗ Item "${item.title}" creation failed: ${result.data.error || 'Unknown error'}`, 'error');
    }
  }
  
  return results;
}

async function testItemRetrieval(listId) {
  log('Testing item retrieval...', 'info');
  
  const result = await makeRequest(`/api/admin/top5-lists/${listId}/items`, getRequestOptions());
  
  if (result.success) {
    log(`✓ Retrieved ${result.data.length} items for list ${listId}`, 'success');
    return result.data;
  } else {
    log(`✗ Item retrieval failed: ${result.data.error || 'Unknown error'}`, 'error');
    return null;
  }
}

async function testImageUpload() {
  log('Testing image upload...', 'info');
  
  // Create a test image file
  const testImagePath = path.join(__dirname, 'test-image.png');
  const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
  
  try {
    fs.writeFileSync(testImagePath, testImageContent);
    
    const form = new FormData();
    form.append('files', fs.createReadStream(testImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    const result = await makeRequest('/api/admin/upload', {
      method: 'POST',
      body: form,
      headers: {
        'Cookie': sessionCookie,
        ...form.getHeaders()
      }
    });
    
    // Clean up test file
    fs.unlinkSync(testImagePath);
    
    if (result.success) {
      log('✓ Image upload successful', 'success');
      return result.data.files[0];
    } else {
      log(`✗ Image upload failed: ${result.data.error || 'Unknown error'}`, 'error');
      return null;
    }
  } catch (error) {
    log(`✗ Image upload error: ${error.message}`, 'error');
    return null;
  }
}

async function testListUpdate(listId, imageUrl) {
  log('Testing list update...', 'info');
  
  const updatedList = {
    ...testList,
    title: 'Updated Test Top 5 Programming Languages',
    mainImage: imageUrl || '',
    color: '#ef4444'
  };
  
  const result = await makeRequest(`/api/admin/top5-lists/${listId}`, getRequestOptions({
    method: 'PUT',
    body: JSON.stringify(updatedList)
  }));
  
  if (result.success) {
    log('✓ List update successful', 'success');
    return true;
  } else {
    log(`✗ List update failed: ${result.data.error || 'Unknown error'}`, 'error');
    return false;
  }
}

async function testItemDeletion(itemId) {
  log('Testing item deletion...', 'info');
  
  const result = await makeRequest(`/api/admin/top5-list-items/${itemId}`, getRequestOptions({
    method: 'DELETE'
  }));
  
  if (result.success) {
    log('✓ Item deletion successful', 'success');
    return true;
  } else {
    log(`✗ Item deletion failed: ${result.data.error || 'Unknown error'}`, 'error');
    return false;
  }
}

async function testListDeletion(listId) {
  log('Testing list deletion...', 'info');
  
  const result = await makeRequest(`/api/admin/top5-lists/${listId}`, getRequestOptions({
    method: 'DELETE'
  }));
  
  if (result.success) {
    log('✓ List deletion successful', 'success');
    return true;
  } else {
    log(`✗ List deletion failed: ${result.data.error || 'Unknown error'}`, 'error');
    return false;
  }
}

// Main test runner
async function runTests() {
  log('Starting Top 5 Lists Admin Tests', 'info');
  log('=====================================', 'info');
  
  let testsPassed = 0;
  let testsTotal = 0;
  
  // Test admin login
  testsTotal++;
  if (await testAdminLogin()) testsPassed++;
  
  // Test authentication check
  testsTotal++;
  if (await testAuthCheck()) testsPassed++;
  
  // Test list creation
  testsTotal++;
  const listId = await testListCreation();
  if (listId) testsPassed++;
  
  if (!listId) {
    log('Cannot continue tests without valid list ID', 'error');
    return;
  }
  
  // Test list retrieval
  testsTotal++;
  if (await testListRetrieval()) testsPassed++;
  
  // Test item creation
  testsTotal++;
  const items = await testItemCreation(listId);
  if (items.length > 0) testsPassed++;
  
  // Test item retrieval
  testsTotal++;
  const retrievedItems = await testItemRetrieval(listId);
  if (retrievedItems && retrievedItems.length > 0) testsPassed++;
  
  // Test image upload
  testsTotal++;
  const imageUrl = await testImageUpload();
  if (imageUrl) testsPassed++;
  
  // Test list update
  testsTotal++;
  if (await testListUpdate(listId, imageUrl)) testsPassed++;
  
  // Test item deletion
  if (retrievedItems && retrievedItems.length > 0) {
    testsTotal++;
    if (await testItemDeletion(retrievedItems[0].id)) testsPassed++;
  }
  
  // Test list deletion
  testsTotal++;
  if (await testListDeletion(listId)) testsPassed++;
  
  // Final results
  log('=====================================', 'info');
  log(`Tests completed: ${testsPassed}/${testsTotal} passed`, testsPassed === testsTotal ? 'success' : 'warning');
  
  if (testsPassed === testsTotal) {
    log('🎉 All tests passed! Top 5 Lists functionality is working correctly.', 'success');
  } else {
    log(`⚠️  ${testsTotal - testsPassed} tests failed. Please check the errors above.`, 'warning');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };