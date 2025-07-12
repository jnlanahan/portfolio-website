import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isOnTopic?: boolean;
  confidence?: number;
  conversationId?: number;
  feedback?: 'positive' | 'negative' | null;
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add initial welcome message when opened for the first time
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: "Hi! I'm Nick's AI assistant, trained specifically on his professional background and experience. I can answer questions about his skills, career, projects, and qualifications. What would you like to know about Nick?",
        sender: 'bot',
        timestamp: new Date(),
        isOnTopic: true,
        confidence: 1.0
      }]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiRequest('/api/chatbot/chat', 'POST', {
        message: inputValue,
        sessionId
      });

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: response.response,
        sender: 'bot',
        timestamp: new Date(),
        isOnTopic: response.isOnTopic,
        confidence: response.confidence,
        conversationId: response.conversationId
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
        isOnTopic: false,
        confidence: 0
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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

  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    try {
      // Find the message to get conversation ID
      const message = messages.find(m => m.id === messageId);
      if (!message || !message.conversationId) {
        console.error('Message or conversation ID not found');
        return;
      }

      await apiRequest('/api/chatbot/feedback', 'POST', {
        conversationId: message.conversationId,
        sessionId: sessionId,
        rating: feedback === 'positive' ? 'thumbs_up' : 'thumbs_down'
      });

      // Update the message with feedback
      setMessages(prev => 
        prev.map(m => 
          m.id === messageId 
            ? { ...m, feedback } 
            : m
        )
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            aria-label="Open chat with Nick's AI assistant"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]">
          <Card className="h-full bg-white border-2 border-gray-200 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold text-sm">Nick's AI Assistant</h3>
                  <p className="text-xs text-blue-100">Ask me about Nick's background!</p>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-700 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span className={`text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </span>
                      <div className="flex items-center gap-2">
                        {message.sender === 'bot' && message.isOnTopic === false && (
                          <Badge variant="secondary" className="text-xs">
                            Off-topic
                          </Badge>
                        )}
                        {message.sender === 'bot' && message.id !== 'welcome' && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFeedback(message.id, 'positive');
                              }}
                              className={`h-6 w-6 p-0 ${message.feedback === 'positive' ? 'bg-green-100 text-green-700' : 'hover:bg-green-50 text-gray-500'}`}
                              disabled={message.feedback !== null}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFeedback(message.id, 'negative');
                              }}
                              className={`h-6 w-6 p-0 ${message.feedback === 'negative' ? 'bg-red-100 text-red-700' : 'hover:bg-red-50 text-gray-500'}`}
                              disabled={message.feedback !== null}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about Nick's experience..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                I'm trained specifically on Nick's professional background and experience.
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}