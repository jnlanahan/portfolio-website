import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Camera, MapPin, BookOpen, Users, Target, Lightbulb, Award } from "lucide-react";

const AboutPage = () => {
  // Fetch carousel images
  const { data: carouselImages = [], isLoading: isCarouselLoading } = useQuery({
    queryKey: ["/api/carousel-images"],
  });

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

  return (
    <div className="page-container relative">
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
            <div className="mb-8">
              <div className="w-48 h-48 md:w-64 md:h-64 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                <span className="text-gray-500 text-lg">Professional Photo</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-futura">
              Beyond the Resume
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed font-futura">
              Here is a little information about me that goes beyond my resume and LinkedIn profile.
            </p>
          </motion.div>
        </div>
      </section>

       {/* Life in Pictures Carousel */}
       <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center font-futura">
              Life in Pictures
            </h2>

            {/* Carousel Container */}
            {isCarouselLoading ? (
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl h-[60vh] md:h-[80vh] flex items-center justify-center">
                <div className="text-white">Loading images...</div>
              </div>
            ) : carouselImages.length > 0 ? (
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl group">
                {/* Carousel Scroll Area */}
                <div 
                  id="pictures-carousel"
                  className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide h-[60vh] md:h-[80vh]"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {carouselImages.map((image: any, index: number) => (
                    <div key={image.id} className="min-w-full snap-center relative">
                      <img
                        src={image.imagePath}
                        alt={image.altText}
                        className="w-full min-h-[60vh] max-h-[80vh] object-contain bg-gray-100"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                        <h3 className="font-bold text-white mb-2 font-futura text-xl">
                          {image.title}
                        </h3>
                        <p className="text-white/90 font-futura">
                          {image.caption}
                        </p>
                      </div>
                    </div>
                  ))}
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

                {/* Scroll Indicators - Dynamic count based on actual images */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {carouselImages.map((_: any, i: number) => (
                    <div key={i} className="w-2 h-2 bg-white/50 rounded-full"></div>
                  ))}
                </div>

                {/* Instructions */}
                <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-futura">
                  Click arrows or swipe to navigate
                </div>
              </div>
            ) : (
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-2xl h-[60vh] md:h-[80vh] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-futura">No images uploaded yet</p>
                  <p className="text-sm">Images will appear here once uploaded through the admin interface</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* How I Lead Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center font-futura">
              How I Lead
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-futura">
                    People First
                  </h3>
                  <p className="text-gray-600 font-futura">
                    I believe that investing in people is the most important thing a leader can do. When you take care of your team, they'll take care of the mission.
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-futura">
                    Strategic Thinking
                  </h3>
                  <p className="text-gray-600 font-futura">
                    I focus on understanding the bigger picture and how each decision connects to our long-term goals. Strategy without execution is just planning.
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="h-8 w-8 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-futura">
                    Innovation
                  </h3>
                  <p className="text-gray-600 font-futura">
                    I'm always looking for better ways to do things. Innovation comes from listening to your team and being willing to try new approaches.
                  </p>
                </div>
              </motion.div>
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
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center font-futura">
              My Passions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-futura">
                    Leadership
                  </h3>
                  <p className="text-gray-600 font-futura">
                    Building high-performing teams and developing future leaders through mentorship and creating opportunities for growth.
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-futura">
                    Strategy
                  </h3>
                  <p className="text-gray-600 font-futura">
                    Creating long-term vision and turning complex challenges into actionable plans that drive meaningful business results.
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="h-8 w-8 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-futura">
                    Innovation
                  </h3>
                  <p className="text-gray-600 font-futura">
                    Exploring emerging technologies and finding creative solutions to transform how we work and deliver value to customers.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Sets Me Apart Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 font-futura">
              What Sets Me Apart
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 font-futura">
                  Military Leadership Experience
                </h3>
                <p className="text-gray-600 font-futura">
                  Leading 165+ soldiers as a Company Commander taught me how to build trust, make decisions under pressure, and accomplish missions with limited resources.
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 font-futura">
                  Global Perspective
                </h3>
                <p className="text-gray-600 font-futura">
                  Living and working in South Korea for 3 years gave me a deep appreciation for different cultures and how to lead diverse, international teams.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Professional Philosophy Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 font-futura">
              My Professional Philosophy
            </h2>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <blockquote className="text-lg text-gray-700 italic mb-6 font-futura">
                "Success isn't just about what you accomplish, but about the people you develop and the positive impact you create along the way."
              </blockquote>
              
              <p className="text-gray-600 font-futura leading-relaxed">
                Throughout my career, I've learned that the best leaders are those who can balance strategic thinking with genuine care for their people. Whether I'm leading soldiers in the field or managing product teams in the corporate world, I focus on creating environments where everyone can do their best work while contributing to something bigger than themselves.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;