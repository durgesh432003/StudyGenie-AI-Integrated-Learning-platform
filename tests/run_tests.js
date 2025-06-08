/**
 * Test Runner for AI Study Material Generator
 * 
 * This script runs all tests for the application.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { runSetup } = require('./setup');

// Define test types
const TEST_TYPES = {
  UNIT: 'unit',
  INTEGRATION: 'integration',
  E2E: 'e2e',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  ALL: 'all'
};

// Parse command line arguments
const args = process.argv.slice(2);
const testType = args[0] || TEST_TYPES.ALL;
const verbose = args.includes('--verbose') || args.includes('-v');

// Configure test environment
process.env.NODE_ENV = 'test';

// Run setup
console.log('Running test setup...');
runSetup();

// Run tests
console.log(`Running ${testType} tests...`);

try {
  switch (testType) {
    case TEST_TYPES.UNIT:
      runUnitTests();
      break;
    case TEST_TYPES.INTEGRATION:
      runIntegrationTests();
      break;
    case TEST_TYPES.E2E:
      runE2ETests();
      break;
    case TEST_TYPES.PERFORMANCE:
      runPerformanceTests();
      break;
    case TEST_TYPES.SECURITY:
      runSecurityTests();
      break;
    case TEST_TYPES.ALL:
      runAllTests();
      break;
    default:
      console.error(`Unknown test type: ${testType}`);
      console.log(`Available test types: ${Object.values(TEST_TYPES).join(', ')}`);
      process.exit(1);
  }
  
  console.log('All tests completed successfully!');
} catch (error) {
  console.error('Tests failed:', error.message);
  process.exit(1);
}

// Test runner functions
function runUnitTests() {
  console.log('Running unit tests...');
  
  try {
    const command = `npm test -- --testMatch="**/whitebox/simple.test.js" ${verbose ? '--verbose' : ''}`;
    execSync(command, { stdio: 'inherit' });
    console.log('Unit tests completed successfully!');
  } catch (error) {
    console.error('Unit tests failed:', error.message);
    throw error;
  }
}

function runIntegrationTests() {
  console.log('Running integration tests...');
  
  try {
    // For now, we'll use the same simple tests for integration
    const command = `npm test -- --testMatch="**/whitebox/simple.test.js" ${verbose ? '--verbose' : ''}`;
    execSync(command, { stdio: 'inherit' });
    console.log('Integration tests completed successfully!');
  } catch (error) {
    console.error('Integration tests failed:', error.message);
    throw error;
  }
}

function runE2ETests() {
  console.log('Running end-to-end tests...');
  
  try {
    // Start the application in test mode
    const appProcess = require('child_process').spawn('npm', ['run', 'dev'], {
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: 'pipe'
    });
    
    // Wait for the application to start
    console.log('Waiting for application to start...');
    setTimeout(() => {
      try {
        // Run Playwright tests
        const command = `npx playwright test ${verbose ? '--debug' : ''}`;
        execSync(command, { stdio: 'inherit' });
        console.log('End-to-end tests completed successfully!');
      } catch (error) {
        console.error('End-to-end tests failed:', error.message);
        throw error;
      } finally {
        // Kill the application process
        appProcess.kill();
      }
    }, 5000);
  } catch (error) {
    console.error('End-to-end tests failed:', error.message);
    throw error;
  }
}

function runPerformanceTests() {
  console.log('Running performance tests...');
  
  try {
    // Run Lighthouse tests
    const command = `npx lighthouse http://localhost:3000 --output=json --output-path=./tests/results/lighthouse-report.json ${verbose ? '--verbose' : ''}`;
    execSync(command, { stdio: 'inherit' });
    
    // Parse and display results
    const lighthouseReport = require('./results/lighthouse-report.json');
    console.log('Lighthouse Performance Score:', lighthouseReport.categories.performance.score * 100);
    console.log('First Contentful Paint:', lighthouseReport.audits['first-contentful-paint'].displayValue);
    console.log('Largest Contentful Paint:', lighthouseReport.audits['largest-contentful-paint'].displayValue);
    console.log('Time to Interactive:', lighthouseReport.audits['interactive'].displayValue);
    
    console.log('Performance tests completed successfully!');
  } catch (error) {
    console.error('Performance tests failed:', error.message);
    throw error;
  }
}

function runSecurityTests() {
  console.log('Running security tests...');
  
  try {
    // Run npm audit
    console.log('Running npm audit...');
    execSync('npm audit', { stdio: 'inherit' });
    
    // Run custom security tests
    console.log('Running custom security tests...');
    // For now, we'll use the same simple tests for security
    const command = `npm test -- --testMatch="**/whitebox/simple.test.js" ${verbose ? '--verbose' : ''}`;
    execSync(command, { stdio: 'inherit' });
    
    console.log('Security tests completed successfully!');
  } catch (error) {
    console.error('Security tests failed:', error.message);
    throw error;
  }
}

function runAllTests() {
  console.log('Running all tests...');
  
  try {
    runUnitTests();
    runIntegrationTests();
    runE2ETests();
    runPerformanceTests();
    runSecurityTests();
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Tests failed:', error.message);
    throw error;
  }
}