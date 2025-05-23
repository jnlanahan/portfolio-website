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

const NewHomePage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 md:py-32">
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

              {/* Buttons removed */}

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
              <div className="relative mx-auto w-64 h-64 md:w-80 md:h-80">
                {/* Animated border effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-secondary to-primary animate-spin-slow blur-sm"></div>
                <div className="absolute inset-1 rounded-full bg-gradient-to-r from-secondary via-primary to-secondary animate-spin-slow blur-sm"></div>
                
                {/* Image */}
                <div className="absolute inset-2 rounded-full overflow-hidden shadow-xl z-10">
                  <img
                    src="https://images.unsplash.com/photo-1555952517-2e8e729e0b44?q=80&w=1964&auto=format&fit=crop"
                    alt="Alex Chen - Portfolio headshot"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

{/* "Currently Available for Work" tile removed */}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Navigation Tiles */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-space mb-4">Explore My Work</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Navigate through different sections of my portfolio to learn more about me, my work, and my thoughts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <HomeTile 
              title="About Me" 
              description="Learn more about my background, skills, and what drives me to create exceptional digital experiences."
              icon="ri-user-line"
              linkTo="/about"
              delay={0.1}
            />
            
            <HomeTile 
              title="Resume" 
              description="Explore my professional journey through tech, design, and problem-solving."
              icon="ri-file-list-line"
              linkTo="/resume"
              delay={0.2}
            />
            
            <HomeTile 
              title="Portfolio" 
              description="Browse through my recent projects, experiments, and collaborations."
              icon="ri-folder-line"
              linkTo="/portfolio"
              delay={0.3}
            />
            
            <HomeTile 
              title="Blog" 
              description="Read my thoughts, tutorials, and insights from my journey in tech."
              icon="ri-article-line"
              linkTo="/blog"
              delay={0.4}
            />
            
            <HomeTile 
              title="Top 5 Lists" 
              description="Discover my favorite tools, resources, and inspirations organized in curated lists."
              icon="ri-list-check"
              linkTo="/top5"
              delay={0.5}
            />
            
{/* Contact tile removed */}
          </div>
        </div>
      </section>
    </>
  );
};

export default NewHomePage;