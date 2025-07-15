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
            className="max-w-6xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 font-futura">
              I am a...
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {/* Critical Thinker */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl shadow-lg h-full"
              >
                <div className="text-xl font-bold text-slate-600 mb-3 font-futura">
                  Critical Thinker
                </div>
                <p className="text-gray-600 text-sm font-futura mb-3 leading-relaxed">
                  20+ years solving unique, one of a kind challenges as an Army Officer, consultant, and engineer.
                </p>
                <p className="text-slate-600 text-base font-futura font-bold">
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
                className="bg-white p-6 rounded-2xl shadow-lg h-full"
              >
                <div className="text-xl font-bold text-slate-600 mb-3 font-futura">
                  Decision Maker
                </div>
                <p className="text-gray-600 text-sm font-futura mb-3 leading-relaxed">
                  Trained to make tough calls and set priorities even when the stakes are high. I have had to make decisions that affect not just me but others too.
                </p>
                <p className="text-slate-600 text-base font-futura font-bold">
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
                className="bg-white p-6 rounded-2xl shadow-lg h-full"
              >
                <div className="text-xl font-bold text-slate-600 mb-3 font-futura">
                  Lifelong Learner
                </div>
                <p className="text-gray-600 text-sm font-futura mb-3 leading-relaxed">
                  I never aim to just get the job done. I want to master what I do. I dive in, get obsessed (in a good way), and keep learning the finer points as I go.
                </p>
                <p className="text-slate-600 text-base font-futura font-bold">
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
                className="bg-white p-6 rounded-2xl shadow-lg h-full"
              >
                <div className="text-xl font-bold text-slate-600 mb-3 font-futura">
                  Driver of Change
                </div>
                <p className="text-gray-600 text-sm font-futura mb-3 leading-relaxed">
                  I have led and supported multiple large scale transformations in the Army and major financial services organizations. I know how to drive change from stakeholder communication and planning to managing resistance before it becomes a problem.
                </p>
                <p className="text-slate-600 text-base font-futura font-bold">
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
                className="bg-white p-6 rounded-2xl shadow-lg h-full"
              >
                <div className="text-xl font-bold text-slate-600 mb-3 font-futura">
                  Communicator
                </div>
                <p className="text-gray-600 text-sm font-futura mb-3 leading-relaxed">
                  I understand what effective communication requires and have trained others to identify its root causes when it fails. I have presented to executives at major banks and commanding generals in the Army, adapting my approach for every audience.
                </p>
                <p className="text-slate-600 text-base font-futura font-bold">
                  All communication is not equal.
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
                  <Users className="w-8 h-8 text-slate-500 mr-3" />
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
                  <Target className="w-8 h-8 text-slate-500 mr-3" />
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