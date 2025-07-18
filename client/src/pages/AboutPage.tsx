import { motion } from "framer-motion";
import { Target, Users, Lightbulb, Camera, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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

            {/* Scrollable Image Container */}
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden group">
              <div 
                id="pictures-carousel"
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {isCarouselLoading ? (
                  <div className="min-w-full snap-center relative flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading images...</p>
                    </div>
                  </div>
                ) : carouselImages.length > 0 ? (
                  carouselImages.map((image: any) => (
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
                  ))
                ) : (
                  <div className="min-w-full snap-center relative flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No images available yet.</p>
                      <p className="text-gray-500 text-sm mt-2">Check back soon for life in pictures!</p>
                    </div>
                  </div>
                )}


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
              {carouselImages.length > 0 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {carouselImages.map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-white/50 rounded-full"></div>
                  ))}
                </div>
              )}

              {/* Instructions */}
              <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-futura">
                Click arrows or swipe to navigate
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Professional Certifications Section */}
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
              Professional Certifications
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* AI Prototyping for Product Managers */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-center">
                  <img
                    src="/@fs/home/runner/workspace/attached_assets/Screenshot 2025-07-17 223656_1752807833594.png"
                    alt="AI Prototyping for Product Managers Certificate"
                    className="w-full h-20 object-cover rounded-lg mb-2"
                  />
                  <h3 className="text-xs font-bold text-gray-900 mb-1 font-futura line-clamp-2">
                    AI Prototyping for Product Managers
                  </h3>
                  <a
                    href="https://maven.com/certificate/isKysWak"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-slate-600 hover:text-slate-800 font-futura font-semibold text-xs transition-colors"
                  >
                    View
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </motion.div>

              {/* Advanced AI Product Leadership */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-center">
                  <img
                    src="/@fs/home/runner/workspace/attached_assets/Screenshot 2025-07-17 223705_1752807833594.png"
                    alt="Advanced AI Product Leadership Certificate"
                    className="w-full h-20 object-cover rounded-lg mb-2"
                  />
                  <h3 className="text-xs font-bold text-gray-900 mb-1 font-futura line-clamp-2">
                    Advanced AI Product Leadership
                  </h3>
                  <a
                    href="https://maven.com/certificate/YBSOUklu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-slate-600 hover:text-slate-800 font-futura font-semibold text-xs transition-colors"
                  >
                    View
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </motion.div>

              {/* AI Product Management 101 */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-center">
                  <img
                    src="/@fs/home/runner/workspace/attached_assets/Screenshot 2025-07-17 223712_1752807833595.png"
                    alt="AI Product Management 101 Certificate"
                    className="w-full h-20 object-cover rounded-lg mb-2"
                  />
                  <h3 className="text-xs font-bold text-gray-900 mb-1 font-futura line-clamp-2">
                    AI Product Management 101
                  </h3>
                  <a
                    href="https://maven.com/certificate/gtpKvnRC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-slate-600 hover:text-slate-800 font-futura font-semibold text-xs transition-colors"
                  >
                    View
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </motion.div>

              {/* AI Product Management Bootcamp */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-center">
                  <img
                    src="/@fs/home/runner/workspace/attached_assets/Screenshot 2025-07-17 223720_1752807833595.png"
                    alt="AI Product Management Bootcamp Certificate"
                    className="w-full h-20 object-cover rounded-lg mb-2"
                  />
                  <h3 className="text-xs font-bold text-gray-900 mb-1 font-futura line-clamp-2">
                    AI Product Management Bootcamp
                  </h3>
                  <a
                    href="https://maven.com/certificate/jHkWhBST"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-slate-600 hover:text-slate-800 font-futura font-semibold text-xs transition-colors"
                  >
                    View
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </motion.div>

              {/* EY AI Certification */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-center">
                  <img
                    src="/@fs/home/runner/workspace/attached_assets/AI Badge_1752806308560.jpg"
                    alt="EY AI Certification Badge"
                    className="w-full h-20 object-cover rounded-lg mb-2"
                  />
                  <h3 className="text-xs font-bold text-gray-900 mb-1 font-futura line-clamp-2">
                    EY AI Certification
                  </h3>
                  <a
                    href="https://www.credly.com/badges/3f4e473d-f350-406c-b6d0-d3c9c3e77a55/linked_in_profile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-slate-600 hover:text-slate-800 font-futura font-semibold text-xs transition-colors"
                  >
                    View
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </motion.div>

              {/* EY Blockchain Certification */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="bg-white p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-center">
                  <img
                    src="/@fs/home/runner/workspace/attached_assets/Blockchain Badge_1752806308560.jpg"
                    alt="EY Blockchain Certification Badge"
                    className="w-full h-20 object-cover rounded-lg mb-2"
                  />
                  <h3 className="text-xs font-bold text-gray-900 mb-1 font-futura line-clamp-2">
                    EY Blockchain Certification
                  </h3>
                  <a
                    href="https://www.credly.com/earner/earned/badge/219ce6d7-1317-419f-9ad7-bd3923d55587"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-slate-600 hover:text-slate-800 font-futura font-semibold text-xs transition-colors"
                  >
                    View
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
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
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-futura">
              My <span className="text-slate-600">Passions</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-futura">
              I'm driven by three things that keep me moving forward in my career.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Leadership */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center font-futura">
                  Leadership
                </h3>
                <p className="text-gray-600 text-center leading-relaxed font-futura">
                  I'm passionate about leadership because I've lived it, taught it, and studied it. It's not about titles or rank. Leadership is about people. Taking care of them, learning from them, and developing them. I was not and am still not the best leader, but I try to get better, and I really care about the people I lead.
                </p>
              </div>
            </motion.div>

            {/* Strategy */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
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
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center font-futura">
                  Innovation
                </h3>
                <p className="text-gray-600 text-center leading-relaxed font-futura">
                  Innovation always pulls me in. I enjoy looking for better ways to do things, spotting new problems to solve, and trying ideas where they don't usually fit. I keep a running list of ideas, and with new vibe coding tools, I'm finally bringing some of them to life.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* I am a... Section */}
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
              I am a...
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Critical Thinker */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="text-2xl font-bold text-slate-600 mb-2 font-futura">
                  Critical Thinker
                </div>
                <p className="text-gray-600 text-sm font-futura mb-2">
                  20+ years solving unique, one of a kind challenges as an Army Officer, consultant, and engineer.
                </p>
                <p className="text-gray-600 text-sm font-futura font-semibold">
                  No problem is too big.
                </p>
              </motion.div>

              {/* Decision Maker */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="text-2xl font-bold text-slate-600 mb-2 font-futura">
                  Decision Maker
                </div>
                <p className="text-gray-600 text-sm font-futura mb-2">
                  Trained to make tough calls and set priorities even when the stakes are high. I have had to make decisions that affect not just me but others too.
                </p>
                <p className="text-gray-600 text-sm font-futura font-semibold">
                  I am decisive.
                </p>
              </motion.div>

              {/* Lifelong Learner */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="text-2xl font-bold text-slate-600 mb-2 font-futura">
                  Lifelong Learner
                </div>
                <p className="text-gray-600 text-sm font-futura mb-2">
                  I never aim to just get the job done. I want to master what I do. I dive in, get obsessed (in a good way), and keep learning the finer points as I go.
                </p>
                <p className="text-gray-600 text-sm font-futura font-semibold">
                  Learning is always the goal.
                </p>
              </motion.div>

              {/* Driver of Change */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="text-2xl font-bold text-slate-600 mb-2 font-futura">
                  Driver of Change
                </div>
                <p className="text-gray-600 text-sm font-futura mb-2">
                  I have led and supported multiple large scale transformations in the Army and major financial services organizations. I know how to drive change from stakeholder communication and planning to managing resistance before it becomes a problem.
                </p>
                <p className="text-gray-600 text-sm font-futura font-semibold">
                  Effective change is a team effort.
                </p>
              </motion.div>

              {/* Communicator */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="text-2xl font-bold text-slate-600 mb-2 font-futura">
                  Communicator
                </div>
                <p className="text-gray-600 text-sm font-futura mb-2">
                  I understand what effective communication requires and have trained others to identify its root causes when it fails. I have presented to executives at major banks and commanding generals in the Army, adapting my approach for every audience.
                </p>
                <p className="text-gray-600 text-sm font-futura font-semibold">
                  All communication is not equal.
                </p>
              </motion.div>

              {/* Cross-Functional Leader */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="text-2xl font-bold text-slate-600 mb-2 font-futura">
                  Cross-Functional Leader
                </div>
                <p className="text-gray-600 text-sm font-futura mb-2">
                  My career has always involved working with experts from every field, whether leading soldiers or collaborating with product, design, and business teams. I know how to adapt my message and style for any audience, building strong partnerships and getting everyone aligned.
                </p>
                <p className="text-gray-600 text-sm font-futura font-semibold">
                  Bringing people together is what I do best.
                </p>
              </motion.div>
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
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 font-futura">
              My Leadership Philosophy
            </h2>

            <div className="space-y-6">
              {/* Purpose Tile */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-futura">Purpose</h3>
                <p className="text-gray-600 leading-relaxed font-futura">
                  Ensure every teammate leaves stronger, more confident, and better prepared for the next challenge.
                </p>
              </div>

              {/* Values & Guiding Principles Tile */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-futura">Values</h3>
                <div className="space-y-3 text-left">
                  <div>
                    <span className="font-semibold text-gray-900 font-futura">Integrity:</span>
                    <span className="text-gray-600 font-futura"> Always choose what is right over what is easy.</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 font-futura">Growth:</span>
                    <span className="text-gray-600 font-futura"> Always raise the least experienced so no one is left behind.</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 font-futura">Mastery:</span>
                    <span className="text-gray-600 font-futura"> Always dig deep to master the craft.</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 font-futura">Empathy:</span>
                    <span className="text-gray-600 font-futura"> Always lead with empathy, listening first.</span>
                  </div>
                </div>
              </div>

              {/* Leadership Approach & Style Tile */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-futura">Approach</h3>
                <div className="space-y-2 text-left">
                  <div>
                    <span className="font-semibold text-gray-900 font-futura">Allow mistakes:</span>
                    <span className="text-gray-600 font-futura"> Let teammates learn by doing.</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 font-futura">Prioritize people:</span>
                    <span className="text-gray-600 font-futura"> Dedicate my time to teammates first.</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 font-futura">Seek effort:</span>
                    <span className="text-gray-600 font-futura"> Reward hard work, persistence, and steady improvement.</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 font-futura">Invite bad news:</span>
                    <span className="text-gray-600 font-futura"> Ask first for what is going wrong and never punish honesty.</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 font-futura">Remove blockers:</span>
                    <span className="text-gray-600 font-futura"> Quickly clear obstacles so the team can keep moving.</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 font-futura">Value intentions:</span>
                    <span className="text-gray-600 font-futura"> Prioritize teammates with good intentions.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1 font-futura">
                  Based in Columbus, Ohio
                </p>
                <p className="text-sm text-gray-500 font-futura">
                  Ready for your next challenge
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;