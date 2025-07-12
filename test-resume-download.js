#!/usr/bin/env node

/**
 * Resume Download Test Suite
 * Tests all resume download endpoints and functionality
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';
const TEST_LOG = [];

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
  console.log(logEntry);
  TEST_LOG.push(logEntry);
}

function logError(message, error) {
  log(`${message}: ${error.message}`, 'error');
  if (error.stack) {
    log(`Stack: ${error.stack}`, 'debug');
  }
}

async function testEndpoint(url, expectedStatus = 200, description = '') {
  log(`Testing ${description || url}...`);
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'ResumeDownloadTest/1.0'
      }
    });
    
    log(`Response status: ${response.status}`);
    log(`Content-Type: ${response.headers.get('content-type')}`);
    log(`Content-Disposition: ${response.headers.get('content-disposition')}`);
    log(`Content-Length: ${response.headers.get('content-length')}`);
    
    if (response.status === expectedStatus) {
      log(`✓ ${description || url} - SUCCESS`, 'success');
      return true;
    } else {
      log(`✗ ${description || url} - FAILED (expected ${expectedStatus}, got ${response.status})`, 'error');
      return false;
    }
  } catch (error) {
    logError(`Failed to test ${description || url}`, error);
    return false;
  }
}

async function testActualDownload(url, description = '') {
  log(`Testing actual download from ${description || url}...`);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'ResumeDownloadTest/1.0'
      }
    });
    
    if (response.status === 200) {
      const buffer = await response.buffer();
      log(`Downloaded ${buffer.length} bytes`);
      
      // Check if it's actually a PDF
      const pdfHeader = buffer.slice(0, 4).toString();
      if (pdfHeader === '%PDF') {
        log(`✓ ${description || url} - PDF download SUCCESS`, 'success');
        return true;
      } else {
        log(`✗ ${description || url} - Downloaded file is not a PDF (header: ${pdfHeader})`, 'error');
        return false;
      }
    } else {
      log(`✗ ${description || url} - Download failed with status ${response.status}`, 'error');
      return false;
    }
  } catch (error) {
    logError(`Failed to download from ${description || url}`, error);
    return false;
  }
}

async function checkDatabaseContent() {
  log('Checking database for resume content...');
  try {
    const response = await fetch(`${BASE_URL}/api/resume/status`, {
      method: 'GET',
      headers: {
        'User-Agent': 'ResumeDownloadTest/1.0'
      }
    });
    
    if (response.status === 200) {
      const data = await response.json();
      log(`Database resume status: ${JSON.stringify(data, null, 2)}`);
      return data.hasResume;
    } else {
      log(`Failed to check database status: ${response.status}`, 'error');
      return false;
    }
  } catch (error) {
    logError('Failed to check database', error);
    return false;
  }
}

async function checkFileSystem() {
  log('Checking file system for resume files...');
  try {
    const resumeDir = path.join(process.cwd(), 'uploads', 'resumes');
    if (fs.existsSync(resumeDir)) {
      const files = fs.readdirSync(resumeDir);
      log(`Files in uploads/resumes: ${JSON.stringify(files)}`);
      return files.length > 0;
    } else {
      log('Resume directory does not exist', 'error');
      return false;
    }
  } catch (error) {
    logError('Failed to check file system', error);
    return false;
  }
}

async function testServerHealth() {
  log('Testing server health...');
  try {
    const response = await fetch(`${BASE_URL}/`, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'ResumeDownloadTest/1.0'
      }
    });
    
    if (response.status === 200) {
      log('✓ Server is healthy', 'success');
      return true;
    } else {
      log(`✗ Server health check failed: ${response.status}`, 'error');
      return false;
    }
  } catch (error) {
    logError('Server health check failed', error);
    return false;
  }
}

async function runAllTests() {
  log('=== RESUME DOWNLOAD TEST SUITE ===');
  log('Starting comprehensive resume download tests...');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Server Health
  if (await testServerHealth()) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 2: Database Content
  if (await checkDatabaseContent()) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 3: File System
  if (await checkFileSystem()) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 4: API endpoint HEAD request
  if (await testEndpoint(`${BASE_URL}/api/resume/download`, 200, 'API Resume Download Endpoint')) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 5: Direct PDF endpoint HEAD request
  if (await testEndpoint(`${BASE_URL}/resume.pdf`, 200, 'Direct PDF Endpoint')) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 6: API endpoint actual download
  if (await testActualDownload(`${BASE_URL}/api/resume/download`, 'API Resume Download')) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 7: Direct PDF endpoint actual download
  if (await testActualDownload(`${BASE_URL}/resume.pdf`, 'Direct PDF Download')) {
    passed++;
  } else {
    failed++;
  }
  
  log('=== TEST RESULTS ===');
  log(`Tests passed: ${passed}`);
  log(`Tests failed: ${failed}`);
  log(`Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    log('❌ Some tests failed. Check the logs above for details.', 'error');
    process.exit(1);
  } else {
    log('✅ All tests passed!', 'success');
    process.exit(0);
  }
}

// Run tests
runAllTests().catch(error => {
  logError('Test suite failed', error);
  process.exit(1);
});