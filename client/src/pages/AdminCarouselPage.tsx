import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCarouselImageSchema } from "@shared/schema";
import { z } from "zod";
import { ArrowLeft, Upload, Edit, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { Link } from "wouter";

const carouselImageFormSchema = insertCarouselImageSchema.extend({
  image: z.any().optional(),
});

type CarouselImageFormData = z.infer<typeof carouselImageFormSchema>;

export default function AdminCarouselPage() {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: carouselImages = [], isLoading } = useQuery({
    queryKey: ["/api/admin/carousel-images"],
  });

  const form = useForm<CarouselImageFormData>({
    resolver: zodResolver(carouselImageFormSchema),
    defaultValues: {
      title: "",
      caption: "",
      altText: "",
      position: 0,
      isVisible: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log("Making API request to create carousel image");
      const response = await fetch("/api/carousel-images", {
        method: "POST",
        body: data,
      });
      console.log("API response status:", response.status);
      console.log("API response headers:", response.headers);
      
      if (!response.ok) {
        const error = await response.json();
        console.log("API error response:", error);
        throw new Error(error.error || "Failed to create carousel image");
      }
      const result = await response.json();
      console.log("API success response:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/carousel-images"] });
      toast({
        title: "Success",
        description: "Carousel image created successfully",
      });
      form.reset();
      setSelectedImage(null);
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await fetch(`/api/carousel-images/${id}`, {
        method: "PUT",
        body: data,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update carousel image");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/carousel-images"] });
      toast({
        title: "Success",
        description: "Carousel image updated successfully",
      });
      form.reset();
      setSelectedImage(null);
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/carousel-images/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/carousel-images"] });
      toast({
        title: "Success",
        description: "Carousel image deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: number; isVisible: boolean }) => {
      const formData = new FormData();
      formData.append("isVisible", String(isVisible));
      
      const response = await fetch(`/api/carousel-images/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update visibility");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/carousel-images"] });
      toast({
        title: "Success",
        description: "Visibility updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CarouselImageFormData) => {
    console.log("Form submission started with data:", data);
    console.log("File input ref:", fileInputRef.current?.files?.[0]);
    
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("caption", data.caption);
    formData.append("altText", data.altText);
    formData.append("position", String(data.position));
    formData.append("isVisible", String(data.isVisible));

    if (fileInputRef.current?.files?.[0]) {
      formData.append("image", fileInputRef.current.files[0]);
      console.log("Image file attached to form data");
    } else {
      console.log("No image file selected");
    }

    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    if (isEditing && selectedImage) {
      console.log("Updating existing image:", selectedImage.id);
      updateMutation.mutate({ id: selectedImage.id, data: formData });
    } else {
      console.log("Creating new carousel image");
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (image: any) => {
    setSelectedImage(image);
    setIsEditing(true);
    form.setValue("title", image.title);
    form.setValue("caption", image.caption);
    form.setValue("altText", image.altText);
    form.setValue("position", image.position);
    form.setValue("isVisible", image.isVisible);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this carousel image?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleVisibility = (id: number, currentVisibility: boolean) => {
    toggleVisibilityMutation.mutate({ id, isVisible: !currentVisibility });
  };

  const handleCancel = () => {
    setSelectedImage(null);
    setIsEditing(false);
    form.reset();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading carousel images...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Carousel Images</h1>
          </div>
          <p className="text-gray-600">
            Manage the "Life in Pictures" carousel images that appear on the About page.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? "Edit Carousel Image" : "Add New Carousel Image"}
            </h2>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="image">Image File</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  required={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter image title"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  {...form.register("caption")}
                  placeholder="Enter image caption"
                  rows={3}
                />
                {form.formState.errors.caption && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.caption.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="altText">Alt Text</Label>
                <Input
                  id="altText"
                  {...form.register("altText")}
                  placeholder="Enter alt text for accessibility"
                />
                {form.formState.errors.altText && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.altText.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  {...form.register("position", { valueAsNumber: true })}
                  placeholder="Enter position (0 = first)"
                />
                {form.formState.errors.position && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.position.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isVisible"
                  checked={form.watch("isVisible")}
                  onCheckedChange={(checked) => form.setValue("isVisible", checked)}
                />
                <Label htmlFor="isVisible">Visible on site</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    "Saving..."
                  ) : isEditing ? (
                    "Update Image"
                  ) : (
                    "Create Image"
                  )}
                </Button>
                
                {isEditing && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* Images List */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Current Images ({carouselImages.length})
            </h2>
            
            <div className="space-y-4">
              {carouselImages.map((image: any) => (
                <div key={image.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <img
                      src={image.imagePath}
                      alt={image.altText}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{image.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{image.caption}</p>
                    <p className="text-xs text-gray-500">Position: {image.position}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVisibility(image.id, image.isVisible)}
                    >
                      {image.isVisible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(image)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {carouselImages.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No carousel images yet. Create your first one!
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}