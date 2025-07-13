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
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
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

      const response = await apiRequest('/api/chatbot/feedback', {
        method: 'POST',
        body: {
          conversationId: message.conversationId,
          sessionId: sessionId,
          rating: feedback === 'positive' ? 'thumbs_up' : 'thumbs_down',
          comment: comment || null,
          userAgent: navigator.userAgent,
          ipAddress: null
        }
      });

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
    if (!customFeedbackDialog.messageId || !customFeedbackDialog.rating) return;
    
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
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-slate-600 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            aria-label="Open chat with Nick's AI assistant"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]" style={{ zIndex: 9999 }}>
          <Card className="h-full bg-white border-2 border-gray-200 shadow-2xl flex flex-col" style={{ zIndex: 9999 }}>
            {/* Header */}
            <div className="bg-slate-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold text-sm">Nick's AI Assistant</h3>
                  <p className="text-xs text-slate-200">Ask me about Nick's background!</p>
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
                                if (message.feedback !== null) return; // Don't allow clicking if feedback already given
                                console.log('=== THUMBS UP CLICKED ===');
                                console.log('Button clicked for message:', message.id);
                                console.log('Message object:', message);
                                console.log('ConversationId:', message.conversationId);
                                console.log('Feedback status:', message.feedback);
                                handleFeedback(message.id, 'positive');
                              }}
                              className={`h-8 w-8 p-1 rounded border-2 transition-all duration-200 hover:scale-110 ${message.feedback === 'positive' ? 'bg-green-100 text-green-700 border-green-300' : message.feedback !== null ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-300 hover:bg-green-50 hover:text-green-600 hover:border-green-300 cursor-pointer'}`}
                              title="Rate this response as helpful"
                              style={{ zIndex: 1000, position: 'relative' }}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (message.feedback !== null) return; // Don't allow clicking if feedback already given
                                console.log('=== THUMBS DOWN CLICKED ===');
                                console.log('Button clicked for message:', message.id);
                                console.log('Message object:', message);
                                console.log('ConversationId:', message.conversationId);
                                console.log('Feedback status:', message.feedback);
                                handleFeedback(message.id, 'negative');
                              }}
                              className={`h-8 w-8 p-1 rounded border-2 transition-all duration-200 hover:scale-110 ${message.feedback === 'negative' ? 'bg-red-100 text-red-700 border-red-300' : message.feedback !== null ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 cursor-pointer'}`}
                              title="Rate this response as not helpful"
                              style={{ zIndex: 1000, position: 'relative' }}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <button
                                  onClick={() => {
                                    if (message.feedback !== null) return; // Don't allow clicking if feedback already given
                                    openCustomFeedbackDialog(message.id, 'positive');
                                  }}
                                  className={`h-8 w-8 p-1 rounded border-2 transition-all duration-200 hover:scale-110 ${message.feedback !== null ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 cursor-pointer'}`}
                                  title="Provide detailed feedback"
                                  style={{ zIndex: 1000, position: 'relative' }}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
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
                                      onClick={handleCustomFeedbackSubmit}
                                      disabled={!customFeedbackDialog.rating}
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
                  className="flex-1"
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
                I'm trained specifically on Nick's professional background and experience.
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}