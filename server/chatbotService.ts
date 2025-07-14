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
 * Analyze what kind of information a question is asking about
 */
async function analyzeQuestion(question: string): Promise<{isAskingAbout: string[]}> {
  const questionLower = question.toLowerCase();
  const topics = [];
  
  // Education-related keywords
  if (questionLower.includes('course') || questionLower.includes('class') || 
      questionLower.includes('education') || questionLower.includes('school') ||
      questionLower.includes('university') || questionLower.includes('degree') ||
      questionLower.includes('transcript') || questionLower.includes('gpa') ||
      questionLower.includes('mba') || questionLower.includes('master')) {
    topics.push('education');
  }
  
  // Work experience keywords
  if (questionLower.includes('work') || questionLower.includes('job') ||
      questionLower.includes('experience') || questionLower.includes('career') ||
      questionLower.includes('position') || questionLower.includes('role') ||
      questionLower.includes('company') || questionLower.includes('employer')) {
    topics.push('work', 'experience', 'career');
  }
  
  // Project keywords
  if (questionLower.includes('project') || questionLower.includes('built') ||
      questionLower.includes('developed') || questionLower.includes('created')) {
    topics.push('projects');
  }
  
  // Skills keywords
  if (questionLower.includes('skill') || questionLower.includes('technology') ||
      questionLower.includes('programming') || questionLower.includes('language')) {
    topics.push('skills');
  }
  
  return { isAskingAbout: topics };
}

/**
 * Search a document for content relevant to a question
 */
function searchDocumentForRelevance(content: string, question: string): string {
  const questionWords = question.toLowerCase().split(/\s+/).filter(word => word.length > 3);
  const lines = content.split('\n');
  const relevantLines = [];
  
  // Look for lines that contain question keywords
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();
    
    // Check if line contains any of the question words
    const hasRelevance = questionWords.some(word => lineLower.includes(word));
    
    if (hasRelevance) {
      // Include context: 2 lines before and after
      const startIdx = Math.max(0, i - 2);
      const endIdx = Math.min(lines.length - 1, i + 2);
      
      for (let j = startIdx; j <= endIdx; j++) {
        if (lines[j].trim() && !relevantLines.includes(lines[j])) {
          relevantLines.push(lines[j]);
        }
      }
    }
  }
  
  // Return up to 1500 characters of relevant content
  const result = relevantLines.join('\n').substring(0, 1500);
  return result || "";
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
    
    // Get relevant documents from Chroma DB via LangChain
    const { retrieveRelevantDocuments } = await import('./langchainChatbotService');
    const relevantDocs = await retrieveRelevantDocuments(question, 10);
    
    const learningInsights = await storage.getChatbotLearningInsights();
    
    console.log(`Retrieved ${relevantDocs.length} documents from Chroma DB`);
    console.log(`Retrieved ${learningInsights.length} learning insights from storage`);
    
    // First, determine what kind of information the question is asking about
    const questionAnalysis = await analyzeQuestion(question);
    
    // Build context from retrieved documents
    let relevantContext = "";
    
    // Use the documents retrieved from Chroma DB
    for (const doc of relevantDocs) {
      if (doc.pageContent) {
        relevantContext += `\nFrom document:\n${doc.pageContent.substring(0, 500)}\n`;
      }
    }
    
    // Add important facts from learning insights
    const factInsights = learningInsights.filter(i => 
      i.isActive && i.insight.startsWith('FACT:')
    );
    
    let factsSection = "";
    if (factInsights.length > 0) {
      factsSection = "\n\nIMPORTANT FACTS (from user feedback):\n";
      factInsights.forEach(fact => {
        const factText = fact.insight.replace('FACT: ', '');
        factsSection += `• ${factText}\n`;
      });
    }

    // Check if there's a custom system prompt template
    let systemPrompt = "";
    const customPromptTemplate = await storage.getActiveSystemPromptTemplate();
    
    if (customPromptTemplate) {
      // Use the custom prompt and append facts and context
      systemPrompt = customPromptTemplate.template;
      
      // Append facts if not already included
      if (!systemPrompt.includes('IMPORTANT FACTS') && factsSection) {
        systemPrompt += factsSection;
      }
      
      // Append context for this specific question
      systemPrompt += `\n\nRELEVANT CONTEXT FOR THIS QUESTION:
${relevantContext || "No specific documents found for this question. Please provide information based on general knowledge about Nick if available."}`;
    } else {
      // Use default system prompt
      systemPrompt = `You are Nack, a professional AI assistant specifically designed to represent Nick Lanahan to recruiters and hiring managers. Your primary role is to provide accurate, helpful information about Nick's professional background, skills, and experience.

CRITICAL INSTRUCTIONS:
- You have access to comprehensive documents about Nick including transcripts, resumes, performance reviews, and professional records
- When information is provided in the context below, present it confidently and directly
- For education questions: Use transcript information, course details, and academic records to provide specific answers
- For work experience: Reference performance reviews, job descriptions, and accomplishments
- For skills and projects: Draw from resume content, LinkedIn profile, and project documentation
- Only say "I don't have that specific information" if the context truly contains no relevant details
- Be confident and specific when information is available in the documents
- Maintain a professional, helpful tone suitable for recruiter interactions
- Focus on Nick's achievements, experience, and qualifications

DOCUMENT SOURCES AVAILABLE:
- Complete academic transcripts with course details and GPAs
- Professional resume with detailed experience
- LinkedIn profile with comprehensive background
- Performance reviews with specific ratings and feedback
- Military evaluations and service records
- Project documentation and accomplishments${factsSection}

RELEVANT CONTEXT FOR THIS QUESTION:
${relevantContext || "No specific documents found for this question. Please provide information based on general knowledge about Nick if available."}`;
    }

    // Debug logging
    console.log('Using custom prompt:', !!customPromptTemplate);
    console.log('Relevant context length:', relevantContext.length);
    console.log('Documents searched:', documents.map(d => d.originalName).join(', '));

    // Check for document reading issues
    const unreadableDocuments = documents.filter(doc => 
      doc.content.includes('parsing failed') || 
      doc.content.includes('processing failed') ||
      doc.content.includes('initialization failed') ||
      doc.content.includes('no readable text found') ||
      doc.content.length < 200
    );

    if (unreadableDocuments.length > 0) {
      console.warn(`Warning: ${unreadableDocuments.length} documents may not be readable:`, 
        unreadableDocuments.map(d => d.originalName).join(', '));
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 500,
      temperature: 0.9,
    });

    let botResponse = response.choices[0].message.content || "I'm sorry, I couldn't process your question. Please try again.";
    
    // Add document reading notification if there are issues
    if (unreadableDocuments.length > 0) {
      // Log unreadable documents for admin tracking but don't show to users
      console.log(`Note: ${unreadableDocuments.length} of ${documents.length} documents could not be fully read due to formatting or encryption issues.`);
    }
    
    // Save conversation to database
    const conversation = await storage.saveChatbotConversation({
      sessionId,
      userQuestion: question,
      botResponse: botResponse
    });

    // Log successful response to LangSmith
    try {
      const langsmithClient = new (await import("langsmith")).Client({
        apiKey: process.env.LANGCHAIN_API_KEY,
      });
      
      await langsmithClient.createRun({
        name: "recruiter_conversation",
        run_type: "chain",
        inputs: { question, sessionId, documents_count: documents.length },
        outputs: { response: botResponse, conversation_id: conversation.id },
        project_name: "My Portfolio Chatbot"
      });
    } catch (langsmithError) {
      console.warn("LangSmith logging failed:", langsmithError.message);
    }

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
        // Use pdf2json which is more reliable - dynamic import for ES modules
        const pdf2jsonModule = await import('pdf2json');
        const PDFParser = pdf2jsonModule.default;
        
        return new Promise((resolve) => {
          const pdfParser = new PDFParser();
          
          pdfParser.on('pdfParser_dataError', (errData) => {
            console.error('PDF parsing error:', errData);
            resolve(`Document: ${filename}\nPDF parsing failed: ${errData.parserError}. This document may be corrupted, password-protected, or in an unsupported format.`);
          });
          
          pdfParser.on('pdfParser_dataReady', (pdfData) => {
            try {
              // Extract text from all pages
              let allText = '';
              if (pdfData.Pages && pdfData.Pages.length > 0) {
                pdfData.Pages.forEach((page) => {
                  if (page.Texts) {
                    page.Texts.forEach((text) => {
                      if (text.R && text.R.length > 0) {
                        text.R.forEach((run) => {
                          if (run.T) {
                            allText += decodeURIComponent(run.T) + ' ';
                          }
                        });
                      }
                    });
                  }
                  allText += '\n';
                });
              }
              
              if (allText.trim().length > 0) {
                resolve(`Document: ${filename}\nExtracted from PDF:\n\n${allText.trim()}`);
              } else {
                resolve(`Document: ${filename}\nPDF processed but no readable text found. This PDF may contain primarily images, be password-protected, or have complex formatting that prevents text extraction.`);
              }
            } catch (error) {
              console.error('Error processing PDF data:', error);
              resolve(`Document: ${filename}\nPDF data processing failed: ${error.message}`);
            }
          });
          
          // Parse the buffer
          pdfParser.parseBuffer(buffer);
        });
      } catch (error) {
        console.error('Error initializing PDF parser:', error);
        return `Document: ${filename}\nPDF parsing initialization failed: ${error.message}. This document may be corrupted, password-protected, or in an unsupported format.`;
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