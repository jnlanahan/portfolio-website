import OpenAI from 'openai';
import { 
  ChatbotDocument, 
  ChatbotTrainingSession, 
  ChatbotConversation,
  ChatbotTrainingProgress,
  InsertChatbotTrainingSession,
  InsertChatbotConversation
} from '@shared/schema';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatbotResponse {
  response: string;
  isOnTopic: boolean;
  confidence: number;
}

export interface TrainingQuestion {
  question: string;
  category: string;
  context?: string;
}

/**
 * Generate a training question based on existing knowledge and gaps
 */
export async function generateTrainingQuestion(
  documents: ChatbotDocument[],
  trainingSessions: ChatbotTrainingSession[],
  progress: ChatbotTrainingProgress | null
): Promise<TrainingQuestion> {
  const totalQuestions = progress?.totalQuestions || 0;
  
  // Create context from documents and existing training
  const documentContext = documents.map(doc => 
    `Document: ${doc.originalName}\nContent: ${doc.content.substring(0, 500)}...`
  ).join('\n\n');
  
  const trainingContext = trainingSessions.slice(-20).map(session => 
    `Q: ${session.question}\nA: ${session.answer}`
  ).join('\n\n');

  const prompt = `You are helping to train a personal chatbot about Nick Lanahan for recruiters. 
  
Based on the following context, generate a specific training question that would help the chatbot better understand Nick's background:

DOCUMENTS CONTEXT:
${documentContext}

EXISTING TRAINING (last 20 Q&As):
${trainingContext}

TRAINING PROGRESS: ${totalQuestions} questions answered

Generate a specific, insightful question that:
1. Focuses on career, skills, experience, achievements, or personal background
2. Helps fill gaps in understanding about Nick
3. Is appropriate for recruiters to ask
4. Avoids repetition of recent questions
5. Gets progressively more detailed as training progresses

Categories to focus on: career, skills, experience, achievements, education, personal, projects, leadership

Return response in JSON format:
{
  "question": "specific question here",
  "category": "category name",
  "context": "brief explanation of why this question is important"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      question: result.question || "Tell me about a significant achievement in your career.",
      category: result.category || "career",
      context: result.context || "Understanding career achievements"
    };
  } catch (error) {
    console.error('Error generating training question:', error);
    // Fallback questions
    const fallbackQuestions = [
      { question: "What are your strongest technical skills?", category: "skills", context: "Understanding technical capabilities" },
      { question: "Describe your leadership experience.", category: "leadership", context: "Understanding leadership background" },
      { question: "What motivates you in your work?", category: "personal", context: "Understanding personal motivations" },
      { question: "Tell me about your educational background.", category: "education", context: "Understanding educational foundation" },
      { question: "What's your biggest professional accomplishment?", category: "achievements", context: "Highlighting key achievements" }
    ];
    
    return fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
  }
}

/**
 * Process a recruiter's question and generate appropriate response
 */
export async function processRecruiterQuestion(
  question: string,
  documents: ChatbotDocument[],
  trainingSessions: ChatbotTrainingSession[]
): Promise<ChatbotResponse> {
  // First, check if the question is on-topic
  const isOnTopic = await checkIfOnTopic(question);
  
  if (!isOnTopic.isOnTopic) {
    return {
      response: "I'm specifically trained to answer questions about Nick Lanahan's professional background, skills, and experience. Could you please ask me something about Nick's career, projects, or qualifications?",
      isOnTopic: false,
      confidence: 0.9
    };
  }

  // Create context from training data
  const documentContext = documents.map(doc => 
    `Document: ${doc.originalName}\nContent: ${doc.content}`
  ).join('\n\n');
  
  const trainingContext = trainingSessions.map(session => 
    `Q: ${session.question}\nA: ${session.answer}`
  ).join('\n\n');

  const systemPrompt = `You are a personal chatbot specifically trained to answer questions about Nick Lanahan for recruiters and hiring managers. 

IMPORTANT GUIDELINES:
1. Only answer questions about Nick Lanahan's professional background, skills, experience, and qualifications
2. Present Nick in a positive, professional light while being truthful
3. If you don't have specific information, say so rather than making things up
4. Keep responses concise and relevant to recruiting/hiring context
5. Be enthusiastic about Nick's qualifications but professional in tone
6. Focus on his strengths, achievements, and value proposition

CONTEXT ABOUT NICK:

DOCUMENTS:
${documentContext}

TRAINING Q&A:
${trainingContext}

Respond to the recruiter's question professionally and helpfully.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return {
      response: response.choices[0].message.content || "I'm sorry, I couldn't generate a response. Could you please rephrase your question?",
      isOnTopic: true,
      confidence: 0.8
    };
  } catch (error) {
    console.error('Error processing recruiter question:', error);
    return {
      response: "I'm experiencing technical difficulties. Please try asking your question again in a moment.",
      isOnTopic: true,
      confidence: 0.1
    };
  }
}

/**
 * Check if a question is on-topic (about Nick Lanahan)
 */
async function checkIfOnTopic(question: string): Promise<{ isOnTopic: boolean; confidence: number }> {
  const prompt = `Determine if this question is about Nick Lanahan's professional background, skills, experience, education, or personal qualities that would be relevant to a recruiter.

Question: "${question}"

Return JSON response:
{
  "isOnTopic": true/false,
  "confidence": 0-1 scale
}

Consider these as ON-TOPIC:
- Questions about skills, experience, education, career
- Questions about projects, achievements, leadership
- Questions about work style, personality, motivations
- Questions about availability, salary expectations, etc.

Consider these as OFF-TOPIC:
- General career advice
- Questions about other people
- Requests for services unrelated to Nick
- Technical questions not about Nick's skills
- Random conversations`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      isOnTopic: result.isOnTopic || false,
      confidence: result.confidence || 0.5
    };
  } catch (error) {
    console.error('Error checking topic relevance:', error);
    // Default to allowing the question if we can't determine
    return { isOnTopic: true, confidence: 0.5 };
  }
}

/**
 * Extract text content from various file types
 */
export function extractTextFromFile(buffer: Buffer, mimeType: string, filename: string): string {
  try {
    // For now, handle text files and assume PDF/DOC extraction will be added later
    if (mimeType.startsWith('text/')) {
      return buffer.toString('utf-8');
    }
    
    // For other file types, return basic info
    return `File: ${filename}\nType: ${mimeType}\nSize: ${buffer.length} bytes\n\nContent extraction for this file type is not yet implemented. Please provide the content as a text file or paste the content during training.`;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return `Error reading file: ${filename}`;
  }
}