import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Send, 
  Bot,
  User,
  MessageSquare,
  Brain,
  Sparkles,
  Upload,
  FileText,
  BarChart3,
  Trash2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TrainingProgress {
  id: number;
  totalQuestions: number;
  documentsCount: number;
  lastTrainingDate: string;
}

interface TrainingDocument {
  id: number;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export default function AdminChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [sessionId] = useState(() => `training-${Date.now()}`);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch training progress
  const { data: progress } = useQuery<TrainingProgress>({
    queryKey: ['/api/admin/chatbot/progress'],
    queryFn: () => apiRequest({ url: '/api/admin/chatbot/progress' }),
  });

  // Fetch training documents
  const { data: documents = [] } = useQuery<TrainingDocument[]>({
    queryKey: ['/api/admin/chatbot/documents'],
    queryFn: () => apiRequest({ url: '/api/admin/chatbot/documents' }),
  });

  // Training conversation mutation
  const trainMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest({
        url: '/api/admin/chatbot/train',
        method: 'POST',
        data: { message, sessionId }
      });
      return response;
    },
    onSuccess: (response) => {
      // Add bot response to messages
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      }]);
      
      // Update training progress
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/progress'] });
    },
    onError: (error) => {
      console.error('Training error:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      }]);
    }
  });

  // Document upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch('/api/admin/chatbot/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      setUploadSuccess(true);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/progress'] });
      
      setTimeout(() => setUploadSuccess(false), 3000);
    },
    onError: (error) => {
      console.error('Upload error:', error);
    }
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      await apiRequest({
        url: `/api/admin/chatbot/documents/${documentId}`,
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/progress'] });
    }
  });

  const handleStartTraining = () => {
    setIsTraining(true);
    // Add initial message from Nack
    setMessages([{
      id: `nack-start-${Date.now()}`,
      role: 'assistant',
      content: "Hi! I'm Nack, your AI assistant. I'm now in TRAINING MODE to learn everything about Nick Lanahan. My goal is to gather 100+ key data points about Nick's professional background, skills, achievements, and personal qualities so I can represent him accurately to recruiters.\n\nLet's start with the basics - what is Nick's current role and company?",
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim() || trainMutation.isPending) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Send to training API
    trainMutation.mutate(currentMessage);
    setCurrentMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-white hover:bg-[#2a2a2a]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-[#007AFF]" />
              <div>
                <h1 className="text-2xl font-bold">Nack Training</h1>
                <p className="text-gray-400">Train your AI assistant about Nick Lanahan</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="border-[#007AFF] text-[#007AFF]">
            {isTraining ? 'Training Active' : 'Ready to Train'}
          </Badge>
        </div>

        {/* Training Progress */}
        <div className="mb-8">
          <Card className="bg-[#2a2a2a] border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-[#007AFF]" />
              <h2 className="text-xl font-semibold">Training Progress</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-[#1a1a1a] rounded-lg">
                <div className="text-3xl font-bold text-[#007AFF]">{progress?.totalQuestions || 0}</div>
                <div className="text-sm text-gray-400">Questions Answered</div>
              </div>
              <div className="text-center p-4 bg-[#1a1a1a] rounded-lg">
                <div className="text-3xl font-bold text-[#34C759]">{progress?.documentsCount || 0}</div>
                <div className="text-sm text-gray-400">Documents Uploaded</div>
              </div>
              <div className="text-center p-4 bg-[#1a1a1a] rounded-lg">
                <div className="text-3xl font-bold text-[#FF9500]">{Math.round(((progress?.totalQuestions || 0) / 100) * 100)}%</div>
                <div className="text-sm text-gray-400">Progress to 100 Points</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress to Goal (100 data points)</span>
                <span>{progress?.totalQuestions || 0}/100</span>
              </div>
              <Progress value={Math.min(((progress?.totalQuestions || 0) / 100) * 100, 100)} className="h-2" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#2a2a2a] border-gray-700">
            <TabsTrigger value="chat" className="data-[state=active]:bg-[#007AFF] data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat Training
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-[#007AFF] data-[state=active]:text-white">
              <Upload className="w-4 h-4 mr-2" />
              Document Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Training Instructions */}
              <div className="lg:col-span-1">
                <Card className="bg-[#2a2a2a] border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-[#007AFF]" />
                    <h2 className="text-xl font-semibold">How Training Works</h2>
                  </div>
                  <div className="space-y-4 text-gray-300">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center text-xs font-bold text-white">1</div>
                      <div>
                        <h3 className="font-medium text-white">Start Training</h3>
                        <p className="text-sm">Click "Ready to Train" to begin the conversation with Nack</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center text-xs font-bold text-white">2</div>
                      <div>
                        <h3 className="font-medium text-white">Answer Questions</h3>
                        <p className="text-sm">Nack will ask specific questions about Nick's background, skills, and experience</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center text-xs font-bold text-white">3</div>
                      <div>
                        <h3 className="font-medium text-white">Build Knowledge</h3>
                        <p className="text-sm">Each response helps Nack learn to better represent Nick to recruiters</p>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="mt-6 bg-[#1a1a1a] border-[#007AFF]">
                    <MessageSquare className="w-4 h-4 text-[#007AFF]" />
                    <AlertDescription className="text-gray-300">
                      <strong className="text-white">Goal:</strong> Gather 100+ key data points about Nick's professional background, achievements, and personal qualities.
                    </AlertDescription>
                  </Alert>
                </Card>
              </div>

              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="bg-[#2a2a2a] border-gray-700 h-[600px] flex flex-col">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-gray-700">
                    <Bot className="w-6 h-6 text-[#007AFF]" />
                    <div>
                      <h3 className="font-semibold">Nack AI Assistant</h3>
                      <p className="text-sm text-gray-400">Training Mode - Learning about Nick Lanahan</p>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
                    {!isTraining ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <Bot className="w-16 h-16 text-gray-600" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-300">Ready to Train Nack</h3>
                          <p className="text-gray-500 mt-2">Click the button below to start training your AI assistant</p>
                        </div>
                        <Button 
                          onClick={handleStartTraining}
                          className="bg-[#007AFF] hover:bg-[#0056CC] text-white"
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Ready to Train
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                message.role === 'user' 
                                  ? 'bg-[#007AFF] text-white' 
                                  : 'bg-gray-700 text-gray-300'
                              }`}>
                                {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                              </div>
                              <div className={`rounded-lg p-3 ${
                                message.role === 'user' 
                                  ? 'bg-[#007AFF] text-white' 
                                  : 'bg-[#1a1a1a] text-gray-200'
                              }`}>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                                }`}>
                                  {formatTime(message.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {trainMutation.isPending && (
                          <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center">
                              <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-[#1a1a1a] rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#007AFF] rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-[#007AFF] rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-2 bg-[#007AFF] rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                <span className="text-gray-400 text-sm ml-2">Nack is thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input Area */}
                  {isTraining && (
                    <div className="p-4 border-t border-gray-700">
                      <div className="flex gap-2">
                        <Input
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your response to Nack..."
                          className="flex-1 bg-[#1a1a1a] border-gray-600 text-white placeholder-gray-400"
                          disabled={trainMutation.isPending}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!currentMessage.trim() || trainMutation.isPending}
                          className="bg-[#007AFF] hover:bg-[#0056CC] text-white"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Press Enter to send, Shift+Enter for new line
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document Upload */}
              <Card className="bg-[#2a2a2a] border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Upload className="w-6 h-6 text-[#007AFF]" />
                  <h2 className="text-xl font-semibold">Upload Documents</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-300 mb-4">
                      Upload documents to help train Nack about Nick's background
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.md"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-[#007AFF] hover:bg-[#0056CC] text-white px-4 py-2 rounded-lg inline-block transition-colors"
                    >
                      Choose File
                    </label>
                  </div>

                  {selectedFile && (
                    <div className="bg-[#1a1a1a] p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{selectedFile.name}</p>
                          <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <Button
                          onClick={handleUpload}
                          disabled={uploadMutation.isPending}
                          className="bg-[#34C759] hover:bg-[#2A9D4A] text-white"
                        >
                          {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {uploadSuccess && (
                    <Alert className="bg-[#1a1a1a] border-[#34C759]">
                      <AlertDescription className="text-green-400">
                        Document uploaded successfully! Nack now has access to this information.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </Card>

              {/* Document List */}
              <Card className="bg-[#2a2a2a] border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-[#007AFF]" />
                  <h2 className="text-xl font-semibold">Training Documents</h2>
                </div>
                
                <ScrollArea className="h-[400px]">
                  {documents.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className="bg-[#1a1a1a] p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">{doc.originalName}</p>
                              <p className="text-sm text-gray-400">
                                {formatFileSize(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              onClick={() => deleteMutation.mutate(doc.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}