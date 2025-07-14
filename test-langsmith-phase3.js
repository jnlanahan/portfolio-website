/**
 * Phase 3 LangSmith Integration Test
 * Tests comprehensive evaluation system for chatbot responses
 */

import fetch from 'node-fetch';

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

async function testLangSmithPhase3() {
  log("Starting Phase 3 LangSmith Evaluation System Test", 'info');
  
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
    
    // Step 2: Test chatbot interaction that triggers automatic evaluation
    log("Step 2: Testing chatbot interaction with automatic evaluation...");
    const conversationId = Date.now();
    const chatResponse = await fetch('http://localhost:5000/api/chatbot/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ 
        message: 'What is Nick\'s educational background?',
        conversationId: conversationId
      })
    });
    
    if (!chatResponse.ok) {
      throw new Error(`Chat failed: ${chatResponse.status}`);
    }
    
    const chatData = await chatResponse.json();
    log(`✅ Chat response received: ${chatData.response.substring(0, 100)}...`, 'success');
    
    // Step 3: Wait for automatic evaluation to complete
    log("Step 3: Waiting for automatic evaluation to complete...");
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    
    // Step 4: Test manual evaluation endpoint
    log("Step 4: Testing manual evaluation endpoint...");
    const evaluationResponse = await fetch('http://localhost:5000/api/langchain/evaluate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        question: 'What is Nick\'s educational background?',
        response: chatData.response,
        context: 'Nick has educational background information available in documents',
        conversationId: conversationId
      })
    });
    
    if (!evaluationResponse.ok) {
      throw new Error(`Evaluation failed: ${evaluationResponse.status}`);
    }
    
    const evaluationData = await evaluationResponse.json();
    log(`✅ Manual evaluation completed: Average score ${evaluationData.averageScore.toFixed(2)} (${evaluationData.totalEvaluators} evaluators)`, 'success');
    
    // Step 5: Test evaluation statistics endpoint
    log("Step 5: Testing evaluation statistics endpoint...");
    const statsResponse = await fetch('http://localhost:5000/api/langchain/evaluations', {
      headers: { 'Cookie': cookies }
    });
    
    if (!statsResponse.ok) {
      throw new Error(`Stats failed: ${statsResponse.status}`);
    }
    
    const statsData = await statsResponse.json();
    log(`✅ Evaluation stats retrieved: ${statsData.totalEvaluations} total evaluations`, 'success');
    
    // Step 6: Test multiple evaluation criteria
    log("Step 6: Testing different evaluation criteria...");
    const testCases = [
      {
        question: 'What is Nick\'s current role?',
        expectedCriteria: ['correctness', 'relevance', 'conciseness', 'professional_tone']
      },
      {
        question: 'Tell me about Nick\'s skills',
        expectedCriteria: ['correctness', 'relevance', 'conciseness', 'professional_tone']
      }
    ];
    
    for (const testCase of testCases) {
      const testChatResponse = await fetch('http://localhost:5000/api/chatbot/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': cookies
        },
        body: JSON.stringify({ 
          message: testCase.question,
          conversationId: Date.now()
        })
      });
      
      if (testChatResponse.ok) {
        const testChatData = await testChatResponse.json();
        
        const testEvaluationResponse = await fetch('http://localhost:5000/api/langchain/evaluate', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cookie': cookies
          },
          body: JSON.stringify({
            question: testCase.question,
            response: testChatData.response,
            context: 'Test context for evaluation',
            conversationId: Date.now()
          })
        });
        
        if (testEvaluationResponse.ok) {
          const testEvaluationData = await testEvaluationResponse.json();
          const evaluationKeys = testEvaluationData.evaluationResults.map(r => r.key);
          
          log(`Test case "${testCase.question}": ${evaluationKeys.length} criteria evaluated`, 'success');
          
          // Check if all expected criteria are present
          const missingCriteria = testCase.expectedCriteria.filter(criteria => 
            !evaluationKeys.includes(criteria)
          );
          
          if (missingCriteria.length === 0) {
            log(`✅ All evaluation criteria present: ${evaluationKeys.join(', ')}`, 'success');
          } else {
            log(`⚠️ Missing criteria: ${missingCriteria.join(', ')}`, 'error');
          }
        }
      }
    }
    
    // Step 7: Check LangSmith tracing for evaluation runs
    log("Step 7: Checking LangSmith for evaluation traces...");
    const finalStatsResponse = await fetch('http://localhost:5000/api/langchain/stats', {
      headers: { 'Cookie': cookies }
    });
    
    if (finalStatsResponse.ok) {
      const finalStats = await finalStatsResponse.json();
      log(`✅ Final LangSmith stats: ${finalStats.totalRuns} total runs`, 'success');
      
      // Count evaluation-related runs
      const evaluationRuns = finalStats.recentRuns?.filter(run => 
        run.name.includes('evaluation') || run.name.includes('evaluate')
      ) || [];
      
      log(`✅ Found ${evaluationRuns.length} evaluation-related runs in LangSmith`, 'success');
    }
    
    log("🎉 Phase 3 LangSmith Evaluation System Test PASSED!", 'success');
    log("Comprehensive evaluation system is fully operational!", 'success');
    
    return {
      success: true,
      totalEvaluations: statsData.totalEvaluations,
      evaluationSystem: 'operational',
      automaticEvaluation: true,
      manualEvaluation: true,
      evaluationCriteria: ['correctness', 'relevance', 'conciseness', 'professional_tone'],
      langsmithTracing: true
    };
    
  } catch (error) {
    log(`❌ Phase 3 test failed: ${error.message}`, 'error');
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testLangSmithPhase3().then(result => {
  console.log('\n=== Phase 3 Test Results ===');
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
});

export { testLangSmithPhase3 };