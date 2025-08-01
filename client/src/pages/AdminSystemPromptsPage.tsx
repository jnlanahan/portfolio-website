import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Settings, Bot, Database, Zap, AlertCircle } from "lucide-react";
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
                <div className="grid grid-cols-2 gap-8">
                  
                  {/* Training Mode (Left Side) */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white mb-4">Training Mode (You)</h3>
                      <p className="text-xs text-gray-400">processTrainingConversation()</p>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-3">
                      <div className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium">
                        Nick Asks Training Question
                      </div>
                      <div className="text-gray-400">↓</div>
                      <div className="bg-[#2a2a2a] border border-purple-500 px-3 py-2 rounded-lg text-sm text-center">
                        <strong>Hardcoded Training Prompt</strong>
                        <br />
                        <span className="text-xs text-gray-400">Built into chatbotService.ts</span>
                      </div>
                      <div className="text-gray-400">↓</div>
                      <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
                        AI Generates Response
                      </div>
                      <div className="text-gray-400">↓</div>
                      <div className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
                        Q&A Stored in Database
                      </div>
                    </div>
                  </div>
                  
                  {/* Visitor Mode (Right Side) */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white mb-4">Visitor Mode (Recruiters)</h3>
                      <p className="text-xs text-gray-400">TWO DIFFERENT SYSTEMS!</p>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-3">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                        Recruiter Asks Question
                      </div>
                      <div className="text-gray-400">↓</div>
                      
                      {/* Split into two parallel systems */}
                      <div className="grid grid-cols-2 gap-4 w-full">
                        
                        {/* Left: Legacy /api/chatbot/ask System */}
                        <div className="bg-[#2a2a2a] border border-red-500 p-3 rounded-lg">
                          <div className="text-center text-sm font-semibold text-white mb-2">/api/chatbot/ask</div>
                          <div className="space-y-2">
                            <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs text-center">
                              <strong>Custom Template</strong>
                            </div>
                            <div className="text-gray-400 text-xs text-center">↓ (if none)</div>
                            <div className="bg-gray-600 text-white px-2 py-1 rounded text-xs text-center">
                              <strong>Visitor Fallback</strong>
                            </div>
                            <div className="text-gray-400 text-xs text-center">↓</div>
                            <div className="bg-cyan-600 text-white px-2 py-1 rounded text-xs text-center">
                              <strong>+ Chroma Context</strong>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right: LangChain /api/chatbot/chat System */}
                        <div className="bg-[#2a2a2a] border border-green-500 p-3 rounded-lg">
                          <div className="text-center text-sm font-semibold text-white mb-2">/api/chatbot/chat</div>
                          <div className="space-y-2">
                            <div className="bg-orange-600 text-white px-2 py-1 rounded text-xs text-center">
                              <strong>LangChain Prompt</strong>
                            </div>
                            <div className="text-gray-400 text-xs text-center">↓</div>
                            <div className="bg-cyan-600 text-white px-2 py-1 rounded text-xs text-center">
                              <strong>Chroma RAG</strong>
                            </div>
                            <div className="text-gray-400 text-xs text-center">↓</div>
                            <div className="bg-green-600 text-white px-2 py-1 rounded text-xs text-center">
                              <strong>LangSmith</strong>
                            </div>
                          </div>
                        </div>
                        
                      </div>
                      
                      <div className="text-gray-400">↓</div>
                      <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
                        AI Generates Response
                      </div>
                      <div className="text-gray-400">↓</div>
                      <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium">
                        Evaluation & Feedback
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">System Prompts (Current Implementation):</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span><strong>Training:</strong> Hardcoded in chatbotService.ts (training mode)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span><strong>Custom:</strong> Database template (priority in /api/chatbot/ask)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded"></div>
                      <span><strong>Visitor:</strong> Hardcoded fallback in chatbotService.ts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span><strong>LangChain:</strong> Full conversation prompt (langchainChatbotService.ts)</span>
                    </div>

                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Actual Usage Flow:</h3>
                  <div className="space-y-1 text-sm">
                    <div>• <strong>Training Mode:</strong> Uses hardcoded training prompt</div>
                    <div>• <strong>Visitor Mode:</strong> FloatingChatbot uses LangChain prompt (/api/chatbot/chat)</div>
                    <div>• <strong>Old Visitor Mode:</strong> Custom/Visitor prompts (/api/chatbot/ask) - legacy</div>
                    <div>• <strong>LangChain Prompt:</strong> ACTUAL prompt used by visitors on site</div>

                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#3a3a3a]">
                <h3 className="font-semibold text-white mb-2">Technical Implementation:</h3>
                <div className="text-sm space-y-1">
                  <div>• <strong>Token Limits:</strong> Set to 150 tokens in API calls (both chatbotService.ts and langchainChatbotService.ts)</div>
                  <div>• <strong>Temperature:</strong> 0.7 for natural conversation flow</div>
                  <div>• <strong>Model:</strong> GPT-4o for all interactions</div>
                  <div>• <strong>Document Retrieval:</strong> Chroma DB with semantic search via LangChain</div>
                  <div>• <strong>Response Style:</strong> Conversational, 2-3 sentences max, no formatting</div>
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