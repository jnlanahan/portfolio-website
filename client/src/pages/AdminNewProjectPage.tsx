import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, X, Star, Palette } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  image: z.string().optional(),
  mediaFiles: z.array(z.string()).default([]),
  thumbnailIndex: z.number().default(0),
  technologies: z.string().optional(),
  demoUrl: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: "Must be a valid URL if provided",
  }),
  codeUrl: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: "Must be a valid URL if provided",
  }),
  featured: z.boolean().default(false),
  status: z.enum(["published", "coming_soon", "in_progress"]).default("published"),
  date: z.string().optional(),
  lessonsLearned: z.string().optional(),
  customColor: z.string().default("#007AFF"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function AdminNewProjectPage() {
  const [, setLocation] = useLocation();
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      slug: "",
      shortDescription: "",
      description: "",
      image: "",
      technologies: "",
      demoUrl: "",
      codeUrl: "",
      featured: false,
      status: "published" as const,
      date: new Date().toISOString().split('T')[0],
      lessonsLearned: "",
      mediaFiles: [],
      thumbnailIndex: 0,
      customColor: "#007AFF",
    },
  });

  const uploadFilesMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const newFiles = [...mediaFiles, ...data.files];
      setMediaFiles(newFiles);
      setValue('mediaFiles', newFiles);
      setValue('image', newFiles[thumbnailIndex] || newFiles[0]);
      toast({
        title: "Files uploaded",
        description: `${data.files.length} files uploaded successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const payload = {
        ...data,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        shortDescription: data.shortDescription || data.description.substring(0, 100) + '...',
        image: mediaFiles[thumbnailIndex] || data.image || '/api/placeholder/600/400',
        technologies: data.technologies ? data.technologies.split(',').map(tech => tech.trim()) : [],
        demoUrl: data.demoUrl || '',
        codeUrl: data.codeUrl || '',
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        mediaFiles: mediaFiles,
        thumbnailIndex: thumbnailIndex,
      };
      return await apiRequest("/api/admin/projects", "POST", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({
        title: "Project created",
        description: "The project has been created successfully",
      });
      setLocation("/admin/projects");
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (mediaFiles.length + files.length > 8) {
        toast({
          title: "Too many files",
          description: "Maximum 8 files allowed",
          variant: "destructive",
        });
        return;
      }
      uploadFilesMutation.mutate(files);
    }
  };

  const removeMediaFile = (index: number) => {
    const newFiles = mediaFiles.filter((_, i) => i !== index);
    setMediaFiles(newFiles);
    setValue('mediaFiles', newFiles);
    
    // Update thumbnail index if necessary
    if (thumbnailIndex >= newFiles.length) {
      setThumbnailIndex(Math.max(0, newFiles.length - 1));
    }
    
    // Update image field
    setValue('image', newFiles[thumbnailIndex] || newFiles[0] || '');
  };

  const setThumbnail = (index: number) => {
    setThumbnailIndex(index);
    setValue('thumbnailIndex', index);
    setValue('image', mediaFiles[index]);
  };

  const onSubmit = (data: ProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  const featuredValue = watch("featured");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/admin/projects")}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Projects
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create New Project
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add a new project to your portfolio
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
            <CardTitle>Project Details</CardTitle>
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
                  <Label htmlFor="slug">Slug (optional)</Label>
                  <Input
                    id="slug"
                    {...register("slug")}
                    className={errors.slug ? "border-red-500" : ""}
                    placeholder="Auto-generated from title if empty"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-500">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description (optional)</Label>
                <Textarea
                  id="shortDescription"
                  {...register("shortDescription")}
                  className={errors.shortDescription ? "border-red-500" : ""}
                  rows={2}
                  placeholder="Auto-generated from description if empty"
                />
                {errors.shortDescription && (
                  <p className="text-sm text-red-500">{errors.shortDescription.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Rich Text)</Label>
                <RichTextEditor
                  content={watch("description") || ""}
                  onChange={(content) => setValue("description", content)}
                  placeholder="Enter a detailed description of your project..."
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL (optional)</Label>
                <Input
                  id="image"
                  {...register("image")}
                  className={errors.image ? "border-red-500" : ""}
                  placeholder="Default placeholder image will be used if empty"
                />
                {errors.image && (
                  <p className="text-sm text-red-500">{errors.image.message}</p>
                )}
              </div>

              {/* Media Files Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Media Files (Max 8)</Label>
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <Upload size={16} />
                    Upload Files
                  </Label>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,video/*,.gif"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadFilesMutation.isPending}
                  />
                </div>

                {uploadFilesMutation.isPending && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Uploading files...
                  </div>
                )}

                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                          {file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={file}
                              alt={`Media ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={file}
                              className="w-full h-full object-cover"
                              muted
                              controls={false}
                            />
                          )}
                        </div>
                        
                        {/* Thumbnail indicator */}
                        {thumbnailIndex === index && (
                          <div className="absolute top-1 left-1 bg-yellow-500 text-white p-1 rounded-full">
                            <Star size={12} fill="currentColor" />
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setThumbnail(index)}
                            className="p-2"
                            title="Set as thumbnail"
                          >
                            <Star size={14} />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removeMediaFile(index)}
                            className="p-2"
                            title="Remove file"
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {mediaFiles.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      No media files uploaded yet
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Supports images, videos, and GIFs (max 8 files)
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="technologies">Technologies (optional, comma separated)</Label>
                <Input
                  id="technologies"
                  {...register("technologies")}
                  className={errors.technologies ? "border-red-500" : ""}
                  placeholder="React, TypeScript, Node.js"
                />
                {errors.technologies && (
                  <p className="text-sm text-red-500">{errors.technologies.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customColor">Custom Theme Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="customColor"
                    type="color"
                    {...register("customColor")}
                    className="w-16 h-10 p-1 border rounded cursor-pointer"
                  />
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type="text"
                      value={watch("customColor") || "#007AFF"}
                      onChange={(e) => setValue("customColor", e.target.value)}
                      placeholder="#007AFF"
                      className="max-w-24"
                    />
                    <span className="text-sm text-gray-500">This color will be used for the project tile theme</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="demoUrl">Demo URL (optional)</Label>
                  <Input
                    id="demoUrl"
                    {...register("demoUrl")}
                    className={errors.demoUrl ? "border-red-500" : ""}
                    placeholder="https://your-demo-url.com"
                  />
                  {errors.demoUrl && (
                    <p className="text-sm text-red-500">{errors.demoUrl.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codeUrl">Code URL (optional)</Label>
                  <Input
                    id="codeUrl"
                    {...register("codeUrl")}
                    className={errors.codeUrl ? "border-red-500" : ""}
                    placeholder="https://github.com/username/repo"
                  />
                  {errors.codeUrl && (
                    <p className="text-sm text-red-500">{errors.codeUrl.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date (optional)</Label>
                  <Input
                    id="date"
                    type="date"
                    {...register("date")}
                    className={errors.date ? "border-red-500" : ""}
                    placeholder="Current date will be used if empty"
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500">{errors.date.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonsLearned">Lessons Learned (optional)</Label>
                  <Input
                    id="lessonsLearned"
                    {...register("lessonsLearned")}
                    placeholder="Key lessons learned from this project"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="flex items-center space-x-2 mt-7">
                  <Switch
                    id="featured"
                    checked={featuredValue}
                    onCheckedChange={(checked) => setValue("featured", checked)}
                  />
                  <Label htmlFor="featured">Featured Project</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/admin/projects")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}