import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, ExternalLink, Upload, X, Star, Palette } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { Switch } from "@/components/ui/switch";

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
  date: z.string().optional(),
  lessonsLearned: z.string().optional(),
  customColor: z.string().default("#007AFF"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function AdminProjectsPage() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/admin/portfolio"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      featured: false,
      date: new Date().toISOString().split('T')[0],
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
        technologies: data.technologies.split(',').map(tech => tech.trim()),
        date: new Date(data.date).toISOString(),
        mediaFiles: mediaFiles,
        thumbnailIndex: thumbnailIndex,
        image: mediaFiles[thumbnailIndex] || data.image,
      };
      return await apiRequest("/api/admin/projects", "POST", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      setIsDialogOpen(false);
      reset();
      setEditingProject(null);
      toast({
        title: "Project created",
        description: "The project has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const payload = {
        ...data,
        technologies: data.technologies.split(',').map(tech => tech.trim()),
        date: new Date(data.date).toISOString(),
        mediaFiles: mediaFiles,
        thumbnailIndex: thumbnailIndex,
        image: mediaFiles[thumbnailIndex] || data.image,
      };
      return await apiRequest(`/api/admin/projects/${editingProject.id}`, "PUT", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      setIsDialogOpen(false);
      reset();
      setEditingProject(null);
      toast({
        title: "Project updated",
        description: "The project has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/projects/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    if (editingProject) {
      updateProjectMutation.mutate(data);
    } else {
      createProjectMutation.mutate(data);
    }
  };

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

  const openDialog = (project: any = null) => {
    setEditingProject(project);
    setMediaFiles(project?.mediaFiles || []);
    setThumbnailIndex(project?.thumbnailIndex || 0);
    
    if (project) {
      setValue('title', project.title);
      setValue('slug', project.slug);
      setValue('shortDescription', project.shortDescription);
      setValue('description', project.description);
      setValue('image', project.image);
      setValue('mediaFiles', project.mediaFiles || []);
      setValue('thumbnailIndex', project.thumbnailIndex || 0);
      setValue('technologies', project.technologies?.join(', ') || '');
      setValue('demoUrl', project.demoUrl);
      setValue('codeUrl', project.codeUrl);
      setValue('featured', project.featured || false);
      setValue('date', project.date ? project.date.split('T')[0] : new Date().toISOString().split('T')[0]);
      setValue('lessonsLearned', project.lessonsLearned || '');
    } else {
      reset();
      setMediaFiles([]);
      setThumbnailIndex(0);
    }
    
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    openDialog();
  };

  const handleEdit = (project: any) => {
    openDialog(project);
  };

  const featuredValue = watch("featured");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading projects...</p>
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
                  Project Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your portfolio projects
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreate} className="flex items-center gap-2">
                    <Plus size={16} />
                    Add New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProject ? "Edit Project" : "Create New Project"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    <Label htmlFor="technologies">Technologies (comma separated, optional)</Label>
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

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={featuredValue}
                      onCheckedChange={(checked) => setValue("featured", checked)}
                    />
                    <Label htmlFor="featured">Featured Project</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                    >
                      {editingProject ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project: any) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                {project.featured && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                    Featured
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteProjectMutation.mutate(project.id)}
                      disabled={deleteProjectMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {project.shortDescription}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {(Array.isArray(project.technologies) ? project.technologies : []).slice(0, 3).map((tech: string) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {project.demoUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(project.demoUrl, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink size={14} />
                        Demo
                      </Button>
                    )}
                    {project.codeUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(project.codeUrl, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink size={14} />
                        Code
                      </Button>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(project.date).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {projects?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No projects found</p>
            <Button onClick={handleCreate} className="mt-4">
              Create your first project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}