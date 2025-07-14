/**
 * Phase 4 LangSmith Integration Test
 * Tests advanced analytics and optimization features
 */

const http = require('http');
const querystring = require('querystring');

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
        'User-Agent': 'LangSmith-Phase4-Test',
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

async function testPerformanceAnalytics(sessionCookie) {
  log('Testing performance analytics endpoint...');
  
  try {
    const response = await makeRequest('GET', '/api/langchain/analytics/performance?timeRange=7d', null, {
      'Cookie': sessionCookie
    });
    
    if (response.status === 200) {
      log('✓ Performance analytics endpoint working', 'success');
      
      // Validate response structure
      const data = response.body;
      const expectedFields = ['responseTimeMetrics', 'evaluationTrends', 'volumeMetrics', 'qualityMetrics'];
      
      for (const field of expectedFields) {
        if (!data[field]) {
          throw new Error(`Missing field: ${field}`);
        }
      }
      
      // Check evaluation trends structure
      const evaluationTrends = data.evaluationTrends;
      const expectedCriteria = ['correctness', 'relevance', 'conciseness', 'professionalTone'];
      
      for (const criterion of expectedCriteria) {
        if (!evaluationTrends[criterion] || !evaluationTrends[criterion].average) {
          throw new Error(`Missing evaluation trend for: ${criterion}`);
        }
      }
      
      log(`✓ Performance analytics data structure validated`, 'success');
      log(`  - Overall quality score: ${data.qualityMetrics.overallScore}`, 'info');
      log(`  - Total interactions: ${data.volumeMetrics.totalInteractions}`, 'info');
      log(`  - Error rate: ${(data.volumeMetrics.errorRate * 100).toFixed(1)}%`, 'info');
      
      return data;
    } else {
      throw new Error(`Performance analytics failed: ${response.status}`);
    }
  } catch (error) {
    log(`✗ Performance analytics test failed: ${error.message}`, 'error');
    throw error;
  }
}

async function testOptimizationInsights(sessionCookie) {
  log('Testing optimization insights endpoint...');
  
  try {
    const response = await makeRequest('GET', '/api/langchain/analytics/optimization', null, {
      'Cookie': sessionCookie
    });
    
    if (response.status === 200) {
      log('✓ Optimization insights endpoint working', 'success');
      
      // Validate response structure
      const data = response.body;
      const expectedFields = ['recommendations', 'abTestingReady', 'currentConfiguration', 'suggestedConfiguration'];
      
      for (const field of expectedFields) {
        if (data[field] === undefined) {
          throw new Error(`Missing field: ${field}`);
        }
      }
      
      // Check recommendations structure
      if (!Array.isArray(data.recommendations) || data.recommendations.length === 0) {
        throw new Error('Recommendations should be a non-empty array');
      }
      
      for (const recommendation of data.recommendations) {
        const requiredFields = ['type', 'priority', 'description', 'action', 'expectedImprovement'];
        for (const field of requiredFields) {
          if (recommendation[field] === undefined) {
            throw new Error(`Missing recommendation field: ${field}`);
          }
        }
      }
      
      log(`✓ Optimization insights data structure validated`, 'success');
      log(`  - Recommendations count: ${data.recommendations.length}`, 'info');
      log(`  - A/B testing ready: ${data.abTestingReady}`, 'info');
      log(`  - Current temperature: ${data.currentConfiguration.temperature}`, 'info');
      
      return data;
    } else {
      throw new Error(`Optimization insights failed: ${response.status}`);
    }
  } catch (error) {
    log(`✗ Optimization insights test failed: ${error.message}`, 'error');
    throw error;
  }
}

async function testAbTestCreation(sessionCookie) {
  log('Testing A/B test creation endpoint...');
  
  try {
    const testConfig = {
      testName: 'Prompt Conciseness Test',
      variantA: {
        name: 'Current Prompt',
        temperature: 0.7,
        maxTokens: 150,
        prompt: 'Current system prompt configuration'
      },
      variantB: {
        name: 'Concise Prompt',
        temperature: 0.6,
        maxTokens: 120,
        prompt: 'Optimized system prompt for conciseness'
      },
      trafficSplit: 0.5
    };
    
    const response = await makeRequest('POST', '/api/langchain/analytics/ab-test', testConfig, {
      'Cookie': sessionCookie
    });
    
    if (response.status === 200) {
      log('✓ A/B test creation endpoint working', 'success');
      
      // Validate response structure
      const data = response.body;
      const expectedFields = ['id', 'name', 'status', 'variants', 'metrics', 'createdAt', 'duration'];
      
      for (const field of expectedFields) {
        if (data[field] === undefined) {
          throw new Error(`Missing field: ${field}`);
        }
      }
      
      // Check variants structure
      if (!data.variants.A || !data.variants.B) {
        throw new Error('Missing variant A or B');
      }
      
      if (data.variants.A.traffic + data.variants.B.traffic !== 1) {
        throw new Error('Traffic split should sum to 1');
      }
      
      log(`✓ A/B test data structure validated`, 'success');
      log(`  - Test ID: ${data.id}`, 'info');
      log(`  - Test name: ${data.name}`, 'info');
      log(`  - Status: ${data.status}`, 'info');
      log(`  - Duration: ${data.duration}`, 'info');
      
      return data;
    } else {
      throw new Error(`A/B test creation failed: ${response.status}`);
    }
  } catch (error) {
    log(`✗ A/B test creation test failed: ${error.message}`, 'error');
    throw error;
  }
}

async function testAnalyticsIntegration(sessionCookie) {
  log('Testing analytics integration with existing evaluation system...');
  
  try {
    // First, get evaluation stats
    const evaluationResponse = await makeRequest('GET', '/api/langchain/evaluations', null, {
      'Cookie': sessionCookie
    });
    
    if (evaluationResponse.status !== 200) {
      throw new Error(`Evaluation stats failed: ${evaluationResponse.status}`);
    }
    
    const evaluationData = evaluationResponse.body;
    
    // Then get analytics data
    const analyticsResponse = await makeRequest('GET', '/api/langchain/analytics/performance', null, {
      'Cookie': sessionCookie
    });
    
    if (analyticsResponse.status !== 200) {
      throw new Error(`Analytics failed: ${analyticsResponse.status}`);
    }
    
    const analyticsData = analyticsResponse.body;
    
    log('✓ Analytics integration with evaluation system working', 'success');
    log(`  - Evaluation runs: ${evaluationData.totalEvaluations}`, 'info');
    log(`  - Analytics quality score: ${analyticsData.qualityMetrics.overallScore}`, 'info');
    log(`  - Analytics interactions: ${analyticsData.volumeMetrics.totalInteractions}`, 'info');
    
    return { evaluationData, analyticsData };
  } catch (error) {
    log(`✗ Analytics integration test failed: ${error.message}`, 'error');
    throw error;
  }
}

async function testPhase4Implementation() {
  log('========================================');
  log('🚀 Starting Phase 4 LangSmith Integration Tests');
  log('========================================');
  
  try {
    // Step 1: Login as admin
    const sessionCookie = await loginAsAdmin();
    
    // Step 2: Test performance analytics
    const performanceData = await testPerformanceAnalytics(sessionCookie);
    
    // Step 3: Test optimization insights
    const optimizationData = await testOptimizationInsights(sessionCookie);
    
    // Step 4: Test A/B test creation
    const abTestData = await testAbTestCreation(sessionCookie);
    
    // Step 5: Test analytics integration
    const integrationData = await testAnalyticsIntegration(sessionCookie);
    
    log('========================================');
    log('✅ Phase 4 Implementation Complete!');
    log('========================================');
    
    // Summary
    log('📊 PHASE 4 SUMMARY:', 'success');
    log(`  • Performance Analytics: ✓ Working`, 'success');
    log(`  • Optimization Insights: ✓ Working`, 'success');
    log(`  • A/B Testing Framework: ✓ Working`, 'success');
    log(`  • Analytics Integration: ✓ Working`, 'success');
    log(`  • Advanced Features: ✓ Ready`, 'success');
    
    log('🎯 KEY METRICS:', 'info');
    log(`  • Overall Quality Score: ${performanceData.qualityMetrics.overallScore}/5.0`, 'info');
    log(`  • User Satisfaction: ${(performanceData.qualityMetrics.userSatisfaction * 100).toFixed(1)}%`, 'info');
    log(`  • Error Rate: ${(performanceData.volumeMetrics.errorRate * 100).toFixed(1)}%`, 'info');
    log(`  • Total Interactions: ${performanceData.volumeMetrics.totalInteractions}`, 'info');
    
    log('🔧 OPTIMIZATION READY:', 'info');
    log(`  • Recommendations: ${optimizationData.recommendations.length} active`, 'info');
    log(`  • A/B Testing: ${optimizationData.abTestingReady ? 'Ready' : 'Not Ready'}`, 'info');
    log(`  • Configuration: Current vs Suggested available`, 'info');
    
    log('🎉 Phase 4 Advanced Analytics & Optimization COMPLETE!', 'success');
    
  } catch (error) {
    log('========================================');
    log('❌ Phase 4 Implementation Failed!');
    log('========================================');
    log(`Error: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the test
testPhase4Implementation();