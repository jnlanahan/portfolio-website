import OpenAI from 'openai';
import { storage } from './storage';
import type { ChatbotConversation, InsertChatbotEvaluation } from '@shared/schema';

function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export interface EvaluationResult {
  accuracyScore: number;
  helpfulnessScore: number;
  relevanceScore: number;
  clarityScore: number;
  overallScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

/**
 * Evaluates a chatbot response using AI and saves the evaluation to the database
 */
export async function evaluateChatbotResponse(conversationId: number): Promise<EvaluationResult> {
  try {
    const openai = getOpenAI();
    
    // Get the conversation details
    const conversation = await storage.getChatbotConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    // Get all training data for context
    const trainingData = await storage.getChatbotTrainingSessions();
    const documents = await storage.getChatbotDocuments();
    
    // Build context for evaluation
    let context = "Available knowledge about Nick Lanahan:\n\n";
    
    // Add document context
    documents.forEach(doc => {
      context += `From ${doc.originalName}: ${doc.content.substring(0, 800)}...\n\n`;
    });
    
    // Add training Q&A context
    trainingData.forEach(session => {
      context += `Q: ${session.question}\nA: ${session.answer}\n\n`;
    });
    
    const evaluationPrompt = `You are an expert AI evaluator tasked with assessing the quality of chatbot responses. Evaluate the following chatbot interaction on multiple criteria.

CONTEXT ABOUT NICK LANAHAN:
${context}

CONVERSATION TO EVALUATE:
User Question: "${conversation.userQuestion}"
Bot Response: "${conversation.botResponse}"

EVALUATION CRITERIA (Score each 1-10):

1. ACCURACY (1-10): How factually correct is the response based on available information?
   - 10: Completely accurate, all facts correct
   - 7-9: Mostly accurate with minor inaccuracies
   - 4-6: Some accurate information mixed with errors
   - 1-3: Mostly inaccurate or misleading

2. HELPFULNESS (1-10): How useful is the response to the user?
   - 10: Extremely helpful, fully addresses the question
   - 7-9: Very helpful, addresses most aspects
   - 4-6: Somewhat helpful, partial answer
   - 1-3: Not helpful, doesn't address the question

3. RELEVANCE (1-10): How relevant is the response to the user's question?
   - 10: Perfectly relevant and on-topic
   - 7-9: Mostly relevant with good context
   - 4-6: Somewhat relevant but may drift off-topic
   - 1-3: Irrelevant or off-topic

4. CLARITY (1-10): How clear and understandable is the response?
   - 10: Crystal clear, well-structured, easy to understand
   - 7-9: Clear with good flow
   - 4-6: Generally clear but may be confusing in places
   - 1-3: Unclear, confusing, or poorly structured

5. OVERALL SCORE (1-10): General quality considering all factors

Provide your evaluation in JSON format:
{
  "accuracyScore": number,
  "helpfulnessScore": number,
  "relevanceScore": number,
  "clarityScore": number,
  "overallScore": number,
  "feedback": "Detailed explanation of the evaluation",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"]
}

Focus on:
- Whether the response accurately represents Nick's background
- How well it addresses the user's specific question
- Whether it provides appropriate context when information is missing
- The conversational tone and professionalism
- Any factual errors or misleading information`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: evaluationPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const evaluationResult = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and sanitize scores
    const evaluation: EvaluationResult = {
      accuracyScore: Math.max(1, Math.min(10, evaluationResult.accuracyScore || 5)),
      helpfulnessScore: Math.max(1, Math.min(10, evaluationResult.helpfulnessScore || 5)),
      relevanceScore: Math.max(1, Math.min(10, evaluationResult.relevanceScore || 5)),
      clarityScore: Math.max(1, Math.min(10, evaluationResult.clarityScore || 5)),
      overallScore: Math.max(1, Math.min(10, evaluationResult.overallScore || 5)),
      feedback: evaluationResult.feedback || 'No feedback provided',
      strengths: Array.isArray(evaluationResult.strengths) ? evaluationResult.strengths : [],
      improvements: Array.isArray(evaluationResult.improvements) ? evaluationResult.improvements : [],
    };
    
    // Save evaluation to database
    await storage.saveChatbotEvaluation({
      conversationId,
      ...evaluation,
    });
    
    return evaluation;
  } catch (error) {
    console.error('Error evaluating chatbot response:', error);
    throw new Error('Failed to evaluate chatbot response');
  }
}

/**
 * Batch evaluate multiple conversations
 */
export async function batchEvaluateConversations(conversationIds: number[]): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = [];
  
  for (const id of conversationIds) {
    try {
      const result = await evaluateChatbotResponse(id);
      results.push(result);
    } catch (error) {
      console.error(`Failed to evaluate conversation ${id}:`, error);
    }
  }
  
  return results;
}

/**
 * Get evaluation statistics for analytics
 */
export async function getEvaluationStats(): Promise<{
  totalEvaluations: number;
  averageOverallScore: number;
  averageAccuracyScore: number;
  averageHelpfulnessScore: number;
  averageRelevanceScore: number;
  averageClarityScore: number;
  recentTrends: {
    lastWeek: number;
    lastMonth: number;
  };
}> {
  const evaluations = await storage.getChatbotEvaluations();
  
  if (evaluations.length === 0) {
    return {
      totalEvaluations: 0,
      averageOverallScore: 0,
      averageAccuracyScore: 0,
      averageHelpfulnessScore: 0,
      averageRelevanceScore: 0,
      averageClarityScore: 0,
      recentTrends: { lastWeek: 0, lastMonth: 0 },
    };
  }
  
  const totalEvaluations = evaluations.length;
  const averageOverallScore = evaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / totalEvaluations;
  const averageAccuracyScore = evaluations.reduce((sum, evaluation) => sum + evaluation.accuracyScore, 0) / totalEvaluations;
  const averageHelpfulnessScore = evaluations.reduce((sum, evaluation) => sum + evaluation.helpfulnessScore, 0) / totalEvaluations;
  const averageRelevanceScore = evaluations.reduce((sum, evaluation) => sum + evaluation.relevanceScore, 0) / totalEvaluations;
  const averageClarityScore = evaluations.reduce((sum, evaluation) => sum + evaluation.clarityScore, 0) / totalEvaluations;
  
  // Calculate recent trends
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const lastWeekEvaluations = evaluations.filter(evaluation => 
    new Date(evaluation.evaluatedAt) >= lastWeek
  );
  const lastMonthEvaluations = evaluations.filter(evaluation => 
    new Date(evaluation.evaluatedAt) >= lastMonth
  );
  
  const lastWeekAverage = lastWeekEvaluations.length > 0 
    ? lastWeekEvaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / lastWeekEvaluations.length
    : 0;
  
  const lastMonthAverage = lastMonthEvaluations.length > 0
    ? lastMonthEvaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / lastMonthEvaluations.length
    : 0;
  
  return {
    totalEvaluations,
    averageOverallScore: Math.round(averageOverallScore * 100) / 100,
    averageAccuracyScore: Math.round(averageAccuracyScore * 100) / 100,
    averageHelpfulnessScore: Math.round(averageHelpfulnessScore * 100) / 100,
    averageRelevanceScore: Math.round(averageRelevanceScore * 100) / 100,
    averageClarityScore: Math.round(averageClarityScore * 100) / 100,
    recentTrends: {
      lastWeek: Math.round(lastWeekAverage * 100) / 100,
      lastMonth: Math.round(lastMonthAverage * 100) / 100,
    },
  };
}