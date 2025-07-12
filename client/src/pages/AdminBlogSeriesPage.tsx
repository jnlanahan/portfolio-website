import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Plus, Edit, Trash2, BookOpen, Users, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { BlogSeries } from '@shared/schema';

interface BlogSeriesFormData {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  featured: boolean;
  published: boolean;
  position: number;
}

export default function AdminBlogSeriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<BlogSeries | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<BlogSeries | null>(null);
  const [formData, setFormData] = useState<BlogSeriesFormData>({
    title: '',
    slug: '',
    description: '',
    coverImage: '',
    featured: false,
    published: false,
    position: 0
  });

  // Fetch all blog series
  const { data: series = [], isLoading, error } = useQuery({
    queryKey: ['/api/blog/series'],
    queryFn: () => apiRequest('/api/blog/series'),
  });

  // Create series mutation
  const createSeriesMutation = useMutation({
    mutationFn: (data: BlogSeriesFormData) => 
      apiRequest('/api/admin/blog/series', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/series'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Blog series created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create series",
        variant: "destructive",
      });
    },
  });

  // Update series mutation
  const updateSeriesMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BlogSeriesFormData> }) =>
      apiRequest(`/api/admin/blog/series/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/series'] });
      setEditingSeries(null);
      resetForm();
      toast({
        title: "Success",
        description: "Blog series updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update series",
        variant: "destructive",
      });
    },
  });

  // Delete series mutation
  const deleteSeriesMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/blog/series/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/series'] });
      toast({
        title: "Success",
        description: "Blog series deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete series",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      coverImage: '',
      featured: false,
      published: false,
      position: 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSeries) {
      updateSeriesMutation.mutate({ id: editingSeries.id, data: formData });
    } else {
      createSeriesMutation.mutate(formData);
    }
  };

  const handleEdit = (series: BlogSeries) => {
    setEditingSeries(series);
    setFormData({
      title: series.title,
      slug: series.slug,
      description: series.description || '',
      coverImage: series.coverImage || '',
      featured: series.featured,
      published: series.published,
      position: series.position
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (series: BlogSeries) => {
    setSeriesToDelete(series);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (seriesToDelete) {
      deleteSeriesMutation.mutate(seriesToDelete.id);
      setDeleteConfirmOpen(false);
      setSeriesToDelete(null);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/admin")}
            className="gap-2 text-gray-600 hover:text-gray-900 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Series Management</h1>
            <p className="text-gray-600 mt-2">Organize your blog posts into series for better navigation</p>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading blog series: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
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
                className="gap-2 text-gray-300 hover:text-white -ml-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Admin Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Blog Series Management
                </h1>
                <p className="text-sm text-gray-300">
                  Organize your blog posts into series
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gray-300">Organize your blog posts into series for better navigation</p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 bg-[#007AFF] hover:bg-[#0056CC] text-white px-4 py-2 rounded-xl font-medium transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Create New Series
          </Button>
        </div>

      {series.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No blog series yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Create your first blog series to organize related posts together
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Series
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {series.map((series: BlogSeries) => (
            <Card key={series.id} className="relative hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                      {series.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1 truncate">/{series.slug}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(series)}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                      title="Edit series"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(series)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete series"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {series.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {series.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant={series.published ? "default" : "secondary"}>
                    {series.published ? "Published" : "Draft"}
                  </Badge>
                  {series.featured && (
                    <Badge variant="outline">
                      Featured
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Position: {series.position}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSeries ? 'Edit Blog Series' : 'Create New Blog Series'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  placeholder="Enter series title"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                  placeholder="url-slug"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this series is about..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                type="number"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">Featured Series</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                />
                <Label htmlFor="published">Published</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingSeries(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createSeriesMutation.isPending || updateSeriesMutation.isPending}
              >
                {createSeriesMutation.isPending || updateSeriesMutation.isPending
                  ? 'Saving...'
                  : editingSeries
                  ? 'Update Series'
                  : 'Create Series'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Blog Series</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to delete "{seriesToDelete?.title}"? This action cannot be undone.
              </p>
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This will permanently delete the series and any associated data.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setSeriesToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteSeriesMutation.isPending}
              >
                {deleteSeriesMutation.isPending ? 'Deleting...' : 'Delete Series'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}