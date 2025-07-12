#!/usr/bin/env node

/**
 * Browser-style Resume Download Test
 * This tests the download functionality as a browser would
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
}

async function testBrowserDownload(url, description) {
  log(`Testing browser-style download from ${description}...`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': `${BASE_URL}/`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    log(`Response status: ${response.status}`);
    log(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
    
    if (response.status === 200) {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/pdf')) {
        const buffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        const pdfHeader = Array.from(uint8Array.slice(0, 4)).map(b => String.fromCharCode(b)).join('');
        
        log(`Downloaded ${buffer.byteLength} bytes`);
        log(`PDF header: ${pdfHeader}`);
        
        if (pdfHeader === '%PDF') {
          log(`✓ ${description} - SUCCESS: Valid PDF downloaded`, 'success');
          return true;
        } else {
          log(`✗ ${description} - FAILED: Downloaded file is not a valid PDF`, 'error');
          return false;
        }
      } else {
        log(`✗ ${description} - FAILED: Wrong content type (${contentType})`, 'error');
        return false;
      }
    } else {
      log(`✗ ${description} - FAILED: HTTP ${response.status}`, 'error');
      return false;
    }
  } catch (error) {
    log(`✗ ${description} - FAILED: ${error.message}`, 'error');
    return false;
  }
}

async function testHomepageButton() {
  log('Testing homepage button click simulation...');
  
  // First, get the homepage to ensure we have a valid session
  try {
    const homeResponse = await fetch(`${BASE_URL}/`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    log(`Homepage response: ${homeResponse.status}`);
    
    if (homeResponse.status === 200) {
      // Now test the download button
      return await testBrowserDownload(`${BASE_URL}/resume.pdf`, 'Homepage Resume Button');
    } else {
      log('Failed to load homepage', 'error');
      return false;
    }
  } catch (error) {
    log(`Homepage test failed: ${error.message}`, 'error');
    return false;
  }
}

async function runBrowserTests() {
  log('=== BROWSER-STYLE RESUME DOWNLOAD TEST ===');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Homepage button simulation
  if (await testHomepageButton()) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 2: Direct URL access (like typing in browser)
  if (await testBrowserDownload(`${BASE_URL}/resume.pdf`, 'Direct URL Access')) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 3: API endpoint (like AJAX call)
  if (await testBrowserDownload(`${BASE_URL}/api/resume/download`, 'API Endpoint')) {
    passed++;
  } else {
    failed++;
  }
  
  log('=== BROWSER TEST RESULTS ===');
  log(`Tests passed: ${passed}`);
  log(`Tests failed: ${failed}`);
  
  if (failed > 0) {
    log('❌ Some tests failed. Resume download is not working correctly from browser.', 'error');
    process.exit(1);
  } else {
    log('✅ All browser tests passed! Resume download is working correctly.', 'success');
    process.exit(0);
  }
}

// Run browser tests
runBrowserTests().catch(error => {
  log(`Browser test suite failed: ${error.message}`, 'error');
  process.exit(1);
});