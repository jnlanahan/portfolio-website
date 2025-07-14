import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, X, Send, Loader2, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
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
  const [conversationId] = useState(() => Date.now()); // Simple numeric ID for conversation
  const [customFeedbackDialog, setCustomFeedbackDialog] = useState<{
    isOpen: boolean;
    messageId: string;
    rating: 'positive' | 'negative' | null;
  }>({
    isOpen: false,
    messageId: '',
    rating: null,
  });
  const [customFeedbackText, setCustomFeedbackText] = useState('');
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
        text: "👋 Hi! I'm Nick's dedicated AI assistant with comprehensive training on his entire professional background. I know his skills, experience, projects, achievements, and career journey inside and out. Ask me anything about Nick - from technical expertise to leadership experience!",
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
        conversationId
      });

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: response.response,
        sender: 'bot',
        timestamp: new Date(),
        isOnTopic: true, // LangChain responses are always on-topic
        confidence: 1.0, // LangChain provides high-quality responses
        conversationId: conversationId
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

  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative', comment?: string) => {
    try {
      // Find the message to get conversation ID
      const message = messages.find(m => m.id === messageId);
      console.log('=== FEEDBACK DEBUG ===');
      console.log('messageId:', messageId);
      console.log('feedback:', feedback);
      console.log('message found:', message);
      console.log('message.conversationId:', message?.conversationId);
      console.log('messages array:', messages);
      
      if (!message) {
        console.error('Message not found with ID:', messageId);
        alert('Error: Message not found');
        return;
      }

      if (!message.conversationId) {
        console.error('Message found but no conversationId:', message);
        alert('Error: No conversation ID found for this message');
        return;
      }

      console.log('Submitting feedback:', {
        conversationId: message.conversationId,
        sessionId: sessionId,
        rating: feedback === 'positive' ? 'thumbs_up' : 'thumbs_down',
        comment
      });

      const response = await fetch('/api/chatbot/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: message.conversationId,
          sessionId: sessionId,
          rating: feedback === 'positive' ? 'thumbs_up' : 'thumbs_down',
          comment: comment || null,
          userAgent: navigator.userAgent,
          ipAddress: null
        })
      }).then(res => res.json());

      console.log('Feedback submitted successfully:', response);
      console.log('About to update message state with feedback:', feedback);

      // Update the message with feedback
      setMessages(prev => {
        const updated = prev.map(m => 
          m.id === messageId 
            ? { ...m, feedback } 
            : m
        );
        console.log('Updated messages:', updated);
        return updated;
      });

      alert('Feedback submitted successfully! Thank you for your input.');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback: ' + error.message);
    }
  };

  const handleCustomFeedbackSubmit = async () => {
    console.log('=== CUSTOM FEEDBACK SUBMIT ===');
    console.log('customFeedbackDialog:', customFeedbackDialog);
    console.log('customFeedbackText:', customFeedbackText);
    
    if (!customFeedbackDialog.messageId || !customFeedbackDialog.rating) {
      console.log('Missing required data - messageId:', customFeedbackDialog.messageId, 'rating:', customFeedbackDialog.rating);
      return;
    }
    
    await handleFeedback(
      customFeedbackDialog.messageId, 
      customFeedbackDialog.rating, 
      customFeedbackText.trim() || undefined
    );
    
    // Close dialog and reset state
    setCustomFeedbackDialog({ isOpen: false, messageId: '', rating: null });
    setCustomFeedbackText('');
  };

  const openCustomFeedbackDialog = (messageId: string, rating: 'positive' | 'negative') => {
    setCustomFeedbackDialog({ isOpen: true, messageId, rating });
    setCustomFeedbackText('');
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <div className="relative">
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 h-14 w-14 rounded-full bg-blue-400 animate-ping opacity-75"></div>
            <div className="absolute inset-0 h-14 w-14 rounded-full bg-blue-500 animate-pulse opacity-50"></div>
            
            {/* Main button */}
            <Button
              onClick={() => setIsOpen(true)}
              className="relative h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-2 border-white/20"
              aria-label="Chat with Nick's AI - Trained specifically on his background & experience"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            
            {/* Floating tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              💬 Ask me about Nick!
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 h-[500px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] transition-opacity duration-300 ${customFeedbackDialog.isOpen ? 'opacity-50' : 'opacity-100'}`} style={{ zIndex: customFeedbackDialog.isOpen ? 9000 : 9999 }}>
          <Card className="h-full bg-white border-2 border-gray-200 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <MessageCircle className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">🧠 Nick's AI Assistant</h3>
                  <p className="text-xs text-blue-100">Trained exclusively on Nick's experience & skills</p>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 h-8 w-8 p-0"
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
                        ? 'bg-slate-600 text-white'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span className={`text-xs ${message.sender === 'user' ? 'text-slate-200' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </span>
                      <div className="flex items-center gap-2">
                        {message.sender === 'bot' && message.isOnTopic === false && (
                          <Badge variant="secondary" className="text-xs">
                            Off-topic
                          </Badge>
                        )}
                        {message.sender === 'bot' && message.id !== 'welcome' && (
                          <div className="flex items-center gap-1 relative z-10">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (message.feedback) return;
                                openCustomFeedbackDialog(message.id, 'positive');
                              }}
                              className={`px-2 py-1 text-xs rounded border-2 transition-all duration-200 hover:scale-105 ${message.feedback ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 cursor-pointer'}`}
                              title="Provide feedback on this response"
                              style={{ zIndex: 1000, position: 'relative', pointerEvents: 'auto' }}
                              type="button"
                            >
                              {message.feedback ? 'Feedback Given' : 'Give Feedback'}
                            </button>
                            <Dialog open={customFeedbackDialog.isOpen} onOpenChange={(open) => {
                              if (!open) {
                                setCustomFeedbackDialog({ isOpen: false, messageId: '', rating: null });
                                setCustomFeedbackText('');
                              }
                            }}>
                              <DialogContent className="sm:max-w-[425px]" style={{ zIndex: 10000 }}>
                                <DialogHeader>
                                  <DialogTitle>Provide Detailed Feedback</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="feedback-type">Rate this response:</Label>
                                    <div className="flex gap-2 mt-2">
                                      <Button
                                        variant={customFeedbackDialog.rating === 'positive' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setCustomFeedbackDialog(prev => ({ ...prev, rating: 'positive' }))}
                                        className="flex items-center gap-1"
                                      >
                                        <ThumbsUp className="h-3 w-3" />
                                        Helpful
                                      </Button>
                                      <Button
                                        variant={customFeedbackDialog.rating === 'negative' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setCustomFeedbackDialog(prev => ({ ...prev, rating: 'negative' }))}
                                        className="flex items-center gap-1"
                                      >
                                        <ThumbsDown className="h-3 w-3" />
                                        Not Helpful
                                      </Button>
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="feedback-comment">What did you think about this response? (Optional)</Label>
                                    <Textarea
                                      id="feedback-comment"
                                      placeholder="Please share your thoughts on how this response could be improved..."
                                      value={customFeedbackText}
                                      onChange={(e) => setCustomFeedbackText(e.target.value)}
                                      rows={3}
                                      className="mt-2"
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setCustomFeedbackDialog({ isOpen: false, messageId: '', rating: null })}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleCustomFeedbackSubmit();
                                      }}
                                      disabled={false}
                                      className={!customFeedbackDialog.rating ? 'opacity-50' : ''}
                                      type="button"
                                    >
                                      Submit Feedback
                                    </Button>

                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
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
                  className="flex-1 bg-white border-gray-300 text-gray-800 placeholder:text-gray-500 focus:border-slate-400 focus:ring-slate-400"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 <strong>I know Nick extensively</strong> - trained on his complete professional background, skills, and experience.
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}