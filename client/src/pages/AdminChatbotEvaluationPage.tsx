import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, TrendingUp, ThumbsUp, ThumbsDown, BarChart3, MessageSquare, CheckCircle, XCircle, Brain, Target, Lightbulb, Shield, Trash2, ToggleLeft, ToggleRight, Clock, Activity, Edit, Check } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';

interface ChatbotEvaluation {
  id: number;
  conversationId: number;
  accuracyScore: number;
  helpfulnessScore: number;
  relevanceScore: number;
  clarityScore: number;
  overallScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  evaluatedAt: string;
  conversation?: {
    userQuestion: string;
    aiResponse: string;
    sessionId: string;
    createdAt: string;
  } | null;
}

interface UserFeedback {
  id: number;
  conversationId: number;
  sessionId: string;
  rating: 'thumbs_up' | 'thumbs_down';
  comment: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface ChatbotConversation {
  id: number;
  sessionId: string;
  userQuestion: string;
  botResponse: string;
  createdAt: string;
}

interface EvaluationStats {
  totalEvaluations: number;
  averageOverallScore: number;
  averageAccuracyScore: number;
  averageHelpfulnessScore: number;
  averageRelevanceScore: number;
  averageClarityScore: number;
  recentTrends: {
    lastWeek: number;
    lastMonth: number;
  };
}

interface LearningInsight {
  id: number;
  category: 'improvement' | 'best_practice' | 'avoid_pattern';
  insight: string;
  examples: string[];
  sourceEvaluationId: number;
  importance: number;
  isActive: boolean;
  createdAt: string;
}

interface LearningStats {
  totalInsights: number;
  bestPractices: number;
  improvements: number;
  avoidPatterns: number;
  avgImportance: number;
  recentInsights: LearningInsight[];
}

// PromptDiffPreview Component
function PromptDiffPreview({ onPromptChange }: { onPromptChange: (prompt: string) => void }) {
  const [editMode, setEditMode] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');
  
  const { data: currentPrompt, isLoading: currentLoading } = useQuery({
    queryKey: ['/api/admin/chatbot/learning/system-prompt'],
  });

  const { data: previewData, isLoading: previewLoading } = useQuery({
    queryKey: ['/api/admin/chatbot/learning/prompt-preview'],
    enabled: !!currentPrompt,
  });

  useEffect(() => {
    if (previewData?.prompt) {
      setEditedPrompt(previewData.prompt);
      onPromptChange(previewData.prompt);
    }
  }, [previewData, onPromptChange]);

  if (currentLoading || previewLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-400">Loading preview...</p>
      </div>
    );
  }

  const currentLines = currentPrompt?.prompt?.split('\n') || [];
  const displayPrompt = editMode ? editedPrompt : (previewData?.prompt || '');
  const newLines = displayPrompt.split('\n');
  
  // Simple diff implementation
  const changes = [];
  const maxLength = Math.max(currentLines.length, newLines.length);
  
  for (let i = 0; i < maxLength; i++) {
    const currentLine = currentLines[i];
    const newLine = newLines[i];
    
    if (currentLine === undefined && newLine !== undefined) {
      // Added line
      changes.push({ type: 'added', line: newLine, index: i });
    } else if (currentLine !== undefined && newLine === undefined) {
      // Deleted line
      changes.push({ type: 'deleted', line: currentLine, index: i });
    } else if (currentLine !== newLine) {
      // Modified line
      if (currentLine) changes.push({ type: 'deleted', line: currentLine, index: i });
      if (newLine) changes.push({ type: 'added', line: newLine, index: i });
    } else {
      // Unchanged line
      changes.push({ type: 'unchanged', line: currentLine, index: i });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-gray-400">Added</span>
          </span>
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-gray-400">Deleted</span>
          </span>
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span className="text-gray-400">Unchanged</span>
          </span>
        </div>
        <Button
          size="sm"
          variant={editMode ? "default" : "outline"}
          onClick={() => setEditMode(!editMode)}
          className={editMode ? "bg-blue-600 hover:bg-blue-700" : "text-gray-300 border-gray-600 hover:bg-gray-700"}
        >
          {editMode ? <Check className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
          {editMode ? "Done Editing" : "Edit Prompt"}
        </Button>
      </div>

      {editMode ? (
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Edit System Prompt:</label>
          <textarea
            value={editedPrompt}
            onChange={(e) => {
              setEditedPrompt(e.target.value);
              onPromptChange(e.target.value);
            }}
            className="w-full h-96 bg-gray-900 text-gray-300 p-4 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none font-mono text-xs"
            placeholder="Enter system prompt..."
          />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-xs">
            {changes.map((change, idx) => (
              <div
                key={idx}
                className={`${
                  change.type === 'added' ? 'bg-green-900 bg-opacity-30 text-green-400' :
                  change.type === 'deleted' ? 'bg-red-900 bg-opacity-30 text-red-400 line-through' :
                  'text-gray-500'
                }`}
              >
                <span className="select-none mr-2 text-gray-600">
                  {change.type === 'added' ? '+' : change.type === 'deleted' ? '-' : ' '}
                </span>
                {change.line || ' '}
              </div>
            ))}
          </pre>
        </div>
      )}

      <div className="text-sm text-gray-400">
        <p>📌 Review the changes carefully before applying them.</p>
        <p>📌 You can edit the prompt directly by clicking "Edit Prompt".</p>
        <p>📌 The chatbot will use this updated prompt for all future conversations.</p>
      </div>
    </div>
  );
}

export default function AdminChatbotEvaluationPage() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'evaluations' | 'learning'>('overview');
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [suggestedPrompt, setSuggestedPrompt] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [manualEditPrompt, setManualEditPrompt] = useState('');
  const queryClient = useQueryClient();

  const { data: evaluations, isLoading: evaluationsLoading } = useQuery({
    queryKey: ['/api/admin/chatbot/evaluations/detailed'],
    queryFn: () => apiRequest('/api/admin/chatbot/evaluations/detailed', 'GET') as Promise<ChatbotEvaluation[]>
  });

  const { data: feedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ['/api/admin/chatbot/feedback'],
    queryFn: () => apiRequest('/api/admin/chatbot/feedback', 'GET') as Promise<UserFeedback[]>
  });

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/admin/chatbot/conversations'],
    queryFn: () => apiRequest('/api/admin/chatbot/conversations', 'GET') as Promise<ChatbotConversation[]>
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/chatbot/evaluations/stats'],
    queryFn: () => apiRequest('/api/admin/chatbot/evaluations/stats', 'GET') as Promise<EvaluationStats>
  });

  const { data: learningInsights, isLoading: learningInsightsLoading } = useQuery({
    queryKey: ['/api/admin/chatbot/learning/insights'],
    queryFn: () => apiRequest('/api/admin/chatbot/learning/insights', 'GET') as Promise<LearningInsight[]>
  });

  const { data: learningStats, isLoading: learningStatsLoading } = useQuery({
    queryKey: ['/api/admin/chatbot/learning/stats'],
    queryFn: () => apiRequest('/api/admin/chatbot/learning/stats', 'GET') as Promise<LearningStats>
  });

  const { data: systemPromptData, isLoading: systemPromptLoading } = useQuery({
    queryKey: ['/api/admin/chatbot/learning/system-prompt'],
    queryFn: () => apiRequest('/api/admin/chatbot/learning/system-prompt', 'GET') as Promise<{ prompt: string; stats: any }>,
    enabled: selectedTab === 'learning'
  });

  const evaluateConversationMutation = useMutation({
    mutationFn: (conversationId: number) => 
      apiRequest(`/api/admin/chatbot/evaluations/evaluate/${conversationId}`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/evaluations/detailed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/evaluations/stats'] });
    }
  });

  const batchEvaluateMutation = useMutation({
    mutationFn: (conversationIds: number[]) => 
      apiRequest('/api/admin/chatbot/evaluations/batch', 'POST', { conversationIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/evaluations/detailed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/evaluations/stats'] });
    }
  });

  const processRecentEvaluationsMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/chatbot/learning/process-recent', 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/learning/insights'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/learning/stats'] });
    }
  });

  const updateSystemPromptMutation = useMutation({
    mutationFn: (customPrompt?: string) => 
      apiRequest('/api/admin/chatbot/learning/update-prompt', 'POST', { customPrompt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/learning/system-prompt'] });
    }
  });

  const processFeedbackMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/chatbot/knowledge/process-all-feedback', 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/learning/insights'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/learning/stats'] });
    }
  });

  const deduplicateInsightsMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/chatbot/knowledge/deduplicate', 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/learning/insights'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/learning/stats'] });
    }
  });

  const toggleInsightMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => 
      apiRequest(`/api/admin/chatbot/learning/insights/${id}`, 'PATCH', { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/learning/insights'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/learning/stats'] });
    }
  });

  const deleteInsightMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/chatbot/learning/insights/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/learning/insights'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/learning/stats'] });
    }
  });

  const generateSuggestionMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/chatbot/learning/generate-suggestion', 'POST'),
    onSuccess: (suggestion) => {
      setSuggestedPrompt(suggestion.prompt);
      setShowApprovalDialog(true);
    }
  });

  const approveSuggestionMutation = useMutation({
    mutationFn: (approved: boolean) => {
      if (approved) {
        return apiRequest('/api/admin/chatbot/learning/update-prompt', 'POST', { customPrompt: suggestedPrompt });
      }
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/learning/system-prompt'] });
      setShowApprovalDialog(false);
      setSuggestedPrompt('');
    }
  });

  const handleEvaluateConversation = (conversationId: number) => {
    evaluateConversationMutation.mutate(conversationId);
  };

  const handleBatchEvaluate = () => {
    if (!conversations) return;
    
    const evaluatedConversationIds = new Set(evaluations?.map(e => e.conversationId) || []);
    const unevaluatedConversations = conversations.filter(c => !evaluatedConversationIds.has(c.id));
    const conversationIds = unevaluatedConversations.slice(0, 10).map(c => c.id);
    
    if (conversationIds.length > 0) {
      batchEvaluateMutation.mutate(conversationIds);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 4) return 'bg-green-100 text-green-800';
    if (score >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const positiveFeedback = feedback?.filter(f => f.rating === 'thumbs_up').length || 0;
  const negativeFeedback = feedback?.filter(f => f.rating === 'thumbs_down').length || 0;
  const totalFeedback = positiveFeedback + negativeFeedback;
  const feedbackRatio = totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 0;

  const evaluatedConversationIds = new Set(evaluations?.map(e => e.conversationId) || []);
  const unevaluatedConversations = conversations?.filter(c => !evaluatedConversationIds.has(c.id)) || [];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block">
              ← Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Chatbot Evaluation Dashboard</h1>
            <p className="text-gray-400 mt-1">Monitor and analyze chatbot performance</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleBatchEvaluate}
              disabled={batchEvaluateMutation.isPending || unevaluatedConversations.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {batchEvaluateMutation.isPending ? 'Evaluating...' : `Evaluate ${Math.min(unevaluatedConversations.length, 10)} Conversations`}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'evaluations', label: 'Evaluations', icon: MessageSquare },
            { id: 'learning', label: 'Learning & Feedback', icon: Brain }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 ${
                selectedTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Total Evaluations</h3>
                    <p className="text-2xl font-bold text-blue-400">{stats?.totalEvaluations || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Average Score</h3>
                    <p className={`text-2xl font-bold ${getScoreColor(stats?.averageOverallScore || 0)}`}>
                      {stats?.averageOverallScore?.toFixed(1) || '0.0'}/5
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <ThumbsUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Positive Feedback</h3>
                    <p className="text-2xl font-bold text-green-400">{feedbackRatio.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Score Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Accuracy', value: stats?.averageAccuracyScore || 0 },
                  { label: 'Helpfulness', value: stats?.averageHelpfulnessScore || 0 },
                  { label: 'Relevance', value: stats?.averageRelevanceScore || 0 },
                  { label: 'Clarity', value: stats?.averageClarityScore || 0 }
                ].map(metric => (
                  <div key={metric.label} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <span className={`text-sm font-bold ${getScoreColor(metric.value)}`}>
                        {metric.value.toFixed(1)}/5
                      </span>
                    </div>
                    <Progress value={(metric.value / 5) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Trends */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Week Average</span>
                    <span className={`text-sm font-bold ${getScoreColor(stats?.recentTrends.lastWeek || 0)}`}>
                      {stats?.recentTrends.lastWeek?.toFixed(1) || '0.0'}/5
                    </span>
                  </div>
                  <Progress value={((stats?.recentTrends.lastWeek || 0) / 5) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Month Average</span>
                    <span className={`text-sm font-bold ${getScoreColor(stats?.recentTrends.lastMonth || 0)}`}>
                      {stats?.recentTrends.lastMonth?.toFixed(1) || '0.0'}/5
                    </span>
                  </div>
                  <Progress value={((stats?.recentTrends.lastMonth || 0) / 5) * 100} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Evaluations Tab */}
        {selectedTab === 'evaluations' && (
          <div className="space-y-6">
            {evaluationsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-400">Loading evaluations...</p>
              </div>
            ) : evaluations && evaluations.length > 0 ? (
              <div className="grid gap-6">
                {evaluations.map(evaluation => (
                  <div key={evaluation.id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          Conversation #{evaluation.conversationId}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Evaluated {formatDistanceToNow(new Date(evaluation.evaluatedAt))} ago
                        </p>
                      </div>
                      <Badge className={`${getScoreBadgeColor(evaluation.overallScore)}`}>
                        {evaluation.overallScore.toFixed(1)}/5
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Accuracy</p>
                        <p className={`font-bold ${getScoreColor(evaluation.accuracyScore)}`}>
                          {evaluation.accuracyScore.toFixed(1)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Helpfulness</p>
                        <p className={`font-bold ${getScoreColor(evaluation.helpfulnessScore)}`}>
                          {evaluation.helpfulnessScore.toFixed(1)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Relevance</p>
                        <p className={`font-bold ${getScoreColor(evaluation.relevanceScore)}`}>
                          {evaluation.relevanceScore.toFixed(1)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Clarity</p>
                        <p className={`font-bold ${getScoreColor(evaluation.clarityScore)}`}>
                          {evaluation.clarityScore.toFixed(1)}
                        </p>
                      </div>
                    </div>

                    {/* Conversation Details */}
                    {evaluation.conversation && (
                      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                        <h4 className="font-medium text-blue-400 mb-3">Conversation Details</h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">User Question:</p>
                            <p className="text-sm text-gray-200 bg-gray-800 p-3 rounded italic">
                              "{evaluation.conversation.userQuestion}"
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">AI Response:</p>
                            <p className="text-sm text-gray-200 bg-gray-800 p-3 rounded">
                              {evaluation.conversation.aiResponse}
                            </p>
                          </div>
                          <div className="text-xs text-gray-400">
                            Session: {evaluation.conversation.sessionId} • {formatDistanceToNow(new Date(evaluation.conversation.createdAt))} ago
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-green-400 mb-2">Strengths</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {evaluation.strengths.map((strength, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-yellow-400 mb-2">Areas for Improvement</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {evaluation.improvements.map((improvement, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-blue-400 mb-2">AI Feedback</h4>
                        <p className="text-sm text-gray-300">{evaluation.feedback}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No evaluations yet. Start by evaluating some conversations!</p>
              </div>
            )}
          </div>
        )}



        {/* Learning & Feedback Tab */}
        {selectedTab === 'learning' && (
          <div className="space-y-6">
            {/* Combined Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Feedback Stats First Row */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <ThumbsUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Positive Feedback</h3>
                    <p className="text-2xl font-bold text-green-400">{positiveFeedback}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <ThumbsDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Negative Feedback</h3>
                    <p className="text-2xl font-bold text-red-400">{negativeFeedback}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Success Rate</h3>
                    <p className="text-2xl font-bold text-blue-400">{feedbackRatio.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Total Insights</h3>
                    <p className="text-2xl font-bold text-blue-400">{learningStats?.totalInsights || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Stats Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Best Practices</h3>
                    <p className="text-2xl font-bold text-green-400">{learningStats?.bestPractices || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-600 rounded-lg">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Improvements</h3>
                    <p className="text-2xl font-bold text-yellow-400">{learningStats?.improvements || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Avoid Patterns</h3>
                    <p className="text-2xl font-bold text-red-400">{learningStats?.avoidPatterns || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Feedback Section */}
            {feedback && feedback.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Recent User Feedback</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {feedback.filter(fb => fb.comment).slice(0, 10).map(fb => (
                    <div key={fb.id} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            fb.rating === 'thumbs_up' ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                            {fb.rating === 'thumbs_up' ? (
                              <ThumbsUp className="w-4 h-4" />
                            ) : (
                              <ThumbsDown className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">Conversation #{fb.conversationId}</p>
                            <p className="text-sm text-gray-400">
                              {formatDistanceToNow(new Date(fb.createdAt))} ago
                            </p>
                          </div>
                        </div>
                      </div>
                      {fb.comment && (
                        <div className="mt-2 p-3 bg-gray-800 rounded-md">
                          <p className="text-sm text-gray-300">{fb.comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current System Prompt */}
            {systemPromptData && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Current System Prompt</h3>
                  <Button
                    onClick={() => {
                      setManualEditPrompt(systemPromptData.prompt);
                      setShowEditDialog(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <span className="text-gray-400">Documents: {systemPromptData.stats.documents}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">Training Sessions: {systemPromptData.stats.trainingSessions}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-yellow-400">Active Facts: {systemPromptData.stats.activeFacts}</span>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap">{systemPromptData.prompt}</pre>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>📌 The system prompt is automatically updated when you click "Update System Prompt".</p>
                    <p>📌 IMPORTANT FACTS section contains knowledge extracted from user feedback.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Learning Controls */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Learning System Controls</h3>
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-yellow-400">Quality-First Learning</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Focus on extracting high-quality insights from user feedback and session-level patterns.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => processFeedbackMutation.mutate()}
                      disabled={processFeedbackMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {processFeedbackMutation.isPending ? 'Processing...' : 'Process User Feedback'}
                    </Button>
                    <Button
                      onClick={() => deduplicateInsightsMutation.mutate()}
                      disabled={deduplicateInsightsMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {deduplicateInsightsMutation.isPending ? 'Deduplicating...' : 'Deduplicate Insights'}
                    </Button>
                    <Button
                      onClick={() => generateSuggestionMutation.mutate()}
                      disabled={generateSuggestionMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {generateSuggestionMutation.isPending ? 'Generating...' : 'Get AI Suggestion'}
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  <p>💡 Tip: Process user feedback first to extract knowledge gaps, then deduplicate to merge similar insights.</p>
                </div>
              </div>
            </div>

            {/* Learning Insights List */}
            {learningInsights && learningInsights.length > 0 ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Learning Insights</h3>
                <div className="space-y-4">
                  {learningInsights.map((insight) => (
                    <div key={insight.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={
                              insight.category === 'best_practice' ? 'bg-green-100 text-green-800' :
                              insight.category === 'improvement' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {insight.category === 'best_practice' ? 'Best Practice' :
                               insight.category === 'improvement' ? 'Improvement' :
                               'Avoid Pattern'}
                            </Badge>
                            <Badge variant="outline">
                              Importance: {insight.importance}/10
                            </Badge>
                            <Badge variant={insight.isActive ? 'default' : 'secondary'}>
                              {insight.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-gray-300 mb-2">{insight.insight}</p>
                          {insight.examples && insight.examples.length > 0 && (
                            <div className="ml-4">
                              <p className="text-sm text-gray-400 mb-1">Examples:</p>
                              <ul className="text-sm text-gray-400 space-y-1">
                                {insight.examples.map((example, idx) => (
                                  <li key={idx}>• {example}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleInsightMutation.mutate({ id: insight.id, isActive: !insight.isActive })}
                            disabled={toggleInsightMutation.isPending}
                          >
                            {insight.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteInsightMutation.mutate(insight.id)}
                            disabled={deleteInsightMutation.isPending}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>Created {formatDistanceToNow(new Date(insight.createdAt))} ago</span>
                        <span>•</span>
                        <span>From evaluation #{insight.sourceEvaluationId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No learning insights yet. Insights will be generated from evaluation feedback.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Suggestion Approval Dialog */}
      {showApprovalDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">AI System Prompt Suggestion</h2>
              <p className="text-sm text-gray-400 mt-1">AI has generated a suggested improvement to the system prompt. Review and approve or reject.</p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Suggested System Prompt:</h3>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">{suggestedPrompt}</pre>
                  </div>
                </div>
                
                <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-300 font-medium">AI Recommendation</p>
                      <p className="text-sm text-blue-200 mt-1">
                        This prompt has been generated based on recent learning insights, user feedback, and evaluation results. 
                        It should improve the chatbot's accuracy and helpfulness.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  approveSuggestionMutation.mutate(false);
                  setShowApprovalDialog(false);
                }}
                className="text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                No, Reject
              </Button>
              <Button
                onClick={() => approveSuggestionMutation.mutate(true)}
                disabled={approveSuggestionMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {approveSuggestionMutation.isPending ? 'Applying...' : 'Yes, Apply'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Edit Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Edit System Prompt</h2>
              <p className="text-sm text-gray-400 mt-1">Manually edit the system prompt. Changes will be applied immediately.</p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium mb-2">System Prompt</label>
                  <textarea
                    value={manualEditPrompt}
                    onChange={(e) => setManualEditPrompt(e.target.value)}
                    className="w-full h-96 bg-gray-900 text-gray-300 rounded-lg p-4 font-mono text-sm resize-none"
                    placeholder="Enter system prompt..."
                  />
                </div>
                
                <div className="bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                    <p className="text-sm font-medium text-blue-300">Manual Edit Mode</p>
                  </div>
                  <p className="text-sm text-blue-200">
                    You are manually editing the system prompt. This will override any AI-generated suggestions. 
                    Make sure to preserve important sections like CRITICAL INSTRUCTIONS and IMPORTANT FACTS.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setManualEditPrompt('');
                }}
                className="text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  updateSystemPromptMutation.mutate(manualEditPrompt);
                  setShowEditDialog(false);
                  setManualEditPrompt('');
                }}
                disabled={updateSystemPromptMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {updateSystemPromptMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}