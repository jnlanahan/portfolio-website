import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Trash2,
  Bot,
  Brain,
  Download,
  CheckCircle2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';

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
  content: string;
  uploadedAt: string;
}

interface TrainingSession {
  id: number;
  question: string;
  answer: string;
  category: string;
  createdAt: string;
}

interface TrainingQuestion {
  question: string;
  category: string;
  context?: string;
}

export default function AdminChatbotPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<TrainingQuestion | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [trainingSuccess, setTrainingSuccess] = useState(false);
  const queryClient = useQueryClient();

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

  // Fetch training sessions
  const { data: sessions = [] } = useQuery<TrainingSession[]>({
    queryKey: ['/api/admin/chatbot/training/sessions'],
    queryFn: () => apiRequest({ url: '/api/admin/chatbot/training/sessions' }),
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      return apiRequest({
        url: '/api/admin/chatbot/documents',
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/progress'] });
      setSelectedFile(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest({
      url: `/api/admin/chatbot/documents/${id}`,
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/progress'] });
    },
  });

  // Generate training question mutation
  const generateQuestionMutation = useMutation({
    mutationFn: () => apiRequest({
      url: '/api/admin/chatbot/training/question',
      method: 'POST',
    }),
    onSuccess: (data: TrainingQuestion) => {
      setCurrentQuestion(data);
      setCurrentAnswer('');
    },
  });

  // Submit training answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: (data: { question: string; answer: string; category: string }) => 
      apiRequest({
        url: '/api/admin/chatbot/training/answer',
        method: 'POST',
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/training/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/progress'] });
      setCurrentQuestion(null);
      setCurrentAnswer('');
      setTrainingSuccess(true);
      setTimeout(() => setTrainingSuccess(false), 3000);
    },
  });

  const handleFileUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleGenerateQuestion = () => {
    generateQuestionMutation.mutate();
  };

  const handleSubmitAnswer = () => {
    if (currentQuestion && currentAnswer.trim()) {
      submitAnswerMutation.mutate({
        question: currentQuestion.question,
        answer: currentAnswer,
        category: currentQuestion.category,
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const progressPercentage = progress ? Math.min((progress.totalQuestions / 50) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-500" />
            Chatbot Training Center
          </h1>
          <p className="text-gray-400">
            Train your personal AI assistant with documents and Q&A sessions
          </p>
        </div>

        {/* Training Progress Overview */}
        <Card className="bg-[#2a2a2a] border-[#3a3a3a] mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Training Progress
              </h2>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                {progress?.totalQuestions || 0} Questions Answered
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {progress?.totalQuestions || 0}
                </div>
                <div className="text-sm text-gray-400">Training Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {progress?.documentsCount || 0}
                </div>
                <div className="text-sm text-gray-400">Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {progressPercentage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-400">Training Complete</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Training Progress</span>
                <span>{progress?.totalQuestions || 0} / 50 recommended</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {progress?.lastTrainingDate && (
              <p className="text-sm text-gray-400 mt-4">
                Last training: {formatDistanceToNow(new Date(progress.lastTrainingDate), { addSuffix: true })}
              </p>
            )}
          </div>
        </Card>

        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="bg-[#2a2a2a] border-[#3a3a3a]">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Training
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            {/* Upload Section */}
            <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-green-500" />
                  Upload Training Documents
                </h2>
                
                {uploadSuccess && (
                  <Alert className="mb-4 bg-green-900/20 border-green-500">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-400">
                      Document uploaded and processed successfully!
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="document-upload" className="text-gray-200">
                      Select Document
                    </Label>
                    <Input
                      id="document-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.md,.rtf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="mt-2 bg-[#1a1a1a] border-[#3a3a3a] text-white"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Supported formats: PDF, Word, Text, Markdown, RTF (max 25MB)
                    </p>
                  </div>

                  <Button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || uploadMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Documents List */}
            <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Training Documents ({documents.length})
                </h2>

                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{doc.originalName}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                            <span>{formatFileSize(doc.fileSize)}</span>
                            <span>{doc.fileType}</span>
                            <span>
                              Uploaded {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => deleteMutation.mutate(doc.id)}
                          variant="destructive"
                          size="sm"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {documents.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No training documents uploaded yet</p>
                      <p className="text-sm">Upload documents to start training your chatbot</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            {/* Training Section */}
            <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Interactive Training
                </h2>

                {trainingSuccess && (
                  <Alert className="mb-4 bg-green-900/20 border-green-500">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-400">
                      Training answer saved successfully!
                    </AlertDescription>
                  </Alert>
                )}

                {!currentQuestion ? (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                    <p className="text-gray-400 mb-4">Ready to train your chatbot?</p>
                    <Button
                      onClick={handleGenerateQuestion}
                      disabled={generateQuestionMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {generateQuestionMutation.isPending ? (
                        <>
                          <Brain className="h-4 w-4 mr-2 animate-spin" />
                          Generating Question...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Generate Training Question
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-purple-400 border-purple-400">
                          {currentQuestion.category}
                        </Badge>
                        <Button
                          onClick={handleGenerateQuestion}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                        >
                          Generate New Question
                        </Button>
                      </div>
                      <h3 className="font-medium text-white mb-2">Training Question:</h3>
                      <p className="text-gray-300">{currentQuestion.question}</p>
                      {currentQuestion.context && (
                        <p className="text-sm text-gray-400 mt-2">
                          Context: {currentQuestion.context}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="training-answer" className="text-gray-200">
                        Your Answer
                      </Label>
                      <Textarea
                        id="training-answer"
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Provide a comprehensive answer about yourself..."
                        className="mt-2 bg-[#1a1a1a] border-[#3a3a3a] text-white min-h-32"
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={!currentAnswer.trim() || submitAnswerMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {submitAnswerMutation.isPending ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Save Answer
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setCurrentQuestion(null)}
                        variant="outline"
                        className="border-[#3a3a3a] hover:bg-[#2a2a2a]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Recent Training Sessions */}
            <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  Recent Training Sessions
                </h2>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-blue-400 border-blue-400">
                          {session.category}
                        </Badge>
                        <span className="text-sm text-gray-400">
                          {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-300">Q:</p>
                          <p className="text-sm text-gray-400">{session.question}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-300">A:</p>
                          <p className="text-sm text-gray-400">{session.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {sessions.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No training sessions yet</p>
                      <p className="text-sm">Start training to see your Q&A sessions here</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  Chatbot Analytics
                </h2>
                
                <div className="text-center py-8 text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Analytics coming soon</p>
                  <p className="text-sm">Track chatbot usage and popular questions</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}