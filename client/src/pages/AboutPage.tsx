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

      {/* Core Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {/* Leadership */}
            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Leadership
              </h3>
              <p className="text-gray-600 text-center leading-relaxed" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                From commanding troops to leading product teams, I believe leadership is about empowering others to achieve their best. It's not about being in charge—it's about taking care of those in your charge.
              </p>
              <div className="mt-6 text-center">
                <span className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                  8+ Years Military Leadership
                </span>
              </div>
            </motion.div>

            {/* Strategy */}
            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Strategy
              </h3>
              <p className="text-gray-600 text-center leading-relaxed" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Every great achievement starts with a clear strategy. I thrive on breaking down complex challenges into actionable plans, aligning teams toward common goals, and adapting when the landscape changes.
              </p>
              <div className="mt-6 text-center">
                <span className="inline-block bg-green-50 text-green-600 px-4 py-2 rounded-full text-sm font-medium">
                  Fortune 500 Consulting
                </span>
              </div>
            </motion.div>

            {/* Innovation */}
            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Lightbulb className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Innovation
              </h3>
              <p className="text-gray-600 text-center leading-relaxed" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Innovation isn't just about technology—it's about finding better ways to solve problems. I'm energized by exploring new approaches, challenging assumptions, and turning ideas into reality.
              </p>
              <div className="mt-6 text-center">
                <span className="inline-block bg-purple-50 text-purple-600 px-4 py-2 rounded-full text-sm font-medium">
                  Digital Transformation
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Fun Facts Circle */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-12" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Quick Facts About Me
            </h2>
            
            <div className="relative">
              {/* Central Circle */}
              <div className="w-32 h-32 md:w-40 md:h-40 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <span className="text-white font-bold text-2xl md:text-3xl" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  NL
                </span>
              </div>
              
              {/* Facts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                {funFacts.map((fact, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <p className="text-gray-700 text-sm font-medium" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                      {fact}
                    </p>
                  </motion.div>
                ))}
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
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Beyond the Office
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-lg">
                <div className="flex items-center mb-6">
                  <MapPin className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Life Journey
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Currently calling Columbus, Ohio home, but my journey has taken me from the mountains of North Carolina to the plains of Missouri, the labs of NC State, and the challenges of military bases across the country. Each place has shaped my perspective and approach to life.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-lg">
                <div className="flex items-center mb-6">
                  <Heart className="w-8 h-8 text-red-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    What Drives Me
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Family comes first, always. When I'm not solving complex business problems, you'll find me exploring new hiking trails, experimenting with coffee brewing techniques, or diving into the latest book on leadership or innovation.
                </p>
              </div>
            </div>

            <div className="mt-8 bg-white p-8 rounded-3xl shadow-lg">
              <div className="flex items-center mb-6">
                <Globe className="w-8 h-8 text-green-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Philosophy
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                "Success isn't just about reaching the destination—it's about who you become along the way and who you lift up with you." This philosophy guides everything I do, from leading teams to building products that make a real difference in people's lives.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interests Grid */}
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
              Interests & Hobbies
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Coffee, label: "Coffee Brewing", color: "bg-amber-100 text-amber-600" },
                { icon: Book, label: "Reading", color: "bg-blue-100 text-blue-600" },
                { icon: Music, label: "Music", color: "bg-purple-100 text-purple-600" },
                { icon: Camera, label: "Photography", color: "bg-green-100 text-green-600" }
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
                  <p className="text-gray-700 font-medium text-center" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {interest.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;