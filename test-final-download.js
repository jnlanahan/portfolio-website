#!/usr/bin/env node

/**
 * Final Resume Download Test
 * This tests all scenarios where the resume download could fail
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m',    // Yellow
    reset: '\x1b[0m'     // Reset
  };
  
  const color = colors[type] || colors.info;
  console.log(`${color}[${timestamp}] ${type.toUpperCase()}: ${message}${colors.reset}`);
}

async function testEndpoint(url, description, expectedStatus = 200) {
  log(`Testing ${description}...`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    const contentDisposition = response.headers.get('content-disposition');
    
    log(`${description} - Status: ${response.status}`);
    log(`${description} - Content-Type: ${contentType}`);
    log(`${description} - Content-Length: ${contentLength}`);
    log(`${description} - Content-Disposition: ${contentDisposition}`);
    
    if (response.status === expectedStatus) {
      if (contentType && contentType.includes('application/pdf')) {
        const buffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        const pdfHeader = Array.from(uint8Array.slice(0, 4)).map(b => String.fromCharCode(b)).join('');
        
        if (pdfHeader === '%PDF') {
          log(`✓ ${description} - SUCCESS (Valid PDF, ${buffer.byteLength} bytes)`, 'success');
          return true;
        } else {
          log(`✗ ${description} - FAILED (Invalid PDF header: ${pdfHeader})`, 'error');
          return false;
        }
      } else {
        log(`✗ ${description} - FAILED (Wrong content type: ${contentType})`, 'error');
        return false;
      }
    } else {
      log(`✗ ${description} - FAILED (Status ${response.status})`, 'error');
      return false;
    }
  } catch (error) {
    log(`✗ ${description} - ERROR: ${error.message}`, 'error');
    return false;
  }
}

async function testWithDifferentUserAgents() {
  log('Testing with different user agents...');
  
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ];
  
  let successCount = 0;
  
  for (const userAgent of userAgents) {
    const browserName = userAgent.includes('Chrome') ? 'Chrome' : 
                       userAgent.includes('Firefox') ? 'Firefox' : 
                       userAgent.includes('Safari') ? 'Safari' : 'Unknown';
    
    try {
      const response = await fetch(`${BASE_URL}/resume.pdf`, {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          'Accept': 'application/pdf,text/html,*/*;q=0.9',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.status === 200 && response.headers.get('content-type').includes('application/pdf')) {
        log(`✓ ${browserName} - SUCCESS`, 'success');
        successCount++;
      } else {
        log(`✗ ${browserName} - FAILED (Status: ${response.status})`, 'error');
      }
    } catch (error) {
      log(`✗ ${browserName} - ERROR: ${error.message}`, 'error');
    }
  }
  
  log(`User Agent Test Results: ${successCount}/${userAgents.length} successful`);
  return successCount === userAgents.length;
}

async function testConcurrentDownloads() {
  log('Testing concurrent downloads...');
  
  const promises = [];
  const downloadCount = 5;
  
  for (let i = 0; i < downloadCount; i++) {
    promises.push(fetch(`${BASE_URL}/resume.pdf`, {
      method: 'GET',
      headers: {
        'User-Agent': `TestClient-${i}`,
        'Accept': 'application/pdf'
      }
    }));
  }
  
  try {
    const responses = await Promise.all(promises);
    let successCount = 0;
    
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      if (response.status === 200 && response.headers.get('content-type').includes('application/pdf')) {
        successCount++;
      }
    }
    
    log(`Concurrent Downloads: ${successCount}/${downloadCount} successful`);
    return successCount === downloadCount;
  } catch (error) {
    log(`Concurrent download test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testServerStatus() {
  log('Checking server status...');
  
  try {
    const response = await fetch(`${BASE_URL}/`, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'StatusCheck/1.0'
      }
    });
    
    if (response.status === 200) {
      log('✓ Server is running', 'success');
      return true;
    } else {
      log(`✗ Server status check failed: ${response.status}`, 'error');
      return false;
    }
  } catch (error) {
    log(`✗ Server status check error: ${error.message}`, 'error');
    return false;
  }
}

async function runFinalTest() {
  log('=== FINAL COMPREHENSIVE RESUME DOWNLOAD TEST ===');
  log('This test will verify all possible download scenarios\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Server Status
  log('1. Testing server status...');
  if (await testServerStatus()) {
    passed++;
    log('');
  } else {
    failed++;
    log('❌ Server is not running properly\n', 'error');
    return;
  }
  
  // Test 2: Direct PDF endpoint
  log('2. Testing direct PDF endpoint...');
  if (await testEndpoint(`${BASE_URL}/resume.pdf`, 'Direct PDF (/resume.pdf)')) {
    passed++;
  } else {
    failed++;
  }
  log('');
  
  // Test 3: API endpoint
  log('3. Testing API endpoint...');
  if (await testEndpoint(`${BASE_URL}/api/resume/download`, 'API Resume Download')) {
    passed++;
  } else {
    failed++;
  }
  log('');
  
  // Test 4: Different user agents
  log('4. Testing different browsers...');
  if (await testWithDifferentUserAgents()) {
    passed++;
  } else {
    failed++;
  }
  log('');
  
  // Test 5: Concurrent downloads
  log('5. Testing concurrent downloads...');
  if (await testConcurrentDownloads()) {
    passed++;
  } else {
    failed++;
  }
  log('');
  
  // Test 6: File system check
  log('6. Checking file system...');
  try {
    const resumeDir = path.join(process.cwd(), 'uploads', 'resumes');
    if (fs.existsSync(resumeDir)) {
      const files = fs.readdirSync(resumeDir);
      if (files.length > 0) {
        log(`✓ Resume files found: ${files.join(', ')}`, 'success');
        passed++;
      } else {
        log('✗ No resume files found in uploads/resumes', 'error');
        failed++;
      }
    } else {
      log('✗ Resume directory does not exist', 'error');
      failed++;
    }
  } catch (error) {
    log(`✗ File system check failed: ${error.message}`, 'error');
    failed++;
  }
  log('');
  
  // Results
  log('=== FINAL TEST RESULTS ===');
  log(`Total tests: ${passed + failed}`);
  log(`Passed: ${passed}`, 'success');
  log(`Failed: ${failed}`, failed > 0 ? 'error' : 'info');
  log(`Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    log('\n🎉 ALL TESTS PASSED! 🎉', 'success');
    log('Resume download is working perfectly from all angles.', 'success');
    log('The homepage download button should work correctly now.', 'success');
    process.exit(0);
  } else {
    log('\n❌ SOME TESTS FAILED', 'error');
    log('There are still issues with the resume download functionality.', 'error');
    process.exit(1);
  }
}

// Run the final test
runFinalTest().catch(error => {
  log(`Final test suite failed: ${error.message}`, 'error');
  process.exit(1);
});