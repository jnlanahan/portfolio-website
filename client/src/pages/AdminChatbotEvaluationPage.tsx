import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, TrendingUp, ThumbsUp, ThumbsDown, BarChart3, MessageSquare, CheckCircle, XCircle, Brain, Target, Lightbulb, Shield, Trash2, ToggleLeft, ToggleRight, Clock, Activity } from 'lucide-react';
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

export default function AdminChatbotEvaluationPage() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'evaluations' | 'feedback' | 'learning'>('overview');
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
    mutationFn: () => apiRequest('/api/admin/chatbot/learning/update-prompt', 'POST'),
    onSuccess: () => {
      // No need to invalidate queries, just show success
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
            { id: 'feedback', label: 'User Feedback', icon: ThumbsUp },
            { id: 'learning', label: 'AI Learning', icon: Brain }
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

        {/* Feedback Tab */}
        {selectedTab === 'feedback' && (
          <div className="space-y-6">
            {/* Feedback Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>

            {/* Feedback List */}
            {feedbackLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-400">Loading feedback...</p>
              </div>
            ) : feedback && feedback.length > 0 ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Feedback</h3>
                <div className="space-y-4">
                  {feedback.slice(0, 20).map(fb => (
                    <div key={fb.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
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
                      <Badge className={
                        fb.rating === 'thumbs_up' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }>
                        {fb.rating === 'thumbs_up' ? 'positive' : 'negative'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ThumbsUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No user feedback yet. Feedback will appear here once users interact with the chatbot.</p>
              </div>
            )}
          </div>
        )}

        {/* Learning Insights Tab */}
        {selectedTab === 'learning' && (
          <div className="space-y-6">
            {/* Learning Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

            {/* Learning Controls */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Learning System Controls</h3>
              <div className="flex gap-4">
                <Button
                  onClick={() => processRecentEvaluationsMutation.mutate()}
                  disabled={processRecentEvaluationsMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {processRecentEvaluationsMutation.isPending ? 'Processing...' : 'Process Recent Evaluations'}
                </Button>
                <Button
                  onClick={() => updateSystemPromptMutation.mutate()}
                  disabled={updateSystemPromptMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updateSystemPromptMutation.isPending ? 'Updating...' : 'Update System Prompt'}
                </Button>
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
    </div>
  );
}