#!/usr/bin/env node
import http from 'http';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const baseUrl = 'http://localhost:5000';
const testImage = path.join(__dirname, 'attached_assets', 'PXL_20250628_182520391_1752206764378.jpg');

// Helper function to make HTTP requests
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(result);
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Test functions
async function testGetAboutMeContent() {
  console.log('\n=== Testing GET /api/about-me ===');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/about-me',
    method: 'GET'
  };
  
  try {
    const result = await makeRequest(options);
    console.log('Status:', result.status);
    console.log('Content:', JSON.stringify(result.body, null, 2));
    
    if (result.status === 200) {
      console.log('✓ GET /api/about-me works correctly');
      return result.body;
    } else {
      console.log('✗ GET /api/about-me failed');
      return null;
    }
  } catch (error) {
    console.error('✗ GET /api/about-me error:', error.message);
    return null;
  }
}

async function testUpdateAboutMeContent() {
  console.log('\n=== Testing PUT /api/admin/about-me ===');
  
  const updateData = {
    lifePicturesTitle: 'TEST: Life in Pictures Updated',
    lifePicturesCaption: 'TEST: Updated Caption',
    lifePicturesDescription: 'TEST: Updated description for testing'
  };
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/about-me',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(updateData))
    }
  };
  
  try {
    const result = await makeRequest(options, JSON.stringify(updateData));
    console.log('Status:', result.status);
    console.log('Response:', JSON.stringify(result.body, null, 2));
    
    if (result.status === 401) {
      console.log('✓ PUT /api/admin/about-me correctly requires authentication');
      return true;
    } else {
      console.log('✗ PUT /api/admin/about-me should require authentication');
      return false;
    }
  } catch (error) {
    console.error('✗ PUT /api/admin/about-me error:', error.message);
    return false;
  }
}

async function testImageUpload() {
  console.log('\n=== Testing POST /api/admin/about-me/upload-image ===');
  
  if (!fs.existsSync(testImage)) {
    console.log('✗ Test image not found:', testImage);
    return false;
  }
  
  const form = new FormData();
  form.append('file', fs.createReadStream(testImage));
  form.append('fieldName', 'heroImage');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/about-me/upload-image',
    method: 'POST',
    headers: form.getHeaders()
  };
  
  try {
    const result = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const result = {
              status: res.statusCode,
              headers: res.headers,
              body: body ? JSON.parse(body) : null
            };
            resolve(result);
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: body
            });
          }
        });
      });
      
      req.on('error', reject);
      form.pipe(req);
    });
    
    console.log('Status:', result.status);
    console.log('Response:', JSON.stringify(result.body, null, 2));
    
    if (result.status === 401) {
      console.log('✓ POST /api/admin/about-me/upload-image correctly requires authentication');
      return true;
    } else {
      console.log('✗ POST /api/admin/about-me/upload-image should require authentication');
      return false;
    }
  } catch (error) {
    console.error('✗ POST /api/admin/about-me/upload-image error:', error.message);
    return false;
  }
}

async function testPublicAboutPage() {
  console.log('\n=== Testing Public About Page ===');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/about',
    method: 'GET'
  };
  
  try {
    const result = await makeRequest(options);
    console.log('Status:', result.status);
    
    if (result.status === 200) {
      console.log('✓ Public About page loads correctly');
      return true;
    } else {
      console.log('✗ Public About page failed to load');
      return false;
    }
  } catch (error) {
    console.error('✗ Public About page error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting About Me Functionality Tests');
  console.log('=========================================');
  
  const results = [];
  
  // Test 1: Get About Me content
  const content = await testGetAboutMeContent();
  results.push(content !== null);
  
  // Test 2: Update About Me content (should require auth)
  const updateTest = await testUpdateAboutMeContent();
  results.push(updateTest);
  
  // Test 3: Image upload (should require auth)
  const imageTest = await testImageUpload();
  results.push(imageTest);
  
  // Test 4: Public About page
  const pageTest = await testPublicAboutPage();
  results.push(pageTest);
  
  console.log('\n=========================================');
  console.log('🏁 Test Results Summary:');
  console.log('=========================================');
  console.log(`✓ Tests passed: ${results.filter(r => r).length}/${results.length}`);
  console.log(`✗ Tests failed: ${results.filter(r => !r).length}/${results.length}`);
  
  if (results.every(r => r)) {
    console.log('🎉 All tests passed! About Me functionality is working correctly.');
  } else {
    console.log('❌ Some tests failed. Please check the implementation.');
  }
  
  console.log('\n📊 Database Content Check:');
  if (content) {
    console.log('- Hero Image:', content.heroImage || 'Not set');
    console.log('- Life Pictures Title:', content.lifePicturesTitle || 'Not set');
    console.log('- Life Pictures Image:', content.lifePicturesImage || 'Not set');
    console.log('- Life Pictures Caption:', content.lifePicturesCaption || 'Not set');
    console.log('- Life Pictures Description:', content.lifePicturesDescription || 'Not set');
  }
}

// Run the tests
runTests().catch(console.error);