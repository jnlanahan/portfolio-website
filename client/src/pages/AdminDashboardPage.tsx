import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  FileText, 
  Folder, 
  Mail, 
  LogOut, 
  Edit,
  Trash2,
  Plus,
  Eye,
  Upload,
  Bot,
  Settings,
  Clock
} from "lucide-react";

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/admin/logout", "POST");
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin panel",
      });
      setLocation("/admin/login");
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    },
  });

  // Fetch dashboard data
  const { data: projects } = useQuery({
    queryKey: ["/api/portfolio"],
    enabled: adminStatus?.isAdmin,
  });

  const { data: blogPosts } = useQuery({
    queryKey: ["/api/blog"],
    enabled: adminStatus?.isAdmin,
  });

  const { data: contactSubmissions } = useQuery({
    queryKey: ["/api/admin/contact"],
    enabled: adminStatus?.isAdmin,
  });

  const { data: topFiveLists } = useQuery({
    queryKey: ["/api/admin/top5-lists"],
    enabled: adminStatus?.isAdmin,
  });



  // Delete contact submission
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/contact/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact"] });
      toast({
        title: "Contact submission deleted",
        description: "The contact submission has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the contact submission",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
          <p className="text-white">Loading admin dashboard...</p>
        </div>
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
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-300">
                Manage your portfolio content
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <LogOut size={16} />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Dashboard Tiles - 2 Column, 4 Row Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Resume Upload Tile */}
          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a] hover:border-[#007AFF] transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Resume</h3>
                <p className="text-sm text-gray-300">Upload & manage resume</p>
              </div>
              <Upload className="h-8 w-8 text-[#007AFF]" />
            </div>
            <Button
              onClick={() => setLocation("/admin/resume/upload")}
              className="w-full bg-[#007AFF] hover:bg-[#0056CC] text-white font-medium rounded-xl"
            >
              Upload Resume
            </Button>
          </div>

          {/* System Prompts Tile */}
          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a] hover:border-[#AF52DE] transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">System Prompts</h3>
                <p className="text-sm text-gray-300">Configure AI responses</p>
              </div>
              <Settings className="h-8 w-8 text-[#AF52DE]" />
            </div>
            <Button
              onClick={() => setLocation("/admin/system-prompts")}
              className="w-full bg-[#AF52DE] hover:bg-[#8A2BE2] text-white font-medium rounded-xl"
            >
              System Prompts
            </Button>
          </div>

          {/* Chatbot Training Tile */}
          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a] hover:border-[#007AFF] transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Train Chatbot</h3>
                <p className="text-sm text-gray-300">Improve AI responses</p>
              </div>
              <Bot className="h-8 w-8 text-[#007AFF]" />
            </div>
            <Button
              onClick={() => setLocation("/admin/chatbot")}
              className="w-full bg-[#007AFF] hover:bg-[#0056CC] text-white font-medium rounded-xl"
            >
              Train Chatbot
            </Button>
          </div>

          {/* LangChain AI Tile */}
          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a] hover:border-[#34C759] transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">LangChain AI</h3>
                <p className="text-sm text-gray-300">Advanced AI management</p>
              </div>
              <Bot className="h-8 w-8 text-[#34C759]" />
            </div>
            <Button
              onClick={() => setLocation("/admin/langchain")}
              className="w-full bg-[#34C759] hover:bg-[#28A745] text-white font-medium rounded-xl"
            >
              LangChain AI
            </Button>
          </div>

          {/* View Live Site Tile */}
          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a] hover:border-[#007AFF] transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Live Site</h3>
                <p className="text-sm text-gray-300">View public website</p>
              </div>
              <Eye className="h-8 w-8 text-[#007AFF]" />
            </div>
            <Button
              onClick={() => setLocation("/")}
              className="w-full bg-[#007AFF] hover:bg-[#0056CC] text-white font-medium rounded-xl"
            >
              View Live Site
            </Button>
          </div>

          {/* Project Management */}
          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a] hover:border-[#007AFF] transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Project Management</h3>
                <p className="text-sm text-gray-300">{projects?.length || 0} projects</p>
              </div>
              <Folder className="h-8 w-8 text-[#007AFF]" />
            </div>
            <Button
              onClick={() => setLocation("/admin/projects")}
              className="w-full bg-[#007AFF] hover:bg-[#0056CC] text-white font-medium rounded-xl"
            >
              Manage Projects
            </Button>
          </div>

          {/* Blog Management */}
          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a] hover:border-[#34C759] transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Blog Management</h3>
                <p className="text-sm text-gray-300">{blogPosts?.length || 0} posts</p>
              </div>
              <FileText className="h-8 w-8 text-[#34C759]" />
            </div>
            <Button
              onClick={() => setLocation("/admin/blog")}
              className="w-full bg-[#34C759] hover:bg-[#28A745] text-white font-medium rounded-xl"
            >
              Manage Blog
            </Button>
          </div>

          {/* Top 5 Lists Management */}
          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a] hover:border-[#FF9500] transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Top 5 Lists Management</h3>
                <p className="text-sm text-gray-300">{topFiveLists?.length || 0} lists</p>
              </div>
              <Users className="h-8 w-8 text-[#FF9500]" />
            </div>
            <Button
              onClick={() => setLocation("/admin/top5-lists")}
              className="w-full bg-[#FF9500] hover:bg-[#E6850E] text-white font-medium rounded-xl"
            >
              Manage Top 5 Lists
            </Button>
          </div>
        </div>

        {/* Contact Messages Overview */}
        <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Contact Messages</h3>
              <p className="text-sm text-gray-300">{contactSubmissions?.length || 0} messages</p>
            </div>
            <Mail className="h-8 w-8 text-[#007AFF]" />
          </div>
          <div className="space-y-3">
            {contactSubmissions?.slice(0, 3).map((submission: any) => (
              <div key={submission.id} className="flex items-start justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#3a3a3a]">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium text-white">{submission.name}</p>
                    <Badge className="bg-[#007AFF] text-white text-xs">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-300 mb-1">{submission.email}</p>
                  <p className="text-xs text-gray-400 line-clamp-2">{submission.message}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    onClick={() => deleteContactMutation.mutate(submission.id)}
                    disabled={deleteContactMutation.isPending}
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
            {contactSubmissions?.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No contact messages found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}