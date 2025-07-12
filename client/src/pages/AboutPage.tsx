import { motion } from "framer-motion";
import { Target, Users } from "lucide-react";

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

  return (
    <div className="page-container relative">
      {/* Hero Introduction */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Beyond the Resume
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              What drives me as a leader and how I approach challenges that matter.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Leadership Philosophy */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              How I Lead
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Leadership Philosophy */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Military to Corporate
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  8+ years of military leadership taught me that great leaders empower others to succeed. I bring this servant-leadership approach to corporate environments, focusing on team development and mission accomplishment.
                </p>
              </motion.div>

              {/* Problem-Solving Approach */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <Target className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Strategic Thinking
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  I break down complex business challenges into actionable strategies. My approach combines analytical rigor with creative problem-solving to deliver results that matter.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Sets Me Apart */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              What Sets Me Apart
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Unique Perspective */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="text-2xl font-bold text-blue-600 mb-2" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Military → Corporate
                </div>
                <p className="text-gray-600 text-sm" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Unique perspective bridging military discipline with corporate innovation
                </p>
              </motion.div>

              {/* Cross-functional Experience */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="text-2xl font-bold text-green-600 mb-2" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Technical + Business
                </div>
                <p className="text-gray-600 text-sm" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Engineering background with business strategy execution
                </p>
              </motion.div>

              {/* Results-Oriented */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="text-2xl font-bold text-purple-600 mb-2" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Mission-First
                </div>
                <p className="text-gray-600 text-sm" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Focused on outcomes that drive real business impact
                </p>
              </motion.div>
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
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              My Professional Philosophy
            </h2>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <blockquote className="text-lg text-gray-700 italic mb-6" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                "Leadership is not about being in charge. It's about taking care of those in your charge."
              </blockquote>
              <p className="text-gray-600 leading-relaxed mb-6" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                This principle, learned through military service and refined in corporate environments, drives how I approach every challenge. Whether leading a team through complex transformations or solving technical problems, I focus on empowering others and delivering results that matter.
              </p>
              <div className="flex justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Based in Columbus, Ohio
                  </p>
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Ready for your next challenge
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;