import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAboutMeContentSchema } from "@shared/schema";
import type { AboutMeContent, InsertAboutMeContent } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Upload, Camera } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminAboutMePage() {
  const { toast } = useToast();
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [lifePicturesImageFile, setLifePicturesImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [lifePicturesImagePreview, setLifePicturesImagePreview] = useState<string | null>(null);

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
      heroImage: null,
      lifePicturesTitle: 'Life in Pictures',
      lifePicturesImage: null,
      lifePicturesCaption: 'Leading Teams',
      lifePicturesDescription: 'Working with my team at EY'
    }
  });

  // Update form when data loads
  React.useEffect(() => {
    if (aboutMeContent) {
      form.reset({
        heroImage: aboutMeContent.heroImage || null,
        lifePicturesTitle: aboutMeContent.lifePicturesTitle || 'Life in Pictures',
        lifePicturesImage: aboutMeContent.lifePicturesImage || null,
        lifePicturesCaption: aboutMeContent.lifePicturesCaption || 'Leading Teams',
        lifePicturesDescription: aboutMeContent.lifePicturesDescription || 'Working with my team at EY'
      });
    }
  }, [aboutMeContent, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<InsertAboutMeContent>) => {
      const response = await fetch('/api/admin/about-me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save About Me content');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/about-me'] });
      toast({
        title: "Success",
        description: "About Me content saved successfully",
      });
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save About Me content",
        variant: "destructive",
      });
    }
  });

  const handleHeroImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setHeroImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setHeroImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLifePicturesImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLifePicturesImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLifePicturesImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, fieldName: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldName', fieldName);
    
    const response = await fetch('/api/admin/about-me/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    return response.json();
  };

  const uploadImageMutation = useMutation({
    mutationFn: async ({ file, fieldName }: { file: File; fieldName: string }) => {
      return uploadImage(file, fieldName);
    },
    onSuccess: (data, variables) => {
      // Update the form with the new image path
      if (variables.fieldName === 'heroImage') {
        form.setValue('heroImage', data.imagePath);
        setHeroImageFile(null);
        setHeroImagePreview(null);
      } else if (variables.fieldName === 'lifePicturesImage') {
        form.setValue('lifePicturesImage', data.imagePath);
        setLifePicturesImageFile(null);
        setLifePicturesImagePreview(null);
      }
      
      // Save the form automatically after image upload
      const formData = form.getValues();
      saveMutation.mutate(formData);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  });

  const handleSave = async () => {
    // Upload images first if they exist
    if (heroImageFile) {
      await uploadImageMutation.mutateAsync({ file: heroImageFile, fieldName: 'heroImage' });
    }
    if (lifePicturesImageFile) {
      await uploadImageMutation.mutateAsync({ file: lifePicturesImageFile, fieldName: 'lifePicturesImage' });
    }
    
    // Save the form data
    const formData = form.getValues();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="text-white hover:bg-[#2a2a2a]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Edit About Me Page</h1>
              <p className="text-gray-400 mt-2">Manage the hero image and Life in Pictures section</p>
            </div>
          </div>
          <Button 
            onClick={handleSave}
            disabled={saveMutation.isPending || uploadImageMutation.isPending}
            className="bg-[#007AFF] hover:bg-[#0056CC] text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hero Image Section */}
          <div className="bg-[#2a2a2a] p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Hero Image
            </h2>
            
            <div className="space-y-4">
              <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
                {heroImagePreview ? (
                  <img src={heroImagePreview} alt="Hero preview" className="w-full h-full object-cover" />
                ) : aboutMeContent?.heroImage ? (
                  <img src={aboutMeContent.heroImage} alt="Current hero" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image uploaded
                  </div>
                )}
              </div>
              
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageChange}
                  className="bg-[#1a1a1a] border-gray-600 text-white"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Upload a new hero image (recommended: 1200x600px)
                </p>
              </div>
            </div>
          </div>

          {/* Life in Pictures Section */}
          <div className="bg-[#2a2a2a] p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Life in Pictures
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Section Title</label>
                <Input
                  {...form.register('lifePicturesTitle')}
                  className="bg-[#1a1a1a] border-gray-600 text-white"
                  placeholder="Life in Pictures"
                />
              </div>
              
              <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
                {lifePicturesImagePreview ? (
                  <img src={lifePicturesImagePreview} alt="Life pictures preview" className="w-full h-full object-cover" />
                ) : aboutMeContent?.lifePicturesImage ? (
                  <img src={aboutMeContent.lifePicturesImage} alt="Current life pictures" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image uploaded
                  </div>
                )}
              </div>
              
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLifePicturesImageChange}
                  className="bg-[#1a1a1a] border-gray-600 text-white"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Upload a new life pictures image (recommended: 1200x600px)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Caption</label>
                <Input
                  {...form.register('lifePicturesCaption')}
                  className="bg-[#1a1a1a] border-gray-600 text-white"
                  placeholder="Leading Teams"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  {...form.register('lifePicturesDescription')}
                  className="bg-[#1a1a1a] border-gray-600 text-white"
                  placeholder="Working with my team at EY"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Test Log Section */}
        <div className="mt-8 bg-[#2a2a2a] p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Test Log</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Hero image upload endpoint: /api/admin/about-me/upload-image</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Life pictures image upload endpoint: /api/admin/about-me/upload-image</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Text fields: lifePicturesTitle, lifePicturesCaption, lifePicturesDescription</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Save endpoint: PUT /api/admin/about-me</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}