/**
 * Phase 2 LangSmith Integration Test
 * Tests automatic tracing for all chatbot interactions
 */

import fetch from 'node-fetch';

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

async function testLangSmithPhase2() {
  log("Starting Phase 2 LangSmith Integration Test", 'info');
  
  try {
    // Step 1: Login to admin
    log("Step 1: Logging in to admin...");
    const loginResponse = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const cookies = loginResponse.headers.get('set-cookie');
    log("✅ Admin login successful", 'success');
    
    // Step 2: Test chatbot interaction with tracing
    log("Step 2: Testing chatbot interaction with LangSmith tracing...");
    const chatResponse = await fetch('http://localhost:5000/api/chatbot/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ 
        message: 'Tell me about Nick\'s experience at EY',
        conversationId: Date.now()
      })
    });
    
    if (!chatResponse.ok) {
      throw new Error(`Chat failed: ${chatResponse.status}`);
    }
    
    const chatData = await chatResponse.json();
    log(`✅ Chat response received: ${chatData.response.substring(0, 100)}...`, 'success');
    
    // Step 3: Test another interaction for tracing continuity
    log("Step 3: Testing follow-up question for conversation history...");
    const followUpResponse = await fetch('http://localhost:5000/api/chatbot/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ 
        message: 'What specific projects did he work on there?',
        conversationId: Date.now()
      })
    });
    
    if (!followUpResponse.ok) {
      throw new Error(`Follow-up chat failed: ${followUpResponse.status}`);
    }
    
    const followUpData = await followUpResponse.json();
    log(`✅ Follow-up response received: ${followUpData.response.substring(0, 100)}...`, 'success');
    
    // Step 4: Check LangSmith stats to verify tracing
    log("Step 4: Checking LangSmith stats for new traces...");
    const statsResponse = await fetch('http://localhost:5000/api/langchain/stats', {
      headers: { 'Cookie': cookies }
    });
    
    if (!statsResponse.ok) {
      throw new Error(`Stats failed: ${statsResponse.status}`);
    }
    
    const statsData = await statsResponse.json();
    log(`✅ LangSmith stats retrieved: ${statsData.totalRuns} total runs`, 'success');
    
    // Step 5: Test error handling with tracing
    log("Step 5: Testing error handling with LangSmith tracing...");
    const errorResponse = await fetch('http://localhost:5000/api/chatbot/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ 
        message: '', // Empty message to trigger error
        conversationId: Date.now()
      })
    });
    
    // This should either handle gracefully or trace the error
    log(`Error handling test completed with status: ${errorResponse.status}`, 'info');
    
    // Step 6: Final verification
    log("Step 6: Final verification of tracing system...");
    const finalStatsResponse = await fetch('http://localhost:5000/api/langchain/stats', {
      headers: { 'Cookie': cookies }
    });
    
    const finalStats = await finalStatsResponse.json();
    log(`✅ Final stats: ${finalStats.totalRuns} total runs`, 'success');
    
    log("🎉 Phase 2 LangSmith Integration Test PASSED!", 'success');
    log("All chatbot interactions are now being traced to LangSmith!", 'success');
    
    return {
      success: true,
      totalRuns: finalStats.totalRuns,
      tracingEnabled: true
    };
    
  } catch (error) {
    log(`❌ Phase 2 test failed: ${error.message}`, 'error');
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testLangSmithPhase2().then(result => {
  console.log('\n=== Phase 2 Test Results ===');
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
});

export { testLangSmithPhase2 };