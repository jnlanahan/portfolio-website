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
import { generateEnhancedSystemPrompt } from './chatbotLearningService';
// Note: Using dynamic imports to avoid initialization issues

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
  conversationId?: number;
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
    `Document: ${doc.originalName}\nContent: ${doc.content.substring(0, 1500)}...`
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
    
    console.log(`Retrieved ${documents.length} documents from storage`);
    console.log(`Retrieved ${trainingData.length} training sessions from storage`);
    
    // Build context from training data
    let context = "Current profile data about Nick Lanahan:\n\n";
    
    // Add document context - focus on documents with substantial content
    const substantialDocs = documents.filter(doc => doc.content.length > 1000);
    console.log(`Using ${substantialDocs.length} substantial documents out of ${documents.length} total`);
    
    substantialDocs.forEach(doc => {
      console.log(`Document: ${doc.originalName}, Content length: ${doc.content.length}`);
      context += `From ${doc.originalName}: ${doc.content.substring(0, 3000)}...\n\n`;
    });
    
    // Add Q&A context
    trainingData.forEach(session => {
      context += `Q: ${session.question}\nA: ${session.answer}\n\n`;
    });

    const systemPrompt = `You are Nack, a professional AI assistant specifically designed to represent Nick Lanahan to recruiters and hiring managers. Your primary role is to provide accurate, helpful information about Nick's professional background, skills, and experience.

DETAILED CONTEXT FROM NICK'S DOCUMENTS:
${context}

INSTRUCTIONS:
- Use the detailed information provided above to answer questions about Nick's background
- When specific information is available in the context, provide it directly
- Be confident and informative when answering questions about information that's clearly documented
- Maintain a professional, helpful tone suitable for recruiter interactions
- Focus on Nick's achievements, experience, and qualifications`;

    // Debug logging
    console.log('Context length:', context.length);
    console.log('Context contains "South Korea":', context.includes('South Korea'));
    console.log('Context contains "Seoul":', context.includes('Seoul'));
    console.log('Context contains "Pyeongtaek":', context.includes('Pyeongtaek'));

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 500,
      temperature: 0.9,
    });

    const botResponse = response.choices[0].message.content || "I'm sorry, I couldn't process your question. Please try again.";
    
    // Save conversation to database
    const conversation = await storage.saveChatbotConversation({
      sessionId,
      userQuestion: question,
      botResponse: botResponse
    });

    return {
      response: botResponse,
      isOnTopic: true,
      confidence: isOnTopicResult.confidence,
      conversationId: conversation.id
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

    const systemPrompt = `You are Nack, Nick Lanahan's AI assistant in TRAINING MODE. Your goal is to learn about Nick through natural conversation.

ABSOLUTE RULE: You must ask exactly ONE question per response. Do not ask multiple questions. Do not create numbered lists. Do not use bullet points. Ask only ONE question.

Your response should be in this format:
- Acknowledge what Nick just shared 
- Ask ONE single question

Example of correct response:
"That's great to hear about your role at EY! What's the most challenging aspect of managing product transformations?"

Example of INCORRECT response (DO NOT DO THIS):
"Thanks for sharing! I have a few questions: 1. What challenges do you face? 2. How long have you been there? 3. What skills do you use?"

Current profile data you already know:
${profileContext}

Now respond with acknowledgment + ONE question only.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
        { role: "assistant", content: "I understand. I will ask only ONE question per response. No numbered lists, no multiple questions." },
        { role: "user", content: "Perfect. Now respond to my message with acknowledgment and ONE question only." }
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    const botResponse = response.choices[0].message.content || "I'm sorry, I couldn't process your message. Please try again.";
    
    // Save training conversation to database
    const conversation = await storage.saveChatbotConversation({
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
 * Check if a question is inappropriate or harmful (very lenient filtering)
 */
async function checkIfOnTopic(question: string): Promise<{ isOnTopic: boolean; confidence: number }> {
  const prompt = `Is this question clearly harmful, offensive, or inappropriate? Only flag content that is obviously problematic.

Question: "${question}"

Return JSON response:
{
  "isOnTopic": true/false,
  "confidence": 0-1 scale
}

ONLY mark as inappropriate (isOnTopic: false) if the question contains:
- Clear hate speech or discrimination
- Explicit sexual content
- Requests for harmful/illegal activities
- Obvious malicious intent

ALL other questions should be marked as acceptable (isOnTopic: true), including:
- Any questions about someone's background, career, or history
- Questions using pronouns like "he", "she", "they"
- Questions about locations, timelines, or events
- Questions where the answer might be "I don't know"
- General conversation about professional topics

Default to acceptable (isOnTopic: true) unless clearly inappropriate.`;

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
export async function extractTextFromFile(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  try {
    // Handle text files
    if (mimeType.startsWith('text/')) {
      return buffer.toString('utf-8');
    }
    
    // Handle PDF files
    if (mimeType === 'application/pdf') {
      try {
        const pdfParse = await import('pdf-parse');
        const data = await pdfParse.default(buffer);
        return `Document: ${filename}\nExtracted from PDF:\n\n${data.text}`;
      } catch (error) {
        console.error('Error parsing PDF:', error);
        return `File: ${filename}\nPDF parsing failed: ${error.message}`;
      }
    }
    
    // Handle Word documents (.docx)
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        return `Document: ${filename}\nExtracted from Word document:\n\n${result.value}`;
      } catch (error) {
        console.error('Error parsing Word document:', error);
        return `File: ${filename}\nWord document parsing failed: ${error.message}`;
      }
    }
    
    // Handle older Word documents (.doc)
    if (mimeType === 'application/msword') {
      try {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        return `Document: ${filename}\nExtracted from Word document:\n\n${result.value}`;
      } catch (error) {
        console.error('Error parsing Word document:', error);
        return `File: ${filename}\nWord document parsing failed: ${error.message}`;
      }
    }
    
    // Handle markdown files
    if (mimeType === 'text/markdown') {
      return `Document: ${filename}\nMarkdown content:\n\n${buffer.toString('utf-8')}`;
    }
    
    // For other file types, return basic info
    return `File: ${filename}\nType: ${mimeType}\nSize: ${buffer.length} bytes\n\nContent extraction for this file type is not yet implemented. Please provide the content as a text file or paste the content during training.`;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return `Error reading file: ${filename} - ${error.message}`;
  }
}