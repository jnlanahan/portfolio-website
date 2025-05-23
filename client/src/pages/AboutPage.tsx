import { motion } from "framer-motion";
import { Link } from "wouter";
import { GlowingEffect } from "@/components/ui/glowing-effect";

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
      className="relative min-h-[16rem] rounded-xl"
    >
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={2}
        />
        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border-[0.75px] bg-background/30 backdrop-blur-sm p-6 shadow-sm">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg bg-primary/20 p-3">
              <i className={`${icon} text-primary text-xl`}></i>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-space font-semibold">{title}</h3>
              <p className="text-muted-foreground">{description}</p>
              <Link 
                href={linkTo}
                className="inline-flex items-center text-secondary hover:underline mt-4"
              >
                Explore <i className="ri-arrow-right-line ml-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
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