import { motion } from "framer-motion";
import { Target, Users, Lightbulb, Camera, MapPin } from "lucide-react";

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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center font-futura">
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
                  <h3 className="text-xl font-bold text-gray-900 font-futura">
                    Military to Corporate
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed font-futura">
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
                  <h3 className="text-xl font-bold text-gray-900 font-futura">
                    Strategic Thinking
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed font-futura">
                  I break down complex business challenges into actionable strategies. My approach combines analytical rigor with creative problem-solving to deliver results that matter.
                </p>
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
              My <span className="text-blue-600">Passions</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-futura">
              Three principles that guide everything I do
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
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center font-futura">
                  Leadership
                </h3>
                <p className="text-gray-600 text-center leading-relaxed font-futura">
                  From commanding troops to leading product teams, I believe leadership is about empowering others to achieve their best.
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
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center font-futura">
                  Strategy
                </h3>
                <p className="text-gray-600 text-center leading-relaxed font-futura">
                  Breaking down complex challenges into actionable plans, aligning teams toward common goals and adapting when needed.
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
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center font-futura">
                  Innovation
                </h3>
                <p className="text-gray-600 text-center leading-relaxed font-futura">
                  Finding better ways to solve problems, challenging assumptions, and turning ideas into reality.
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
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 font-futura">
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
                <div className="text-2xl font-bold text-blue-600 mb-2 font-futura">
                  Military → Corporate
                </div>
                <p className="text-gray-600 text-sm font-futura">
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
                <div className="text-2xl font-bold text-green-600 mb-2 font-futura">
                  Technical + Business
                </div>
                <p className="text-gray-600 text-sm font-futura">
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
                <div className="text-2xl font-bold text-purple-600 mb-2 font-futura">
                  Mission-First
                </div>
                <p className="text-gray-600 text-sm font-futura">
                  Focused on outcomes that drive real business impact
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pictures Section */}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Professional Photo */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Professional Team Photo</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 font-futura">
                    Leading Teams
                  </h3>
                  <p className="text-gray-600 text-sm font-futura">
                    Working with my team at EY
                  </p>
                </div>
              </motion.div>

              {/* Military Photo */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Military Service Photo</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 font-futura">
                    Military Leadership
                  </h3>
                  <p className="text-gray-600 text-sm font-futura">
                    8+ years serving in the U.S. Army
                  </p>
                </div>
              </motion.div>

              {/* Personal/Adventure Photo */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Adventure/Hiking Photo</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 font-futura">
                    Beyond Work
                  </h3>
                  <p className="text-gray-600 text-sm font-futura">
                    Exploring trails and recharging outdoors
                  </p>
                </div>
              </motion.div>

              {/* Travel Photo */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Travel/Location Photo</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 font-futura">
                    Journey Across States
                  </h3>
                  <p className="text-gray-600 text-sm font-futura">
                    From NC to Missouri to Ohio
                  </p>
                </div>
              </motion.div>

              {/* University Photo */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">University Photo</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 font-futura">
                    Academic Journey
                  </h3>
                  <p className="text-gray-600 text-sm font-futura">
                    Engineering studies and continued learning
                  </p>
                </div>
              </motion.div>

              {/* Family/Personal Photo */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Family/Personal Photo</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 font-futura">
                    What Matters Most
                  </h3>
                  <p className="text-gray-600 text-sm font-futura">
                    Family and personal connections
                  </p>
                </div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6 font-futura">
              My Professional Philosophy
            </h2>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <blockquote className="text-lg text-gray-700 italic mb-6 font-futura">
                "Leadership is not about being in charge. It's about taking care of those in your charge."
              </blockquote>
              <p className="text-gray-600 leading-relaxed mb-6 font-futura">
                This principle, learned through military service and refined in corporate environments, drives how I approach every challenge. Whether leading a team through complex transformations or solving technical problems, I focus on empowering others and delivering results that matter.
              </p>
              <div className="flex justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1 font-futura">
                    Based in Columbus, Ohio
                  </p>
                  <p className="text-sm text-gray-500 font-futura">
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