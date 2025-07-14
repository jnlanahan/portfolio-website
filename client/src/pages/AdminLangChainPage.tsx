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
import { ExternalLink, RefreshCw, BarChart3, Database, Play, Plus, Eye } from 'lucide-react';
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
          <TabsList className="grid w-full grid-cols-5 bg-[#2a2a2a] border-gray-600">
            <TabsTrigger value="dashboard" className="text-white data-[state=active]:bg-[#007AFF] data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="architecture" className="text-white data-[state=active]:bg-[#007AFF] data-[state=active]:text-white">
              <Database className="w-4 h-4 mr-2" />
              Architecture
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-white data-[state=active]:bg-[#007AFF] data-[state=active]:text-white">
              <Database className="w-4 h-4 mr-2" />
              Vector Store
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="text-white data-[state=active]:bg-[#007AFF] data-[state=active]:text-white">
              <Play className="w-4 h-4 mr-2" />
              Evaluation
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="text-white data-[state=active]:bg-[#007AFF] data-[state=active]:text-white">
              <Eye className="w-4 h-4 mr-2" />
              Monitoring
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

          {/* Evaluation Tab */}
          <TabsContent value="evaluation" className="space-y-6">
            <Alert className="bg-[#2a2a2a] border-gray-600">
              <Play className="h-4 w-4" />
              <AlertDescription className="text-gray-300">
                Create evaluation datasets to systematically test your chatbot's performance on specific questions and scenarios.
              </AlertDescription>
            </Alert>

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
              <h3 className="text-lg font-semibold text-white mb-4">Evaluation Features</h3>
              <div className="space-y-3 text-gray-400 text-sm">
                <p>✓ Automatic response evaluation against expected outputs</p>
                <p>✓ Performance metrics (accuracy, relevance, helpfulness)</p>
                <p>✓ Regression testing to ensure consistent performance</p>
                <p>✓ A/B testing for different prompt versions</p>
                <p>✓ Export results for further analysis</p>
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