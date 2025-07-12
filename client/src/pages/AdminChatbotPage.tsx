import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Send, 
  Bot,
  User,
  MessageSquare,
  Brain,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AdminChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [sessionId] = useState(() => `training-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

        {/* Main Content */}
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
      </div>
    </div>
  );
}