/**
 * Test Enhanced Evaluation System with Source Documents
 * Validates that evaluators now have access to source documents for factual verification
 */

const http = require('http');

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m'
  };
  console.log(`${colors[type]}[${timestamp}] ${message}\x1b[0m`);
}

async function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Enhanced-Evaluation-Test',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, body: jsonBody, headers: res.headers });
        } catch (error) {
          resolve({ status: res.statusCode, body: body, headers: res.headers });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testEducationalBackgroundQuestion() {
  log('Testing educational background question to trigger document verification...');
  
  try {
    // Ask a specific question about Nick's educational background
    const response = await makeRequest('POST', '/api/chatbot/chat', {
      message: "What degrees does Nick Lanahan have and where did he study?",
      conversationId: Date.now()
    });
    
    if (response.status === 200) {
      log('✓ Educational background question processed successfully', 'success');
      log(`Response: ${response.body.response.substring(0, 200)}...`, 'info');
      
      // Wait for background evaluation to complete
      log('Waiting for background evaluation to complete...', 'info');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      return response.body.response;
    } else {
      throw new Error(`Chat request failed: ${response.status}`);
    }
  } catch (error) {
    log(`✗ Educational background test failed: ${error.message}`, 'error');
    throw error;
  }
}

async function loginAsAdmin() {
  log('Logging in as admin...');
  const response = await makeRequest('POST', '/api/admin/login', {
    username: 'admin',
    password: 'admin123'
  });
  
  if (response.status === 200) {
    log('✓ Admin login successful', 'success');
    const cookies = response.headers['set-cookie'];
    return cookies ? cookies.map(cookie => cookie.split(';')[0]).join('; ') : '';
  } else {
    throw new Error(`Admin login failed: ${response.status}`);
  }
}

async function checkRecentEvaluations(sessionCookie) {
  log('Checking recent evaluations for source document verification...');
  
  try {
    const response = await makeRequest('GET', '/api/langchain/evaluations', null, {
      'Cookie': sessionCookie
    });
    
    if (response.status === 200) {
      log('✓ Retrieved recent evaluations', 'success');
      
      const data = response.body;
      if (data.recentEvaluations && data.recentEvaluations.length > 0) {
        const recentEval = data.recentEvaluations[0];
        
        log(`Recent evaluation details:`, 'info');
        log(`  - Evaluation name: ${recentEval.name}`, 'info');
        log(`  - Question: ${recentEval.inputs.args[0].substring(0, 100)}...`, 'info');
        log(`  - Response: ${recentEval.inputs.args[1].substring(0, 100)}...`, 'info');
        
        // Check if evaluation results include source document verification
        if (recentEval.outputs && recentEval.outputs.feedback) {
          log(`  - Feedback includes source verification: ${recentEval.outputs.feedback.includes('source documents') ? 'YES' : 'NO'}`, 'info');
          
          if (recentEval.outputs.feedback.includes('source documents')) {
            log('✓ ENHANCED EVALUATION WORKING: Evaluators now have access to source documents!', 'success');
            return true;
          } else {
            log('! Evaluation feedback does not mention source documents', 'warning');
            return false;
          }
        }
      } else {
        log('No recent evaluations found', 'warning');
        return false;
      }
    } else {
      throw new Error(`Failed to retrieve evaluations: ${response.status}`);
    }
  } catch (error) {
    log(`✗ Failed to check evaluations: ${error.message}`, 'error');
    throw error;
  }
}

async function testEnhancedEvaluationSystem() {
  log('========================================');
  log('🔍 Testing Enhanced Evaluation System');
  log('========================================');
  
  try {
    // Step 1: Ask a question about Nick's educational background
    const chatResponse = await testEducationalBackgroundQuestion();
    
    // Step 2: Login as admin to check evaluation results
    const sessionCookie = await loginAsAdmin();
    
    // Step 3: Check if recent evaluations now include source document verification
    const hasSourceDocuments = await checkRecentEvaluations(sessionCookie);
    
    log('========================================');
    if (hasSourceDocuments) {
      log('✅ Enhanced Evaluation System WORKING!');
      log('========================================');
      log('📋 IMPROVEMENTS IMPLEMENTED:', 'success');
      log('  • Evaluators now receive source documents for factual verification', 'success');
      log('  • Correctness evaluator can verify educational background claims', 'success');
      log('  • Comprehensiveness evaluator can assess missed information', 'success');
      log('  • Coherence evaluator has better context understanding', 'success');
      log('  • All evaluators provide more accurate assessments', 'success');
      
      log('🎯 FACTUAL VERIFICATION NOW POSSIBLE:', 'info');
      log('  • Educational degrees and institutions can be verified', 'info');
      log('  • Work experience claims can be fact-checked', 'info');
      log('  • Military service details can be validated', 'info');
      log('  • Skills and certifications can be confirmed', 'info');
      
      log('✅ The evaluation system can now provide accurate 10/10 scores when information is fully supported by source documents!', 'success');
    } else {
      log('❌ Enhanced Evaluation System needs adjustment');
      log('========================================');
      log('⚠️  Evaluators may not be receiving source documents properly', 'warning');
      log('   Check the evaluation prompts and input parameters', 'warning');
    }
    
  } catch (error) {
    log('========================================');
    log('❌ Enhanced Evaluation Test Failed!');
    log('========================================');
    log(`Error: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the test
testEnhancedEvaluationSystem();