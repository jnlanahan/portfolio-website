import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import AIContentPolisher from "@/components/AIContentPolisher";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, X, FileText, Download } from "lucide-react";

const blogSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
  seriesId: z.string().optional(), // Series selection
  featured: z.boolean().default(false),
  published: z.boolean().default(false), // Default to draft mode
  status: z.enum(["published", "coming_soon", "in_progress"]).default("published"),
  date: z.string().optional(),
});

const publishedBlogSchema = blogSchema.extend({
  title: z.string().min(1, "Title is required for published posts"),
  slug: z.string().min(1, "Slug is required for published posts"),
  excerpt: z.string().min(1, "Excerpt is required for published posts"),
  content: z.string().min(1, "Content is required for published posts"),
  coverImage: z.string().min(1, "Cover image is required for published posts"),
  tags: z.string().min(1, "Tags are required for published posts"),
  category: z.string().min(1, "Category is required for published posts"),
  date: z.string().min(1, "Date is required for published posts"),
});

type BlogFormData = z.infer<typeof blogSchema>;

export default function AdminNewBlogPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Check if we're in edit mode
  const [match, params] = useRoute("/admin/blog/edit/:id");
  const isEditMode = !!match;
  const blogId = params?.id ? parseInt(params.id) : null;
  
  // Fetch existing blog post data if editing
  const { data: existingPost, isLoading: isLoadingPost } = useQuery({
    queryKey: [`/api/blog/${blogId}`],
    enabled: isEditMode && !!blogId,
  });

  // Fetch available blog series
  const { data: blogSeries = [] } = useQuery({
    queryKey: ['/api/blog/series'],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
    reset,
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema), // Always use the basic schema
    defaultValues: {
      featured: false,
      published: false, // Default to draft mode
      status: "published" as const,
      date: new Date().toISOString().split('T')[0],
      seriesId: "",
    },
  });
  
  // Update form when existing post data is loaded
  useEffect(() => {
    if (existingPost && isEditMode) {
      const postData = existingPost;
      reset({
        title: postData.title || "",
        slug: postData.slug || "",
        excerpt: postData.excerpt || "",
        coverImage: postData.coverImage || "",
        tags: Array.isArray(postData.tags) ? postData.tags.join(", ") : "",
        category: postData.category || "",
        seriesId: postData.seriesId ? postData.seriesId.toString() : "",
        featured: postData.featured || false,
        published: postData.published || false,
        status: postData.status || "published",
        date: postData.date ? new Date(postData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
      setContent(postData.content || "");
      setCoverImage(postData.coverImage || "");
    }
  }, [existingPost, isEditMode, reset]);

  const createBlogMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditMode && blogId) {
        return await apiRequest(`/api/admin/blog/${blogId}`, "PUT", payload);
      } else {
        return await apiRequest("/api/admin/blog", "POST", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: [`/api/blog/${blogId}`] });
      }
      toast({
        title: isEditMode ? "Blog post updated" : "Blog post created",
        description: isEditMode ? "The blog post has been updated successfully" : "The blog post has been created successfully",
      });
      setLocation("/admin/blog");
    },
    onError: (error: any) => {
      toast({
        title: isEditMode ? "Update failed" : "Creation failed",
        description: error.message || (isEditMode ? "Failed to update blog post" : "Failed to create blog post"),
        variant: "destructive",
      });
    },
  });

  const importMarkdownMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('markdown', file);
      
      const response = await fetch('/api/admin/blog/import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to import markdown');
      }
      
      return response.json();
    },
    onSuccess: (response) => {
      const { data } = response;
      
      // Populate form with imported data
      reset({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags,
        category: data.category,
        featured: data.featured,
        published: data.published,
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
      
      setContent(data.content);
      setCoverImage(data.coverImage);
      
      toast({
        title: "Success",
        description: "Markdown file imported successfully",
      });
    },
    onError: (error) => {
      console.error('Error importing markdown:', error);
      toast({
        title: "Error",
        description: "Failed to import markdown file",
        variant: "destructive",
      });
    },
  });

  const handleMarkdownImport = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsImporting(true);
    try {
      const file = files[0];
      if (!file.name.endsWith('.md')) {
        toast({
          title: "Invalid file",
          description: "Please select a .md file",
          variant: "destructive",
        });
        return;
      }

      importMarkdownMutation.mutate(file);
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import markdown file",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (data.files && data.files.length > 0) {
        setCoverImage(data.files[0]);
        setValue("coverImage", data.files[0]);
        toast({
          title: "Upload successful",
          description: "Cover image uploaded successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload cover image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSaveDraft = (data: BlogFormData) => {
    const payload = {
      ...data,
      content: content,
      coverImage: coverImage || data.coverImage,
      published: false,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      seriesId: data.seriesId && data.seriesId !== "" ? parseInt(data.seriesId) : null,
    };
    
    createBlogMutation.mutate(payload);
  };

  const onPublish = (data: BlogFormData) => {
    // Validate required fields for published posts
    const validationResult = publishedBlogSchema.safeParse({
      ...data,
      content: content,
      coverImage: coverImage || data.coverImage,
    });

    if (!validationResult.success) {
      // Show validation errors
      validationResult.error.errors.forEach((error) => {
        toast({
          title: "Validation Error",
          description: `${error.path.join('.')}: ${error.message}`,
          variant: "destructive",
        });
      });
      return;
    }

    const payload = {
      ...data,
      content: content,
      coverImage: coverImage || data.coverImage,
      published: true,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      seriesId: data.seriesId && data.seriesId !== "" ? parseInt(data.seriesId) : null,
    };
    
    createBlogMutation.mutate(payload);
  };

  const featuredValue = watch("featured");

  // Show loading state when fetching existing post
  if (isEditMode && isLoadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading blog post...</p>
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
                onClick={() => setLocation("/admin/blog")}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Blog
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditMode ? "Edit Blog Post" : "Create New Blog Post"}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isEditMode ? "Edit and update your blog post" : "Add a new blog post to your website"}
                </p>
              </div>
            </div>
            
            {/* Markdown Import/Export Actions */}
            <div className="flex items-center gap-2">
              {!isEditMode && (
                <div>
                  <input
                    type="file"
                    accept=".md"
                    onChange={(e) => handleMarkdownImport(e.target.files)}
                    className="hidden"
                    id="markdown-import"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('markdown-import')?.click()}
                    disabled={isImporting}
                    className="flex items-center gap-2"
                  >
                    <FileText size={16} />
                    {isImporting ? "Importing..." : "Import Markdown"}
                  </Button>
                </div>
              )}
              
              {isEditMode && blogId && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`/api/admin/blog/${blogId}/export`, '_blank')}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Export Markdown
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Blog Post Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-gray-500 text-sm">(optional)</span></Label>
                  <Input
                    id="title"
                    {...register("title")}
                    className={errors.title ? "border-red-500" : ""}
                    placeholder="Enter blog post title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug <span className="text-gray-500 text-sm">(optional)</span></Label>
                  <Input
                    id="slug"
                    {...register("slug")}
                    className={errors.slug ? "border-red-500" : ""}
                    placeholder="url-friendly-slug"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-500">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt <span className="text-gray-500 text-sm">(optional)</span></Label>
                <Textarea
                  id="excerpt"
                  {...register("excerpt")}
                  className={errors.excerpt ? "border-red-500" : ""}
                  rows={3}
                  placeholder="Brief description of the blog post"
                />
                {errors.excerpt && (
                  <p className="text-sm text-red-500">{errors.excerpt.message}</p>
                )}
                
                {/* AI Content Polisher for Excerpt */}
                <div className="mt-2">
                  <AIContentPolisher 
                    content={watch("excerpt") || ""}
                    onContentChange={(newContent) => setValue("excerpt", newContent)}
                    contentType="excerpt"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your blog post..."
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content.message}</p>
                )}
                
                {/* AI Content Polisher */}
                <div className="mt-4">
                  <AIContentPolisher 
                    content={content}
                    onContentChange={setContent}
                    contentType="blog"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cover Image <span className="text-gray-500 text-sm">(optional)</span></Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files;
                          handleFileUpload(files);
                        };
                        input.click();
                      }}
                      disabled={isUploading}
                      className="flex items-center gap-2"
                    >
                      <Upload size={16} />
                      {isUploading ? 'Uploading...' : 'Upload Cover Image'}
                    </Button>
                    <span className="text-sm text-gray-600">
                      or enter URL manually
                    </span>
                  </div>
                  
                  {coverImage && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <img 
                        src={coverImage} 
                        alt="Cover preview" 
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Cover Image</p>
                        <p className="text-xs text-gray-600 truncate">{coverImage}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCoverImage("");
                          setValue("coverImage", "");
                        }}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="coverImageUrl">Or enter URL manually</Label>
                    <Input
                      id="coverImageUrl"
                      {...register("coverImage")}
                      className={errors.coverImage ? "border-red-500" : ""}
                      placeholder="https://example.com/image.jpg"
                      onChange={(e) => {
                        const value = e.target.value;
                        setCoverImage(value);
                      }}
                    />
                    {errors.coverImage && (
                      <p className="text-sm text-red-500">{errors.coverImage.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags <span className="text-gray-500 text-sm">(optional)</span></Label>
                  <Input
                    id="tags"
                    {...register("tags")}
                    className={errors.tags ? "border-red-500" : ""}
                    placeholder="React, JavaScript, Web Development"
                  />
                  {errors.tags && (
                    <p className="text-sm text-red-500">{errors.tags.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-gray-500 text-sm">(optional)</span></Label>
                  <Input
                    id="category"
                    {...register("category")}
                    className={errors.category ? "border-red-500" : ""}
                    placeholder="Technology, Tutorial, etc."
                  />
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seriesId">Blog Series <span className="text-gray-500 text-sm">(optional)</span></Label>
                <Select
                  value={watch("seriesId") || "none"}
                  onValueChange={(value) => setValue("seriesId", value === "none" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a series (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {blogSeries.map((series: any) => (
                      <SelectItem key={series.id} value={series.id.toString()}>
                        {series.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Organize this post as part of a series
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Publication Date <span className="text-gray-500 text-sm">(optional)</span></Label>
                  <Input
                    id="date"
                    type="date"
                    {...register("date")}
                    className={errors.date ? "border-red-500" : ""}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500">{errors.date.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={watch("status")} onValueChange={(value: "published" | "coming_soon" | "in_progress") => setValue("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="coming_soon">Coming Soon</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={featuredValue}
                    onCheckedChange={(checked) => setValue("featured", checked)}
                  />
                  <Label htmlFor="featured">Featured Post</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/admin/blog")}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSubmit(onSaveDraft)}
                  disabled={createBlogMutation.isPending}
                >
                  {createBlogMutation.isPending 
                    ? (isEditMode ? "Updating..." : "Saving...") 
                    : (isEditMode ? "Update as Draft" : "Save as Draft")}
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit(onPublish)}
                  disabled={createBlogMutation.isPending}
                >
                  {createBlogMutation.isPending 
                    ? (isEditMode ? "Updating..." : "Publishing...") 
                    : (isEditMode ? "Update & Publish" : "Publish")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}