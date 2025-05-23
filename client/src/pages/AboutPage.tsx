import { motion } from "framer-motion";
import { Link } from "wouter";

const HomeTile = ({ 
  title, 
  description, 
  icon, 
  linkTo, 
  delay = 0 
}: { 
  title: string; 
  description: string; 
  icon: string; 
  linkTo: string; 
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-background/30 backdrop-blur-sm rounded-xl border border-border hover:border-secondary p-6 transition-all duration-300"
    >
      <div className="flex items-center mb-4">
        <div className="bg-primary/20 p-3 rounded-full mr-3">
          <i className={`${icon} text-primary text-xl`}></i>
        </div>
        <h3 className="text-xl font-space font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground mb-6">{description}</p>
      <Link 
        href={linkTo}
        className="inline-flex items-center text-secondary hover:underline"
      >
        Explore <i className="ri-arrow-right-line ml-2"></i>
      </Link>
    </motion.div>
  );
};

const AboutPage = () => {
  return (
    <div className="page-container">
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

              <div className="mt-8 flex space-x-6">
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
              className="relative lg:-ml-12 xl:-ml-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Enhanced profile picture with fade effect */}
              <div className="relative mx-auto w-80 h-80 md:w-96 md:h-96">
                {/* Animated gradient border effect with increased blur for fade effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-secondary to-primary animate-spin-slow blur-lg"></div>
                <div className="absolute inset-1 rounded-full bg-gradient-to-r from-secondary via-primary to-secondary animate-spin-slow blur-lg"></div>
                
                {/* Enhanced Image with text fade effect */}
                <div className="absolute inset-2 rounded-full overflow-hidden shadow-xl z-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-20 opacity-50"></div>
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

      {/* About Me Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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
      </section>

      {/* Navigation Tiles */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore My Work</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Navigate through different sections of my portfolio to learn more about me, my work, and my thoughts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <HomeTile 
              title="Resume" 
              description="Explore my professional journey through tech, design, and problem-solving."
              icon="ri-file-list-line"
              linkTo="/resume"
              delay={0.1}
            />
            
            <HomeTile 
              title="Portfolio" 
              description="Browse through my recent projects, experiments, and collaborations."
              icon="ri-folder-line"
              linkTo="/portfolio"
              delay={0.2}
            />
            
            <HomeTile 
              title="Blog" 
              description="Read my thoughts, tutorials, and insights from my journey in tech."
              icon="ri-article-line"
              linkTo="/blog"
              delay={0.3}
            />
            
            <HomeTile 
              title="Top 5 Lists" 
              description="Discover my favorite tools, resources, and inspirations organized in curated lists."
              icon="ri-list-check"
              linkTo="/top5"
              delay={0.4}
            />
            
            <HomeTile 
              title="Contact" 
              description="Reach out for collaboration opportunities, questions, or just to say hello."
              icon="ri-mail-line"
              linkTo="/contact"
              delay={0.5}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;