import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Settings, Bot, Database, Zap } from "lucide-react";
import SystemPromptManager from "@/components/SystemPromptManager";

export default function AdminSystemPromptsPage() {
  const [, setLocation] = useLocation();

  // Check admin authentication
  const { data: adminStatus, isLoading } = useQuery({
    queryKey: ["/api/admin/status"],
    retry: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !adminStatus?.isAdmin) {
      setLocation("/admin/login");
    }
  }, [adminStatus, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!adminStatus?.isAdmin) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="bg-[#2a2a2a] shadow-lg border-b border-[#3a3a3a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/admin")}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Settings size={24} />
                  System Prompts
                </h1>
                <p className="text-sm text-gray-300">
                  Manage chatbot system prompts and behavior
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Prompt Flow Diagram */}
        <Card className="mb-6 bg-[#2a2a2a] border-[#3a3a3a]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database size={20} />
              System Prompt Flow Diagram
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <div className="space-y-6">
              {/* Flow Diagram */}
              <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#3a3a3a]">
                <div className="flex flex-col space-y-4">
                  
                  {/* User Question Input */}
                  <div className="flex items-center justify-center">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                      User Question Received
                    </div>
                  </div>
                  
                  {/* Decision Diamond */}
                  <div className="flex items-center justify-center">
                    <div className="text-gray-400">↓</div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transform rotate-45 w-32 h-32 flex items-center justify-center text-sm">
                      <div className="transform -rotate-45">Which Service?</div>
                    </div>
                  </div>
                  
                  {/* Two Paths */}
                  <div className="flex justify-around items-start">
                    
                    {/* Training Mode Path */}
                    <div className="flex flex-col items-center space-y-3 w-1/2">
                      <div className="text-gray-400">↙</div>
                      <div className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium">
                        Training Mode
                      </div>
                      <div className="text-gray-400">↓</div>
                      <div className="bg-[#2a2a2a] border border-purple-500 px-3 py-2 rounded-lg text-sm">
                        <strong>Default Prompt</strong>
                        <br />
                        <span className="text-xs text-gray-400">Base training behavior</span>
                      </div>
                      <div className="text-gray-400">↓</div>
                      <div className="bg-[#2a2a2a] border border-green-500 px-3 py-2 rounded-lg text-sm">
                        <strong>Enhanced Prompt</strong>
                        <br />
                        <span className="text-xs text-gray-400">Auto-generated from learning insights</span>
                      </div>
                    </div>
                    
                    {/* Visitor Mode Path */}
                    <div className="flex flex-col items-center space-y-3 w-1/2">
                      <div className="text-gray-400">↘</div>
                      <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium">
                        Visitor Mode
                      </div>
                      <div className="text-gray-400">↓</div>
                      <div className="bg-[#2a2a2a] border border-orange-500 px-3 py-2 rounded-lg text-sm">
                        <strong>Custom Prompt</strong>
                        <br />
                        <span className="text-xs text-gray-400">Database-stored override</span>
                      </div>
                      <div className="text-gray-400">↓</div>
                      <div className="bg-[#2a2a2a] border border-cyan-500 px-3 py-2 rounded-lg text-sm">
                        <strong>LangChain Prompt</strong>
                        <br />
                        <span className="text-xs text-gray-400">RAG with document retrieval</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Response Generation */}
                  <div className="flex items-center justify-center mt-4">
                    <div className="text-gray-400">↓</div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
                      Response Generated
                    </div>
                  </div>
                  
                  {/* Feedback Loop */}
                  <div className="flex items-center justify-center">
                    <div className="text-gray-400">↓</div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium">
                      Evaluation & Feedback
                    </div>
                  </div>
                  
                  {/* Learning Loop */}
                  <div className="flex items-center justify-center">
                    <div className="text-gray-400">↑ (Learning Loop)</div>
                  </div>
                  
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">System Prompts:</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span><strong>Default:</strong> Base training prompt in code</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span><strong>Enhanced:</strong> Auto-generated with learning insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span><strong>Custom:</strong> Database-stored override</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                      <span><strong>LangChain:</strong> RAG pipeline with document retrieval</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Usage Flow:</h3>
                  <div className="space-y-1 text-sm">
                    <div>• Training mode generates Enhanced prompt from Default + insights</div>
                    <div>• Visitor mode uses Custom prompt (if set) or LangChain prompt</div>
                    <div>• Poor evaluations create learning insights</div>
                    <div>• Insights automatically improve Enhanced prompt</div>
                    <div>• All responses are evaluated and create feedback loop</div>
                  </div>
                </div>
              </div>

              {/* Enhanced Prompt Generation Details */}
              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#3a3a3a]">
                <h3 className="font-semibold text-white mb-2">Enhanced Prompt Generation Process:</h3>
                <div className="text-sm space-y-1">
                  <div>1. <strong>Base:</strong> Starts with Default prompt</div>
                  <div>2. <strong>Learning Insights:</strong> Adds best practices from evaluations (score ≥ 7/10)</div>
                  <div>3. <strong>Improvement Areas:</strong> Adds areas that need enhancement (score &lt; 7/10)</div>
                  <div>4. <strong>Avoid Patterns:</strong> Adds patterns to avoid from poor evaluations (score &lt; 3.5/10)</div>
                  <div>5. <strong>Auto-Update:</strong> Regenerates automatically when new insights are created</div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* System Prompt Manager */}
        <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings size={20} />
              System Prompt Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SystemPromptManager />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}