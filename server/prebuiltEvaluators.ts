import { evaluate } from 'langsmith/evaluation';
import { createLLMAsJudge, CONCISENESS_PROMPT, CORRECTNESS_PROMPT } from 'openevals';

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
 * Evaluates how factually correct the response is using source documents
 */
export async function evaluateCorrectness(
  question: string,
  response: string,
  sourceDocuments?: string,
  expectedAnswer?: string
): Promise<{ score: number; feedback: string }> {
  try {
    // Enhanced correctness prompt that includes source documents
    const enhancedCorrectnessPrompt = `
You are an expert evaluator assessing the factual correctness of a chatbot response about Nick Lanahan's professional background.

TASK: Evaluate if the response is factually accurate based on the provided source documents.

QUESTION: {question}
RESPONSE: {response}

${sourceDocuments ? `SOURCE DOCUMENTS (Use these to verify factual accuracy):
${sourceDocuments}

IMPORTANT: You now have access to the actual source documents. Use them to verify specific facts like:
- Educational background and degrees
- Work experience and positions
- Skills and certifications
- Personal details and achievements
- Military service details
- Any other factual claims

If the response contains information that contradicts the source documents, score it lower.
If the response is factually consistent with the source documents, score it higher.` : 'Note: No source documents provided for verification.'}

SCORING CRITERIA:
- 10: Completely accurate, fully supported by source documents
- 8-9: Mostly accurate with minor gaps or unsupported details  
- 6-7: Generally accurate but some unverified or potentially incorrect information
- 4-5: Mixed accuracy, some correct information but notable inaccuracies
- 1-3: Largely inaccurate or unsupported by source documents

Provide your evaluation as a JSON object with:
- score: number (1-10)
- reasoning: string explaining your assessment and what you verified against the source documents
`;

    const correctnessEvaluator = createLLMAsJudge({
      prompt: enhancedCorrectnessPrompt,
      feedbackKey: "correctness",
      model: "openai:gpt-4o",
    });
    
    const results = await evaluate((inputs) => response, {
      data: [{
        inputs: { 
          question,
          response,
          sourceDocuments: sourceDocuments || "No source documents provided"
        },
        outputs: { response },
        expected_outputs: expectedAnswer ? { response: expectedAnswer } : undefined
      }],
      evaluators: [correctnessEvaluator],
    });
    
    // Extract score and feedback from results
    const feedbackData = results.results[0]?.evaluation_results?.correctness;
    const score = feedbackData?.score || 5;
    const feedback = feedbackData?.comment || "No feedback available";
    
    return {
      score: Math.max(1, Math.min(10, score)),
      feedback: feedback
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
  response: string,
  sourceDocuments?: string
): Promise<{ score: number; feedback: string }> {
  try {
    // Use proper LangSmith evaluation with openevals
    const concisenessEvaluator = createLLMAsJudge({
      prompt: CONCISENESS_PROMPT,
      feedbackKey: "conciseness", 
      model: "openai:gpt-4o",
    });
    
    const results = await evaluate((inputs) => response, {
      data: [{
        inputs: { question },
        outputs: { response }
      }],
      evaluators: [concisenessEvaluator],
    });
    
    // Extract score and feedback from results
    const feedbackData = results.results[0]?.evaluation_results?.conciseness;
    const score = feedbackData?.score || 5;
    const feedback = feedbackData?.comment || "No feedback available";
    
    return {
      score: Math.max(1, Math.min(10, score)),
      feedback: feedback
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
          prompt: `You are an expert evaluator assessing the comprehensiveness of AI responses about Nick Lanahan's professional background.

EVALUATION CRITERIA:
Rate how thoroughly the response addresses the question on a scale of 1-10:
- 10: Completely comprehensive, addresses all aspects of the question
- 8-9: Very comprehensive, covers most important aspects
- 6-7: Generally comprehensive but missing some details
- 4-5: Partially comprehensive, significant gaps
- 1-3: Poor coverage, major aspects ignored

QUESTION: {question}
${context ? `SOURCE DOCUMENTS (Use these to assess comprehensiveness):
${context}

IMPORTANT: You now have access to the actual source documents. Use them to evaluate whether the response is comprehensive by checking:
- Are all relevant details from the source documents included?
- Does the response miss important information that's available in the documents?
- Are there key aspects of the question that could be better answered using the source material?` : 'Note: No source documents provided for comprehensiveness assessment.'}

RESPONSE: {response}

Consider:
- Does the response fully answer the question?
- Are all relevant aspects covered?
- Is important information missing that's available in the source documents?
- Does it provide sufficient detail given the available information?
- Are there missed opportunities to provide more comprehensive information?

Format your response as:
Score: [number]
Feedback: [detailed explanation including what information from source documents was missed or well-utilized]`,
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
  response: string,
  sourceDocuments?: string
): Promise<{ score: number; feedback: string }> {
  try {
    const response_eval = await langsmithClient.evaluate(
      async (inputs: any) => response,
      {
        data: [{
          inputs: { 
            question,
            sourceDocuments: sourceDocuments || "No source documents provided" 
          },
          outputs: { answer: response }
        }],
        evaluators: [{
          evaluator_type: "llm_as_judge",
          llm_config: {
            model: "gpt-4o",
            temperature: 0.1
          },
          prompt: `You are an expert evaluator assessing the coherence of AI responses about Nick Lanahan's professional background.

EVALUATION CRITERIA:
Rate how coherent and logically structured the response is on a scale of 1-10:
- 10: Perfectly coherent, excellent logical flow, easy to follow
- 8-9: Very coherent with clear structure
- 6-7: Generally coherent but some unclear connections
- 4-5: Somewhat coherent but confusing in places
- 1-3: Poor coherence, hard to follow logical flow

QUESTION: {question}
RESPONSE: {response}

${sourceDocuments ? `SOURCE DOCUMENTS (Available for context):
${sourceDocuments}

Note: While evaluating coherence, you can reference the source documents to understand the context better and assess whether the response flows logically given the available information.` : 'Note: No source documents provided for additional context.'}

Consider:
- Does the response flow logically from point to point?
- Are ideas clearly connected?
- Is the structure easy to follow?
- Are transitions smooth?
- Does the response present information in a logical order?

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
    evaluateCorrectness(question, response, context, expectedAnswer),
    evaluateConciseness(question, response, context)
  ]);
  
  // Run comprehensiveness and coherence evaluators with source documents
  const [
    comprehensiveness,
    coherence
  ] = await Promise.all([
    evaluateComprehensiveness(question, response, context),
    evaluateCoherence(question, response, context)
  ]);
  
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