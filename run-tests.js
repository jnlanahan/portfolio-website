#!/usr/bin/env node

/**
 * Test Runner Launcher
 * Runs the main test suite from the tests directory
 */

const { spawn } = require('child_process');
const path = require('path');

// Run the main test suite
const testRunner = spawn('node', [path.join(__dirname, 'tests', 'run-tests.js')], {
  stdio: 'inherit',
  cwd: __dirname
});

testRunner.on('close', (code) => {
  process.exit(code);
});

testRunner.on('error', (error) => {
  console.error('Failed to start test runner:', error);
  process.exit(1);
});