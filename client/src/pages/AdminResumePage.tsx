import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Eye } from "lucide-react";

const resumeSchema = z.object({
  content: z.string().min(1, "Resume content is required"),
});

type ResumeFormData = z.infer<typeof resumeSchema>;

export default function AdminResumePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState(false);

  const { data: resume, isLoading } = useQuery({
    queryKey: ["/api/admin/resume"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      content: resume?.content || "",
    },
  });

  const updateResumeMutation = useMutation({
    mutationFn: async (data: ResumeFormData) => {
      return await apiRequest("/api/admin/resume", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/resume"] });
      toast({
        title: "Resume updated",
        description: "Your resume has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update resume",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResumeFormData) => {
    updateResumeMutation.mutate(data);
  };

  const contentValue = watch("content");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/admin/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Resume Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Edit your resume content
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPreview(!preview)}
                className="flex items-center gap-2"
              >
                <Eye size={16} />
                {preview ? "Edit" : "Preview"}
              </Button>
              <Button
                form="resume-form"
                type="submit"
                disabled={updateResumeMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {updateResumeMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Editor */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Resume Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="resume-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Resume Content (Markdown supported)</Label>
                  <Textarea
                    id="content"
                    {...register("content")}
                    className={`min-h-[500px] font-mono text-sm ${errors.content ? "border-red-500" : ""}`}
                    placeholder="Write your resume content here using Markdown..."
                    defaultValue={resume?.content || ""}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500">{errors.content.message}</p>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-2">Markdown tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li># Header 1, ## Header 2, ### Header 3</li>
                    <li>**Bold text** and *italic text*</li>
                    <li>- Bullet points</li>
                    <li>1. Numbered lists</li>
                    <li>[Link text](https://example.com)</li>
                  </ul>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[500px] prose dark:prose-invert max-w-none">
                {contentValue ? (
                  <div
                    className="whitespace-pre-wrap text-sm"
                    dangerouslySetInnerHTML={{
                      __html: contentValue
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
                        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
                        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2">$1</h3>')
                        .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
                    }}
                  />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    Start typing to see a preview...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Usage Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your resume content will be available through the API and can be used to generate PDFs or display on your website.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm">
                <h4 className="font-semibold mb-2">API Endpoint:</h4>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  GET /api/admin/resume
                </code>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  This endpoint will return your resume content for use in applications or PDF generation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}