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
  Eye
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!adminStatus?.isAdmin) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your portfolio content
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Projects
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {projects?.length || 0}
                  </p>
                </div>
                <Folder className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Blog Posts
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {blogPosts?.length || 0}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Contact Messages
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {contactSubmissions?.length || 0}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Admin Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    1
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Project Management</span>
                <Button size="sm" onClick={() => setLocation("/admin/projects")}>
                  <Plus size={16} className="mr-2" />
                  Manage Projects
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects?.slice(0, 3).map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {project.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {project.shortDescription}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {project.featured ? "Featured" : "Standard"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {projects?.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No projects found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Blog Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Blog Management</span>
                <Button size="sm" onClick={() => setLocation("/admin/blog")}>
                  <Plus size={16} className="mr-2" />
                  Manage Blog
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blogPosts?.slice(0, 3).map((post: any) => (
                  <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {post.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {post.featured ? "Featured" : "Standard"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {blogPosts?.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No blog posts found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Messages */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Contact Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contactSubmissions?.slice(0, 5).map((submission: any) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {submission.name}
                        </p>
                        <Badge variant="outline">{submission.email}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {submission.subject}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {submission.message.substring(0, 100)}...
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteContactMutation.mutate(submission.id)}
                        disabled={deleteContactMutation.isPending}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                {contactSubmissions?.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No contact messages found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setLocation("/admin/resume")}
                  className="flex items-center gap-2"
                >
                  <FileText size={16} />
                  Edit Resume
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/admin/blog")}
                  className="flex items-center gap-2"
                >
                  <Edit size={16} />
                  Write Blog Post
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="flex items-center gap-2"
                >
                  <Eye size={16} />
                  View Live Site
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}