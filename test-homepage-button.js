#!/usr/bin/env node

/**
 * Homepage Button Click Test
 * This specifically tests what happens when the homepage button is clicked
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
}

async function testHomepageLoad() {
  log('Loading homepage...');
  
  try {
    const response = await fetch(`${BASE_URL}/`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });
    
    log(`Homepage status: ${response.status}`);
    
    if (response.status === 200) {
      const html = await response.text();
      
      // Check if the homepage contains the resume download button
      const hasResumeButton = html.includes('/resume.pdf') || html.includes('Download my Resume');
      log(`Homepage contains resume button: ${hasResumeButton}`);
      
      if (hasResumeButton) {
        log('✓ Homepage loaded successfully with resume button', 'success');
        return true;
      } else {
        log('✗ Homepage loaded but no resume button found', 'error');
        return false;
      }
    } else {
      log(`✗ Homepage failed to load: ${response.status}`, 'error');
      return false;
    }
  } catch (error) {
    log(`Homepage load failed: ${error.message}`, 'error');
    return false;
  }
}

async function testButtonClick() {
  log('Simulating button click...');
  
  try {
    // Simulate a browser clicking the download button
    const response = await fetch(`${BASE_URL}/resume.pdf`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': `${BASE_URL}/`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1'
      }
    });
    
    log(`Button click response: ${response.status}`);
    log(`Content-Type: ${response.headers.get('content-type')}`);
    log(`Content-Disposition: ${response.headers.get('content-disposition')}`);
    
    if (response.status === 200) {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/pdf')) {
        const buffer = await response.arrayBuffer();
        log(`Downloaded ${buffer.byteLength} bytes`);
        
        // Verify it's a valid PDF
        const uint8Array = new Uint8Array(buffer);
        const pdfHeader = Array.from(uint8Array.slice(0, 4)).map(b => String.fromCharCode(b)).join('');
        
        if (pdfHeader === '%PDF') {
          log('✓ Button click successful - Valid PDF downloaded', 'success');
          return true;
        } else {
          log('✗ Button click failed - Invalid PDF', 'error');
          return false;
        }
      } else {
        log('✗ Button click failed - Wrong content type', 'error');
        const text = await response.text();
        log(`Response body (first 200 chars): ${text.substring(0, 200)}...`);
        return false;
      }
    } else if (response.status === 404) {
      log('✗ Button click failed - 404 Not Found', 'error');
      const text = await response.text();
      log(`404 Response body: ${text}`);
      return false;
    } else {
      log(`✗ Button click failed - ${response.status}`, 'error');
      return false;
    }
  } catch (error) {
    log(`Button click failed: ${error.message}`, 'error');
    return false;
  }
}

async function testMultipleClicks() {
  log('Testing multiple button clicks...');
  
  let successCount = 0;
  const attempts = 3;
  
  for (let i = 1; i <= attempts; i++) {
    log(`Attempt ${i} of ${attempts}...`);
    
    if (await testButtonClick()) {
      successCount++;
      log(`✓ Attempt ${i} successful`);
    } else {
      log(`✗ Attempt ${i} failed`);
    }
    
    // Wait a bit between attempts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  log(`Success rate: ${successCount}/${attempts} (${((successCount/attempts)*100).toFixed(1)}%)`);
  return successCount === attempts;
}

async function runHomepageButtonTest() {
  log('=== HOMEPAGE BUTTON CLICK TEST ===');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Homepage loads
  if (await testHomepageLoad()) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 2: Single button click
  if (await testButtonClick()) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 3: Multiple button clicks
  if (await testMultipleClicks()) {
    passed++;
  } else {
    failed++;
  }
  
  log('=== HOMEPAGE BUTTON TEST RESULTS ===');
  log(`Tests passed: ${passed}`);
  log(`Tests failed: ${failed}`);
  
  if (failed > 0) {
    log('❌ Some homepage button tests failed.', 'error');
    process.exit(1);
  } else {
    log('✅ All homepage button tests passed!', 'success');
    process.exit(0);
  }
}

// Run tests
runHomepageButtonTest().catch(error => {
  log(`Homepage button test failed: ${error.message}`, 'error');
  process.exit(1);
});