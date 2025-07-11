import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  List,
  Eye,
  Settings
} from "lucide-react";

export default function AdminTop5ListsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication first
  const { data: authCheck, isLoading: authLoading, error: authError } = useQuery({
    queryKey: ["/api/admin/check-auth"],
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authError && !authLoading) {
      setLocation("/admin/login");
    }
  }, [authError, authLoading, setLocation]);

  // Fetch Top 5 lists
  const { data: lists, isLoading } = useQuery({
    queryKey: ["/api/admin/top5-lists"],
    enabled: authCheck,
  });

  // Delete list mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/top5-lists/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/top5-lists"] });
      toast({
        title: "List deleted successfully",
        description: "The Top 5 list has been removed",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the list",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Top 5 lists...</p>
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
                onClick={() => setLocation("/admin")}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Top 5 Lists Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your Top 5 lists and their items
                </p>
              </div>
            </div>
            <Button
              onClick={() => setLocation("/admin/top5-lists/new")}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Add New List
            </Button>
          </div>
        </div>
      </div>

      {/* Lists Management */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {lists?.map((list: any) => (
            <Card key={list.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{list.title}</CardTitle>
                  <Badge variant="secondary">
                    Position {list.position}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* List Info */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {list.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: list.color }}
                      />
                      <span className="text-xs text-gray-500">
                        {list.color}
                      </span>
                    </div>
                  </div>

                  {/* Main Image */}
                  {list.mainImage && (
                    <div className="relative">
                      <img
                        src={list.mainImage}
                        alt={list.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-white/80">
                          Main Image
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLocation(`/admin/top5-lists/${list.id}`)}
                      className="flex items-center gap-1"
                    >
                      <Edit size={14} />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLocation(`/admin/top5-lists/${list.id}/items`)}
                      className="flex items-center gap-1"
                    >
                      <List size={14} />
                      Items
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(list.id)}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {lists?.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <List className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Top 5 Lists Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first Top 5 list to get started
              </p>
              <Button
                onClick={() => setLocation("/admin/top5-lists/new")}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Create Your First List
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}