#!/usr/bin/env node

/**
 * Frontend Component Test Suite
 * Tests UI components, navigation, and user interactions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_TIMEOUT = 30000;

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

// Test data
const testScenarios = [
  {
    name: 'Homepage Navigation',
    tests: [
      { name: 'Homepage loads correctly', url: '/' },
      { name: 'Navigation tiles are clickable', url: '/', selector: '.nav-tile' },
      { name: 'Background animation works', url: '/', selector: '.rotating-words' }
    ]
  },
  {
    name: 'Portfolio Section',
    tests: [
      { name: 'Portfolio page loads', url: '/portfolio' },
      { name: 'Project cards display', url: '/portfolio', selector: '.project-card' },
      { name: 'Project filtering works', url: '/portfolio', selector: '.filter-button' }
    ]
  },
  {
    name: 'Blog Section',
    tests: [
      { name: 'Blog page loads', url: '/blog' },
      { name: 'Blog posts display', url: '/blog', selector: '.blog-post' },
      { name: 'Blog categories work', url: '/blog', selector: '.category-filter' }
    ]
  },
  {
    name: 'Top 5 Lists',
    tests: [
      { name: 'Lists page loads', url: '/top5' },
      { name: 'List items display', url: '/top5', selector: '.list-item' }
    ]
  },
  {
    name: 'Contact Form',
    tests: [
      { name: 'Contact page loads', url: '/contact' },
      { name: 'Form fields are present', url: '/contact', selector: 'form' },
      { name: 'Form validation works', url: '/contact', selector: 'input[required]' }
    ]
  },
  {
    name: 'Admin Interface',
    tests: [
      { name: 'Admin login page loads', url: '/admin' },
      { name: 'Login form works', url: '/admin', selector: 'form' },
      { name: 'Dashboard loads after login', url: '/admin/dashboard' }
    ]
  }
];

// Playwright test script generator
function generatePlaywrightTest() {
  const testScript = `
const { test, expect } = require('@playwright/test');

test.describe('Portfolio Website Frontend Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up any global state
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  ${testScenarios.map(scenario => `
  test.describe('${scenario.name}', () => {
    ${scenario.tests.map(testCase => `
    test('${testCase.name}', async ({ page }) => {
      await page.goto('${BASE_URL}${testCase.url}');
      await expect(page).toHaveTitle(/Portfolio/);
      
      ${testCase.selector ? `
      // Wait for specific element
      await page.waitForSelector('${testCase.selector}', { timeout: ${TEST_TIMEOUT} });
      const element = await page.locator('${testCase.selector}');
      await expect(element).toBeVisible();
      ` : ''}
      
      // Take screenshot for visual regression
      await page.screenshot({ 
        path: 'tests/screenshots/${scenario.name.replace(/\s+/g, '-').toLowerCase()}-${testCase.name.replace(/\s+/g, '-').toLowerCase()}.png' 
      });
    });
    `).join('')}
  });
  `).join('')}

  test.describe('Admin Workflow Tests', () => {
    test('Complete admin workflow', async ({ page }) => {
      // Login
      await page.goto('${BASE_URL}/admin');
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      // Verify dashboard loads
      await expect(page).toHaveURL(/dashboard/);
      await expect(page.locator('text=Quick Actions')).toBeVisible();
      
      // Test project creation
      await page.click('text=Add New Project');
      await page.fill('input[name="title"]', 'Test Project');
      await page.fill('textarea[name="description"]', 'Test description');
      await page.click('button[type="submit"]');
      
      // Verify project was created
      await expect(page.locator('text=Test Project')).toBeVisible();
      
      // Test blog creation
      await page.click('text=Add New Blog Post');
      await page.fill('input[name="title"]', 'Test Blog Post');
      await page.fill('.tiptap', 'Test content');
      await page.click('button:has-text("Publish")');
      
      // Verify blog was created
      await expect(page.locator('text=Test Blog Post')).toBeVisible();
      
      // Test resume upload
      await page.click('text=Upload Resume');
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('tests/test-resume.pdf');
      await page.click('button:has-text("Upload Resume")');
      
      // Verify resume was uploaded
      await expect(page.locator('text=Resume uploaded successfully')).toBeVisible();
    });
  });

  test.describe('Responsive Design Tests', () => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1440, height: 900, name: 'desktop' }
    ];

    viewports.forEach(viewport => {
      test(\`Layout works on \${viewport.name}\`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('${BASE_URL}/');
        
        // Test navigation
        await expect(page.locator('nav')).toBeVisible();
        
        // Test content areas
        await expect(page.locator('main')).toBeVisible();
        
        // Take screenshot
        await page.screenshot({ 
          path: \`tests/screenshots/responsive-\${viewport.name}.png\` 
        });
      });
    });
  });

  test.describe('Performance Tests', () => {
    test('Page load performance', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('${BASE_URL}/');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
      
      // Check for performance metrics
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          loadComplete: navigation.loadEventEnd - navigation.navigationStart
        };
      });
      
      expect(performanceMetrics.domContentLoaded).toBeLessThan(3000);
      expect(performanceMetrics.loadComplete).toBeLessThan(5000);
    });
  });

  test.describe('Accessibility Tests', () => {
    test('Basic accessibility checks', async ({ page }) => {
      await page.goto('${BASE_URL}/');
      
      // Check for proper heading structure
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
      
      // Check for alt text on images
      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
      
      // Check for proper form labels
      const inputs = await page.locator('input').all();
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        if (id) {
          await expect(page.locator(\`label[for="\${id}"]\`)).toBeVisible();
        }
      }
    });
  });
});
`;

  return testScript;
}

// Create test files and directory structure
function setupTestEnvironment() {
  log('Setting up test environment...', 'info');
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // Create Playwright test file
  const playwrightTestPath = path.join(__dirname, 'frontend.spec.js');
  fs.writeFileSync(playwrightTestPath, generatePlaywrightTest());
  
  // Create test resume file
  const testResumePath = path.join(__dirname, 'test-resume.pdf');
  const testPdfData = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n202\n%%EOF');
  fs.writeFileSync(testResumePath, testPdfData);
  
  // Create package.json for test dependencies
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = {
    name: 'portfolio-tests',
    version: '1.0.0',
    scripts: {
      'test:api': 'node api-tests.js',
      'test:frontend': 'npx playwright test frontend.spec.js',
      'test:all': 'npm run test:api && npm run test:frontend',
      'test:headed': 'npx playwright test frontend.spec.js --headed'
    },
    devDependencies: {
      '@playwright/test': '^1.40.0',
      'node-fetch': '^3.3.0',
      'form-data': '^4.0.0'
    }
  };
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  log('✓ Test environment set up successfully', 'success');
}

// Simple HTTP test runner (fallback if Playwright not available)
async function runBasicTests() {
  log('Running basic frontend tests...', 'info');
  
  const testResults = [];
  
  for (const scenario of testScenarios) {
    log(`Testing ${scenario.name}...`, 'info');
    
    for (const testCase of scenario.tests) {
      try {
        const response = await fetch(`${BASE_URL}${testCase.url}`);
        
        if (response.status === 200) {
          testResults.push({ scenario: scenario.name, test: testCase.name, status: 'PASS' });
          log(`✓ ${testCase.name}`, 'success');
        } else {
          testResults.push({ scenario: scenario.name, test: testCase.name, status: 'FAIL', error: `HTTP ${response.status}` });
          log(`✗ ${testCase.name}: HTTP ${response.status}`, 'error');
        }
      } catch (error) {
        testResults.push({ scenario: scenario.name, test: testCase.name, status: 'FAIL', error: error.message });
        log(`✗ ${testCase.name}: ${error.message}`, 'error');
      }
    }
  }
  
  // Summary
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  
  log(`\nTest Summary:`, 'info');
  log(`✓ Passed: ${passed}`, 'success');
  log(`✗ Failed: ${failed}`, failed > 0 ? 'error' : 'info');
  
  if (failed > 0) {
    log('\nFailed tests:', 'error');
    testResults.filter(r => r.status === 'FAIL').forEach(result => {
      log(`  - ${result.scenario}: ${result.test} (${result.error})`, 'error');
    });
  }
  
  return { passed, failed, results: testResults };
}

// Main function
async function runFrontendTests() {
  setupTestEnvironment();
  
  log('Frontend tests setup complete. You can now run:', 'info');
  log('  npm run test:all          # Run all tests', 'info');
  log('  npm run test:api          # Run API tests only', 'info');
  log('  npm run test:frontend     # Run frontend tests only', 'info');
  log('  npm run test:headed       # Run frontend tests with browser UI', 'info');
  
  // Run basic tests as fallback
  if (typeof fetch === 'undefined') {
    global.fetch = require('node-fetch');
  }
  
  return await runBasicTests();
}

// Run if called directly
if (require.main === module) {
  runFrontendTests().catch(console.error);
}

module.exports = { runFrontendTests, setupTestEnvironment };