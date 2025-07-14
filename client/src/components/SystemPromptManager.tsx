import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  RefreshCw, 
  FileText, 
  Settings, 
  Database, 
  Link,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy
} from 'lucide-react';
import { format } from 'date-fns';

interface SystemPrompt {
  prompt: string;
  editable: boolean;
  description: string;
  lastModified: string;
}

interface SystemPrompts {
  training: SystemPrompt;
  visitor: SystemPrompt;
  custom: SystemPrompt;
  langchain: SystemPrompt;
}

export default function SystemPromptManager() {
  const [editingPrompt, setEditingPrompt] = useState<{
    type: string;
    content: string;
  } | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch all system prompts
  const { data: prompts, isLoading, error } = useQuery<SystemPrompts>({
    queryKey: ['/api/admin/chatbot/system-prompts'],
    queryFn: () => apiRequest('/api/admin/chatbot/system-prompts'),
  });

  // Update system prompt mutation
  const updatePromptMutation = useMutation({
    mutationFn: async ({ type, prompt }: { type: string; prompt: string }) => {
      return apiRequest(`/api/admin/chatbot/system-prompts/${type}`, 'POST', { prompt });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/system-prompts'] });
      setEditingPrompt(null);
    },
  });

  const handleEdit = (type: string, content: string) => {
    setEditingPrompt({ type, content });
  };

  const handleSave = () => {
    if (!editingPrompt) return;
    
    updatePromptMutation.mutate({
      type: editingPrompt.type,
      prompt: editingPrompt.content
    });
  };

  const handleCancel = () => {
    setEditingPrompt(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getPromptTypeInfo = (type: string) => {
    const info = {
      training: {
        icon: <Database className="w-4 h-4" />,
        title: "Training Mode",
        color: "bg-blue-500",
        description: "Used when training the chatbot"
      },
      visitor: {
        icon: <FileText className="w-4 h-4" />,
        title: "Visitor Mode",
        color: "bg-green-500",
        description: "Default prompt for visitors"
      },
      custom: {
        icon: <Settings className="w-4 h-4" />,
        title: "Custom Template",
        color: "bg-purple-500",
        description: "Database-stored custom template"
      },
      langchain: {
        icon: <Link className="w-4 h-4" />,
        title: "LangChain",
        color: "bg-orange-500",
        description: "Actual visitor prompt via /api/chatbot/chat"
      }
    };
    return info[type] || info.training;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm text-gray-300">Loading system prompts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-600 bg-red-950">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-300">
          Failed to load system prompts: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">System Prompt Manager</h2>
          <p className="text-gray-400 text-sm mt-1">
            Edit and manage the 4 system prompts used by the chatbot
          </p>
        </div>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot/system-prompts'] })}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="training" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#2a2a2a]">
          {prompts && Object.entries(prompts).map(([type, prompt]) => {
            const info = getPromptTypeInfo(type);
            return (
              <TabsTrigger
                key={type}
                value={type}
                className="flex items-center space-x-2 data-[state=active]:bg-[#007AFF] data-[state=active]:text-white"
              >
                {info.icon}
                <span className="hidden sm:inline">{info.title.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {prompts && Object.entries(prompts).map(([type, prompt]) => {
          const info = getPromptTypeInfo(type);
          const isEditing = editingPrompt?.type === type;
          
          return (
            <TabsContent key={type} value={type} className="space-y-4">
              <Card className="bg-[#2a2a2a] border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full ${info.color} flex items-center justify-center text-white`}>
                        {info.icon}
                      </div>
                      <div>
                        <CardTitle className="text-white">{info.title}</CardTitle>
                        <p className="text-gray-400 text-sm mt-1">{prompt.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={prompt.editable ? "default" : "secondary"}>
                        {prompt.editable ? "Editable" : "Read-only"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Last Modified */}
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Last modified: {format(new Date(prompt.lastModified), 'MMM d, yyyy h:mm a')}</span>
                  </div>

                  {/* Prompt Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">Prompt Content</label>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => copyToClipboard(prompt.prompt)}
                          variant="ghost"
                          size="sm"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {prompt.editable && !isEditing && (
                          <Button
                            onClick={() => handleEdit(type, prompt.prompt)}
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                        )}
                        {!prompt.editable && (
                          <Badge variant="secondary" className="text-xs">
                            Read-only
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editingPrompt.content}
                          onChange={(e) => setEditingPrompt({
                            ...editingPrompt,
                            content: e.target.value
                          })}
                          rows={15}
                          className="bg-[#1a1a1a] border-gray-600 text-white font-mono text-sm"
                        />
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={handleSave}
                            disabled={updatePromptMutation.isPending}
                            size="sm"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {updatePromptMutation.isPending ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            onClick={handleCancel}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg p-3">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                          {prompt.prompt}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Update Status */}
      {updatePromptMutation.isSuccess && (
        <Alert className="border-green-600 bg-green-950">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-300">
            System prompt updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {updatePromptMutation.isError && (
        <Alert className="border-red-600 bg-red-950">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-300">
            Failed to update system prompt: {updatePromptMutation.error?.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}