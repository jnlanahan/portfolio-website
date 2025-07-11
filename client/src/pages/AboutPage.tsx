import { motion } from "framer-motion";
import RotatingWords from "@/components/RotatingWords";

const AboutPage = () => {
  return (
    <div className="page-container relative">
      {/* Hero Section with Enhanced Profile Picture */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="z-10"
            >
              <p className="text-gray-600 mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif', fontSize: '16px' }}>Hello, I'm</p>
              <h1 className="text-gray-900 mb-6" style={{ 
                fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '700',
                fontSize: 'clamp(32px, 5vw, 48px)',
                lineHeight: '1.2'
              }}>
                Nick Lanahan
                <span className="block text-gray-700 mt-2" style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: '500' }}>
                  <RotatingWords 
                    words={["Leader", "Coach", "Product Manager", "Family Man", "Strategist", "Critical Thinker"]} 
                    interval={2500}
                    prefixText="and I am a"
                  />
                </span>
              </h1>
              <p className="text-gray-600 mb-8 max-w-xl" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif', fontSize: '17px', lineHeight: '1.5' }}>
                With 8+ years of experience crafting digital experiences since 2015, I specialize in building impactful web applications. My journey began with a Computer Science degree from UC Berkeley, followed by roles at startups and tech companies. I create intuitive, accessible interfaces backed by robust architecture, combining technical excellence with empathetic design thinking.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-xl font-medium mb-4 text-blue-600" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Front-End</h4>
                  <ul className="space-y-2 text-gray-600" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-2"></i> React & Next.js</li>
                    <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-2"></i> TypeScript</li>
                    <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-2"></i> Tailwind CSS</li>
                    <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-2"></i> Framer Motion</li>
                  </ul>
                </div>
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-xl font-medium mb-4 text-blue-600" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Back-End</h4>
                  <ul className="space-y-2 text-gray-600" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-2"></i> Node.js & Express</li>
                    <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-2"></i> PostgreSQL & MongoDB</li>
                    <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-2"></i> GraphQL</li>
                    <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-2"></i> AWS & Firebase</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex space-x-6">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label="GitHub"
                >
                  <i className="ri-github-fill"></i>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <i className="ri-linkedin-box-fill"></i>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label="Twitter"
                >
                  <i className="ri-twitter-fill"></i>
                </a>
                <a
                  href="https://codepen.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label="CodePen"
                >
                  <i className="ri-codepen-line"></i>
                </a>
              </div>
            </motion.div>

            <motion.div 
              className="relative lg:-ml-12 xl:-ml-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Enhanced profile picture with fade effect */}
              <div className="relative mx-auto w-[500px] h-[400px] -mt-12">
                {/* Animated gradient border effect with increased blur for fade effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-secondary via-primary to-secondary animate-spin-slow blur-lg"></div>
                <div className="absolute inset-1 rounded-lg bg-gradient-to-r from-secondary via-secondary to-secondary animate-spin-slow blur-lg"></div>
                
                {/* Enhanced Image with text fade effect */}
                <div className="absolute inset-2 rounded-lg overflow-hidden shadow-xl z-10">
                  <div className="absolute inset-0 bg-gradient-to-l from-background via-background/50 to-transparent z-20"></div>
                  <img
                    src="https://images.unsplash.com/photo-1555952517-2e8e729e0b44?q=80&w=1964&auto=format&fit=crop"
                    alt="Alex Chen - Portfolio headshot"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default AboutPage;