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
import { ArrowLeft, Save, Upload, Edit, Target, Users, Lightbulb, Camera, MapPin } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminAboutMePage() {
  const { toast } = useToast();
  const [editingSection, setEditingSection] = useState<string | null>(null);
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
      setEditingSection(null);
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

  const handleSaveSection = async (sectionData: Partial<InsertAboutMeContent>) => {
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
          sectionData.image = imagePath;
        }
      }

      const currentData = form.getValues();
      const updatedData = { ...currentData, ...sectionData };
      
      saveMutation.mutate(updatedData);
    } catch (error) {
      toast({ 
        title: "Error saving content", 
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (isLoading) {
    return (
      <div className="page-container relative">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container relative">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-slate-600 hover:text-slate-800">
                <ArrowLeft size={24} />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Edit About Me Content</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleSaveSection(form.getValues())}
                disabled={saveMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {saveMutation.isPending ? 'Saving...' : 'Save All Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content with top padding to account for fixed header */}
      <div className="pt-20">
        {/* Hero Introduction with Photo */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-5xl mx-auto"
            >
              {/* Large Profile Photo */}
              <div className="mb-8 relative">
                <div className="w-48 h-48 md:w-64 md:h-64 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-gray-500 text-lg">Professional Photo</span>
                  )}
                  <Button
                    onClick={() => setEditingSection(editingSection === 'image' ? null : 'image')}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center"
                    size="sm"
                  >
                    <Edit size={14} />
                  </Button>
                </div>
                
                {editingSection === 'image' && (
                  <div className="mt-4 p-4 bg-white rounded-lg shadow-lg max-w-md mx-auto">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mb-3"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSaveSection({ image: imagePreview })}
                        size="sm"
                        disabled={saveMutation.isPending}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditingSection(null)}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Title Section */}
              <div className="relative">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-futura">
                  {editingSection === 'title' ? (
                    <div className="inline-block">
                      <Input
                        {...form.register('title')}
                        className="text-center text-4xl md:text-5xl font-bold font-futura border-2 border-slate-300 rounded-lg px-4 py-2"
                        placeholder="Beyond the Resume"
                      />
                      <div className="flex justify-center gap-2 mt-2">
                        <Button
                          onClick={() => handleSaveSection({ title: form.getValues('title') })}
                          size="sm"
                          disabled={saveMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingSection(null)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <span className="relative">
                      {aboutMeContent?.title || 'Beyond the Resume'}
                      <Button
                        onClick={() => setEditingSection('title')}
                        className="absolute -top-2 -right-8 w-6 h-6 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        size="sm"
                      >
                        <Edit size={12} />
                      </Button>
                    </span>
                  )}
                </h1>
                
                {/* Subtitle Section */}
                <div className="relative group">
                  {editingSection === 'subtitle' ? (
                    <div>
                      <Textarea
                        {...form.register('subtitle')}
                        className="text-center text-lg font-futura border-2 border-slate-300 rounded-lg px-4 py-2 resize-none"
                        placeholder="Here is a little information about me that goes beyond my resume and LinkedIn profile."
                        rows={2}
                      />
                      <div className="flex justify-center gap-2 mt-2">
                        <Button
                          onClick={() => handleSaveSection({ subtitle: form.getValues('subtitle') })}
                          size="sm"
                          disabled={saveMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingSection(null)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg text-gray-600 leading-relaxed font-futura relative">
                      {aboutMeContent?.subtitle || 'Here is a little information about me that goes beyond my resume and LinkedIn profile.'}
                      <Button
                        onClick={() => setEditingSection('subtitle')}
                        className="absolute -top-2 -right-8 w-6 h-6 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        size="sm"
                      >
                        <Edit size={12} />
                      </Button>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* My Passions Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-futura">
                My <span className="text-slate-600">Passions</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-futura">
                I'm driven by 3 things that keep me moving forward in my career.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Leadership */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group"
              >
                <div className="p-6">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center font-futura">
                    Leadership
                  </h3>
                  <div className="relative">
                    {editingSection === 'leadership' ? (
                      <div>
                        <Textarea
                          value={form.watch('passions') || ''}
                          onChange={(e) => form.setValue('passions', e.target.value)}
                          className="text-center text-gray-600 border-2 border-slate-300 rounded-lg px-4 py-2 resize-none min-h-32"
                          placeholder="I'm passionate about leadership because..."
                          rows={6}
                        />
                        <div className="flex justify-center gap-2 mt-2">
                          <Button
                            onClick={() => handleSaveSection({ passions: form.getValues('passions') })}
                            size="sm"
                            disabled={saveMutation.isPending}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingSection(null)}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center leading-relaxed font-futura">
                        {aboutMeContent?.passions || "I'm passionate about leadership because I've lived it, taught it, and studied it. It's not about titles or rank. Leadership is about people. Taking care of them, learning from them, and developing them. I was not and am still not the best leader, but I try to get better, and I really care about the people I lead."}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => setEditingSection(editingSection === 'leadership' ? null : 'leadership')}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  size="sm"
                >
                  <Edit size={14} />
                </Button>
              </motion.div>

              {/* Strategy */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group"
              >
                <div className="p-6">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center font-futura">
                    Strategy
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed font-futura">
                    Strategy is misunderstood. I studied it in the military and business school, and I practice it in both places. You need those different views and a sense of the long history of that word to really understand it. I'm writing a series of articles now to share my perspective on strategy which can apply to both the military and the business world.
                  </p>
                </div>
              </motion.div>

              {/* Innovation */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group"
              >
                <div className="p-6">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-6 h-6 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center font-futura">
                    Innovation
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed font-futura">
                    Innovation always pulls me in. I enjoy looking for better ways to do things, spoting new problems to solve, and trying ideas where they don't usually fit. I keep a running list of ideas, and with new vibe coding tools, I'm finally bringing some of them to life.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* What Sets Me Apart */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto text-center relative group"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8 font-futura">
                What Sets Me <span className="text-slate-600">Apart</span>
              </h2>
              <div className="relative">
                {editingSection === 'differentiators' ? (
                  <div>
                    <Textarea
                      {...form.register('differentiators')}
                      className="text-center text-gray-600 border-2 border-slate-300 rounded-lg px-4 py-2 resize-none min-h-32 max-w-4xl mx-auto"
                      placeholder="What makes you unique..."
                      rows={8}
                    />
                    <div className="flex justify-center gap-2 mt-4">
                      <Button
                        onClick={() => handleSaveSection({ differentiators: form.getValues('differentiators') })}
                        size="sm"
                        disabled={saveMutation.isPending}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditingSection(null)}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto font-futura">
                    {aboutMeContent?.differentiators || "What sets me apart is my unique combination of military leadership experience, business education, and hands-on product management expertise. I've led teams in high-pressure environments, studied strategy at top institutions, and delivered real results in technology companies. This diverse background gives me a perspective that's both strategic and practical."}
                  </p>
                )}
              </div>
              <Button
                onClick={() => setEditingSection(editingSection === 'differentiators' ? null : 'differentiators')}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                size="sm"
              >
                <Edit size={14} />
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}