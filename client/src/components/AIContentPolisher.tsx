import React, { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Sparkles, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Target,
  BookOpen,
  TrendingUp,
  Brain,
  Wand2
} from 'lucide-react';

interface PolishSuggestion {
  type: 'grammar' | 'clarity' | 'style' | 'tone' | 'structure' | 'engagement';
  original: string;
  improved: string;
  explanation: string;
  confidence: number;
}

interface PolishResponse {
  suggestions: PolishSuggestion[];
  overallScore: number;
  summary: string;
  wordCount: number;
  readabilityScore: number;
}

interface AIContentPolisherProps {
  content: string;
  onContentChange: (content: string) => void;
  contentType?: 'blog' | 'excerpt' | 'title';
  className?: string;
}

const suggestionTypeIcons = {
  grammar: CheckCircle,
  clarity: Lightbulb,
  style: Sparkles,
  tone: Target,
  structure: BookOpen,
  engagement: TrendingUp
};

const suggestionTypeColors = {
  grammar: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  clarity: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  style: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  tone: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  structure: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  engagement: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
};

export default function AIContentPolisher({ 
  content, 
  onContentChange, 
  contentType = 'blog',
  className = '' 
}: AIContentPolisherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [polishResult, setPolishResult] = useState<PolishResponse | null>(null);
  const [quickTips, setQuickTips] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [improvedText, setImprovedText] = useState('');
  const { toast } = useToast();

  // Polish content mutation
  const polishMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest('/api/admin/polish-content', 'POST', {
        content: text,
        contentType
      });
    },
    onSuccess: (data) => {
      setPolishResult(data);
      toast({
        title: "Content analysis complete",
        description: `Found ${data.suggestions.length} suggestions to improve your content`,
      });
    },
    onError: (error) => {
      console.error('Polish error:', error);
      toast({
        title: "Analysis failed",
        description: "Unable to analyze content. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Quick suggestions mutation
  const quickSuggestionsMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest('/api/admin/quick-suggestions', 'POST', {
        content: text
      });
    },
    onSuccess: (data) => {
      setQuickTips(data.suggestions || []);
    },
    onError: (error) => {
      console.error('Quick suggestions error:', error);
    },
  });

  // Improve selection mutation
  const improveSelectionMutation = useMutation({
    mutationFn: async ({ selectedText, context }: { selectedText: string; context: string }) => {
      return apiRequest('/api/admin/improve-selection', 'POST', {
        selectedText,
        context
      });
    },
    onSuccess: (data) => {
      setImprovedText(data.improved);
    },
    onError: (error) => {
      console.error('Improve selection error:', error);
      toast({
        title: "Improvement failed",
        description: "Unable to improve the selected text. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-fetch quick suggestions when content changes
  useEffect(() => {
    if (content && content.length > 50) {
      const timeoutId = setTimeout(() => {
        quickSuggestionsMutation.mutate(content);
      }, 2000); // Debounce for 2 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [content]);

  const handlePolishContent = useCallback(() => {
    if (!content.trim()) {
      toast({
        title: "No content to analyze",
        description: "Please add some content before running the polisher.",
        variant: "destructive",
      });
      return;
    }
    polishMutation.mutate(content);
    setIsOpen(true);
  }, [content, polishMutation, toast]);

  const handleApplySuggestion = useCallback((suggestion: PolishSuggestion) => {
    const updatedContent = content.replace(suggestion.original, suggestion.improved);
    onContentChange(updatedContent);
    
    toast({
      title: "Suggestion applied",
      description: "Content has been updated with the improvement",
    });
  }, [content, onContentChange, toast]);

  const handleImproveSelection = useCallback(() => {
    if (!selectedText.trim()) {
      toast({
        title: "No text selected",
        description: "Please select some text to improve.",
        variant: "destructive",
      });
      return;
    }
    improveSelectionMutation.mutate({ 
      selectedText, 
      context: content.substring(0, 500) 
    });
  }, [selectedText, content, improveSelectionMutation, toast]);

  const handleApplyImprovedText = useCallback(() => {
    if (improvedText && selectedText) {
      const updatedContent = content.replace(selectedText, improvedText);
      onContentChange(updatedContent);
      setSelectedText('');
      setImprovedText('');
      
      toast({
        title: "Text improved",
        description: "Selected text has been replaced with the improved version",
      });
    }
  }, [content, selectedText, improvedText, onContentChange, toast]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Tips Bar */}
      {quickTips.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                  Quick Writing Tips
                </h4>
                <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
                  {quickTips.slice(0, 3).map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-500 dark:text-purple-400">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Polisher Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handlePolishContent}
              disabled={polishMutation.isPending}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Wand2 className="h-4 w-4" />
              {polishMutation.isPending ? "Analyzing..." : "Polish Content"}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI Content Analysis
              </DialogTitle>
            </DialogHeader>

            {polishResult && (
              <div className="space-y-6">
                {/* Overall Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(polishResult.overallScore)}`}>
                        {polishResult.overallScore}/100
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Overall Score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(polishResult.readabilityScore)}`}>
                        {polishResult.readabilityScore}/100
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Readability</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {polishResult.wordCount}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Words</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary */}
                <Card>
                  <CardContent className="p-4">
                    <p className="text-gray-700 dark:text-gray-300">{polishResult.summary}</p>
                  </CardContent>
                </Card>

                {/* Suggestions */}
                {polishResult.suggestions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Improvement Suggestions</h3>
                    {polishResult.suggestions.map((suggestion, index) => {
                      const IconComponent = suggestionTypeIcons[suggestion.type];
                      return (
                        <Card key={index} className="border-l-4 border-l-purple-500">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4" />
                                  <Badge className={suggestionTypeColors[suggestion.type]}>
                                    {suggestion.type}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {Math.round(suggestion.confidence * 100)}% confidence
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleApplySuggestion(suggestion)}
                                  className="flex items-center gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Apply
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Original:
                                  </p>
                                  <p className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded border-l-2 border-red-300">
                                    {suggestion.original}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Improved:
                                  </p>
                                  <p className="text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded border-l-2 border-green-300">
                                    {suggestion.improved}
                                  </p>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                {suggestion.explanation}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Text Selection Improver */}
        <div className="flex items-center gap-2">
          <Textarea
            placeholder="Paste text to improve..."
            value={selectedText}
            onChange={(e) => setSelectedText(e.target.value)}
            className="h-10 resize-none"
            rows={1}
          />
          <Button
            onClick={handleImproveSelection}
            disabled={improveSelectionMutation.isPending}
            size="sm"
            variant="outline"
          >
            <Zap className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Improved Text Preview */}
      {improvedText && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                  Improved Version:
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {improvedText}
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleApplyImprovedText}
                className="flex items-center gap-1"
              >
                <CheckCircle className="h-3 w-3" />
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}