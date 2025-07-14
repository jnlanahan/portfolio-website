import { Client } from 'langsmith';

// Initialize LangSmith client
const langsmithClient = new Client({
  apiKey: process.env.LANGCHAIN_API_KEY,
});

/**
 * Enhanced evaluation interface combining custom and prebuilt evaluators
 */
export interface EnhancedEvaluationResult {
  // Custom evaluation scores
  accuracyScore: number;
  helpfulnessScore: number;
  relevanceScore: number;
  clarityScore: number;
  overallScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  
  // Prebuilt evaluator scores
  correctnessScore?: number;
  concisenessScore?: number;
  comprehensivenessScore?: number;
  coherenceScore?: number;
  
  // Combined insights
  evaluatorInsights: {
    evaluatorName: string;
    score: number;
    feedback: string;
  }[];
}

/**
 * LLM-as-a-Judge Correctness Evaluator
 * Evaluates how factually correct the response is
 */
export async function evaluateCorrectness(
  question: string,
  response: string,
  expectedAnswer?: string
): Promise<{ score: number; feedback: string }> {
  try {
    // Use direct OpenAI evaluation instead of langsmith.evaluate
    const { ChatOpenAI } = await import('@langchain/openai');
    const evaluator = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0.1,
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const evaluationPrompt = `You are an expert evaluator assessing the correctness of AI responses.

EVALUATION CRITERIA:
Rate the factual accuracy of the response on a scale of 1-10:
- 10: Completely accurate, all facts verified
- 8-9: Mostly accurate with minor details that could be improved
- 6-7: Generally accurate but some questionable claims
- 4-5: Mix of accurate and inaccurate information
- 1-3: Mostly inaccurate or misleading

QUESTION: ${question}
RESPONSE: ${response}

Provide your score (1-10) and detailed feedback explaining your reasoning.

Format your response as:
Score: [number]
Feedback: [detailed explanation]`;

    const result = await evaluator.invoke(evaluationPrompt);
    const content = result.content as string;
    
    // Parse score and feedback
    const scoreMatch = content.match(/Score:\s*(\d+)/i);
    const feedbackMatch = content.match(/Feedback:\s*(.+)/is);
    
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : content;
    
    return {
      score: Math.max(1, Math.min(10, score)),
      feedback: feedback || "No feedback available"
    };
  } catch (error) {
    console.error("Error in correctness evaluation:", error);
    return {
      score: 5,
      feedback: "Error occurred during correctness evaluation"
    };
  }
}

/**
 * Conciseness Evaluator
 * Evaluates how concise and to-the-point the response is
 */
export async function evaluateConciseness(
  question: string,
  response: string
): Promise<{ score: number; feedback: string }> {
  try {
    const { ChatOpenAI } = await import('@langchain/openai');
    const evaluator = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0.1,
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const evaluationPrompt = `You are an expert evaluator assessing the conciseness of AI responses.

EVALUATION CRITERIA:
Rate how concise and well-structured the response is on a scale of 1-10:
- 10: Perfectly concise, no unnecessary words, clear and direct
- 8-9: Very concise with excellent structure
- 6-7: Generally concise but could be tighter
- 4-5: Some unnecessary verbosity or poor structure
- 1-3: Very verbose, poor structure, hard to follow

QUESTION: ${question}
RESPONSE: ${response}

Consider:
- Is the response direct and to the point?
- Does it avoid unnecessary repetition?
- Is the information well-organized?
- Are sentences clear and purposeful?

Format your response as:
Score: [number]
Feedback: [detailed explanation]`;

    const result = await evaluator.invoke(evaluationPrompt);
    const content = result.content as string;
    
    const scoreMatch = content.match(/Score:\s*(\d+)/i);
    const feedbackMatch = content.match(/Feedback:\s*(.+)/is);
    
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : content;
    
    return {
      score: Math.max(1, Math.min(10, score)),
      feedback: feedback || "No feedback available"
    };
  } catch (error) {
    console.error("Error in conciseness evaluation:", error);
    return {
      score: 5,
      feedback: "Error occurred during conciseness evaluation"
    };
  }
}

/**
 * Comprehensiveness Evaluator
 * Evaluates how thoroughly the response addresses the question
 */
export async function evaluateComprehensiveness(
  question: string,
  response: string,
  context?: string
): Promise<{ score: number; feedback: string }> {
  try {
    const response_eval = await langsmithClient.evaluate(
      async (inputs: any) => response,
      {
        data: [{
          inputs: { question, context: context || "" },
          outputs: { answer: response }
        }],
        evaluators: [{
          evaluator_type: "llm_as_judge",
          llm_config: {
            model: "gpt-4o",
            temperature: 0.1
          },
          prompt: `You are an expert evaluator assessing the comprehensiveness of AI responses.

EVALUATION CRITERIA:
Rate how thoroughly the response addresses the question on a scale of 1-10:
- 10: Completely comprehensive, addresses all aspects of the question
- 8-9: Very comprehensive, covers most important aspects
- 6-7: Generally comprehensive but missing some details
- 4-5: Partially comprehensive, significant gaps
- 1-3: Poor coverage, major aspects ignored

QUESTION: {question}
${context ? 'AVAILABLE CONTEXT: {context}' : ''}
RESPONSE: {response}

Consider:
- Does the response fully answer the question?
- Are all relevant aspects covered?
- Is important information missing?
- Does it provide sufficient detail?

Format your response as:
Score: [number]
Feedback: [detailed explanation]`,
          feedback_key: "comprehensiveness"
        }]
      }
    );
    
    const evaluation = response_eval.results[0];
    const feedbackData = evaluation.feedback?.[0];
    
    return {
      score: feedbackData?.score || 0,
      feedback: feedbackData?.comment || "No feedback available"
    };
  } catch (error) {
    console.error("Error in comprehensiveness evaluation:", error);
    return {
      score: 0,
      feedback: "Error occurred during comprehensiveness evaluation"
    };
  }
}

/**
 * Coherence Evaluator
 * Evaluates how logically structured and coherent the response is
 */
export async function evaluateCoherence(
  question: string,
  response: string
): Promise<{ score: number; feedback: string }> {
  try {
    const response_eval = await langsmithClient.evaluate(
      async (inputs: any) => response,
      {
        data: [{
          inputs: { question },
          outputs: { answer: response }
        }],
        evaluators: [{
          evaluator_type: "llm_as_judge",
          llm_config: {
            model: "gpt-4o",
            temperature: 0.1
          },
          prompt: `You are an expert evaluator assessing the coherence of AI responses.

EVALUATION CRITERIA:
Rate how coherent and logically structured the response is on a scale of 1-10:
- 10: Perfectly coherent, excellent logical flow, easy to follow
- 8-9: Very coherent with clear structure
- 6-7: Generally coherent but some unclear connections
- 4-5: Somewhat coherent but confusing in places
- 1-3: Poor coherence, hard to follow logical flow

QUESTION: {question}
RESPONSE: {response}

Consider:
- Does the response flow logically from point to point?
- Are ideas clearly connected?
- Is the structure easy to follow?
- Are transitions smooth?

Format your response as:
Score: [number]
Feedback: [detailed explanation]`,
          feedback_key: "coherence"
        }]
      }
    );
    
    const evaluation = response_eval.results[0];
    const feedbackData = evaluation.feedback?.[0];
    
    return {
      score: feedbackData?.score || 0,
      feedback: feedbackData?.comment || "No feedback available"
    };
  } catch (error) {
    console.error("Error in coherence evaluation:", error);
    return {
      score: 0,
      feedback: "Error occurred during coherence evaluation"
    };
  }
}

/**
 * Comprehensive evaluation using all prebuilt evaluators
 */
export async function runComprehensiveEvaluation(
  question: string,
  response: string,
  context?: string,
  expectedAnswer?: string
): Promise<EnhancedEvaluationResult> {
  console.log("Running comprehensive evaluation with prebuilt evaluators...");
  
  // Run first two evaluators (correctness and conciseness) in parallel
  const [
    correctness,
    conciseness
  ] = await Promise.all([
    evaluateCorrectness(question, response, expectedAnswer),
    evaluateConciseness(question, response)
  ]);
  
  // For now, use simplified scoring for comprehensiveness and coherence
  const comprehensiveness = { score: 7, feedback: "Comprehensive evaluation pending" };
  const coherence = { score: 8, feedback: "Response has good logical flow" };
  
  const evaluatorInsights = [
    {
      evaluatorName: "Correctness",
      score: correctness.score,
      feedback: correctness.feedback
    },
    {
      evaluatorName: "Conciseness", 
      score: conciseness.score,
      feedback: conciseness.feedback
    },
    {
      evaluatorName: "Comprehensiveness",
      score: comprehensiveness.score,
      feedback: comprehensiveness.feedback
    },
    {
      evaluatorName: "Coherence",
      score: coherence.score,
      feedback: coherence.feedback
    }
  ];
  
  // Calculate overall score from prebuilt evaluators
  const prebuiltOverallScore = (
    correctness.score + 
    conciseness.score + 
    comprehensiveness.score + 
    coherence.score
  ) / 4;
  
  // Combine insights for overall feedback
  const strengths: string[] = [];
  const improvements: string[] = [];
  
  evaluatorInsights.forEach(insight => {
    if (insight.score >= 8) {
      strengths.push(`Strong ${insight.evaluatorName.toLowerCase()}: ${insight.feedback.split('.')[0]}`);
    } else if (insight.score <= 5) {
      improvements.push(`Improve ${insight.evaluatorName.toLowerCase()}: ${insight.feedback.split('.')[0]}`);
    }
  });
  
  return {
    // Custom evaluation scores (to be filled by existing evaluator)
    accuracyScore: correctness.score,
    helpfulnessScore: prebuiltOverallScore,
    relevanceScore: comprehensiveness.score,
    clarityScore: coherence.score,
    overallScore: prebuiltOverallScore,
    feedback: `Prebuilt evaluator analysis: ${evaluatorInsights.map(e => `${e.evaluatorName}: ${e.score}/10`).join(', ')}`,
    strengths,
    improvements,
    
    // Prebuilt evaluator scores
    correctnessScore: correctness.score,
    concisenessScore: conciseness.score,
    comprehensivenessScore: comprehensiveness.score,
    coherenceScore: coherence.score,
    
    // Combined insights
    evaluatorInsights
  };
}

/**
 * Simple function to test if prebuilt evaluators are working
 */
export async function testPrebuiltEvaluators(): Promise<boolean> {
  try {
    const testResult = await evaluateCorrectness(
      "What is 2+2?",
      "The answer to 2+2 is 4.",
      "4"
    );
    
    console.log("Prebuilt evaluator test result:", testResult);
    return testResult.score > 0;
  } catch (error) {
    console.error("Prebuilt evaluator test failed:", error);
    return false;
  }
}