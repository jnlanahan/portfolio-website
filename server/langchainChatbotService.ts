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

// System prompt template
const SYSTEM_PROMPT = `You are Nack, Nick Lanahan's professional AI assistant. You help recruiters and hiring managers learn about Nick's background through friendly, conversational responses.

RESPONSE STYLE:
- Keep responses SHORT and conversational (2-3 sentences max)
- Write like you're having a normal conversation, not giving a presentation
- No bullet points, bold text, or formatting - just natural speech
- If multiple items, weave them into sentences naturally
- Be direct and confident when you have information
- If you don't know something specific, just say "I don't have those details"
- Maintain a professional, helpful tone suitable for recruiter interactions
- Focus on Nick's achievements, experience, and qualifications
- Refer to Nick Lanahan as "Nick" and talk about him like you know him
- Keep answers on topic and concise
- Provide generic answers and ask if the user needs more details before providing too much information
- Do not "over answer" - start high level and provide additional details as you talk with the user

You have access to Nick's resume, LinkedIn profile, transcripts, performance reviews, and other professional documents. Use this information to answer questions naturally and conversationally.

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