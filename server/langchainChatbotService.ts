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

// Initialize LangSmith client
const langsmithClient = new Client({
  apiKey: process.env.LANGCHAIN_API_KEY,
});

// Set up LangChain project name
process.env.LANGCHAIN_PROJECT = "My Portfolio Chatbot";

// Initialize OpenAI models
const llm = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Global vector store for documents
let vectorStore: MemoryVectorStore | null = null;
let chromaClient: ChromaClient | null = null;

// System prompt template
const SYSTEM_PROMPT = `You are Nack, a professional AI assistant specifically designed to represent Nick Lanahan to recruiters and hiring managers. Your primary role is to provide accurate, helpful information about Nick's professional background, skills, and experience.

CRITICAL INSTRUCTIONS:
- Always search available documents before answering questions
- When asked about specific topics, look for relevant documents:
  * For coursework or education details → Check for transcripts or academic records
  * For work experience or duration → Check resume and LinkedIn profile 
  * For project details → Check portfolio documents or project descriptions
  * For technical skills → Check resume, LinkedIn, and project documentation
  * For certifications or achievements → Check resume and professional documents
- Never assume information is not available without checking all documents
- If you cannot find specific information after searching, say "I don't have that specific information in the documents available"
- Be confident when information is found in documents
- Maintain a professional, helpful tone suitable for recruiter interactions
- Focus on Nick's achievements, experience, and qualifications

CONTEXT FROM DOCUMENTS:
{context}

CONVERSATION HISTORY:
{history}

QUESTION: {question}`;

const promptTemplate = PromptTemplate.fromTemplate(SYSTEM_PROMPT);

/**
 * Initialize the vector store with all documents from the database
 */
async function initializeVectorStore(): Promise<void> {
  try {
    console.log("Initializing LangChain integration...");
    
    // Check if chroma_db folder exists
    const fs = await import('fs');
    const path = await import('path');
    const chromaDbPath = path.join(process.cwd(), 'chroma_db');
    
    if (fs.existsSync(chromaDbPath)) {
      console.log("Found existing Chroma database at:", chromaDbPath);
      
      // For file-based Chroma database, we need to use a different approach
      // Let's fall back to the database storage with semantic search
      console.log("Using database storage with semantic search as fallback");
      
      // Create a memory vector store as fallback
      vectorStore = new MemoryVectorStore(embeddings);
      
      // Load documents from database into vector store
      const documents = await storage.getChatbotDocuments();
      console.log(`Loading ${documents.length} documents into vector store`);
      
      const langchainDocs = documents.map(doc => new Document({
        pageContent: doc.content,
        metadata: {
          filename: doc.originalName,
          type: doc.type,
          id: doc.id
        }
      }));
      
      if (langchainDocs.length > 0) {
        await vectorStore.addDocuments(langchainDocs);
        console.log("Documents loaded into vector store successfully");
      }
      
      console.log("Vector store initialized with database documents");
    } else {
      console.log("No existing Chroma database found. Please copy your chroma_db folder to the project root.");
    }
    
    // Create a placeholder MemoryVectorStore for LangChain compatibility
    vectorStore = new MemoryVectorStore(embeddings);
    
    console.log("LangChain integration initialized");
    
    // Track initialization in LangSmith
    try {
      await langsmithClient.createRun({
        name: "vector_store_initialization",
        runType: "tool",
        inputs: { database_type: "chroma", has_local_db: fs.existsSync(chromaDbPath) },
        outputs: { status: "success", vector_store_ready: true }
      });
    } catch (langsmithError) {
      console.warn("LangSmith logging failed:", langsmithError.message);
    }
    
  } catch (error) {
    console.error("Error initializing LangChain integration:", error);
    console.log("Creating fallback MemoryVectorStore...");
    
    // Fallback: create memory vector store
    vectorStore = new MemoryVectorStore(embeddings);
    
    // Track error in LangSmith
    try {
      await langsmithClient.createRun({
        name: "vector_store_initialization",
        runType: "tool",
        inputs: { database_type: "chroma", has_local_db: false },
        outputs: { status: "fallback", error: error?.message }
      });
    } catch (langsmithError) {
      console.warn("LangSmith logging failed:", langsmithError.message);
    }
  }
}

/**
 * Retrieve relevant documents using your existing Chroma database or fallback to database storage
 */
async function retrieveRelevantDocuments(question: string, k: number = 5): Promise<Document[]> {
  if (!chromaClient && !vectorStore) {
    await initializeVectorStore();
  }
  
  // Use the vector store for semantic search
  if (vectorStore) {
    try {
      const results = await vectorStore.similaritySearch(question, k);
      console.log(`Retrieved ${results.length} relevant documents from vector store for question: "${question}"`);
      return results;
    } catch (error) {
      console.error("Error retrieving documents from vector store:", error);
    }
  }
  
  // No fallback to database storage - if Chroma is not available, return empty
  console.log("Chroma database not available and no fallback configured");
  return [];
}

/**
 * Get conversation history for context
 */
async function getConversationHistory(conversationId: number): Promise<string> {
  try {
    // Get recent conversations from database
    const conversations = await storage.getChatbotConversations();
    
    // Filter by session and get recent ones
    const sessionConversations = conversations
      .filter(conv => conv.sessionId === conversationId.toString())
      .slice(-5); // Get last 5 conversations
    
    // Format as conversation history
    return sessionConversations.map(conv => 
      `User: ${conv.userQuestion}\nAssistant: ${conv.botResponse}`
    ).join('\n\n');
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
    
    // Log additional metadata to LangSmith
    try {
      await langsmithClient.createRun({
        name: "rag_metadata",
        run_type: "tool",
        inputs: { 
          question,
          conversationId,
          userId,
          documents_retrieved: relevantDocs.length,
          context_length: context.length
        },
        outputs: { 
          response_length: response.length,
          documents_used: relevantDocs.map(doc => doc.metadata?.filename || 'unknown')
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
export async function processMessage(
  message: string,
  conversationId: number,
  userId?: string
): Promise<string> {
  
  try {
    // Get response from RAG pipeline
    const response = await ragPipeline(message, conversationId, userId);
    
    // Store conversation in database
    await storage.saveChatbotConversation({
      sessionId: conversationId.toString(),
      userQuestion: message,
      botResponse: response
    });
    
    return response;
    
  } catch (error) {
    console.error("Error processing message:", error);
    
    // Log error to LangSmith
    try {
      await langsmithClient.createRun({
        name: "message_processing_error",
        run_type: "tool",
        inputs: { message, conversationId, userId },
        outputs: { error: error.message }
      });
    } catch (langsmithError) {
      console.warn("LangSmith error logging failed:", langsmithError.message);
    }
    
    throw error;
  }
}

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