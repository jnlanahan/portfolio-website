import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <section id="home" className="pt-28 md:pt-32 min-h-screen flex items-center">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-secondary font-sora mb-4">Hello, I'm</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-space mb-6">
              Alex Chen
              <span className="block text-2xl md:text-3xl text-muted-foreground mt-2">
                Full-Stack Developer & UX Enthusiast
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              I build accessible, user-centric applications that solve real problems.
              Specializing in React, Node.js, and everything in between.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#portfolio"
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-md transition-colors flex items-center"
              >
                <i className="ri-briefcase-line mr-2"></i> View My Work
              </a>
              <a
                href="#contact"
                className="px-6 py-3 bg-transparent border border-border hover:border-secondary text-foreground font-medium rounded-md transition-colors flex items-center"
              >
                <i className="ri-mail-line mr-2"></i> Get In Touch
              </a>
            </div>

            <div className="mt-12 flex space-x-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl text-muted-foreground hover:text-secondary transition-colors"
                aria-label="GitHub"
              >
                <i className="ri-github-fill"></i>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl text-muted-foreground hover:text-secondary transition-colors"
                aria-label="LinkedIn"
              >
                <i className="ri-linkedin-box-fill"></i>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl text-muted-foreground hover:text-secondary transition-colors"
                aria-label="Twitter"
              >
                <i className="ri-twitter-fill"></i>
              </a>
              <a
                href="https://codepen.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl text-muted-foreground hover:text-secondary transition-colors"
                aria-label="CodePen"
              >
                <i className="ri-codepen-line"></i>
              </a>
            </div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img
              src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800"
              alt="Alex Chen - Portfolio headshot"
              className="rounded-full mx-auto w-64 h-64 md:w-80 md:h-80 object-cover border-4 border-primary shadow-lg"
            />

            <motion.div
              className="absolute -bottom-4 -right-4 md:bottom-4 md:right-16 bg-[#1E1E1E] p-4 rounded-lg shadow-lg border border-border"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-secondary animate-pulse mr-2"></div>
                <span className="text-sm font-medium">Currently Available for Work</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
