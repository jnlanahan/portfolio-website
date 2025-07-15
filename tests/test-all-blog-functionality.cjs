/**
 * Comprehensive Blog Test Suite
 * Runs all blog-related tests including series, posts, and UI components
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function runTest(testFile) {
  return new Promise((resolve, reject) => {
    log(`Running ${testFile}...`, 'info');
    
    const testProcess = spawn('node', [testFile], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        log(`${testFile} completed successfully`, 'success');
        resolve(true);
      } else {
        log(`${testFile} failed with code ${code}`, 'error');
        resolve(false);
      }
    });
    
    testProcess.on('error', (error) => {
      log(`${testFile} error: ${error.message}`, 'error');
      resolve(false);
    });
  });
}

async function runAllBlogTests() {
  log('Starting Comprehensive Blog Test Suite', 'info');
  log('This will test all blog functionality including series, posts, and UI', 'info');
  log('=' * 60, 'info');
  
  const testFiles = [
    'test-blog-series.cjs',
    'test-blog-posts.cjs',
    'test-blog-ui.cjs'
  ];
  
  // Check if all test files exist
  const missingFiles = testFiles.filter(file => !fs.existsSync(file));
  if (missingFiles.length > 0) {
    log(`Missing test files: ${missingFiles.join(', ')}`, 'error');
    return;
  }
  
  const results = {};
  
  // Run each test suite
  for (const testFile of testFiles) {
    log(`\n${'='.repeat(60)}`, 'info');
    log(`RUNNING: ${testFile}`, 'info');
    log('='.repeat(60), 'info');
    
    results[testFile] = await runTest(testFile);
    
    // Add a small delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary
  log('\n' + '='.repeat(60), 'info');
  log('COMPREHENSIVE BLOG TEST SUMMARY', 'info');
  log('='.repeat(60), 'info');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    log(`${test}: ${passed ? 'PASS' : 'FAIL'}`, passed ? 'success' : 'error');
  });
  
  log(`\nOverall: ${passedTests}/${totalTests} test suites passed`, 
    passedTests === totalTests ? 'success' : 'error');
  
  if (passedTests === totalTests) {
    log('\n🎉 All blog functionality tests passed!', 'success');
    log('Your blog system is working correctly.', 'success');
  } else {
    log('\n❌ Some tests failed.', 'error');
    log('Please check the individual test outputs above for details.', 'error');
  }
  
  log('\n' + '='.repeat(60), 'info');
  log('Test suite completed', 'info');
}

// Check if server is running
async function checkServer() {
  try {
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:5000/api/blog');
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  log('Blog Test Suite Launcher', 'info');
  
  // Check if server is running
  const serverRunning = await checkServer();
  if (!serverRunning) {
    log('Server is not running on localhost:5000', 'error');
    log('Please start the server with: npm run dev', 'error');
    return;
  }
  
  log('Server is running, proceeding with tests...', 'success');
  
  // Run all tests
  await runAllBlogTests();
}

// Run the main function
main().catch(error => {
  log(`Test suite failed: ${error.message}`, 'error');
  process.exit(1);
});