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
  Bot
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
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a]">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                onClick={() => setLocation("/admin/resume/upload")}
                className="flex items-center gap-2 bg-[#007AFF] hover:bg-[#0056CC] text-white px-4 py-3 rounded-xl font-medium transition-all duration-200"
              >
                <Upload size={16} />
                Upload Resume
              </Button>
              <Button
                onClick={() => setLocation("/admin/blog/new")}
                className="flex items-center gap-2 bg-[#007AFF] hover:bg-[#0056CC] text-white px-4 py-3 rounded-xl font-medium transition-all duration-200"
              >
                <Edit size={16} />
                Write Blog Post
              </Button>
              <Button
                onClick={() => setLocation("/admin/chatbot")}
                className="flex items-center gap-2 bg-[#007AFF] hover:bg-[#0056CC] text-white px-4 py-3 rounded-xl font-medium transition-all duration-200"
              >
                <Bot size={16} />
                Train Chatbot
              </Button>
              <Button
                onClick={() => setLocation("/")}
                className="flex items-center gap-2 bg-[#007AFF] hover:bg-[#0056CC] text-white px-4 py-3 rounded-xl font-medium transition-all duration-200"
              >
                <Eye size={16} />
                View Live Site
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  Projects
                </p>
                <p className="text-2xl font-bold text-white">
                  {projects?.length || 0}
                </p>
              </div>
              <Folder className="h-8 w-8 text-[#007AFF]" />
            </div>
          </div>

          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  Blog Posts
                </p>
                <p className="text-2xl font-bold text-white">
                  {blogPosts?.length || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-[#34C759]" />
            </div>
          </div>

          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  Contact Messages
                </p>
                <p className="text-2xl font-bold text-white">
                  {contactSubmissions?.length || 0}
                </p>
              </div>
              <Mail className="h-8 w-8 text-[#AF52DE]" />
            </div>
          </div>

          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  Top 5 Lists
                </p>
                <p className="text-2xl font-bold text-white">
                  {topFiveLists?.length || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-[#FF9500]" />
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Management */}
          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Project Management</h3>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <Button 
                onClick={() => setLocation("/admin/projects/new")}
                className="flex-1 bg-[#007AFF] hover:bg-[#0056CC] text-white py-2 px-4 rounded-xl font-medium transition-all duration-200"
              >
                <Plus size={16} className="mr-2" />
                Add New
              </Button>
              <Button 
                onClick={() => setLocation("/admin/projects")}
                className="flex-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white py-2 px-4 rounded-xl font-medium transition-all duration-200"
              >
                <Edit size={16} className="mr-2" />
                Manage
              </Button>
            </div>

            {/* Project List */}
            <div className="space-y-3">
              {projects?.slice(0, 3).map((project: any) => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#3a3a3a]">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {project.title}
                    </p>
                    <p className="text-sm text-gray-300 truncate">
                      {project.shortDescription}
                    </p>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.featured 
                        ? 'bg-[#007AFF] text-white' 
                        : 'bg-[#3a3a3a] text-gray-300'
                    }`}>
                      {project.featured ? "Featured" : "Standard"}
                    </span>
                  </div>
                </div>
              ))}
              {projects?.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No projects found
                </p>
              )}
            </div>
          </div>

          {/* Blog Management */}
          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Blog Management</h3>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <Button 
                onClick={() => setLocation("/admin/blog/new")}
                className="flex-1 bg-[#007AFF] hover:bg-[#0056CC] text-white py-2 px-4 rounded-xl font-medium transition-all duration-200"
              >
                <Plus size={16} className="mr-2" />
                Add New
              </Button>
              <Button 
                onClick={() => setLocation("/admin/blog")}
                className="flex-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white py-2 px-4 rounded-xl font-medium transition-all duration-200"
              >
                <Edit size={16} className="mr-2" />
                Manage
              </Button>
            </div>

            {/* Blog Series Management */}
            <div className="p-4 bg-[#007AFF]/10 rounded-xl border border-[#007AFF]/20 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#007AFF]">
                    Blog Series Management
                  </p>
                  <p className="text-sm text-[#007AFF]/80">
                    Organize posts into series
                  </p>
                </div>
                <Button 
                  onClick={() => setLocation("/admin/blog/series")}
                  className="bg-[#007AFF] hover:bg-[#0056CC] text-white px-4 py-2 rounded-xl font-medium transition-all duration-200"
                >
                  <Edit size={16} className="mr-2" />
                  Manage Series
                </Button>
              </div>
            </div>
            
            {/* Recent Blog Posts */}
            <div className="space-y-3">
              {blogPosts?.slice(0, 2).map((post: any) => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#3a3a3a]">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {post.title}
                    </p>
                    <p className="text-sm text-gray-300 truncate">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.featured 
                        ? 'bg-[#34C759] text-white' 
                        : 'bg-[#3a3a3a] text-gray-300'
                    }`}>
                      {post.featured ? "Featured" : "Standard"}
                    </span>
                  </div>
                </div>
              ))}
              {blogPosts?.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No blog posts found
                </p>
              )}
            </div>
          </div>

          {/* Top 5 Lists Management */}
          <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Top 5 Lists Management</h3>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <Button 
                onClick={() => setLocation("/admin/top5-lists/new")}
                className="flex-1 bg-[#007AFF] hover:bg-[#0056CC] text-white py-2 px-4 rounded-xl font-medium transition-all duration-200"
              >
                <Plus size={16} className="mr-2" />
                Add New
              </Button>
              <Button 
                onClick={() => setLocation("/admin/top5-lists")}
                className="flex-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white py-2 px-4 rounded-xl font-medium transition-all duration-200"
              >
                <Edit size={16} className="mr-2" />
                Manage
              </Button>
            </div>

            {/* Top 5 Lists */}
            <div className="space-y-3">
              {topFiveLists?.slice(0, 3).map((list: any) => (
                <div key={list.id} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#3a3a3a]">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {list.title}
                    </p>
                    <p className="text-sm text-gray-300 truncate">
                      {list.description}
                    </p>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF9500] text-white">
                      List {list.position}
                    </span>
                  </div>
                </div>
              ))}
              {topFiveLists?.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No top 5 lists found
                </p>
              )}
            </div>
          </div>

          {/* Contact Messages */}
          <div className="lg:col-span-3 bg-[#2a2a2a] rounded-2xl p-6 shadow-lg border border-[#3a3a3a]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Recent Contact Messages</h3>
            </div>
            
            <div className="space-y-4">
              {contactSubmissions?.slice(0, 5).map((submission: any) => (
                <div key={submission.id} className="flex items-start justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#3a3a3a]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium text-white">
                        {submission.name}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#AF52DE] text-white">
                        {submission.email}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 font-medium mb-1">
                      {submission.subject}
                    </p>
                    <p className="text-sm text-gray-400 mb-2">
                      {submission.message.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={() => deleteContactMutation.mutate(submission.id)}
                      disabled={deleteContactMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl font-medium transition-all duration-200"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              {contactSubmissions?.length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  No contact messages found
                </p>
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}