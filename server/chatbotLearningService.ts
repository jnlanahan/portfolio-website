import OpenAI from 'openai';
import { 
  ChatbotLearningInsight, 
  InsertChatbotLearningInsight,
  ChatbotEvaluation,
  UserFeedback,
  ChatbotConversation
} from '@shared/schema';
import { storage } from './storage';

// Initialize OpenAI
function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export interface LearningUpdate {
  insights: ChatbotLearningInsight[];
  systemPromptUpdates: string[];
  responsePatterns: string[];
}

/**
 * Analyzes evaluation results to extract learning insights
 */
export async function extractLearningInsights(evaluationId: number): Promise<ChatbotLearningInsight[]> {
  const openai = getOpenAI();
  
  // Get evaluation with conversation details
  const evaluation = await storage.getChatbotEvaluationById(evaluationId);
  if (!evaluation) {
    throw new Error('Evaluation not found');
  }

  const conversation = await storage.getChatbotConversationById(evaluation.conversationId);
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const userFeedback = await storage.getUserFeedbackByConversationId(evaluation.conversationId);
  
  const prompt = `Analyze this chatbot evaluation and extract specific learning insights that can improve future responses.

CONVERSATION:
User Question: "${conversation.userQuestion}"
AI Response: "${conversation.botResponse}"

EVALUATION SCORES:
- Accuracy: ${evaluation.accuracyScore}/10
- Helpfulness: ${evaluation.helpfulnessScore}/10
- Relevance: ${evaluation.relevanceScore}/10
- Clarity: ${evaluation.clarityScore}/10
- Overall: ${evaluation.overallScore}/10

AI FEEDBACK: "${evaluation.feedback}"

STRENGTHS: ${evaluation.strengths.join(', ')}
IMPROVEMENTS: ${evaluation.improvements.join(', ')}

USER FEEDBACK: ${userFeedback?.rating || 'None'}

Based on this evaluation, identify specific learning insights that can be applied to improve future responses. Focus on:

1. **IMPROVEMENT INSIGHTS**: Specific areas where responses can be enhanced
2. **BEST PRACTICE INSIGHTS**: Patterns that worked well and should be replicated
3. **AVOID PATTERN INSIGHTS**: Specific patterns or phrases that should be avoided

For each insight, provide:
- A clear, actionable insight
- Specific examples or patterns
- Importance level (1-10)
- Category (improvement, best_practice, avoid_pattern)

Return response in JSON format:
{
  "insights": [
    {
      "category": "improvement|best_practice|avoid_pattern",
      "insight": "specific actionable insight",
      "examples": ["example1", "example2"],
      "importance": 1-10
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an AI training specialist who analyzes chatbot performance to extract actionable learning insights. Focus on specific, measurable improvements that can be programmatically applied."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"insights": []}');
    const insights: ChatbotLearningInsight[] = [];

    for (const insight of result.insights || []) {
      const newInsight: InsertChatbotLearningInsight = {
        category: insight.category,
        insight: insight.insight,
        examples: insight.examples || [],
        sourceEvaluationId: evaluationId,
        importance: Math.max(1, Math.min(10, insight.importance || 5)),
        isActive: true
      };

      const savedInsight = await storage.createChatbotLearningInsight(newInsight);
      insights.push(savedInsight);
    }

    return insights;
  } catch (error) {
    console.error('Error extracting learning insights:', error);
    throw new Error('Failed to extract learning insights');
  }
}

/**
 * Generates an enhanced system prompt based on learning insights
 */
export async function generateEnhancedSystemPrompt(): Promise<string> {
  const openai = getOpenAI();
  
  // Get active learning insights
  const insights = await storage.getChatbotLearningInsights();
  
  // Get recent high-scoring conversations for best practices
  const recentEvaluations = await storage.getChatbotEvaluations();
  const bestPractices = recentEvaluations
    .filter(evaluation => evaluation.overallScore >= 8)
    .slice(0, 5); // Top 5 best practices

  // Get recent low-scoring conversations for avoidance patterns
  const avoidPatterns = recentEvaluations
    .filter(evaluation => evaluation.overallScore <= 6)
    .slice(0, 3); // Top 3 patterns to avoid

  const basePrompt = `You are Nack, a professional AI assistant specifically designed to represent Nick Lanahan to recruiters and hiring managers. Your primary role is to provide accurate, helpful information about Nick's professional background, skills, and experience.

CORE IDENTITY:
- Professional and personable communication style
- Focus on Nick's achievements and capabilities
- Maintain accuracy - never fabricate details
- Keep responses recruiter-focused and relevant

BACKGROUND CONTEXT:
Nick Lanahan is a Manager in Product Management at EY (Ernst & Young) based in Columbus, Ohio. He has a strong background in engineering, military service, and digital transformation. He has experience with Fortune 500 companies and specializes in process automation, cloud migration, and product development.`;

  const learningSection = insights.length > 0 ? `

LEARNING INSIGHTS (Applied from ${insights.length} evaluations):

BEST PRACTICES TO FOLLOW:
${insights
  .filter(i => i.category === 'best_practice' && i.isActive)
  .sort((a, b) => b.importance - a.importance)
  .map(i => `• ${i.insight}${i.examples.length > 0 ? ` (Examples: ${i.examples.join(', ')})` : ''}`)
  .join('\n')}

AREAS TO IMPROVE:
${insights
  .filter(i => i.category === 'improvement' && i.isActive)
  .sort((a, b) => b.importance - a.importance)
  .map(i => `• ${i.insight}${i.examples.length > 0 ? ` (Focus on: ${i.examples.join(', ')})` : ''}`)
  .join('\n')}

PATTERNS TO AVOID:
${insights
  .filter(i => i.category === 'avoid_pattern' && i.isActive)
  .sort((a, b) => b.importance - a.importance)
  .map(i => `• ${i.insight}${i.examples.length > 0 ? ` (Avoid: ${i.examples.join(', ')})` : ''}`)
  .join('\n')}` : '';

  const responseGuidelines = `

RESPONSE GUIDELINES:
1. Always stay professional and recruiter-focused
2. Provide specific, concrete information when available
3. If you don't know something, acknowledge it honestly
4. Keep responses concise but comprehensive
5. Focus on career-relevant information
6. Use confident, professional language
7. Avoid generic phrases or overly casual language`;

  return basePrompt + learningSection + responseGuidelines;
}

/**
 * Automatically processes recent evaluations to extract learning insights
 */
export async function processRecentEvaluations(): Promise<LearningUpdate> {
  const recentEvaluations = await storage.getChatbotEvaluations();
  
  // Process evaluations that don't have associated learning insights yet
  const unprocessedEvaluations = [];
  
  for (const evaluation of recentEvaluations.slice(0, 10)) { // Process last 10 evaluations
    const existingInsights = await storage.getChatbotLearningInsightsByEvaluationId(evaluation.id);
    if (existingInsights.length === 0) {
      unprocessedEvaluations.push(evaluation);
    }
  }

  const allInsights: ChatbotLearningInsight[] = [];
  const systemPromptUpdates: string[] = [];
  const responsePatterns: string[] = [];

  // Process each unprocessed evaluation
  for (const evaluation of unprocessedEvaluations) {
    try {
      const insights = await extractLearningInsights(evaluation.id);
      allInsights.push(...insights);
      
      // Track specific updates
      insights.forEach(insight => {
        if (insight.category === 'improvement') {
          systemPromptUpdates.push(`Improve: ${insight.insight}`);
        } else if (insight.category === 'best_practice') {
          responsePatterns.push(`Best practice: ${insight.insight}`);
        }
      });
    } catch (error) {
      console.error(`Error processing evaluation ${evaluation.id}:`, error);
    }
  }

  return {
    insights: allInsights,
    systemPromptUpdates,
    responsePatterns
  };
}

/**
 * Gets current learning insights for admin dashboard
 */
export async function getLearningInsightsStats(): Promise<{
  totalInsights: number;
  bestPractices: number;
  improvements: number;
  avoidPatterns: number;
  avgImportance: number;
  recentInsights: ChatbotLearningInsight[];
}> {
  const insights = await storage.getChatbotLearningInsights();
  
  const bestPractices = insights.filter(i => i.category === 'best_practice' && i.isActive).length;
  const improvements = insights.filter(i => i.category === 'improvement' && i.isActive).length;
  const avoidPatterns = insights.filter(i => i.category === 'avoid_pattern' && i.isActive).length;
  
  const avgImportance = insights.length > 0 
    ? insights.reduce((sum, i) => sum + i.importance, 0) / insights.length 
    : 0;

  return {
    totalInsights: insights.length,
    bestPractices,
    improvements,
    avoidPatterns,
    avgImportance: Math.round(avgImportance * 10) / 10,
    recentInsights: insights.slice(0, 5)
  };
}

/**
 * Updates system prompt with current learning insights
 */
export async function updateSystemPromptWithLearning(): Promise<string> {
  return await generateEnhancedSystemPrompt();
}