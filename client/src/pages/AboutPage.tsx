import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { AboutMeContent } from "@shared/schema";
import { MapPin, Lightbulb, Target, Users } from "lucide-react";
import profilePic from "@assets/PXL_20250628_182520391_1752206764378.jpg";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function AboutPage() {
  const { data: aboutMeContent } = useQuery<AboutMeContent>({
    queryKey: ['/api/about-me'],
    queryFn: async () => {
      const response = await fetch('/api/about-me');
      if (!response.ok) {
        throw new Error('Failed to fetch About Me content');
      }
      return response.json();
    }
  });

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1a1a1a]">
      {/* Hero Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="mb-8">
              <div className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-6 rounded-full overflow-hidden shadow-xl">
                {aboutMeContent?.heroImage ? (
                  <img 
                    src={aboutMeContent.heroImage} 
                    alt="Nick Lanahan" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={profilePic} 
                    alt="Nick Lanahan" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-futura">
                Beyond the Resume
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-futura">
                Here is a little information about me that goes beyond my resume and LinkedIn profile.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bio Cards Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-futura">
                I am a...
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Critical Thinker */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <Target className="h-6 w-6 text-slate-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 font-futura">Critical Thinker</h3>
                </div>
                <p className="text-gray-700 leading-relaxed font-futura">
                  20+ years solving unique, one of a kind challenges as an Army Officer, consultant, and engineer.
                </p>
              </motion.div>

              {/* Decision Maker */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <Target className="h-6 w-6 text-slate-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 font-futura">Decision Maker</h3>
                </div>
                <p className="text-gray-700 leading-relaxed font-futura">
                  Trained to make tough calls and set priorities even when the stakes are high. I have had to make decisions that affect not just me but others too.
                </p>
              </motion.div>

              {/* Lifelong Learner */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <Lightbulb className="h-6 w-6 text-slate-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 font-futura">Lifelong Learner</h3>
                </div>
                <p className="text-gray-700 leading-relaxed font-futura">
                  I never aim to just get the job done. I want to master what I do. I dive in, get obsessed (in a good way), and keep learning the finer points as I go.
                </p>
              </motion.div>

              {/* Change Agent */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <Target className="h-6 w-6 text-slate-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 font-futura">Change Agent</h3>
                </div>
                <p className="text-gray-700 leading-relaxed font-futura">
                  I have led and supported multiple large scale transformations in the Army and major financial services organizations. I know how to drive change from stakeholder communication and planning to managing resistance before it becomes a problem.
                </p>
              </motion.div>

              {/* Communicator */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2"
              >
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 text-slate-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 font-futura">Communicator</h3>
                </div>
                <p className="text-gray-700 leading-relaxed font-futura">
                  I understand what effective communication requires and have trained others to identify its root causes when it fails. I have presented to executives at major banks and commanding generals in the Army, adapting my approach for every audience.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* My Passions Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-futura">
                My Passions
              </h2>
              <p className="text-xl text-gray-600 font-futura">
                I'm driven by 3 things that keep me moving forward in my career.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Leadership */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-gray-50 p-8 rounded-2xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 text-slate-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 font-futura">Leadership</h3>
                </div>
                <p className="text-gray-700 leading-relaxed font-futura">
                  I'm passionate about leadership because I've lived it, taught it, and studied it. It's not about titles or rank. Leadership is about people. Taking care of them, learning from them, and developing them. I was not and am still not the best leader, but I try to get better, and I really care about the people I lead.
                </p>
              </motion.div>

              {/* Strategy */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-gray-50 p-8 rounded-2xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <Target className="h-6 w-6 text-slate-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 font-futura">Strategy</h3>
                </div>
                <p className="text-gray-700 leading-relaxed font-futura">
                  Strategy is misunderstood. I studied it in the military and business school, and I practice it in both places. You need those different views and a sense of the long history of that word to really understand it. I'm writing a series of articles now to share my perspective on strategy which can apply to both the military and the business world.
                </p>
              </motion.div>

              {/* Innovation */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gray-50 p-8 rounded-2xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <Lightbulb className="h-6 w-6 text-slate-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 font-futura">Innovation</h3>
                </div>
                <p className="text-gray-700 leading-relaxed font-futura">
                  Innovation always pulls me in. I enjoy looking for better ways to do things, spoting new problems to solve, and trying ideas where they don't usually fit. I keep a running list of ideas, and with new vibe coding tools, I'm finally bringing some of them to life.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Sets Me Apart Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-futura">
                What Sets Me Apart
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* How I Lead */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 font-futura flex items-center">
                  <Users className="h-6 w-6 text-slate-600 mr-3" />
                  How I Lead
                </h3>
                <p className="text-gray-700 leading-relaxed font-futura">
                  I lead by example and focus on developing others. Whether it's mentoring junior engineers or leading cross-functional teams, I believe in creating an environment where everyone can contribute their best work and grow professionally.
                </p>
              </motion.div>

              {/* Strategic Thinking */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 font-futura flex items-center">
                  <Target className="h-6 w-6 text-slate-600 mr-3" />
                  Strategic Thinking
                </h3>
                <p className="text-gray-700 leading-relaxed font-futura">
                  I excel at seeing the bigger picture while managing the details. My military and business background gives me a unique perspective on long-term planning and execution under pressure.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Life in Pictures Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center font-futura">
              {aboutMeContent?.lifePicturesTitle || 'Life in Pictures'}
            </h2>
            
            {/* Scrollable Image Container */}
            <div className="relative group">
              <div 
                id="pictures-carousel"
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Life Pictures Image */}
                <div className="min-w-full snap-start relative">
                  <div className="h-80 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {aboutMeContent?.lifePicturesImage ? (
                      <img src={aboutMeContent.lifePicturesImage} alt="Life Pictures" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500 text-sm">Life Pictures</span>
                    )}
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="font-bold text-gray-900 mb-2 font-futura text-xl">
                      {aboutMeContent?.lifePicturesCaption || 'Leading Teams'}
                    </h3>
                    <p className="text-gray-600 font-futura">
                      {aboutMeContent?.lifePicturesDescription || 'Working with my team at EY'}
                    </p>
                  </div>
                </div>

                {/* Military Service Photo */}
                <div className="min-w-full snap-start relative">
                  <div className="h-80 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Military Service Photo</span>
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="font-bold text-gray-900 mb-2 font-futura text-xl">
                      Serving Others
                    </h3>
                    <p className="text-gray-600 font-futura">
                      11 years of military service in the U.S. Army
                    </p>
                  </div>
                </div>

                {/* Adventure Photo */}
                <div className="min-w-full snap-start relative">
                  <div className="h-80 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Adventure Photo</span>
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="font-bold text-gray-900 mb-2 font-futura text-xl">
                      Pushing Boundaries
                    </h3>
                    <p className="text-gray-600 font-futura">
                      Always seeking new challenges and adventures
                    </p>
                  </div>
                </div>

                {/* Travel Photo */}
                <div className="min-w-full snap-start relative">
                  <div className="h-80 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Travel Photo</span>
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="font-bold text-gray-900 mb-2 font-futura text-xl">
                      Global Perspective
                    </h3>
                    <p className="text-gray-600 font-futura">
                      Lived and worked around the world
                    </p>
                  </div>
                </div>

                {/* University Photo */}
                <div className="min-w-full snap-start relative">
                  <div className="h-80 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">University Photo</span>
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="font-bold text-gray-900 mb-2 font-futura text-xl">
                      Continuous Learning
                    </h3>
                    <p className="text-gray-600 font-futura">
                      Engineering degree and ongoing education
                    </p>
                  </div>
                </div>

                {/* Family Photo */}
                <div className="min-w-full snap-start relative">
                  <div className="h-80 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Family/Personal Photo</span>
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="font-bold text-gray-900 mb-2 font-futura text-xl">
                      What Matters Most
                    </h3>
                    <p className="text-gray-600 font-futura">
                      Family and personal connections
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => {
                  const carousel = document.getElementById('pictures-carousel');
                  if (carousel) {
                    carousel.scrollBy({ left: -carousel.clientWidth, behavior: 'smooth' });
                  }
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => {
                  const carousel = document.getElementById('pictures-carousel');
                  if (carousel) {
                    carousel.scrollBy({ left: carousel.clientWidth, behavior: 'smooth' });
                  }
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Scroll Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
              </div>

              {/* Instructions */}
              <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-futura">
                Click arrows or swipe to navigate
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Professional Philosophy */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center font-futura">
              My Leadership Philosophy
            </h2>
            
            <div className="space-y-8">
              {/* Purpose */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <h3 className="text-xl font-bold text-slate-600 mb-4 font-futura">
                  Purpose
                </h3>
                <p className="text-gray-700 leading-relaxed font-futura">
                  Ensure every teammate leaves stronger, more confident, and better prepared for the next challenge.
                </p>
              </motion.div>

              {/* Values & Guiding Principles */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
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
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}