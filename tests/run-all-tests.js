#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Runs all tests for the portfolio website including API, frontend, and integration tests
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      cwd: __dirname,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function checkServerHealth() {
  log('Checking server health...', 'info');
  
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

async function setupDependencies() {
  log('Installing test dependencies...', 'info');
  
  try {
    await runCommand('npm', ['install']);
    log('✓ Dependencies installed', 'success');
  } catch (error) {
    log('✗ Failed to install dependencies', 'error');
    throw error;
  }
}

async function runApiTests() {
  log('Running API tests...', 'info');
  
  try {
    await runCommand('node', ['api-tests.js']);
    log('✓ API tests completed', 'success');
    return true;
  } catch (error) {
    log('✗ API tests failed', 'error');
    return false;
  }
}

async function runFrontendTests() {
  log('Running frontend tests...', 'info');
  
  try {
    // Check if Playwright is available
    if (fs.existsSync(path.join(__dirname, 'node_modules', '@playwright', 'test'))) {
      await runCommand('npx', ['playwright', 'test', 'frontend.spec.js', '--reporter=line']);
      log('✓ Frontend tests completed', 'success');
    } else {
      log('Playwright not available, running basic frontend tests...', 'warn');
      await runCommand('node', ['frontend-tests.js']);
      log('✓ Basic frontend tests completed', 'success');
    }
    return true;
  } catch (error) {
    log('✗ Frontend tests failed', 'error');
    return false;
  }
}

async function generateTestReport() {
  log('Generating test report...', 'info');
  
  const reportPath = path.join(__dirname, 'test-report.html');
  const reportContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Portfolio Website Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 8px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .info { color: #17a2b8; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Portfolio Website Test Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="section">
        <h2>Test Summary</h2>
        <p>This report covers comprehensive testing of the portfolio website including:</p>
        <ul>
            <li>API endpoint testing</li>
            <li>Frontend component testing</li>
            <li>Admin functionality testing</li>
            <li>File upload testing</li>
            <li>Database operations testing</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>Test Areas Covered</h2>
        <h3>API Tests</h3>
        <ul>
            <li>Admin authentication and authorization</li>
            <li>Project CRUD operations</li>
            <li>Blog post management</li>
            <li>Resume upload and download</li>
            <li>Contact form submissions</li>
            <li>File upload functionality</li>
        </ul>
        
        <h3>Frontend Tests</h3>
        <ul>
            <li>Page navigation and routing</li>
            <li>Component rendering</li>
            <li>Form validation</li>
            <li>Responsive design</li>
            <li>User interactions</li>
            <li>Admin interface workflows</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>Test Commands</h2>
        <pre>
# Run all tests
npm run test:all

# Run API tests only
npm run test:api

# Run frontend tests only
npm run test:frontend

# Run frontend tests with browser UI
npm run test:headed

# Run individual test
node api-tests.js
node frontend-tests.js
        </pre>
    </div>
    
    <div class="section">
        <h2>Test Files</h2>
        <ul>
            <li><strong>api-tests.js</strong> - Comprehensive API endpoint testing</li>
            <li><strong>frontend-tests.js</strong> - Frontend component and UI testing</li>
            <li><strong>frontend.spec.js</strong> - Playwright test specifications</li>
            <li><strong>run-all-tests.js</strong> - Test runner and orchestration</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>Screenshots</h2>
        <p>Screenshots are automatically generated in the <code>screenshots/</code> directory during frontend tests.</p>
    </div>
</body>
</html>
  `;
  
  fs.writeFileSync(reportPath, reportContent);
  log(`✓ Test report generated: ${reportPath}`, 'success');
}

async function main() {
  log('Starting comprehensive test suite...', 'info');
  
  const results = {
    server: false,
    api: false,
    frontend: false
  };
  
  try {
    // Check server health
    results.server = await checkServerHealth();
    if (!results.server) {
      log('Server health check failed. Please start the server first.', 'error');
      process.exit(1);
    }
    
    // Setup dependencies
    await setupDependencies();
    
    // Run API tests
    results.api = await runApiTests();
    
    // Run frontend tests
    results.frontend = await runFrontendTests();
    
    // Generate report
    await generateTestReport();
    
    // Final summary
    log('\n=== Test Summary ===', 'info');
    log(`Server Health: ${results.server ? '✓ PASS' : '✗ FAIL'}`, results.server ? 'success' : 'error');
    log(`API Tests: ${results.api ? '✓ PASS' : '✗ FAIL'}`, results.api ? 'success' : 'error');
    log(`Frontend Tests: ${results.frontend ? '✓ PASS' : '✗ FAIL'}`, results.frontend ? 'success' : 'error');
    
    const allPassed = results.server && results.api && results.frontend;
    if (allPassed) {
      log('\n🎉 All tests passed!', 'success');
    } else {
      log('\n❌ Some tests failed. Please check the logs above.', 'error');
      process.exit(1);
    }
    
  } catch (error) {
    log(`Test runner failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Import fetch if not available
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Run main function if called directly
if (require.main === module) {
  main();
}

module.exports = { main };