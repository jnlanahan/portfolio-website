import { motion } from "framer-motion";
import { Target, Lightbulb, Users, MapPin, Coffee, Book, Music, Camera, Globe, Heart } from "lucide-react";

const AboutPage = () => {
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

  const funFacts = [
    "Born and raised in North Carolina",
    "Served 8+ years in the U.S. Army",
    "Graduated from 4 universities",
    "Worked across 3 different states",
    "Led teams of 50+ people",
    "Coffee enthusiast (3 cups minimum daily)",
    "Weekend warrior on hiking trails",
    "Passionate about continuous learning"
  ];

  return (
    <div className="page-container relative">
      {/* Hero Introduction */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Getting to Know
              <span className="block text-blue-600">Nick Lanahan</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Beyond the resume lies a story of service, growth, and passion. I'm driven by the belief that great leadership, strategic thinking, and innovative solutions can transform organizations and lives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Values Section - Enhanced with Images */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              My <span className="text-blue-600">Passions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              These three principles guide everything I do, from leading teams to building innovative solutions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Leadership */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
                {/* Header with Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="w-16 h-16 text-white opacity-80" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">01</span>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Leadership
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    From commanding troops to leading product teams, I believe leadership is about empowering others to achieve their best. It's not about being in charge—it's about taking care of those in your charge.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                      Military Leadership
                    </span>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                      Team Building
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Strategy */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
                {/* Header with Image */}
                <div className="relative h-48 bg-gradient-to-br from-green-500 to-green-600 overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Target className="w-16 h-16 text-white opacity-80" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">02</span>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Strategy
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Every great achievement starts with a clear strategy. I thrive on breaking down complex challenges into actionable plans, aligning teams toward common goals, and adapting when the landscape changes.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                      Fortune 500
                    </span>
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                      Consulting
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Innovation */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="relative group"
            >
              <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
                {/* Header with Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-500 to-purple-600 overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lightbulb className="w-16 h-16 text-white opacity-80" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">03</span>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Innovation
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Innovation isn't just about technology—it's about finding better ways to solve problems. I'm energized by exploring new approaches, challenging assumptions, and turning ideas into reality.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                      Digital Transformation
                    </span>
                    <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                      Product Innovation
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visual Journey Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              My Journey in Numbers
            </h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              {[
                { number: "8+", label: "Years Military Service", color: "text-blue-600" },
                { number: "4", label: "Universities Attended", color: "text-green-600" },
                { number: "3", label: "States Worked In", color: "text-purple-600" },
                { number: "50+", label: "People Led", color: "text-orange-600" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className={`text-4xl font-bold ${stat.color} mb-2`} style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Creative Facts Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Personal Facts */}
              <div className="space-y-4">
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-red-600 font-bold">NC</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Born & Raised</h4>
                      <p className="text-gray-600 text-sm" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>North Carolina</p>
                    </div>
                  </div>
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Mountain landscapes image</span>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <Coffee className="w-6 h-6 text-amber-600 mr-3" />
                    <h4 className="font-bold text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Coffee Enthusiast</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    3 cups minimum daily, always exploring new brewing methods
                  </p>
                  <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Coffee brewing image</span>
                  </div>
                </motion.div>
              </div>

              {/* Center Column - Main Image */}
              <div className="lg:col-span-1">
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-white p-6 rounded-2xl shadow-lg h-full"
                >
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        NL
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                      Nick Lanahan
                    </h3>
                    <p className="text-gray-600" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                      Columbus, Ohio
                    </p>
                  </div>
                  
                  <div className="w-full h-64 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Professional headshot image</span>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-600 text-sm italic" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                      "Leadership is not about being in charge. It's about taking care of those in your charge."
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Professional Facts */}
              <div className="space-y-4">
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-white p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-green-600 font-bold">EY</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Current Role</h4>
                      <p className="text-gray-600 text-sm" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Product Management</p>
                    </div>
                  </div>
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Office/team collaboration image</span>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="bg-white p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <Camera className="w-6 h-6 text-purple-600 mr-3" />
                    <h4 className="font-bold text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Weekend Warrior</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Exploring hiking trails and capturing moments
                  </p>
                  <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Hiking/outdoor image</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Personal Life Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Beyond the Office
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-8 rounded-3xl shadow-lg">
                <div className="flex items-center mb-6">
                  <MapPin className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Life Journey
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Currently calling Columbus, Ohio home, but my journey has taken me from the mountains of North Carolina to the plains of Missouri, the labs of NC State, and the challenges of military bases across the country. Each place has shaped my perspective and approach to life.
                </p>
                <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Travel/location montage image</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-lg">
                <div className="flex items-center mb-6">
                  <Heart className="w-8 h-8 text-red-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    What Drives Me
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Family comes first, always. When I'm not solving complex business problems, you'll find me exploring new hiking trails, experimenting with coffee brewing techniques, or diving into the latest book on leadership or innovation.
                </p>
                <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Family/personal life image</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <div className="flex items-center mb-6">
                <Globe className="w-8 h-8 text-green-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Philosophy
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-gray-600 leading-relaxed text-lg" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    "Success isn't just about reaching the destination—it's about who you become along the way and who you lift up with you." This philosophy guides everything I do, from leading teams to building products that make a real difference in people's lives.
                  </p>
                </div>
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Inspirational/leadership image</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interests & Lifestyle Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Interests & Lifestyle
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  icon: Coffee, 
                  label: "Coffee Brewing", 
                  color: "bg-amber-100 text-amber-600",
                  description: "Exploring different brewing methods and bean origins"
                },
                { 
                  icon: Book, 
                  label: "Reading", 
                  color: "bg-blue-100 text-blue-600",
                  description: "Leadership, strategy, and innovation books"
                },
                { 
                  icon: Music, 
                  label: "Music", 
                  color: "bg-purple-100 text-purple-600",
                  description: "Diverse genres for focus and relaxation"
                },
                { 
                  icon: Camera, 
                  label: "Photography", 
                  color: "bg-green-100 text-green-600",
                  description: "Capturing moments during hiking adventures"
                }
              ].map((interest, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 ${interest.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <interest.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-gray-900 font-bold text-center mb-2" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {interest.label}
                  </h3>
                  <p className="text-gray-600 text-sm text-center mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {interest.description}
                  </p>
                  <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-xs">{interest.label.toLowerCase()} image</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Lifestyle Showcase */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Continuous Learning
                </h3>
                <p className="text-gray-600 text-sm mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Always exploring new ideas through books, podcasts, and online courses
                </p>
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Learning/books image</span>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Outdoor Adventures
                </h3>
                <p className="text-gray-600 text-sm mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Weekend hiking trips to recharge and find inspiration in nature
                </p>
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Hiking/nature image</span>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Community Impact
                </h3>
                <p className="text-gray-600 text-sm mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Mentoring young professionals and giving back to the community
                </p>
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Community/mentoring image</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;