import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, Search, Calendar, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminBlogPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ["/api/blog"],
  });

  const deleteBlogPostMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/blog/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({
        title: "Blog post deleted",
        description: "The blog post has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete blog post",
        variant: "destructive",
      });
    },
  });

  const filteredPosts = blogPosts?.filter((post: any) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading blog posts...</p>
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
                  Blog Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your blog posts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search blog posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                onClick={() => setLocation("/admin/blog/new")}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add New Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts?.map((post: any) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  {post.featured && (
                    <Badge className="bg-yellow-500 text-white">
                      Featured
                    </Badge>
                  )}
                  {post.published ? (
                    <Badge className="bg-green-500 text-white">
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Draft
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setLocation(`/admin/blog/edit/${post.id}`)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteBlogPostMutation.mutate(post.id)}
                      disabled={deleteBlogPostMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {(Array.isArray(post.tags) ? post.tags : []).slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={12} />
                    {post.views || 0} views
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLocation(`/admin/blog/edit/${post.id}`)}
                    className="flex items-center gap-1"
                  >
                    <Edit size={14} />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredPosts?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? "No blog posts match your search" : "No blog posts found"}
            </p>
            <Button onClick={() => setLocation("/admin/blog/new")}>
              Create your first blog post
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}