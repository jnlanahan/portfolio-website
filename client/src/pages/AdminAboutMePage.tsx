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
      heroTitle: '',
      heroSubtitle: '',
      criticalThinkerBio: '',
      decisionMakerBio: '',
      lifelongLearnerBio: '',
      changeAgentBio: '',
      communicatorBio: '',
      leadershipContent: '',
      strategyContent: '',
      innovationContent: '',
      heroImage: null
    }
  });

  // Update form when data loads
  React.useEffect(() => {
    if (aboutMeContent) {
      form.reset({
        heroTitle: aboutMeContent.heroTitle || '',
        heroSubtitle: aboutMeContent.heroSubtitle || '',
        criticalThinkerBio: aboutMeContent.criticalThinkerBio || '',
        decisionMakerBio: aboutMeContent.decisionMakerBio || '',
        lifelongLearnerBio: aboutMeContent.lifelongLearnerBio || '',
        changeAgentBio: aboutMeContent.changeAgentBio || '',
        communicatorBio: aboutMeContent.communicatorBio || '',
        leadershipContent: aboutMeContent.leadershipContent || '',
        strategyContent: aboutMeContent.strategyContent || '',
        innovationContent: aboutMeContent.innovationContent || '',
        heroImage: aboutMeContent.heroImage || null
      });
    }
  }, [aboutMeContent, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<InsertAboutMeContent>) => {
      // Always use PUT for partial updates
      const response = await fetch('/api/admin/about-me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Save error response:', errorText);
        throw new Error(`Failed to save About Me content: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "About Me content saved successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/about-me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/about-me'] });
      setEditingSection(null);
    },
    onError: (error) => {
      console.error('Save error:', error);
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

      // For partial updates, we just need to send the changed fields
      saveMutation.mutate(sectionData);
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
                onClick={() => handleSaveSection({
                  title: form.getValues('title'),
                  subtitle: form.getValues('subtitle'),
                  bio: form.getValues('bio'),
                  passions: form.getValues('passions'),
                  differentiators: form.getValues('differentiators'),
                  image: form.getValues('image')
                })}
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
                        onClick={async () => {
                          if (imageFile) {
                            const formData = new FormData();
                            formData.append('image', imageFile);
                            
                            try {
                              const uploadResponse = await fetch('/api/admin/about-me/upload-image', {
                                method: 'POST',
                                body: formData
                              });
                              
                              if (uploadResponse.ok) {
                                const { imagePath } = await uploadResponse.json();
                                await handleSaveSection({ image: imagePath });
                              }
                            } catch (error) {
                              toast({ 
                                title: "Error uploading image", 
                                description: "Failed to upload image",
                                variant: "destructive"
                              });
                            }
                          }
                        }}
                        size="sm"
                        disabled={saveMutation.isPending || !imageFile}
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
              <div className="relative group">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-futura">
                  {editingSection === 'title' ? (
                    <div className="inline-block">
                      <Input
                        defaultValue={aboutMeContent?.heroTitle || 'Beyond the Resume'}
                        onChange={(e) => form.setValue('heroTitle', e.target.value)}
                        className="text-center text-4xl md:text-5xl font-bold font-futura border-2 border-slate-300 rounded-lg px-4 py-2"
                        placeholder="Beyond the Resume"
                      />
                      <div className="flex justify-center gap-2 mt-2">
                        <Button
                          onClick={() => handleSaveSection({ heroTitle: form.getValues('heroTitle') })}
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
                      {aboutMeContent?.heroTitle || 'Beyond the Resume'}
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
                        defaultValue={aboutMeContent?.heroSubtitle || 'Here is a little information about me that goes beyond my resume and LinkedIn profile.'}
                        onChange={(e) => form.setValue('heroSubtitle', e.target.value)}
                        className="text-center text-lg font-futura border-2 border-slate-300 rounded-lg px-4 py-2 resize-none"
                        placeholder="Here is a little information about me that goes beyond my resume and LinkedIn profile."
                        rows={2}
                      />
                      <div className="flex justify-center gap-2 mt-2">
                        <Button
                          onClick={() => handleSaveSection({ heroSubtitle: form.getValues('heroSubtitle') })}
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
                      {aboutMeContent?.heroSubtitle || 'Here is a little information about me that goes beyond my resume and LinkedIn profile.'}
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
                          defaultValue={aboutMeContent?.passions || "I'm passionate about leadership because I've lived it, taught it, and studied it. It's not about titles or rank. Leadership is about people. Taking care of them, learning from them, and developing them. I was not and am still not the best leader, but I try to get better, and I really care about the people I lead."}
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
                  <div className="relative">
                    {editingSection === 'strategy' ? (
                      <div>
                        <Textarea
                          defaultValue={aboutMeContent?.strategyContent || "Strategy is misunderstood. I studied it in the military and business school, and I practice it in both places. You need those different views and a sense of the long history of that word to really understand it. I'm writing a series of articles now to share my perspective on strategy which can apply to both the military and the business world."}
                          onChange={(e) => form.setValue('strategyContent', e.target.value)}
                          className="text-center text-gray-600 border-2 border-slate-300 rounded-lg px-4 py-2 resize-none min-h-32"
                          placeholder="Strategy content..."
                          rows={6}
                        />
                        <div className="flex justify-center gap-2 mt-2">
                          <Button
                            onClick={() => handleSaveSection({ strategyContent: form.getValues('strategyContent') })}
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
                        {aboutMeContent?.strategyContent || "Strategy is misunderstood. I studied it in the military and business school, and I practice it in both places. You need those different views and a sense of the long history of that word to really understand it. I'm writing a series of articles now to share my perspective on strategy which can apply to both the military and the business world."}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => setEditingSection(editingSection === 'strategy' ? null : 'strategy')}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  size="sm"
                >
                  <Edit size={14} />
                </Button>
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
                  <div className="relative">
                    {editingSection === 'innovation' ? (
                      <div>
                        <Textarea
                          defaultValue={aboutMeContent?.innovationContent || "Innovation always pulls me in. I enjoy looking for better ways to do things, spoting new problems to solve, and trying ideas where they don't usually fit. I keep a running list of ideas, and with new vibe coding tools, I'm finally bringing some of them to life."}
                          onChange={(e) => form.setValue('innovationContent', e.target.value)}
                          className="text-center text-gray-600 border-2 border-slate-300 rounded-lg px-4 py-2 resize-none min-h-32"
                          placeholder="Innovation content..."
                          rows={6}
                        />
                        <div className="flex justify-center gap-2 mt-2">
                          <Button
                            onClick={() => handleSaveSection({ innovationContent: form.getValues('innovationContent') })}
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
                        {aboutMeContent?.innovationContent || "Innovation always pulls me in. I enjoy looking for better ways to do things, spoting new problems to solve, and trying ideas where they don't usually fit. I keep a running list of ideas, and with new vibe coding tools, I'm finally bringing some of them to life."}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => setEditingSection(editingSection === 'innovation' ? null : 'innovation')}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  size="sm"
                >
                  <Edit size={14} />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>



        {/* "I am a..." Leadership Cards Section */}
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
                I am a...
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {/* Critical Thinker */}
                <div className="bg-white p-6 rounded-2xl shadow-lg h-full relative group">
                  <div className="text-xl font-bold text-slate-600 mb-3 font-futura">
                    Critical Thinker
                  </div>
                  <div className="relative">
                    {editingSection === 'criticalThinker' ? (
                      <div>
                        <Textarea
                          defaultValue={aboutMeContent?.criticalThinkerBio || "20+ years solving unique, one of a kind challenges as an Army Officer, consultant, and engineer."}
                          onChange={(e) => form.setValue('criticalThinkerBio', e.target.value)}
                          className="text-gray-600 text-sm border-2 border-slate-300 rounded-lg px-4 py-2 resize-none min-h-20 mb-3"
                          placeholder="Critical Thinker bio..."
                          rows={3}
                        />
                        <div className="flex justify-center gap-2 mt-2">
                          <Button
                            onClick={() => handleSaveSection({ criticalThinkerBio: form.getValues('criticalThinkerBio') })}
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
                      <p className="text-gray-600 text-sm font-futura mb-3 leading-relaxed">
                        {aboutMeContent?.criticalThinkerBio || "20+ years solving unique, one of a kind challenges as an Army Officer, consultant, and engineer."}
                      </p>
                    )}
                  </div>
                  <p className="text-slate-600 text-base font-futura font-bold">
                    No problem is too big.
                  </p>
                  <Button
                    onClick={() => setEditingSection(editingSection === 'criticalThinker' ? null : 'criticalThinker')}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    size="sm"
                  >
                    <Edit size={14} />
                  </Button>
                </div>

                {/* Decision Maker */}
                <div className="bg-white p-6 rounded-2xl shadow-lg h-full relative group">
                  <div className="text-xl font-bold text-slate-600 mb-3 font-futura">
                    Decision Maker
                  </div>
                  <div className="relative">
                    {editingSection === 'decisionMaker' ? (
                      <div>
                        <Textarea
                          defaultValue={aboutMeContent?.decisionMakerBio || "Trained to make tough calls and set priorities even when the stakes are high. I have had to make decisions that affect not just me but others too."}
                          onChange={(e) => form.setValue('decisionMakerBio', e.target.value)}
                          className="text-gray-600 text-sm border-2 border-slate-300 rounded-lg px-4 py-2 resize-none min-h-20 mb-3"
                          placeholder="Decision Maker bio..."
                          rows={3}
                        />
                        <div className="flex justify-center gap-2 mt-2">
                          <Button
                            onClick={() => handleSaveSection({ decisionMakerBio: form.getValues('decisionMakerBio') })}
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
                      <p className="text-gray-600 text-sm font-futura mb-3 leading-relaxed">
                        {aboutMeContent?.decisionMakerBio || "Trained to make tough calls and set priorities even when the stakes are high. I have had to make decisions that affect not just me but others too."}
                      </p>
                    )}
                  </div>
                  <p className="text-slate-600 text-base font-futura font-bold">
                    I am decisive.
                  </p>
                  <Button
                    onClick={() => setEditingSection(editingSection === 'decisionMaker' ? null : 'decisionMaker')}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    size="sm"
                  >
                    <Edit size={14} />
                  </Button>
                </div>

                {/* Lifelong Learner */}
                <div className="bg-white p-6 rounded-2xl shadow-lg h-full relative group">
                  <div className="text-xl font-bold text-slate-600 mb-3 font-futura">
                    Lifelong Learner
                  </div>
                  <div className="relative">
                    {editingSection === 'lifelongLearner' ? (
                      <div>
                        <Textarea
                          defaultValue={aboutMeContent?.lifelongLearnerBio || "I never aim to just get the job done. I want to master what I do. I dive in, get obsessed (in a good way), and keep learning the finer points as I go."}
                          onChange={(e) => form.setValue('lifelongLearnerBio', e.target.value)}
                          className="text-gray-600 text-sm border-2 border-slate-300 rounded-lg px-4 py-2 resize-none min-h-20 mb-3"
                          placeholder="Lifelong Learner bio..."
                          rows={3}
                        />
                        <div className="flex justify-center gap-2 mt-2">
                          <Button
                            onClick={() => handleSaveSection({ lifelongLearnerBio: form.getValues('lifelongLearnerBio') })}
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
                      <p className="text-gray-600 text-sm font-futura mb-3 leading-relaxed">
                        {aboutMeContent?.lifelongLearnerBio || "I never aim to just get the job done. I want to master what I do. I dive in, get obsessed (in a good way), and keep learning the finer points as I go."}
                      </p>
                    )}
                  </div>
                  <p className="text-slate-600 text-base font-futura font-bold">
                    Learning is always the goal.
                  </p>
                  <Button
                    onClick={() => setEditingSection(editingSection === 'lifelongLearner' ? null : 'lifelongLearner')}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    size="sm"
                  >
                    <Edit size={14} />
                  </Button>
                </div>

                {/* Change Agent */}
                <div className="bg-white p-6 rounded-2xl shadow-lg h-full relative group">
                  <div className="text-xl font-bold text-slate-600 mb-3 font-futura">
                    Change agent
                  </div>
                  <div className="relative">
                    {editingSection === 'changeAgent' ? (
                      <div>
                        <Textarea
                          defaultValue={aboutMeContent?.changeAgentBio || "I have led and supported multiple large scale transformations in the Army and major financial services organizations. I know how to drive change from stakeholder communication and planning to managing resistance before it becomes a problem."}
                          onChange={(e) => form.setValue('changeAgentBio', e.target.value)}
                          className="text-gray-600 text-sm border-2 border-slate-300 rounded-lg px-4 py-2 resize-none min-h-20 mb-3"
                          placeholder="Change Agent bio..."
                          rows={3}
                        />
                        <div className="flex justify-center gap-2 mt-2">
                          <Button
                            onClick={() => handleSaveSection({ changeAgentBio: form.getValues('changeAgentBio') })}
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
                      <p className="text-gray-600 text-sm font-futura mb-3 leading-relaxed">
                        {aboutMeContent?.changeAgentBio || "I have led and supported multiple large scale transformations in the Army and major financial services organizations. I know how to drive change from stakeholder communication and planning to managing resistance before it becomes a problem."}
                      </p>
                    )}
                  </div>
                  <p className="text-slate-600 text-base font-futura font-bold">
                    Effective change is a team effort.
                  </p>
                  <Button
                    onClick={() => setEditingSection(editingSection === 'changeAgent' ? null : 'changeAgent')}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    size="sm"
                  >
                    <Edit size={14} />
                  </Button>
                </div>

                {/* Communicator */}
                <div className="bg-white p-6 rounded-2xl shadow-lg h-full relative group">
                  <div className="text-xl font-bold text-slate-600 mb-3 font-futura">
                    Communicator
                  </div>
                  <div className="relative">
                    {editingSection === 'communicator' ? (
                      <div>
                        <Textarea
                          defaultValue={aboutMeContent?.communicatorBio || "I understand what effective communication requires and have trained others to identify its root causes when it fails. I have presented to executives at major banks and commanding generals in the Army, adapting my approach for every audience."}
                          onChange={(e) => form.setValue('communicatorBio', e.target.value)}
                          className="text-gray-600 text-sm border-2 border-slate-300 rounded-lg px-4 py-2 resize-none min-h-20 mb-3"
                          placeholder="Communicator bio..."
                          rows={3}
                        />
                        <div className="flex justify-center gap-2 mt-2">
                          <Button
                            onClick={() => handleSaveSection({ communicatorBio: form.getValues('communicatorBio') })}
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
                      <p className="text-gray-600 text-sm font-futura mb-3 leading-relaxed">
                        {aboutMeContent?.communicatorBio || "I understand what effective communication requires and have trained others to identify its root causes when it fails. I have presented to executives at major banks and commanding generals in the Army, adapting my approach for every audience."}
                      </p>
                    )}
                  </div>
                  <p className="text-slate-600 text-base font-futura font-bold">
                    All communication is not equal.
                  </p>
                  <Button
                    onClick={() => setEditingSection(editingSection === 'communicator' ? null : 'communicator')}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    size="sm"
                  >
                    <Edit size={14} />
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={() => setEditingSection(editingSection === 'bio' ? null : 'bio')}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                size="sm"
              >
                <Edit size={14} />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Life in Pictures */}
        <section className="py-12">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto relative group"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center font-futura">
                Life in Pictures
              </h2>
              
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-80 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Professional Team Photo</span>
                </div>
                <div className="p-6 bg-white">
                  <h3 className="font-bold text-gray-900 mb-2 font-futura text-xl">
                    Leading Teams
                  </h3>
                  <p className="text-gray-600 font-futura">
                    Working with my team at EY
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* My Leadership Philosophy */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto relative group"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center font-futura">
                My Leadership Philosophy
              </h2>
              
              <div className="space-y-8">
                {/* Purpose */}
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-slate-600 mb-4 font-futura">
                    Purpose
                  </h3>
                  <p className="text-gray-700 leading-relaxed font-futura">
                    Ensure every teammate leaves stronger, more confident, and better prepared for the next challenge.
                  </p>
                </div>

                {/* Values & Guiding Principles */}
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-slate-600 mb-4 font-futura">
                    Values & Guiding Principles
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 font-futura">Integrity:</h4>
                      <p className="text-gray-700 leading-relaxed font-futura">
                        Always choose what is right over what is easy, using every task as a learning opportunity and never cutting corners.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 font-futura">Growth:</h4>
                      <p className="text-gray-700 leading-relaxed font-futura">
                        Always raise the least experienced so no one is left behind, building a team whose floor exceeds others' ceiling through shared commitment.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 font-futura">Mastery:</h4>
                      <p className="text-gray-700 leading-relaxed font-futura">
                        Always dig deep to master the craft, because excellence, not "good enough," is the foundation of sound judgment.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 font-futura">Empathy:</h4>
                      <p className="text-gray-700 leading-relaxed font-futura">
                        Always lead with empathy, listening first and tailoring communication to each person's background and needs.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Leadership Approach & Style */}
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-slate-600 mb-4 font-futura">
                    Leadership Approach & Style
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 font-futura">Allow mistakes for growth:</h4>
                      <p className="text-gray-700 text-sm leading-relaxed font-futura">
                        Let teammates learn by doing, even when the result isn't my preferred way.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 font-futura">Prioritize people:</h4>
                      <p className="text-gray-700 text-sm leading-relaxed font-futura">
                        Dedicate my time to teammates first, placing their needs above competing demands.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 font-futura">Seek effort over natural abilities:</h4>
                      <p className="text-gray-700 text-sm leading-relaxed font-futura">
                        Reward hard work, persistence, and steady improvement above natural talent.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 font-futura">Invite bad news:</h4>
                      <p className="text-gray-700 text-sm leading-relaxed font-futura">
                        Ask first for what is going wrong and never punish honesty.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 font-futura">Remove blockers:</h4>
                      <p className="text-gray-700 text-sm leading-relaxed font-futura">
                        Quickly clear obstacles so the team can keep moving.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 font-futura">Value intentions:</h4>
                      <p className="text-gray-700 text-sm leading-relaxed font-futura">
                        Prioritize teammates with good intentions over those with bad intentions, regardless of their skills.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>



        {/* Final section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="text-center text-gray-600 mb-4 font-futura">
                Based in Columbus, Ohio
              </div>
              <div className="text-center text-gray-600 font-futura">
                Ready for your next challenge
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}