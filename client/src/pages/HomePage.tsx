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
  image,
  compact = false
}: { 
  title: string; 
  description: string; 
  icon: string; 
  linkTo: string; 
  delay?: number;
  size?: "normal" | "large" | "wide";
  image?: string;
  compact?: boolean;
}) => {
  const isExternal = linkTo.startsWith('http') || linkTo.startsWith('mailto:');
  
  const handleClick = () => {
    trackEvent('homepage_tile_click', { 
      tile: title, 
      destination: linkTo 
    });
  };

  const tileContent = compact ? (
    <GlowingCard 
      className="bg-background/90 backdrop-blur-md rounded-2xl border border-secondary/10 hover:border-secondary/30 hover:bg-background/95 transition-all duration-300 h-32 md:h-16 cursor-pointer group overflow-hidden flex items-center justify-center"
      glowColor="rgba(67, 186, 147, 0.6)"
    >
      <h3 className="text-sm font-space font-medium text-foreground group-hover:text-secondary transition-colors">
        {title}
      </h3>
    </GlowingCard>
  ) : (
    <GlowingCard 
      className="bg-background/90 backdrop-blur-md rounded-2xl border border-secondary/10 hover:border-secondary/30 hover:bg-background/95 transition-all duration-300 h-full cursor-pointer group overflow-hidden"
      glowColor="rgba(67, 186, 147, 0.6)"
    >
      {/* Header with title */}
      <div className="p-6 pb-4">
        <h3 className="text-lg font-space font-medium text-foreground group-hover:text-secondary transition-colors">
          {title}
        </h3>
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
      {/* Navigation Tiles Grid */}
      <div className="max-w-7xl mx-auto">
        {/* Mobile: Single Column Stack */}
        <div className="block md:hidden space-y-4 mb-4">
          {/* Brand Tile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-16"
          >
            <GlowingCard 
              className="bg-background/90 backdrop-blur-md rounded-2xl border border-secondary/10 hover:border-secondary/30 transition-all duration-300 h-full flex items-center justify-center"
              glowColor="rgba(67, 186, 147, 0.6)"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
                  <i className="ri-code-s-slash-line text-secondary text-xl"></i>
                </div>
                <div>
                  <h2 className="text-lg font-space font-bold">
                    Nick<span className="text-secondary">.</span>Lanahan
                  </h2>
                  <p className="text-xs text-muted-foreground">Full Stack Developer</p>
                </div>
              </div>
            </GlowingCard>
          </motion.div>
          
          {/* Utility Tiles */}
          <HomeTile
            title="Contact"
            description=""
            icon=""
            linkTo="/contact"
            delay={0.2}
            compact={true}
          />
          
          <HomeTile
            title="Resume"
            description=""
            icon=""
            linkTo="/resume.pdf"
            delay={0.3}
            compact={true}
          />
          
          <HomeTile
            title="LinkedIn"
            description=""
            icon=""
            linkTo="https://linkedin.com/in/nicklanahan"
            delay={0.4}
            compact={true}
          />
        </div>

        {/* Desktop: Two Row Layout */}
        <div className="hidden md:block">
          {/* Top Row */}
          <div className="grid grid-cols-12 gap-4 mb-4 h-16">
            {/* Brand Tile - 1/3 wider again (6 columns instead of 4) */}
            <div className="col-span-6 h-full">
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
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
                      <i className="ri-code-s-slash-line text-secondary text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-lg font-space font-bold">
                        Nick<span className="text-secondary">.</span>Lanahan
                      </h2>
                      <p className="text-xs text-muted-foreground">Full Stack Developer</p>
                    </div>
                  </div>
                </GlowingCard>
              </motion.div>
            </div>
            
            {/* Three Compact Tiles - 2 columns each in remaining 6 columns */}
            <div className="col-span-6 grid grid-cols-3 gap-4 h-full">
              <HomeTile
                title="Contact"
                description=""
                icon=""
                linkTo="/contact"
                delay={0.2}
                compact={true}
              />
              
              <HomeTile
                title="Resume"
                description=""
                icon=""
                linkTo="/resume.pdf"
                delay={0.3}
                compact={true}
              />
              
              <HomeTile
                title="LinkedIn"
                description=""
                icon=""
                linkTo="https://linkedin.com/in/nicklanahan"
                delay={0.4}
                compact={true}
              />
            </div>
          </div>
        </div>
        
        {/* Main Navigation Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <HomeTile
            title="About"
            description="Learn more about my background, skills, and journey"
            icon="ri-user-line"
            linkTo="/about"
            delay={0.5}
            size="large"
            image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"
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