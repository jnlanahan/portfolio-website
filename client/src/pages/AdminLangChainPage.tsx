import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, RefreshCw, BarChart3, Database, Play, Plus, Eye, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { SystemArchitectureDiagram, DataFlowDiagram, TrainingFlowDiagram } from '@/components/ArchitecturalDiagrams';

export default function AdminLangChainPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [evaluationName, setEvaluationName] = useState('');
  const [evaluationExamples, setEvaluationExamples] = useState('');

  // Fetch LangSmith stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/langchain/stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch dashboard URLs
  const { data: dashboardInfo } = useQuery({
    queryKey: ['/api/langchain/dashboard']
  });

  // Fetch evaluation statistics
  const { data: evaluationStats } = useQuery({
    queryKey: ['/api/langchain/evaluations'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Test LangSmith connection mutation
  const testConnection = useMutation({
    mutationFn: () => apiRequest('/api/langchain/test-connection'),
    onSuccess: (result) => {
      toast({
        title: result.success ? "Connection Success" : "Connection Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Test Failed",
        description: error.message || "Failed to test connection.",
        variant: "destructive"
      });
    }
  });

  // Refresh vector store mutation
  const refreshVectorStore = useMutation({
    mutationFn: () => apiRequest('/api/langchain/documents/refresh', {
      method: 'POST'
    }),
    onSuccess: () => {
      toast({
        title: "Vector Store Refreshed",
        description: "All documents have been reloaded into the vector store."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/langchain/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh vector store.",
        variant: "destructive"
      });
    }
  });

  // Create evaluation dataset mutation
  const createDataset = useMutation({
    mutationFn: (data: { name: string, examples: any[] }) => 
      apiRequest('/api/langchain/evaluation/dataset', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: (data) => {
      toast({
        title: "Dataset Created",
        description: `Evaluation dataset "${data.name}" created with ${data.exampleCount} examples.`
      });
      setEvaluationName('');
      setEvaluationExamples('');
      queryClient.invalidateQueries({ queryKey: ['/api/langchain/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Dataset Creation Failed",
        description: error.message || "Failed to create evaluation dataset.",
        variant: "destructive"
      });
    }
  });

  // Handle evaluation dataset creation
  const handleCreateDataset = () => {
    if (!evaluationName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a dataset name.",
        variant: "destructive"
      });
      return;
    }

    try {
      const examples = JSON.parse(evaluationExamples);
      if (!Array.isArray(examples)) {
        throw new Error("Examples must be an array");
      }

      createDataset.mutate({
        name: evaluationName,
        examples
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please enter valid JSON for the examples.",
        variant: "destructive"
      });
    }
  };

  // Handle vector store refresh
  const handleRefreshVectorStore = async () => {
    setIsRefreshing(true);
    try {
      await refreshVectorStore.mutateAsync();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">LangChain & LangSmith Management</h1>
              <p className="text-gray-400">Advanced chatbot monitoring, evaluation, and document management</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin">
                <Button variant="outline" className="bg-[#2a2a2a] border-gray-600 text-white hover:bg-[#3a3a3a]">
                  Back to Admin
                </Button>
              </Link>
              {dashboardInfo?.dashboardUrl && (
                <a href={dashboardInfo.dashboardUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#007AFF] hover:bg-[#0056CC] text-white">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open LangSmith
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-[#2a2a2a] border-gray-600">
            <TabsTrigger value="dashboard" className="text-white data-[state=active]:bg-[#007AFF] data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-[#AF52DE] data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="text-white data-[state=active]:bg-[#34C759] data-[state=active]:text-white">
              <Play className="w-4 h-4 mr-2" />
              Evaluation
            </TabsTrigger>
            <TabsTrigger value="guide" className="text-white data-[state=active]:bg-[#FF9500] data-[state=active]:text-white">
              <Eye className="w-4 h-4 mr-2" />
              How to Use
            </TabsTrigger>
            <TabsTrigger value="architecture" className="text-white data-[state=active]:bg-[#007AFF] data-[state=active]:text-white">
              <Database className="w-4 h-4 mr-2" />
              Architecture
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-white data-[state=active]:bg-[#007AFF] data-[state=active]:text-white">
              <Database className="w-4 h-4 mr-2" />
              Vector Store
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Project Info */}
              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Project Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Project Name:</span>
                    <span className="text-white">{dashboardInfo?.projectName || 'Loading...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <Badge className="bg-green-600 text-white">Active</Badge>
                  </div>
                </div>
              </Card>

              {/* Stats */}
              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">LangSmith Stats</h3>
                {statsLoading ? (
                  <div className="text-gray-400">Loading statistics...</div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Runs:</span>
                      <span className="text-white">{stats?.totalRuns || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Recent Runs:</span>
                      <span className="text-white">{stats?.recentRuns?.length || 0}</span>
                    </div>
                    {stats?.error && (
                      <div className="text-red-400 text-xs mt-2">
                        Error: {stats.error}
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Quick Actions */}
              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={() => testConnection.mutate()}
                    disabled={testConnection.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {testConnection.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Test LangSmith Connection
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleRefreshVectorStore}
                    disabled={isRefreshing}
                    className="w-full bg-[#007AFF] hover:bg-[#0056CC] text-white"
                  >
                    {isRefreshing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Vector Store
                      </>
                    )}
                  </Button>
                  
                  {dashboardInfo?.tracesUrl && (
                    <a href={dashboardInfo.tracesUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full bg-[#2a2a2a] border-gray-600 text-white hover:bg-[#3a3a3a]">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Traces
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            </div>

            {/* Recent Runs */}
            {stats?.recentRuns && stats.recentRuns.length > 0 && (
              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Runs</h3>
                <div className="space-y-3">
                  {stats.recentRuns.slice(0, 5).map((run: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                      <div>
                        <div className="text-white font-medium">{run.name || 'Unnamed Run'}</div>
                        <div className="text-gray-400 text-sm">{run.runType || 'Unknown Type'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm">
                          {run.startTime ? new Date(run.startTime).toLocaleTimeString() : 'N/A'}
                        </div>
                        <Badge 
                          className={`text-xs ${
                            run.error ? 'bg-red-600' : 'bg-green-600'
                          } text-white`}
                        >
                          {run.error ? 'Failed' : 'Success'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* How to Use Guide Tab */}
          <TabsContent value="guide" className="space-y-6">
            <Alert className="bg-[#2a2a2a] border-gray-600">
              <Eye className="h-4 w-4" />
              <AlertDescription className="text-gray-300">
                <strong>Complete Guide:</strong> Learn how to maximize your LangSmith integration for optimal chatbot performance monitoring and improvement.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 gap-6">
              {/* Getting Started */}
              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Play className="h-5 w-5 text-orange-400" />
                  Getting Started with LangSmith
                </h3>
                <div className="space-y-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Step 1: Understanding Your Setup</h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>• Your chatbot is automatically integrated with LangSmith</p>
                      <p>• Every conversation is traced and logged in real-time</p>
                      <p>• All 4 evaluation criteria run automatically in the background</p>
                      <p>• No manual setup required - it's working right now!</p>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Step 2: Access Your LangSmith Dashboard</h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>• Click "Open LangSmith" button in the top right</p>
                      <p>• Navigate to your "My Portfolio Chatbot" project</p>
                      <p>• View conversation traces under the "Runs" tab</p>
                      <p>• Look for evaluation runs (named "evaluate_chatbot_response") in the runs list</p>
                      <p>• Click on individual runs to see detailed evaluation scores</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Understanding the Data */}
              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-400" />
                  Understanding Your Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">What Gets Tracked</h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>User questions and chatbot responses</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Document retrieval results</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Response generation time</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Evaluation scores (1-5 scale)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Error conditions and failures</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">4 Evaluation Criteria</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300">Correctness</span>
                        <span className="text-gray-400 text-xs">- factual accuracy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-300">Relevance</span>
                        <span className="text-gray-400 text-xs">- answers the question</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-gray-300">Conciseness</span>
                        <span className="text-gray-400 text-xs">- appropriate length</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-300">Professional Tone</span>
                        <span className="text-gray-400 text-xs">- recruiter-appropriate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* How to Analyze Performance */}
              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                  How to Analyze Performance
                </h3>
                <div className="space-y-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">🟢 Automated Monitoring (Available Now)</h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Performance trends tracked over time</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Evaluation scores logged automatically (4 criteria)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Response time monitoring built-in</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Error rate tracking in LangSmith</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">🟡 Configure LangSmith Alerts</h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p className="text-gray-300 mb-2">Set up in LangSmith Dashboard → Settings → Monitoring:</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Alert when Correctness scores drop below 0.6</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Weekly performance summary reports</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Response time alerts over 5 seconds</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Custom dashboards for key metrics</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">🔴 Manual Analysis Required</h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span>Root cause analysis of failing evaluations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span>System prompt optimization based on patterns</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span>Strategic improvement decisions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span>A/B testing new prompt configurations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Practical Example */}
              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-400" />
                  Example: Improving Low Correctness Scores
                </h3>
                <div className="space-y-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Step 1: Automated Detection</h4>
                    <div className="text-sm text-gray-400">
                      <p className="mb-2">LangSmith automatically identifies pattern:</p>
                      <div className="bg-[#0d1117] rounded p-2 font-mono text-xs">
                        <div className="text-red-400">Correctness: 0.4-0.6 (LOW)</div>
                        <div className="text-green-400">Relevance: 0.8-0.9 (GOOD)</div>
                        <div className="text-yellow-400">Conciseness: 0.3-0.8 (MIXED)</div>
                        <div className="text-blue-400">Professional: 0.7-0.9 (GOOD)</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Step 2: Manual Analysis</h4>
                    <div className="text-sm text-gray-400">
                      <p className="mb-2">Click into failing evaluations to find:</p>
                      <div className="bg-[#0d1117] rounded p-2 text-xs">
                        <p className="text-red-300">"Response mentions 'engineering degree' but context shows 'Civil Engineering' - lacks specificity"</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Step 3: System Improvement</h4>
                    <div className="text-sm text-gray-400">
                      <p className="mb-2">Update system prompt via System Prompt Manager:</p>
                      <div className="bg-[#0d1117] rounded p-2 text-xs">
                        <p className="text-green-300">+ "Be precise: Use exact degree names, job titles, company names"</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Step 4: Automated Verification</h4>
                    <div className="text-sm text-gray-400">
                      <p className="mb-2">LangSmith tracks improvement automatically:</p>
                      <div className="bg-[#0d1117] rounded p-2 font-mono text-xs">
                        <div className="text-green-400">Correctness: 0.8-0.9 (IMPROVED ✓)</div>
                        <div className="text-green-400">Relevance: 0.8-0.9 (MAINTAINED ✓)</div>
                        <div className="text-yellow-400">Conciseness: 0.3-0.5 (NEEDS WORK)</div>
                        <div className="text-blue-400">Professional: 0.7-0.9 (MAINTAINED ✓)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Optimization Strategies */}
              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                  Optimization Strategies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Improve Response Quality</h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>• Use System Prompt Manager to refine prompts</p>
                      <p>• Add more training examples for edge cases</p>
                      <p>• Review and update document content</p>
                      <p>• Test different prompt configurations</p>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Enhance Document Retrieval</h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>• Refresh vector store after document updates</p>
                      <p>• Monitor retrieval relevance in runs</p>
                      <p>• Add more context to document metadata</p>
                      <p>• Optimize embedding search parameters</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Advanced Features */}
              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-orange-400" />
                  Advanced Features & Best Practices
                </h3>
                <div className="space-y-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">LangSmith Power Features</h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>• Create custom evaluation datasets for specific scenarios</p>
                      <p>• Set up alerts for performance degradation</p>
                      <p>• Export data for deeper analysis</p>
                      <p>• Compare performance across different time periods</p>
                      <p>• Use annotation features to mark important conversations</p>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Continuous Improvement Workflow</h4>
                    <div className="space-y-3 text-sm text-gray-400">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">✓</div>
                        <span>Weekly review of evaluation trends</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">✓</div>
                        <span>Monthly prompt optimization based on data</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">✓</div>
                        <span>Quarterly document content review</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">✓</div>
                        <span>A/B testing for major prompt changes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Reference */}
              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-orange-400" />
                  Quick Reference
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Key Metrics</h4>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>• Evaluation Score: 4.0+ = Excellent</p>
                      <p>• Response Time: &lt;3s = Good</p>
                      <p>• Error Rate: &lt;5% = Healthy</p>
                      <p>• Document Retrieval: 85%+ relevant</p>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Common Issues</h4>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>• Low correctness → Update documents</p>
                      <p>• Poor relevance → Refine prompts</p>
                      <p>• Too verbose → Adjust conciseness</p>
                      <p>• Informal tone → Professional prompt</p>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Quick Actions</h4>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>• Test Connection → Dashboard tab</p>
                      <p>• View Runs → LangSmith button</p>
                      <p>• Update Prompts → Chatbot Training</p>
                      <p>• Refresh Data → Vector Store tab</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-6">
            <Alert className="bg-[#2a2a2a] border-gray-600">
              <Database className="h-4 w-4" />
              <AlertDescription className="text-gray-300">
                These diagrams show the complete system architecture including your Chroma database integration, 
                AI training flow, and how all components work together to create a powerful chatbot system.
              </AlertDescription>
            </Alert>

            <div className="space-y-8">
              <SystemArchitectureDiagram />
              <DataFlowDiagram />
              <TrainingFlowDiagram />
            </div>

            {/* AI Training Integration Explanation */}
            <Card className="bg-[#2a2a2a] border-gray-600 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">AI Training Integration with Chroma DB</h3>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h4 className="text-white font-medium mb-2">How the 100+ Question Training Works:</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>AI Training Engine analyzes your uploaded documents in the database</li>
                    <li>Generates 100+ strategic questions based on your actual experience and background</li>
                    <li>You review and approve questions before training begins</li>
                    <li>System automatically asks your chatbot each question using your Chroma database</li>
                    <li>Each Q&A pair is stored in PostgreSQL for future reference</li>
                    <li>LangSmith evaluates response quality and provides improvement suggestions</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Benefits of This Integration:</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Comprehensive Coverage:</strong> Training questions cover all aspects of your background</li>
                    <li><strong>Authentic Responses:</strong> All answers are based on your actual documents</li>
                    <li><strong>Continuous Learning:</strong> System learns from each interaction and improves over time</li>
                    <li><strong>Quality Assurance:</strong> LangSmith provides real-time evaluation and suggestions</li>
                    <li><strong>Scalable:</strong> Can handle unlimited training questions as your profile grows</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Your Chroma Database Role:</h4>
                  <p className="text-gray-400">
                    Your Chroma database acts as the knowledge foundation. When training questions are asked, 
                    the system searches through ALL your documents to find the most relevant information. 
                    This ensures every training response is grounded in your actual experience, not generic AI responses.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Vector Store Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Alert className="bg-[#2a2a2a] border-gray-600">
              <Database className="h-4 w-4" />
              <AlertDescription className="text-gray-300">
                The vector store automatically loads all documents from your database and creates embeddings for semantic search.
                Use the refresh button to reload documents after uploading new ones.
              </AlertDescription>
            </Alert>

            <Card className="bg-[#2a2a2a] border-gray-600 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Vector Store Management</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Document Embeddings</h4>
                    <p className="text-gray-400 text-sm">
                      All uploaded documents are automatically converted to embeddings for semantic search
                    </p>
                  </div>
                  <Button 
                    onClick={handleRefreshVectorStore}
                    disabled={isRefreshing}
                    className="bg-[#007AFF] hover:bg-[#0056CC] text-white"
                  >
                    {isRefreshing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Vector Store
                      </>
                    )}
                  </Button>
                </div>

                <Separator className="bg-gray-600" />

                <div className="text-gray-400 text-sm">
                  <p>
                    → Vector embeddings are created using OpenAI's embedding model<br />
                    → Semantic search retrieves the most relevant documents for each question<br />
                    → All document changes are tracked and logged in LangSmith
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab - Phase 4 */}
          <TabsContent value="analytics" className="space-y-6">
            <Alert className="bg-[#2a2a2a] border-gray-600">
              <TrendingUp className="h-4 w-4" />
              <AlertDescription className="text-gray-300">
                <strong>Phase 4:</strong> Advanced analytics and optimization dashboard for comprehensive chatbot performance analysis.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance Trends */}
              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                  Performance Trends
                </h3>
                {evaluationStats ? (
                  <div className="space-y-4">
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Evaluation Score Trends</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Evaluations:</span>
                          <span className="text-white">{evaluationStats.totalEvaluations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Recent Activity:</span>
                          <Badge className="bg-green-600 text-white">
                            {evaluationStats.recentEvaluations?.length || 0} this session
                          </Badge>
                        </div>
                        <div className="mt-3 p-3 bg-[#0a0a0a] rounded">
                          <div className="text-xs text-gray-400 mb-1">Performance indicators:</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-gray-300">Correctness</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <span className="text-gray-300">Relevance</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              <span className="text-gray-300">Conciseness</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span className="text-gray-300">Professional Tone</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-[#AF52DE] hover:bg-[#9A47C7] text-white"
                      onClick={() => {
                        if (dashboardInfo?.dashboardUrl) {
                          window.open(dashboardInfo.dashboardUrl, '_blank');
                        }
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Detailed Analytics in LangSmith
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    <p className="mt-2 text-gray-400">Loading analytics...</p>
                  </div>
                )}
              </Card>

              {/* Optimization Insights */}
              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  Optimization Insights
                </h3>
                <div className="space-y-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Automated Recommendations</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-gray-300">Response Quality</div>
                          <div className="text-xs text-gray-400">Automatic evaluation system is monitoring all responses</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-gray-300">Performance Tracking</div>
                          <div className="text-xs text-gray-400">All interactions logged to LangSmith for analysis</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-gray-300">Continuous Improvement</div>
                          <div className="text-xs text-gray-400">System learns from evaluation patterns</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">A/B Testing Ready</h4>
                    <div className="text-sm text-gray-400 mb-3">
                      Test different chatbot configurations to optimize performance
                    </div>
                    <Button 
                      className="w-full bg-[#007AFF] hover:bg-[#0056CC] text-white"
                      onClick={() => {
                        toast({
                          title: "A/B Testing",
                          description: "A/B testing framework is ready for different prompt configurations."
                        });
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Configure A/B Tests
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Advanced Analytics Features */}
            <Card className="bg-[#2a2a2a] border-gray-600 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Phase 4 Advanced Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    Performance Analytics
                  </h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>→ Real-time performance dashboards</li>
                    <li>→ Response time analysis</li>
                    <li>→ User satisfaction trends</li>
                    <li>→ Error rate monitoring</li>
                  </ul>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Optimization Engine
                  </h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>→ Automated prompt optimization</li>
                    <li>→ Performance regression detection</li>
                    <li>→ Quality improvement suggestions</li>
                    <li>→ Continuous learning integration</li>
                  </ul>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Database className="w-4 h-4 text-green-400" />
                    Data Management
                  </h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>→ Evaluation dataset management</li>
                    <li>→ Performance benchmarking</li>
                    <li>→ Historical data analysis</li>
                    <li>→ Export capabilities</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Evaluation Tab */}
          <TabsContent value="evaluation" className="space-y-6">
            <Alert className="bg-[#2a2a2a] border-gray-600">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-gray-300">
                <strong>Phase 3 Complete:</strong> Comprehensive evaluation system with 4 criteria (Correctness, Relevance, Conciseness, Professional Tone) 
                automatically evaluates every chatbot response and logs results to LangSmith.
              </AlertDescription>
            </Alert>

            {/* Phase 3 Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Evaluation Statistics
                </h3>
                {evaluationStats ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Evaluations:</span>
                      <span className="text-white font-semibold">{evaluationStats.totalEvaluations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Recent Evaluations:</span>
                      <span className="text-white font-semibold">{evaluationStats.recentEvaluations?.length || 0}</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Automatic evaluation active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>LangSmith logging operational</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-gray-400">Loading evaluation stats...</p>
                  </div>
                )}
              </Card>

              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Play className="h-5 w-5 text-blue-400" />
                  Test Evaluation System
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="test-question" className="text-white">Test Question</Label>
                    <Input
                      id="test-question"
                      placeholder="What is Nick's educational background?"
                      className="bg-[#1a1a1a] border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="test-response" className="text-white">Test Response</Label>
                    <Textarea
                      id="test-response"
                      placeholder="Nick has a BS in Civil Engineering from NC State..."
                      rows={3}
                      className="bg-[#1a1a1a] border-gray-600 text-white"
                    />
                  </div>
                  <Button 
                    className="w-full bg-[#34C759] hover:bg-[#28A745] text-white"
                    onClick={() => {
                      toast({
                        title: "Test Evaluation",
                        description: "This would run the 4-criteria evaluation system on your test input."
                      });
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Test Evaluation
                  </Button>
                </div>
              </Card>
            </div>

            <Card className="bg-[#2a2a2a] border-gray-600 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Create Evaluation Dataset</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dataset-name" className="text-white">Dataset Name</Label>
                  <Input
                    id="dataset-name"
                    value={evaluationName}
                    onChange={(e) => setEvaluationName(e.target.value)}
                    placeholder="e.g., 'Education Questions' or 'Technical Skills'"
                    className="bg-[#1a1a1a] border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="examples" className="text-white">Examples (JSON format)</Label>
                  <Textarea
                    id="examples"
                    value={evaluationExamples}
                    onChange={(e) => setEvaluationExamples(e.target.value)}
                    placeholder={`[
  {
    "inputs": {"question": "What is Nick's educational background?"},
    "outputs": {"answer": "Nick has an MBA from NC State and MS from Missouri S&T"}
  },
  {
    "inputs": {"question": "What companies has Nick worked for?"},
    "outputs": {"answer": "Nick has worked for EY and the U.S. Army"}
  }
]`}
                    rows={10}
                    className="bg-[#1a1a1a] border-gray-600 text-white font-mono text-sm"
                  />
                </div>

                <Button 
                  onClick={handleCreateDataset}
                  disabled={createDataset.isPending}
                  className="bg-[#007AFF] hover:bg-[#0056CC] text-white"
                >
                  {createDataset.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating Dataset...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Dataset
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <Card className="bg-[#2a2a2a] border-gray-600 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Phase 3 Evaluation Criteria</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Correctness
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Evaluates if the response accurately answers the question based on provided context
                    </p>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      Relevance
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Measures how well the response addresses the specific question asked
                    </p>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-yellow-400" />
                      Conciseness
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Ensures responses are appropriately brief (50-150 words) for recruiter interactions
                    </p>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      Professional Tone
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Maintains appropriate professional tone for recruiter and hiring manager interactions
                    </p>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-4 mt-4">
                  <h4 className="text-white font-semibold mb-2">Automatic Evaluation Process</h4>
                  <div className="space-y-2 text-gray-400 text-sm">
                    <p>→ Every chatbot response is automatically evaluated in the background</p>
                    <p>→ All four criteria are scored from 1-5 and normalized to 0-1 scale</p>
                    <p>→ Results are logged to LangSmith for monitoring and improvement</p>
                    <p>→ Evaluation runs asynchronously without affecting response time</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <Alert className="bg-[#2a2a2a] border-gray-600">
              <Eye className="h-4 w-4" />
              <AlertDescription className="text-gray-300">
                All chatbot interactions are automatically logged to LangSmith for monitoring, debugging, and improvement.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Automatic Logging</h3>
                <div className="space-y-3 text-gray-400 text-sm">
                  <p>✓ Every question and response is automatically traced</p>
                  <p>✓ Document retrieval context is logged</p>
                  <p>✓ Performance metrics are tracked</p>
                  <p>✓ Error conditions are captured</p>
                  <p>✓ User feedback is integrated</p>
                </div>
              </Card>

              <Card className="bg-[#2a2a2a] border-gray-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Dashboard Links</h3>
                <div className="space-y-3">
                  {dashboardInfo?.tracesUrl && (
                    <a href={dashboardInfo.tracesUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full bg-[#2a2a2a] border-gray-600 text-white hover:bg-[#3a3a3a]">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Conversation Traces
                      </Button>
                    </a>
                  )}
                  
                  {dashboardInfo?.datasetsUrl && (
                    <a href={dashboardInfo.datasetsUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full bg-[#2a2a2a] border-gray-600 text-white hover:bg-[#3a3a3a]">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Evaluation Datasets
                      </Button>
                    </a>
                  )}
                  
                  {dashboardInfo?.dashboardUrl && (
                    <a href={dashboardInfo.dashboardUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full bg-[#2a2a2a] border-gray-600 text-white hover:bg-[#3a3a3a]">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Main LangSmith Dashboard
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            </div>

            <Card className="bg-[#2a2a2a] border-gray-600 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Benefits of LangSmith Integration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400 text-sm">
                <div>
                  <h4 className="text-white font-medium mb-2">Debugging & Monitoring</h4>
                  <p>See exactly what documents were retrieved, how prompts were formatted, and track response quality over time.</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Performance Analysis</h4>
                  <p>Analyze response times, token usage, and success rates to optimize your chatbot's performance.</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Continuous Improvement</h4>
                  <p>Use evaluation datasets to track improvements and ensure your chatbot maintains quality standards.</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Error Detection</h4>
                  <p>Automatically detect and alert on errors, failed retrievals, or poor response quality.</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}