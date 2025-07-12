#!/usr/bin/env node

/**
 * Password Protection Test Suite
 * Tests the password protection functionality for resume downloads
 */

import fetch from 'node-fetch';

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

async function testDirectAccess() {
  log('Testing direct PDF access...');
  
  try {
    const response = await fetch(`${BASE_URL}/resume.pdf`);
    const data = await response.json();
    
    if (response.status === 401 && data.error === 'Password protected download') {
      log('✓ Direct PDF access correctly blocked', 'success');
      log(`Message: "${data.message}"`, 'info');
      return true;
    } else {
      log(`✗ Direct PDF access not properly blocked (Status: ${response.status})`, 'error');
      return false;
    }
  } catch (error) {
    log(`✗ Direct PDF access test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testInvalidPassword() {
  log('Testing invalid password...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/resume/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: 'wrongpassword' }),
    });
    
    const data = await response.json();
    
    if (response.status === 401 && data.error === 'Invalid password') {
      log('✓ Invalid password correctly rejected', 'success');
      return true;
    } else {
      log(`✗ Invalid password not properly rejected (Status: ${response.status})`, 'error');
      return false;
    }
  } catch (error) {
    log(`✗ Invalid password test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testValidPassword() {
  log('Testing valid password...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/resume/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: 'wolfpack' }),
    });
    
    if (response.status === 200) {
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      if (contentType && contentType.includes('application/pdf')) {
        log('✓ Valid password accepted, PDF download successful', 'success');
        log(`Content-Type: ${contentType}`, 'info');
        log(`Content-Length: ${contentLength} bytes`, 'info');
        return true;
      } else {
        log(`✗ Valid password accepted but wrong content type: ${contentType}`, 'error');
        return false;
      }
    } else {
      log(`✗ Valid password rejected (Status: ${response.status})`, 'error');
      return false;
    }
  } catch (error) {
    log(`✗ Valid password test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testEmptyPassword() {
  log('Testing empty password...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/resume/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: '' }),
    });
    
    const data = await response.json();
    
    if (response.status === 401 && data.error === 'Invalid password') {
      log('✓ Empty password correctly rejected', 'success');
      return true;
    } else {
      log(`✗ Empty password not properly rejected (Status: ${response.status})`, 'error');
      return false;
    }
  } catch (error) {
    log(`✗ Empty password test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testNoPassword() {
  log('Testing request without password...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/resume/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    const data = await response.json();
    
    if (response.status === 401 && data.error === 'Invalid password') {
      log('✓ Request without password correctly rejected', 'success');
      return true;
    } else {
      log(`✗ Request without password not properly rejected (Status: ${response.status})`, 'error');
      return false;
    }
  } catch (error) {
    log(`✗ No password test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testCaseSensitivity() {
  log('Testing password case sensitivity...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/resume/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: 'WOLFPACK' }),
    });
    
    const data = await response.json();
    
    if (response.status === 401 && data.error === 'Invalid password') {
      log('✓ Password is case-sensitive (uppercase rejected)', 'success');
      return true;
    } else {
      log(`✗ Password case sensitivity not working (Status: ${response.status})`, 'error');
      return false;
    }
  } catch (error) {
    log(`✗ Case sensitivity test failed: ${error.message}`, 'error');
    return false;
  }
}

async function runPasswordProtectionTests() {
  log('=== PASSWORD PROTECTION TEST SUITE ===');
  log('Testing resume download password protection...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Direct PDF access should be blocked
  if (await testDirectAccess()) {
    passed++;
  } else {
    failed++;
  }
  log('');
  
  // Test 2: Invalid password should be rejected
  if (await testInvalidPassword()) {
    passed++;
  } else {
    failed++;
  }
  log('');
  
  // Test 3: Valid password should work
  if (await testValidPassword()) {
    passed++;
  } else {
    failed++;
  }
  log('');
  
  // Test 4: Empty password should be rejected
  if (await testEmptyPassword()) {
    passed++;
  } else {
    failed++;
  }
  log('');
  
  // Test 5: No password should be rejected
  if (await testNoPassword()) {
    passed++;
  } else {
    failed++;
  }
  log('');
  
  // Test 6: Case sensitivity
  if (await testCaseSensitivity()) {
    passed++;
  } else {
    failed++;
  }
  log('');
  
  // Results
  log('=== PASSWORD PROTECTION TEST RESULTS ===');
  log(`Total tests: ${passed + failed}`);
  log(`Passed: ${passed}`, 'success');
  log(`Failed: ${failed}`, failed > 0 ? 'error' : 'info');
  log(`Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    log('\n🎉 ALL PASSWORD PROTECTION TESTS PASSED! 🎉', 'success');
    log('✓ Direct PDF access properly blocked', 'success');
    log('✓ Invalid passwords rejected', 'success');
    log('✓ Valid password ("wolfpack") works correctly', 'success');
    log('✓ Password is case-sensitive', 'success');
    log('✓ Empty/missing passwords handled correctly', 'success');
    log('\nPassword protection is working perfectly!', 'success');
    process.exit(0);
  } else {
    log('\n❌ SOME PASSWORD PROTECTION TESTS FAILED', 'error');
    log('Resume download password protection needs fixing.', 'error');
    process.exit(1);
  }
}

// Run the password protection tests
runPasswordProtectionTests().catch(error => {
  log(`Password protection test suite failed: ${error.message}`, 'error');
  process.exit(1);
});