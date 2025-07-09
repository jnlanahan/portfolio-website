import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, X } from "lucide-react";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  coverImage: z.string().min(1, "Cover image is required"),
  tags: z.string().min(1, "Tags are required"),
  category: z.string().min(1, "Category is required"),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  date: z.string().min(1, "Date is required"),
});

type BlogFormData = z.infer<typeof blogSchema>;

export default function AdminNewBlogPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      featured: false,
      published: true,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const createBlogMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      const payload = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()),
        date: new Date(data.date).toISOString(),
      };
      return await apiRequest("/api/admin/blog", "POST", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({
        title: "Blog post created",
        description: "The blog post has been created successfully",
      });
      setLocation("/admin/blog");
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

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

  const onSubmit = (data: BlogFormData) => {
    createBlogMutation.mutate({
      ...data,
      content: content,
      coverImage: coverImage || data.coverImage,
    });
  };

  const featuredValue = watch("featured");
  const publishedValue = watch("published");

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
                  Create New Blog Post
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add a new blog post to your website
                </p>
              </div>
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    {...register("slug")}
                    className={errors.slug ? "border-red-500" : ""}
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-500">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  {...register("excerpt")}
                  className={errors.excerpt ? "border-red-500" : ""}
                  rows={3}
                />
                {errors.excerpt && (
                  <p className="text-sm text-red-500">{errors.excerpt.message}</p>
                )}
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
              </div>

              <div className="space-y-2">
                <Label>Cover Image</Label>
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
                  <Label htmlFor="tags">Tags (comma separated)</Label>
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
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    {...register("category")}
                    className={errors.category ? "border-red-500" : ""}
                  />
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Publication Date</Label>
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

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={featuredValue}
                    onCheckedChange={(checked) => setValue("featured", checked)}
                  />
                  <Label htmlFor="featured">Featured Post</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={publishedValue}
                    onCheckedChange={(checked) => setValue("published", checked)}
                  />
                  <Label htmlFor="published">Published</Label>
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
                  type="submit"
                  disabled={createBlogMutation.isPending}
                >
                  {createBlogMutation.isPending ? "Creating..." : "Create Blog Post"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}