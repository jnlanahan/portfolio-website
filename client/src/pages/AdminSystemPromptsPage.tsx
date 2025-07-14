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
        {/* Info Alert */}
        <Alert className="mb-6 bg-[#2a2a2a] border-[#3a3a3a]">
          <Bot className="h-4 w-4" />
          <AlertDescription className="text-gray-300">
            <strong>System Prompts</strong> control how the chatbot responds to questions. Each prompt serves a different purpose:
            <br />
            • <strong>Default:</strong> Base prompt used when no custom prompt is active
            <br />
            • <strong>Enhanced:</strong> Auto-generated with learning insights (view-only)
            <br />
            • <strong>Custom:</strong> Database-stored prompt that overrides the default
            <br />
            • <strong>LangChain:</strong> Used for the RAG pipeline with document retrieval
          </AlertDescription>
        </Alert>

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