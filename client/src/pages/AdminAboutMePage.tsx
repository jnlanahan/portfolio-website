import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAboutMeContentSchema } from "@shared/schema";
import type { AboutMeContent, InsertAboutMeContent } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Upload, Eye } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminAboutMePage() {
  const { toast } = useToast();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: aboutMeContent, isLoading } = useQuery<AboutMeContent>({
    queryKey: ['/api/admin/about-me'],
    queryFn: async () => {
      const response = await fetch('/api/admin/about-me');
      if (!response.ok) {
        throw new Error('Failed to fetch About Me content');
      }
      return response.json();
    }
  });

  const form = useForm<InsertAboutMeContent>({
    resolver: zodResolver(insertAboutMeContentSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      bio: '',
      passions: '',
      differentiators: '',
      image: null
    }
  });

  // Update form when data loads
  React.useEffect(() => {
    if (aboutMeContent) {
      form.reset({
        title: aboutMeContent.title || '',
        subtitle: aboutMeContent.subtitle || '',
        bio: aboutMeContent.bio || '',
        passions: aboutMeContent.passions || '',
        differentiators: aboutMeContent.differentiators || '',
        image: aboutMeContent.image || null
      });
    }
  }, [aboutMeContent, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: InsertAboutMeContent) => {
      return await apiRequest('/api/admin/about-me', {
        method: aboutMeContent ? 'PUT' : 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: "About Me content saved successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/about-me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/about-me'] });
    },
    onError: (error) => {
      toast({ 
        title: "Error saving content", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: InsertAboutMeContent) => {
    try {
      // Handle image upload if there's a new image
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadResponse = await fetch('/api/admin/about-me/upload-image', {
          method: 'POST',
          body: formData
        });
        
        if (uploadResponse.ok) {
          const { imagePath } = await uploadResponse.json();
          data.image = imagePath;
        }
      }

      saveMutation.mutate(data);
    } catch (error) {
      toast({ 
        title: "Error saving content", 
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-slate-600 hover:text-slate-800">
                <ArrowLeft size={24} />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Edit About Me Content</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center gap-2"
              >
                <Eye size={16} />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={saveMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {isPreviewMode ? (
            <div className="space-y-8">
              {/* Preview Mode */}
              <div className="text-center">
                <div className="w-48 h-48 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-gray-500">Professional Photo</span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {form.watch('title') || 'Beyond the Resume'}
                </h1>
                <p className="text-lg text-gray-600">
                  {form.watch('subtitle') || 'Here is a little information about me that goes beyond my resume and LinkedIn profile.'}
                </p>
              </div>

              {form.watch('bio') && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Bio</h2>
                  <p className="text-gray-600 leading-relaxed">{form.watch('bio')}</p>
                </div>
              )}

              {form.watch('passions') && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">My Passions</h2>
                  <p className="text-gray-600 leading-relaxed">{form.watch('passions')}</p>
                </div>
              )}

              {form.watch('differentiators') && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">What Sets Me Apart</h2>
                  <p className="text-gray-600 leading-relaxed">{form.watch('differentiators')}</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="Beyond the Resume"
                  className="mt-2"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Subtitle */}
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  {...form.register('subtitle')}
                  placeholder="Here is a little information about me that goes beyond my resume and LinkedIn profile."
                  className="mt-2"
                />
                {form.formState.errors.subtitle && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.subtitle.message}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...form.register('bio')}
                  placeholder="Tell your story..."
                  className="mt-2 min-h-32"
                />
                {form.formState.errors.bio && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.bio.message}</p>
                )}
              </div>

              {/* Passions */}
              <div>
                <Label htmlFor="passions">My Passions</Label>
                <Textarea
                  id="passions"
                  {...form.register('passions')}
                  placeholder="What drives you in your career..."
                  className="mt-2 min-h-32"
                />
                {form.formState.errors.passions && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.passions.message}</p>
                )}
              </div>

              {/* Differentiators */}
              <div>
                <Label htmlFor="differentiators">What Sets Me Apart</Label>
                <Textarea
                  id="differentiators"
                  {...form.register('differentiators')}
                  placeholder="What makes you unique..."
                  className="mt-2 min-h-32"
                />
                {form.formState.errors.differentiators && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.differentiators.message}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="image">Profile Image</Label>
                <div className="mt-2 flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" className="flex items-center gap-2">
                    <Upload size={16} />
                    Upload Image
                  </Button>
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-full" />
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}