import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { ArrowLeft, Shield, Check } from "lucide-react";

export default function AdminSetupSecurityPage() {
  const [securityAnswers, setSecurityAnswers] = useState<string[]>(["", "", "", "", ""]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ["/api/admin/security-questions"],
  });

  const { data: statusData } = useQuery({
    queryKey: ["/api/admin/security-questions/status"],
  });

  const setupMutation = useMutation({
    mutationFn: async (answers: string[]) => {
      await apiRequest("/api/admin/setup-security-questions", "POST", { securityAnswers: answers });
    },
    onSuccess: () => {
      toast({
        title: "Security Questions Setup Complete",
        description: "Your security questions have been configured successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/security-questions/status"] });
    },
    onError: (error) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to setup security questions",
        variant: "destructive",
      });
    },
  });

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...securityAnswers];
    newAnswers[index] = value;
    setSecurityAnswers(newAnswers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filledAnswers = securityAnswers.filter(answer => answer.trim() !== "");
    if (filledAnswers.length !== 5) {
      toast({
        title: "Incomplete Answers",
        description: "Please answer all 5 security questions.",
        variant: "destructive",
      });
      return;
    }

    setupMutation.mutate(securityAnswers);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse bg-white rounded-lg p-6">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const questions = questionsData?.questions || [];
  const hasSetup = statusData?.hasSetup || false;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-slate-600 hover:text-slate-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Security Questions Setup</h1>
          <p className="text-gray-600">Configure security questions for password recovery</p>
        </div>

        {hasSetup && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Security questions are already configured</span>
              </div>
              <p className="text-green-700 text-sm mt-2">
                You can reconfigure them below if needed. This will replace your existing security questions.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {questions.map((question: string, index: number) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`question-${index}`} className="text-sm font-medium text-gray-700">
                      {index + 1}. {question}
                    </Label>
                    <Input
                      id={`question-${index}`}
                      type="text"
                      value={securityAnswers[index]}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder="Enter your answer"
                      className="w-full"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Answers are case-insensitive but must match exactly</li>
                  <li>• Store your answers securely - they're needed for password recovery</li>
                  <li>• All 5 questions must be answered to enable recovery</li>
                  <li>• You'll need to answer 2 out of 5 questions correctly during recovery</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={setupMutation.isPending}
              >
                {setupMutation.isPending ? "Setting up..." : hasSetup ? "Update Security Questions" : "Setup Security Questions"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}