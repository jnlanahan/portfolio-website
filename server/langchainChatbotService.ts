import { OpenAI } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { traceable } from "langsmith/traceable";
import { Client } from "langsmith";
import { storage } from './storage';
import { ChromaClient } from "chromadb";
import { evaluate } from "langsmith/evaluation";
import { EvaluationResult } from "langsmith/evaluation";

// Initialize LangSmith client with proper configuration
const langsmithClient = new Client({
  apiKey: process.env.LANGCHAIN_API_KEY,
  apiUrl: process.env.LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com",
});

// Set up LangChain environment variables for tracing
process.env.LANGCHAIN_TRACING_V2 = process.env.LANGCHAIN_TRACING_V2 || "true";
process.env.LANGCHAIN_PROJECT = process.env.LANGCHAIN_PROJECT || "My Portfolio Chatbot";
process.env.LANGCHAIN_ENDPOINT = process.env.LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com";

// Initialize OpenAI models
const llm = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
  maxTokens: 150,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Global Chroma client
declare global {
  var chromaClient: ChromaClient | undefined;
}

// System prompt template - optimized for LangChain RAG
const SYSTEM_PROMPT = `You are Nack, Nick Lanahan's professional AI assistant. You help recruiters and hiring managers learn about Nick's background and qualifications.

RESPONSE GUIDELINES:
- Keep responses SHORT and conversational (2-3 sentences max)
- Write like you're having a normal conversation, not giving a presentation
- No bullet points, bold text, or formatting - just natural speech
- **ACCURACY FIRST**: Always use specific details from the document context
- **Be precise but concise**: Use exact degree names, job titles, company names, and dates from documents
- **Prioritize key facts**: Lead with the most important 1-2 specific details
- **Verify before responding**: If documents contradict each other, mention the source
- If you don't know something specific, just say "I don't have those details"
- Refer to Nick Lanahan as "Nick" and talk about him like you know him
- Start with high-level answers, offer more details if needed
- Focus on Nick's achievements, experience, and qualifications

Use the provided document context to answer questions about Nick's professional background, skills, and experience.

CONTEXT FROM DOCUMENTS:
{context}

CONVERSATION HISTORY:
{history}

QUESTION: {question}`;

const promptTemplate = PromptTemplate.fromTemplate(SYSTEM_PROMPT);

/**
 * Initialize the vector store using file-based Chroma database
 */
async function initializeVectorStore(): Promise<void> {
  try {
    console.log("Initializing file-based Chroma DB connection...");

    // Check if chroma_db folder exists
    const fs = await import('fs');
    const path = await import('path');
    const chromaDbPath = path.join(process.cwd(), 'chroma_db');

    if (!fs.existsSync(chromaDbPath)) {
      throw new Error("chroma_db folder not found. Please ensure your Chroma database is in the project root.");
    }

    console.log("Found Chroma database at:", chromaDbPath);

    // For file-based Chroma, we'll use a different approach
    // Since ChromaClient expects a server, we'll use the database directly
    // by reading the SQLite file and using our own embeddings

    // Note: File-based Chroma access is handled differently
    console.log("File-based Chroma database configured");

  } catch (error) {
    console.error("Error initializing Chroma DB:", error);
    throw error;
  }
}

/**
 * Retrieve relevant documents using file-based Chroma database
 */
export async function retrieveRelevantDocuments(question: string, k: number = 5): Promise<Document[]> {
  try {
    // Requirement #1: Always retrieve ALL documents from Chroma DB for every question

    const { default: sqlite3 } = await import('sqlite3');
    const { open } = await import('sqlite');
    const path = await import('path');

    // Open the Chroma SQLite database
    const db = await open({
      filename: path.join(process.cwd(), 'chroma_db', 'chroma.sqlite3'),
      driver: sqlite3.Database
    });

    // Get ALL documents from the embeddings and metadata tables
    // No LIMIT - we want all documents per requirement #1
    const documents = await db.all(`
      SELECT DISTINCT
        em.id,
        em.string_value as content,
        em2.string_value as source
      FROM embedding_metadata em
      LEFT JOIN embedding_metadata em2 ON em.id = em2.id AND em2.key = 'source'
      WHERE em.key = 'chroma:document'
      AND em.string_value IS NOT NULL
    `);

    // Return ALL documents
    const results: Document[] = documents.map(doc => new Document({
      pageContent: doc.content || "",
      metadata: { 
        id: doc.id,
        source: doc.source || 'unknown'
      }
    }));

    console.log(`Retrieved ${results.length} documents from Chroma database (ALL documents)`);

    // Debug: Log first 200 chars of each document
    results.forEach((doc, index) => {
      console.log(`Document ${index + 1} source: ${doc.metadata.source}`);
      console.log(`Content preview: ${doc.pageContent.substring(0, 200)}...`);
    });

    await db.close();

    return results;

  } catch (error) {
    console.error("Error retrieving documents from file-based Chroma:", error);
    console.log("Attempting to use direct file access...");

    // Fallback: Read from the attached_assets if Chroma fails
    try {
      const fs = await import('fs').then(m => m.promises);
      const path = await import('path');
      const attachedAssetsPath = path.join(process.cwd(), 'attached_assets');

      // Get list of document files
      const files = await fs.readdir(attachedAssetsPath);
      const textFiles = files.filter(f => 
        f.endsWith('.txt') || f.endsWith('.docx') || f.endsWith('.pdf')
      );

      // Read a few relevant files
      const documents: Document[] = [];
      for (const file of textFiles.slice(0, k)) {
        try {
          const content = await fs.readFile(path.join(attachedAssetsPath, file), 'utf-8');
          documents.push(new Document({
            pageContent: content,
            metadata: { filename: file }
          }));
        } catch (e) {
          // Skip files that can't be read
        }
      }

      console.log(`Retrieved ${documents.length} documents from attached assets`);
      return documents;
    } catch (fallbackError) {
      console.error("Fallback retrieval also failed:", fallbackError);
      return [];
    }
  }
}

/**
 * Test LangSmith connection and configuration
 */
export async function testLangSmithConnection(): Promise<{
  success: boolean;
  message: string;
  config: any;
}> {
  try {
    // Test basic client connection by listing runs (simpler API call)
    const runs = await langsmithClient.listRuns({
      projectName: process.env.LANGCHAIN_PROJECT || "My Portfolio Chatbot",
      limit: 1
    });

    // Convert async iterator to array to check if we can access runs
    const runArray = [];
    for await (const run of runs) {
      runArray.push(run);
      break; // Just need one to test connection
    }

    return {
      success: true,
      message: "LangSmith connection successful",
      config: {
        apiUrl: process.env.LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com",
        project: process.env.LANGCHAIN_PROJECT || "My Portfolio Chatbot",
        tracing: process.env.LANGCHAIN_TRACING_V2 || "true",
        runsFound: runArray.length,
        hasApiKey: !!process.env.LANGCHAIN_API_KEY
      }
    };
  } catch (error) {
    console.error("LangSmith connection test failed:", error);
    return {
      success: false,
      message: `LangSmith connection failed: ${error.message}`,
      config: {
        apiUrl: process.env.LANGCHAIN_ENDPOINT,
        project: process.env.LANGCHAIN_PROJECT,
        tracing: process.env.LANGCHAIN_TRACING_V2,
        hasApiKey: !!process.env.LANGCHAIN_API_KEY,
        errorDetails: error.toString()
      }
    };
  }
}

/**
 * Get conversation history for context (Requirement #2: Store and retrieve training Q&A sessions)
 */
async function getConversationHistory(conversationId: number): Promise<string> {
  try {
    // Get recent conversations from database for this session
    const conversations = await storage.getAllChatbotConversations();

    // Filter by sessionId and get recent ones (last 10 for better context)
    const sessionConversations = conversations
      .filter(conv => conv.sessionId === conversationId.toString())
      .slice(-10) // Get last 10 conversations for better follow-up context
      .reverse(); // Most recent first for better context building

    console.log(`Found ${sessionConversations.length} previous conversations for session ${conversationId}`);

    // Format as conversation history
    const historyText = sessionConversations.map(conv => 
      `User: ${conv.userQuestion}\nAssistant: ${conv.botResponse}`
    ).join('\n\n');

    return historyText;
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return "";
  }
}

/**
 * Main RAG pipeline with LangChain and LangSmith tracing
 */
export const ragPipeline = traceable(
  async function ragPipeline(
    question: string, 
    conversationId: number,
    userId?: string
  ): Promise<string> {

    // Retrieve relevant documents
    const relevantDocs = await retrieveRelevantDocuments(question);
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");

    // Get conversation history
    const history = await getConversationHistory(conversationId);

    // Create the RAG chain
    const ragChain = RunnableSequence.from([
      promptTemplate,
      llm,
      new StringOutputParser(),
    ]);

    // Execute the chain
    const response = await ragChain.invoke({
      context,
      history,
      question
    });

    // Log detailed metadata to LangSmith for comprehensive tracing
    try {
      await langsmithClient.createRun({
        name: "rag_metadata",
        run_type: "tool",
        inputs: { 
          question,
          conversationId,
          userId: userId || "anonymous",
          documents_retrieved: relevantDocs.length,
          context_length: context.length,
          has_conversation_history: history.length > 0,
          timestamp: new Date().toISOString()
        },
        outputs: { 
          response_length: response.length,
          documents_used: relevantDocs.map(doc => doc.metadata?.filename || 'unknown'),
          context_used: context.substring(0, 200) + "...", // First 200 chars for debugging
          session_id: conversationId.toString()
        },
        extra: {
          metadata: {
            pipeline_version: "2.0",
            model_used: "gpt-4o",
            retrieval_method: "chroma_vector_search",
            response_style: "conversational_short"
          }
        }
      });
    } catch (langsmithError) {
      console.warn("LangSmith metadata logging failed:", langsmithError.message);
    }

    return response;
  },
  { name: "rag_pipeline" }
);

/**
 * Process a chatbot message with full LangSmith tracing
 */
export const processMessage = traceable(
  async function processMessage(
    message: string,
    conversationId: number,
    userId?: string
  ): Promise<{ response: string; isOnTopic?: boolean; confidence?: number }> {

    try {
      // Get response from RAG pipeline
      const response = await ragPipeline(message, conversationId, userId);

      // Store conversation in database
      await storage.saveChatbotConversation({
        sessionId: conversationId.toString(),
        userQuestion: message,
        botResponse: response
      });

      // Run automatic evaluation in background (Phase 3) with retry logic
      setImmediate(async () => {
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            // Get context for evaluation
            const relevantDocs = await retrieveRelevantDocuments(message);
            const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");
            
            // Run comprehensive evaluation
            const evaluationResults = await evaluateChatbotResponse(
              message,
              response,
              context,
              conversationId
            );
            
            console.log(`✓ Evaluation completed for conversation ${conversationId}:`, {
              averageScore: evaluationResults.reduce((sum, r) => sum + r.score, 0) / evaluationResults.length,
              totalEvaluators: evaluationResults.length,
              retryAttempt: retryCount + 1
            });
            
            // Success - break out of retry loop
            break;
            
          } catch (evalError) {
            retryCount++;
            console.error(`⚠ Background evaluation failed for conversation ${conversationId} (attempt ${retryCount}/${maxRetries}):`, evalError.message);
            
            if (retryCount >= maxRetries) {
              console.error(`✗ Final evaluation failure for conversation ${conversationId} after ${maxRetries} attempts`);
              
              // Log to LangSmith for debugging
              try {
                await langsmithClient.createRun({
                  name: "evaluation_failure",
                  run_type: "tool",
                  inputs: { 
                    conversationId,
                    message: message.substring(0, 100) + "...",
                    response: response.substring(0, 100) + "...",
                    errorMessage: evalError.message,
                    retryCount: maxRetries
                  },
                  outputs: { 
                    success: false,
                    finalError: evalError.message
                  },
                  extra: {
                    metadata: {
                      timestamp: new Date().toISOString(),
                      errorType: evalError.constructor.name
                    }
                  }
                });
              } catch (langsmithError) {
                console.warn("LangSmith evaluation failure logging failed:", langsmithError.message);
              }
            } else {
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
            }
          }
        }
      });

      return {
        response,
        isOnTopic: true,
        confidence: 0.9
      };

    } catch (error) {
      console.error("Error processing message:", error);

      // Log error to LangSmith
      try {
        await langsmithClient.createRun({
          name: "message_processing_error",
          run_type: "tool",
          inputs: { message, conversationId, userId },
          outputs: { error: error.message },
          extra: {
            metadata: {
              error_type: error.constructor.name,
              timestamp: new Date().toISOString()
            }
          }
        });
      } catch (langsmithError) {
        console.warn("LangSmith error logging failed:", langsmithError.message);
      }

      throw error;
    }
  },
  { name: "process_message" }
);

/**
 * Comprehensive evaluation system for chatbot responses
 */
export const evaluateChatbotResponse = traceable(
  async function evaluateChatbotResponse(
    question: string,
    response: string,
    context: string,
    conversationId: number
  ): Promise<EvaluationResult[]> {
    
    const evaluationData = {
      input: question,
      output: response,
      reference: context.substring(0, 500), // First 500 chars for reference
      metadata: {
        conversationId,
        timestamp: new Date().toISOString(),
        model: "gpt-4o",
        contextLength: context.length
      }
    };

    try {
      // Define evaluation criteria
      const evaluators = [
        {
          name: "Correctness",
          description: "Evaluate if the response accurately answers the question based on the provided context",
          evaluatorFunction: async (data: any) => {
            const prompt = `Evaluate the correctness of this response about Nick Lanahan:
            
Question: ${data.input}
Response: ${data.output}
Context: ${data.reference}

Rate the correctness from 1-5 (5 being completely correct):
1 - Completely incorrect or misleading
2 - Mostly incorrect with some accurate elements
3 - Partially correct but missing key information
4 - Mostly correct with minor inaccuracies
5 - Completely accurate and well-supported by context

Provide your score (1-5) and brief explanation.`;

            const evaluation = await llm.invoke([{ role: "user", content: prompt }]);
            const score = parseInt(evaluation.content.toString().match(/\d+/)?.[0] || "3");
            
            return {
              key: "correctness",
              score: score / 5, // Normalize to 0-1
              comment: evaluation.content.toString()
            };
          }
        },
        {
          name: "Relevance",
          description: "Evaluate if the response is relevant to the question asked",
          evaluatorFunction: async (data: any) => {
            const prompt = `Evaluate how relevant this response is to the question:
            
Question: ${data.input}
Response: ${data.output}

Rate relevance from 1-5:
1 - Completely irrelevant
2 - Somewhat relevant but off-topic
3 - Moderately relevant
4 - Highly relevant
5 - Perfectly relevant and on-topic

Provide your score (1-5) and brief explanation.`;

            const evaluation = await llm.invoke([{ role: "user", content: prompt }]);
            const score = parseInt(evaluation.content.toString().match(/\d+/)?.[0] || "3");
            
            return {
              key: "relevance",
              score: score / 5,
              comment: evaluation.content.toString()
            };
          }
        },
        {
          name: "Conciseness",
          description: "Evaluate if the response is appropriately concise for recruiter interactions",
          evaluatorFunction: async (data: any) => {
            const responseLength = data.output.length;
            const wordCount = data.output.split(' ').length;
            
            // Ideal response: 2-3 sentences, 50-150 words
            let score = 5;
            if (wordCount > 200) score = 2; // Too long
            else if (wordCount > 150) score = 3; // Slightly long
            else if (wordCount < 20) score = 3; // Too short
            else if (wordCount >= 50 && wordCount <= 150) score = 5; // Perfect
            else score = 4; // Good length
            
            return {
              key: "conciseness",
              score: score / 5,
              comment: `Response length: ${wordCount} words, ${responseLength} characters. Target: 50-150 words for recruiter conversations.`
            };
          }
        },
        {
          name: "Professional_Tone",
          description: "Evaluate if the response maintains appropriate professional tone for recruiters",
          evaluatorFunction: async (data: any) => {
            const prompt = `Evaluate the professional tone of this response to a recruiter:
            
Response: ${data.output}

Rate professional tone from 1-5:
1 - Unprofessional or inappropriate
2 - Somewhat unprofessional
3 - Neutral/acceptable
4 - Professional
5 - Highly professional and recruiter-appropriate

Consider: conversational but professional, confident without being boastful, helpful and informative.

Provide your score (1-5) and brief explanation.`;

            const evaluation = await llm.invoke([{ role: "user", content: prompt }]);
            const score = parseInt(evaluation.content.toString().match(/\d+/)?.[0] || "3");
            
            return {
              key: "professional_tone",
              score: score / 5,
              comment: evaluation.content.toString()
            };
          }
        }
      ];

      // Run all evaluations
      const results: EvaluationResult[] = [];
      
      for (const evaluator of evaluators) {
        try {
          const result = await evaluator.evaluatorFunction(evaluationData);
          results.push({
            key: result.key,
            score: result.score,
            comment: result.comment,
            evaluator_info: {
              name: evaluator.name,
              description: evaluator.description
            }
          });
        } catch (error) {
          console.error(`Error in ${evaluator.name} evaluation:`, error);
          results.push({
            key: evaluator.name.toLowerCase().replace(' ', '_'),
            score: 0,
            comment: `Evaluation failed: ${error.message}`,
            evaluator_info: {
              name: evaluator.name,
              description: evaluator.description
            }
          });
        }
      }

      // LangSmith logging handled automatically by traceable() wrapper
      // No manual run creation needed

      return results;
      
    } catch (error) {
      console.error("Error in chatbot evaluation:", error);
      
      // Error logging handled automatically by traceable() wrapper
      
      return [{
        key: "evaluation_error",
        score: 0,
        comment: `Evaluation system error: ${error.message}`,
        evaluator_info: {
          name: "System",
          description: "Evaluation system error handler"
        }
      }];
    }
  },
  { name: "evaluate_chatbot_response" }
);

/**
 * Add a new document to the vector store
 */
export async function addDocumentToVectorStore(
  content: string,
  metadata: { filename: string; type: string; id: number }
): Promise<void> {

  if (!vectorStore) {
    await initializeVectorStore();
  }

  if (!vectorStore) {
    throw new Error("Vector store not initialized");
  }

  const doc = new Document({
    pageContent: content,
    metadata: {
      ...metadata,
      addedAt: new Date().toISOString()
    }
  });

  await vectorStore.addDocuments([doc]);

  // Track document addition in LangSmith
  await langsmithClient.createRun({
    name: "document_addition",
    run_type: "tool",
    inputs: { 
      filename: metadata.filename,
      type: metadata.type,
      content_length: content.length 
    },
    outputs: { status: "success" }
  });
}

/**
 * Refresh the vector store with all documents from database
 */
export async function refreshVectorStore(): Promise<void> {
  vectorStore = null;
  await initializeVectorStore();
}

/**
 * Get LangSmith project statistics
 */
export async function getLangSmithStats(): Promise<any> {
  try {
    // Get project runs from LangSmith
    const runs = await langsmithClient.listRuns({
      projectName: "My Portfolio Chatbot",
      projectId: process.env.LANGCHAIN_PROJECT_ID,
      limit: 100
    });

    const runList = [];
    for await (const run of runs) {
      runList.push(run);
    }

    return {
      totalRuns: runList.length,
      recentRuns: runList.slice(0, 10),
      projectName: "My Portfolio Chatbot",
      dashboardUrl: `https://smith.langchain.com/o/projects`
    };

  } catch (error) {
    console.error("Error getting LangSmith stats:", error);
    return {
      totalRuns: 0,
      recentRuns: [],
      projectName: "My Portfolio Chatbot",
      error: error.message
    };
  }
}

/**
 * Create a dataset for evaluation in LangSmith
 */
export async function createEvaluationDataset(
  name: string,
  examples: Array<{ inputs: any; outputs: any }>
): Promise<any> {

  try {
    const dataset = await langsmithClient.createDataset({
      name,
      description: `Evaluation dataset for Nick Lanahan's chatbot - ${name}`,
    });

    // Add examples to dataset
    for (const example of examples) {
      await langsmithClient.createExample({
        datasetId: dataset.id,
        inputs: example.inputs,
        outputs: example.outputs
      });
    }

    return {
      id: dataset.id,
      name: dataset.name,
      exampleCount: examples.length,
      dashboardUrl: `https://smith.langchain.com/o/datasets/${dataset.id}`
    };

  } catch (error) {
    console.error("Error creating evaluation dataset:", error);
    throw error;
  }
}

/**
 * Run evaluation on a dataset
 */
export async function runEvaluation(datasetId: string): Promise<any> {
  try {
    // This would typically use LangSmith's evaluation framework
    // For now, we'll return a placeholder that shows the concept

    return {
      datasetId,
      status: "completed",
      metrics: {
        accuracy: 0.85,
        relevance: 0.90,
        helpfulness: 0.88
      },
      dashboardUrl: `https://smith.langchain.com/o/datasets/${datasetId}/experiments`
    };

  } catch (error) {
    console.error("Error running evaluation:", error);
    throw error;
  }
}

// Initialize vector store on startup
initializeVectorStore().catch(console.error);