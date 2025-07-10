import { motion } from "framer-motion";
import { Link } from "wouter";
import { trackEvent } from "@/lib/analytics";
import { GlowingCard } from "@/components/ui/glowing-card";

const HomeTile = ({ 
  title, 
  description, 
  icon, 
  linkTo, 
  delay = 0,
  size = "normal",
  image
}: { 
  title: string; 
  description: string; 
  icon: string; 
  linkTo: string; 
  delay?: number;
  size?: "normal" | "large" | "wide";
  image?: string;
}) => {
  const isExternal = linkTo.startsWith('http') || linkTo.startsWith('mailto:');
  
  const handleClick = () => {
    trackEvent('homepage_tile_click', { 
      tile: title, 
      destination: linkTo 
    });
  };

  const tileContent = (
    <GlowingCard 
      className="bg-background/90 backdrop-blur-md rounded-2xl border border-secondary/10 hover:border-secondary/30 hover:bg-background/95 transition-all duration-300 h-full cursor-pointer group overflow-hidden"
      glowColor="rgba(67, 186, 147, 0.6)"
    >
      {/* Header with title and arrow */}
      <div className="flex items-center justify-between p-6 pb-4">
        <h3 className="text-lg font-space font-medium text-foreground group-hover:text-secondary transition-colors">
          {title}
        </h3>
        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
          <i className="ri-arrow-right-line text-secondary text-sm group-hover:translate-x-0.5 transition-transform"></i>
        </div>
      </div>

      {/* Content area */}
      <div className="px-6 pb-6 flex-1">
        {image ? (
          <div className="mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-secondary/5 to-primary/5">
            <img 
              src={image} 
              alt={title}
              className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                size === "large" ? "h-48" : "h-32"
              }`}
            />
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-center h-16">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <i className={`${icon} text-secondary text-2xl`}></i>
            </div>
          </div>
        )}
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </GlowingCard>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`${
        size === "large" ? "row-span-2" : 
        size === "wide" ? "col-span-2" : ""
      }`}
    >
      {isExternal ? (
        <a 
          href={linkTo}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
        >
          {tileContent}
        </a>
      ) : (
        <Link 
          href={linkTo}
          onClick={handleClick}
        >
          {tileContent}
        </Link>
      )}
    </motion.div>
  );
};

const HomePage = () => {
  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
              <i className="ri-code-s-slash-line text-secondary text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-space font-bold">
                Nick<span className="text-secondary">.</span>Lanahan
              </h1>
              <p className="text-sm text-muted-foreground">Portfolio & Development</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tiles Grid */}
      <div className="max-w-7xl mx-auto">
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 h-40">
          {/* Large Brand Tile */}
          <div className="md:col-span-1 h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="h-full"
            >
              <GlowingCard 
                className="bg-background/90 backdrop-blur-md rounded-2xl border border-secondary/10 hover:border-secondary/30 transition-all duration-300 h-full flex items-center justify-center"
                glowColor="rgba(67, 186, 147, 0.6)"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <i className="ri-code-s-slash-line text-secondary text-3xl"></i>
                  </div>
                  <h2 className="text-xl font-space font-bold">
                    Nick<span className="text-secondary">.</span>Lanahan
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">Full Stack Developer</p>
                </div>
              </GlowingCard>
            </motion.div>
          </div>
          
          {/* Three Small Tiles */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <HomeTile
              title="Contact"
              description="Get in touch with me"
              icon="ri-mail-line"
              linkTo="/contact"
              delay={0.2}
            />
            
            <HomeTile
              title="Resume"
              description="Download my resume"
              icon="ri-file-download-line"
              linkTo="/resume.pdf"
              delay={0.3}
            />
            
            <HomeTile
              title="LinkedIn"
              description="Connect with me"
              icon="ri-linkedin-line"
              linkTo="https://linkedin.com/in/nicklanahan"
              delay={0.4}
            />
          </div>
        </div>
        
        {/* Bottom Row - Four tiles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <HomeTile
            title="About"
            description="Learn more about my background, skills, and journey"
            icon="ri-user-line"
            linkTo="/about"
            delay={0.5}
            size="large"
          />
          
          <HomeTile
            title="Portfolio"
            description="Browse my latest projects and technical work"
            icon="ri-briefcase-line"
            linkTo="/portfolio"
            delay={0.6}
            size="large"
            image="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop"
          />
          
          <HomeTile
            title="Blog"
            description="Read my thoughts on technology, development, and more"
            icon="ri-article-line"
            linkTo="/blog"
            delay={0.7}
            size="large"
            image="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1000&auto=format&fit=crop"
          />
          
          <HomeTile
            title="Top 5 Lists"
            description="Curated lists of my favorite tools, resources, and recommendations"
            icon="ri-list-check-line"
            linkTo="/top5"
            delay={0.8}
            size="large"
            image="https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=1000&auto=format&fit=crop"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;