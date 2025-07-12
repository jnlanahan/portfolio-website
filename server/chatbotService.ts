import OpenAI from 'openai';
import { 
  ChatbotDocument, 
  ChatbotTrainingSession, 
  ChatbotConversation,
  ChatbotTrainingProgress,
  InsertChatbotTrainingSession,
  InsertChatbotConversation
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
    const openai = getOpenAI();
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
 * Process a recruiter's question and generate appropriate response (VISITOR MODE)
 */
export async function processRecruiterQuestion(
  question: string,
  sessionId: string = 'default'
): Promise<ChatbotResponse> {
  try {
    const isOnTopicResult = await checkIfOnTopic(question);
    
    if (!isOnTopicResult.isOnTopic) {
      return {
        response: "Hi! I'm Nack, Nick's AI assistant, specifically trained to discuss his professional background and experience. I'd be happy to answer questions about his skills, career, projects, or qualifications. What would you like to know about Nick?",
        isOnTopic: false,
        confidence: 0.3
      };
    }

    const openai = getOpenAI();
    
    // Get training data from database to provide context
    const trainingData = await storage.getChatbotTrainingSessions();
    const documents = await storage.getChatbotDocuments();
    
    // Build context from training data
    let context = "Current profile data about Nick Lanahan:\n\n";
    
    // Add document context
    documents.forEach(doc => {
      context += `From ${doc.originalName}: ${doc.content.substring(0, 500)}...\n\n`;
    });
    
    // Add Q&A context
    trainingData.forEach(session => {
      context += `Q: ${session.question}\nA: ${session.answer}\n\n`;
    });

    const systemPrompt = `You are Nack, Nick Lanahan's AI assistant. Your purpose is to provide helpful, accurate information about Nick's professional background, experience, and qualifications.

CORE BEHAVIOR:
- Answer questions directly and conversationally about Nick's background
- Provide specific details from his experience when available
- Be helpful and informative without being overly formal
- If you don't have specific information, say so honestly
- Keep responses concise but comprehensive
- Focus on the most relevant aspects of Nick's background for each question

CURRENT INFORMATION ABOUT NICK:
- Manager, Product Management at EY (Ernst & Young)
- Based in Columbus, Ohio
- Leads high-impact product transformations
- Has engineering and military background
- Attended multiple universities including Ohio State, NC State, and Missouri S&T
- Previously served in the U.S. Army and Army Corps of Engineers

Here's additional context from training data:
${context}

Provide a helpful, direct answer to the user's question about Nick. Be conversational and informative.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const botResponse = response.choices[0].message.content || "I'm sorry, I couldn't process your question. Please try again.";
    
    // Save conversation to database
    await storage.saveChatbotConversation({
      sessionId,
      userQuestion: question,
      botResponse: botResponse
    });

    return {
      response: botResponse,
      isOnTopic: true,
      confidence: isOnTopicResult.confidence
    };
  } catch (error) {
    console.error('Error processing recruiter question:', error);
    return {
      response: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
      isOnTopic: false,
      confidence: 0
    };
  }
}

/**
 * Process a training conversation with Nack in TRAINING MODE
 */
export async function processTrainingConversation(
  message: string,
  sessionId: string = 'training'
): Promise<ChatbotResponse> {
  try {
    const openai = getOpenAI();
    
    // Get existing training data for context
    const trainingData = await storage.getChatbotTrainingSessions();
    const documents = await storage.getChatbotDocuments();
    
    // Build existing profile context
    let profileContext = "Current profile data about Nick Lanahan:\n\n";
    
    documents.forEach(doc => {
      profileContext += `From ${doc.originalName}: ${doc.content.substring(0, 300)}...\n\n`;
    });
    
    trainingData.forEach(session => {
      profileContext += `Q: ${session.question}\nA: ${session.answer}\n\n`;
    });

    const systemPrompt = `You are Nack, Nick Lanahan's dual-mode personal assistant in TRAINING MODE. Your goal is to elicit and store 100+ key data points about Nick Lanahan using questions that never take more than 3 minutes to answer.

TRAINING MODE Behavior:
- Use structured questioning with variety (multiple-choice, open-ended, ranking, "tell me more about...")
- Cover: professional history, roles, companies, projects, skills, metrics, education, certifications, core strengths, values, personal interests, achievements, stories
- Before each question, scan existing profile memory and identify gaps
- Generate fresh questions that probe those gaps (e.g., "I see you mentioned leading a team at X; can you describe a specific challenge you overcame there?")
- After every ~10 facts learned, summarize new profile entries and ask for confirmation
- If a line of questioning yields no new facts, smoothly transition to next topic
- Prompt for document uploads when relevant: "Would you like to upload or paste any relevant documents?"
- Ensure each question can be answered within 3 minutes
- Document ingestion: Summarize document sections, extract structured facts, link to existing profile data

Current profile data (scan for gaps):
${profileContext}

Continue the training conversation naturally. If this is the start, introduce yourself as Nack and begin with foundational questions about Nick's current role and background.

UNIVERSAL GUIDELINES:
- Accuracy: Never fabricate information
- Structured: Break complex questions into clear parts
- Empathy: Be encouraging and professional
- Memory: Automatically note each confirmed fact for later retrieval
- Confirmation: After every ~10 facts, summarize and ask for confirmation/correction`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 600,
      temperature: 0.8,
    });

    const botResponse = response.choices[0].message.content || "I'm sorry, I couldn't process your message. Please try again.";
    
    // Save training conversation to database
    await storage.saveChatbotConversation({
      sessionId,
      userQuestion: message,
      botResponse: botResponse
    });

    // Also save as training session for future reference
    await storage.saveChatbotTrainingSession({
      question: message,
      answer: botResponse,
      category: 'training-conversation'
    });

    return {
      response: botResponse,
      isOnTopic: true,
      confidence: 1.0
    };
  } catch (error) {
    console.error('Error processing training conversation:', error);
    return {
      response: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
      isOnTopic: false,
      confidence: 0
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
- General questions about Nick (e.g., "Tell me about Nick", "Who is Nick?", "What does Nick do?")
- Questions about Nick's background or current role
- Any question that mentions Nick's name or refers to him directly

Consider these as OFF-TOPIC:
- General career advice not about Nick
- Questions about other people (not Nick)
- Requests for services unrelated to Nick
- Technical questions not about Nick's skills
- Random conversations unrelated to Nick`;

  try {
    const openai = getOpenAI();
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