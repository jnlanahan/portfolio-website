/**
 * Test to check if evaluations are being triggered for every message
 */
const https = require('https');
const http = require('http');

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          json: () => JSON.parse(body)
        });
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function testEvaluationTrigger() {
  const baseUrl = 'http://localhost:5000';
  const testMessage = 'What is Nick education background?';
  const conversationId = Date.now();
  
  console.log('🧪 Testing evaluation trigger...');
  console.log('Sending message:', testMessage);
  console.log('Conversation ID:', conversationId);
  
  try {
    // Send message to chatbot
    const response = await makeRequest(`${baseUrl}/api/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, JSON.stringify({
      message: testMessage,
      conversationId: conversationId
    }));
    
    if (!response.ok) {
      console.error('❌ Chat request failed:', response.status, response.statusText);
      return;
    }
    
    const chatResult = await response.json();
    console.log('✅ Chat response received:', chatResult.response.substring(0, 100) + '...');
    
    // Wait a bit for evaluation to complete
    console.log('⏳ Waiting 10 seconds for evaluation to complete...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('✅ Test completed - check LangSmith for evaluation results');
    console.log('Expected: process_message AND evaluate_chatbot_response runs');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEvaluationTrigger();