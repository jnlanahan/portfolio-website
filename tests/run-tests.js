#!/usr/bin/env node

/**
 * Simple Test Runner for Portfolio Website
 * Runs comprehensive test suite to verify all functionality
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m'
  };
  console.log(`${colors[type]}[${timestamp}] ${message}\x1b[0m`);
}

async function checkServerHealth() {
  try {
    const response = await fetch('http://localhost:5000/api/portfolio');
    if (response.ok) {
      log('✓ Server is running and healthy', 'success');
      return true;
    } else {
      log('✗ Server responded with error', 'error');
      return false;
    }
  } catch (error) {
    log('✗ Server is not responding', 'error');
    log('Please make sure the server is running with: npm run dev', 'warn');
    return false;
  }
}

async function runApiTests() {
  log('Running comprehensive API tests...', 'info');
  try {
    execSync('node tests/api-tests.js', { stdio: 'inherit', cwd: __dirname });
    log('✓ API tests completed successfully', 'success');
    return true;
  } catch (error) {
    log('✗ API tests failed', 'error');
    return false;
  }
}

async function main() {
  log('Starting Portfolio Website Test Suite', 'info');
  
  // Check if server is running
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    log('Please start the server first with: npm run dev', 'error');
    process.exit(1);
  }
  
  // Run API tests
  const apiTestsPassed = await runApiTests();
  
  if (apiTestsPassed) {
    log('🎉 All tests passed! Your portfolio website is working correctly.', 'success');
    log('Test coverage includes:', 'info');
    log('  ✓ Admin authentication system', 'success');
    log('  ✓ Project CRUD operations', 'success');
    log('  ✓ Blog management with draft/publish', 'success');
    log('  ✓ Contact form functionality', 'success');
    log('  ✓ Public API endpoints', 'success');
    log('  ✓ Resume management system', 'success');
  } else {
    log('❌ Some tests failed. Please check the output above.', 'error');
    process.exit(1);
  }
}

// Import fetch if needed
if (typeof fetch === 'undefined') {
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
}

main().catch(console.error);