/**
 * Phase 1 LangSmith Integration Test
 * Tests basic connection and configuration
 */

import fetch from 'node-fetch';

async function testLangSmithPhase1() {
  console.log('🧪 Starting Phase 1 LangSmith Integration Test...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    if (!healthResponse.ok) {
      throw new Error('Server is not running');
    }
    console.log('✅ Server is running\n');
    
    // Test 2: Check environment variables
    console.log('2. Checking environment variables...');
    const envVars = {
      LANGCHAIN_API_KEY: !!process.env.LANGCHAIN_API_KEY,
      LANGCHAIN_TRACING_V2: process.env.LANGCHAIN_TRACING_V2,
      LANGCHAIN_PROJECT: process.env.LANGCHAIN_PROJECT,
      LANGCHAIN_ENDPOINT: process.env.LANGCHAIN_ENDPOINT,
    };
    
    console.log('Environment Variables Status:');
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`  ${key}: ${value || 'NOT SET'}`);
    });
    
    const missingVars = Object.entries(envVars).filter(([key, value]) => !value);
    if (missingVars.length > 0) {
      console.log('⚠️  Missing required environment variables:', missingVars.map(([key]) => key).join(', '));
    } else {
      console.log('✅ All environment variables are set\n');
    }
    
    // Test 3: Test LangSmith connection endpoint
    console.log('3. Testing LangSmith connection endpoint...');
    try {
      const connectionResponse = await fetch('http://localhost:5000/api/langchain/test-connection');
      const connectionResult = await connectionResponse.json();
      
      if (connectionResult.success) {
        console.log('✅ LangSmith connection successful!');
        console.log('Config:', JSON.stringify(connectionResult.config, null, 2));
      } else {
        console.log('❌ LangSmith connection failed:', connectionResult.message);
        console.log('Config:', JSON.stringify(connectionResult.config, null, 2));
      }
    } catch (error) {
      console.log('❌ Failed to test LangSmith connection:', error.message);
      console.log('This might be because admin authentication is required');
    }
    
    console.log('\n🎯 Phase 1 Test Results:');
    console.log('✅ Server is running');
    console.log(missingVars.length === 0 ? '✅ Environment variables configured' : '⚠️  Environment variables need setup');
    console.log('⏳ LangSmith connection test requires admin authentication');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Set up the missing environment variables in your Replit secrets');
    console.log('2. Log in to admin panel and test the connection');
    console.log('3. Verify traces appear in LangSmith dashboard');
    
  } catch (error) {
    console.error('❌ Phase 1 test failed:', error.message);
  }
}

// Run the test
testLangSmithPhase1();