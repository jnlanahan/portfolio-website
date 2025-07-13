import OpenAI from 'openai';
import { 
  UserFeedback,
  ChatbotConversation,
  ChatbotTrainingDocument,
  ChatbotLearningInsight,
  InsertChatbotLearningInsight
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

interface SessionInsight {
  type: 'knowledge_gap' | 'misunderstanding' | 'missing_context' | 'general_improvement';
  issue: string;
  resolution: string;
  examples: string[];
  priority: number;
}

interface KnowledgeUpdate {
  knowledgeGaps: string[];
  factCorrections: string[];
  contextAdditions: string[];
  behaviorAdjustments: string[];
}

/**
 * Process user feedback to extract direct knowledge updates
 */
export async function processUserFeedback(feedbackId: number): Promise<KnowledgeUpdate> {
  const feedback = await storage.getUserFeedbackById(feedbackId);
  if (!feedback || !feedback.comment) {
    throw new Error('Feedback not found or has no comment');
  }

  const conversation = await storage.getChatbotConversationById(feedback.conversationId);
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const openai = getOpenAI();
  
  const prompt = `Analyze this user feedback to extract specific knowledge updates needed for the chatbot.

USER QUESTION: "${conversation.userQuestion}"
BOT RESPONSE: "${conversation.botResponse}"
USER FEEDBACK (${feedback.rating}): "${feedback.comment}"

The user is providing direct feedback about what the chatbot should know or how it should respond.

Extract specific, actionable knowledge updates in these categories:
1. KNOWLEDGE GAPS: Facts or information the chatbot is missing
2. FACT CORRECTIONS: Information the chatbot got wrong
3. CONTEXT ADDITIONS: Additional context needed for better responses
4. BEHAVIOR ADJUSTMENTS: How the chatbot should change its response approach

Be very specific. For example:
- If user says "The bot should know I have transcripts", extract: "Bot has access to Nick's academic transcripts"
- If user says "It should know what courses I took", extract: "Bot should reference specific courses from Nick's MBA transcripts"

Return JSON format:
{
  "knowledgeGaps": ["specific fact 1", "specific fact 2"],
  "factCorrections": ["correction 1", "correction 2"],
  "contextAdditions": ["context 1", "context 2"],
  "behaviorAdjustments": ["adjustment 1", "adjustment 2"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at extracting specific knowledge updates from user feedback. Focus on concrete, actionable information that can directly improve the chatbot's responses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      knowledgeGaps: result.knowledgeGaps || [],
      factCorrections: result.factCorrections || [],
      contextAdditions: result.contextAdditions || [],
      behaviorAdjustments: result.behaviorAdjustments || []
    };
  } catch (error) {
    console.error('Error processing user feedback:', error);
    throw new Error('Failed to process user feedback');
  }
}

/**
 * Process an entire conversation session to extract high-level insights
 */
export async function processConversationSession(conversationId: number): Promise<SessionInsight[]> {
  const conversation = await storage.getChatbotConversationById(conversationId);
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const evaluation = await storage.getChatbotEvaluationByConversationId(conversationId);
  const userFeedback = await storage.getUserFeedbackByConversationId(conversationId);
  
  // Only process if there's meaningful feedback
  if (!evaluation && !userFeedback) {
    return [];
  }

  const openai = getOpenAI();
  
  const prompt = `Analyze this entire conversation session to extract high-level learning insights.

CONVERSATION:
User: "${conversation.userQuestion}"
Bot: "${conversation.botResponse}"

${evaluation ? `
EVALUATION SCORES:
Overall: ${evaluation.overallScore}/10
Accuracy: ${evaluation.accuracyScore}/10
Helpfulness: ${evaluation.helpfulnessScore}/10
AI Feedback: "${evaluation.feedback}"
Improvements Needed: ${evaluation.improvements.join(', ')}
` : ''}

${userFeedback ? `
USER FEEDBACK (${userFeedback.rating}): "${userFeedback.comment}"
` : ''}

Extract 1-3 HIGH-LEVEL insights that would meaningfully improve future conversations. 
Focus on patterns, not specific details.
Avoid creating duplicate insights - look for unique, impactful improvements.

Return JSON format:
{
  "insights": [
    {
      "type": "knowledge_gap|misunderstanding|missing_context|general_improvement",
      "issue": "Clear description of the problem",
      "resolution": "How to fix this going forward",
      "examples": ["specific example from this conversation"],
      "priority": 1-10
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at identifying high-level patterns and improvements for chatbot training. Focus on quality over quantity - only extract truly meaningful insights."
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
    return result.insights || [];
  } catch (error) {
    console.error('Error processing conversation session:', error);
    return [];
  }
}

/**
 * Deduplicate and merge similar insights
 */
export async function deduplicateInsights(): Promise<number> {
  const allInsights = await storage.getChatbotLearningInsights();
  const openai = getOpenAI();
  
  // Group insights by category
  const categories = {
    best_practice: allInsights.filter(i => i.category === 'best_practice'),
    improvement: allInsights.filter(i => i.category === 'improvement'),
    avoid_pattern: allInsights.filter(i => i.category === 'avoid_pattern')
  };

  let deduplicatedCount = 0;

  for (const [category, insights] of Object.entries(categories)) {
    if (insights.length < 2) continue;

    const prompt = `Analyze these ${category} insights and identify which ones are duplicates or very similar.

INSIGHTS:
${insights.map((i, idx) => `${idx + 1}. "${i.insight}" (ID: ${i.id}, Importance: ${i.importance})`).join('\n')}

Identify groups of similar insights that should be merged. For each group:
1. List the insight IDs that should be merged
2. Provide a single, comprehensive insight that captures all of them
3. Set the importance as the highest from the group

Return JSON format:
{
  "mergeGroups": [
    {
      "insightIds": [1, 3, 7],
      "mergedInsight": "Comprehensive insight text",
      "importance": 9
    }
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at identifying and merging duplicate insights. Only merge insights that are truly similar in meaning and purpose."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"mergeGroups": []}');
      
      // Process merge groups
      for (const group of result.mergeGroups || []) {
        if (group.insightIds.length > 1) {
          // Keep the first insight and update it
          const keepId = group.insightIds[0];
          const removeIds = group.insightIds.slice(1);
          
          // Update the kept insight
          await storage.updateChatbotLearningInsight(keepId, {
            insight: group.mergedInsight,
            importance: group.importance
          });
          
          // Deactivate the duplicates
          for (const id of removeIds) {
            await storage.updateChatbotLearningInsight(id, { isActive: false });
            deduplicatedCount++;
          }
        }
      }
    } catch (error) {
      console.error(`Error deduplicating ${category} insights:`, error);
    }
  }

  return deduplicatedCount;
}

/**
 * Convert session insights to learning insights with deduplication check
 */
export async function convertToLearningInsights(
  sessionInsights: SessionInsight[], 
  conversationId: number
): Promise<ChatbotLearningInsight[]> {
  const existingInsights = await storage.getChatbotLearningInsights();
  const savedInsights: ChatbotLearningInsight[] = [];

  for (const sessionInsight of sessionInsights) {
    // Check if a similar insight already exists
    const isDuplicate = existingInsights.some(existing => 
      existing.insight.toLowerCase().includes(sessionInsight.issue.toLowerCase()) ||
      sessionInsight.issue.toLowerCase().includes(existing.insight.toLowerCase())
    );

    if (!isDuplicate) {
      const category = sessionInsight.type === 'knowledge_gap' || sessionInsight.type === 'missing_context' 
        ? 'improvement' 
        : sessionInsight.type === 'misunderstanding' 
        ? 'avoid_pattern' 
        : 'improvement';

      const newInsight: InsertChatbotLearningInsight = {
        category,
        insight: `${sessionInsight.issue} - ${sessionInsight.resolution}`,
        examples: sessionInsight.examples,
        sourceEvaluationId: null, // We're not tying to specific evaluations anymore
        importance: sessionInsight.priority,
        isActive: true
      };

      const saved = await storage.createChatbotLearningInsight(newInsight);
      savedInsights.push(saved);
    }
  }

  return savedInsights;
}

/**
 * Create a knowledge fact from user feedback
 */
export async function createKnowledgeFact(
  fact: string, 
  source: 'user_feedback' | 'training' | 'document',
  sourceId?: number
): Promise<void> {
  // For now, we'll store this as a high-priority learning insight
  // In the future, this could be a separate knowledge base table
  
  const insight: InsertChatbotLearningInsight = {
    category: 'best_practice',
    insight: `FACT: ${fact}`,
    examples: [],
    sourceEvaluationId: sourceId || null,
    importance: 10, // Facts get highest priority
    isActive: true
  };

  await storage.createChatbotLearningInsight(insight);
}