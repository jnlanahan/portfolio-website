import { motion } from "framer-motion";

const AboutPage = () => {
  return (
    <div className="page-container">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6">About Me</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          A bit more about my background, skills, and what drives me to create exceptional digital experiences.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src="https://images.unsplash.com/photo-1593062096033-9a26b09da705?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
            alt="Modern workspace with laptop and desk setup"
            className="rounded-xl shadow-lg w-full h-auto"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-space font-semibold mb-6">
            Crafting Digital Experiences Since 2015
          </h3>
          <p className="text-muted-foreground mb-6">
            I'm a full-stack developer with 8+ years of experience building impactful web applications. My journey began with a Computer Science degree from UC Berkeley, followed by roles at startups and established tech companies.
          </p>
          <p className="text-muted-foreground mb-6">
            I specialize in creating intuitive, accessible interfaces backed by robust architecture. My approach combines technical excellence with empathetic design thinking.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="text-xl font-space font-medium mb-4 text-secondary">
                Front-End
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <i className="ri-check-line text-secondary mr-2"></i> React & Next.js
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-secondary mr-2"></i> TypeScript
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-secondary mr-2"></i> Tailwind CSS
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-secondary mr-2"></i> Framer Motion
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-space font-medium mb-4 text-secondary">
                Back-End
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <i className="ri-check-line text-secondary mr-2"></i> Node.js & Express
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-secondary mr-2"></i> PostgreSQL & MongoDB
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-secondary mr-2"></i> GraphQL
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-secondary mr-2"></i> AWS & Firebase
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;