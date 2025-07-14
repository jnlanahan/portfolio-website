# Chroma Database Integration Setup

This guide explains how to integrate your existing Chroma vector database with the LangChain-powered chatbot system.

## Quick Setup

1. **Copy your Chroma database folder** to the project root:
   ```
   your-project/
   ├── chroma_db/          ← Copy your Chroma database here
   │   ├── chroma.sqlite3
   │   └── ... (other Chroma files)
   ├── server/
   ├── client/
   └── ... (other project files)
   ```

2. **Start the application**:
   ```bash
   npm run dev
   ```

3. **Test the integration**:
   - Visit `/admin/langchain` to see LangChain management interface
   - Use the floating chatbot to test document retrieval
   - All conversations are automatically logged to LangSmith

## How It Works

### LangChain Integration
- **Vector Store**: Connects to your existing Chroma database for semantic search
- **RAG Pipeline**: Uses LangChain's retrieval-augmented generation
- **LangSmith Tracing**: All chatbot interactions are automatically logged
- **Fallback System**: Falls back to database storage if Chroma is unavailable

### Document Retrieval
1. **Primary**: Uses your Chroma database for semantic similarity search
2. **Fallback**: Uses database storage with keyword matching if Chroma unavailable
3. **Context**: Retrieved documents are used to provide accurate responses

### Admin Interface
- **Dashboard**: View project statistics and recent runs
- **Vector Store**: Manage document collections and refresh
- **Evaluation**: Create datasets for systematic testing
- **Monitoring**: Links to LangSmith dashboards

## Configuration

### Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key
LANGCHAIN_API_KEY=your_langchain_api_key
LANGCHAIN_PROJECT=My Portfolio Chatbot
```

### Collection Names
The system automatically detects collections in your Chroma database. If you have specific collection names, update the code in `server/langchainChatbotService.ts`.

## Troubleshooting

### Chroma Database Not Found
- Ensure `chroma_db` folder is in the project root
- Check that the folder contains `chroma.sqlite3` and other Chroma files
- Server will show: "Found existing Chroma database at: /path/to/chroma_db"

### LangSmith Logging Issues
- Verify `LANGCHAIN_API_KEY` is set correctly
- Check LangSmith project name matches your configuration
- Warnings about LangSmith logging won't affect chatbot functionality

### Document Retrieval Problems
- System will automatically fall back to database storage
- Check server logs for retrieval method being used
- Verify your Chroma database contains the expected collections

## Advanced Usage

### Custom Collection Names
```typescript
// In server/langchainChatbotService.ts
const collection = await chromaClient.getCollection({
  name: "your_custom_collection_name"
});
```

### Chroma Server Configuration
If you're running Chroma as a server (not file-based), update the client configuration:
```typescript
chromaClient = new ChromaClient({
  host: "your-chroma-host",
  port: 8000,
  ssl: false
});
```

## Benefits

1. **Immediate Access**: No need to re-upload or re-process documents
2. **Semantic Search**: Leverages your existing embeddings for better retrieval
3. **Enterprise Monitoring**: LangSmith provides comprehensive conversation tracking
4. **Evaluation Tools**: Built-in evaluation dataset creation and management
5. **Continuous Improvement**: Systematic approach to chatbot enhancement

## Next Steps

1. Copy your `chroma_db` folder to the project root
2. Restart the application
3. Test the chatbot with questions about your documents
4. Use `/admin/langchain` to monitor and improve the system
5. Create evaluation datasets for systematic testing