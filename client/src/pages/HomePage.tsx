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
      className="relative border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden flex items-center justify-center bg-white hover:-translate-y-1"
      style={{ 
        borderRadius: '16px', /* 8-point grid radius */
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', /* Apple-style subtle shadow */
        height: '64px' /* 8-point grid height */
      }}
      glowColor="rgba(0, 122, 255, 0.1)"
      strength={0.3}
    >
      <h3 className="font-space font-medium text-gray-900 group-hover:text-primary transition-colors" style={{ fontSize: '14px' }}> {/* Consistent sizing */}
        {title}
      </h3>
    </GlowingCard>
  ) : (
    <GlowingCard 
      className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 h-full cursor-pointer group overflow-hidden hover:-translate-y-1"
      style={{ 
        borderRadius: '16px', /* 8-point grid radius */
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' /* Apple-style subtle shadow */
      }}
      glowColor="rgba(0, 122, 255, 0.1)"
      strength={0.3}
    >
      {/* Header with title */}
      <div style={{ padding: '16px 16px 8px' }}> {/* 8-point grid padding */}
        <h3 className="font-space font-medium text-gray-900 group-hover:text-primary transition-colors" style={{ fontSize: '20px' }}> {/* Apple HIG: Section headings 20-24px */}
          {title}
        </h3>
      </div>

      {/* Content area */}
      <div style={{ padding: '0 16px 16px' }} className="flex-1"> {/* 8-point grid padding */}
        {image ? (
          <div style={{ marginBottom: '12px', borderRadius: '12px' }} className="overflow-hidden bg-gray-50"> {/* 8-point grid margin and radius */}
            <img 
              src={image} 
              alt={title}
              className={`w-full object-cover group-hover:scale-105 transition-transform duration-500`}
              style={{ height: size === "large" ? '128px' : '96px' }} /* 8-point grid heights */
            />
          </div>
        ) : (
          <div style={{ marginBottom: '12px', height: '48px' }} className="flex items-center justify-center"> {/* 8-point grid dimensions */}
            <div style={{ width: '40px', height: '40px', borderRadius: '12px' }} className="bg-gray-100 flex items-center justify-center"> {/* 8-point grid dimensions */}
              <i className={`${icon} text-primary text-xl`}></i>
            </div>
          </div>
        )}
        <p className="text-gray-600 leading-relaxed" style={{ fontSize: '16px' }}> {/* Apple HIG: Body copy 16-17px */}
          {description}
        </p>
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

const ActionButton = ({ title, linkTo, delay }: { title: string; linkTo: string; delay: number }) => {
  const isExternal = linkTo.startsWith('http') || linkTo.startsWith('mailto:');
  
  const handleClick = () => {
    trackEvent('homepage_action_click', { 
      action: title, 
      destination: linkTo 
    });
  };

  const buttonContent = (
    <div 
      className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-pointer group flex items-center justify-center hover:shadow-lg"
      style={{ 
        borderRadius: '32px', /* Apple-style pill shape */
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', /* Apple-style subtle shadow */
        height: '48px', /* 8-point grid height */
        padding: '0 24px' /* 8-point grid padding */
      }}
    >
      <span className="font-space font-medium text-gray-900 group-hover:text-primary transition-colors" style={{ fontSize: '16px' }}>
        {title}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {isExternal ? (
        <a 
          href={linkTo}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
        >
          {buttonContent}
        </a>
      ) : (
        <Link 
          href={linkTo}
          onClick={handleClick}
        >
          {buttonContent}
        </Link>
      )}
    </motion.div>
  );
};

const HomePage = () => {
  return (
    <div className="min-h-screen" style={{ padding: '24px 16px' }}> {/* 8-point grid: 24px vertical, 16px horizontal */}
      {/* Navigation Tiles Grid */}
      <div className="max-w-6xl mx-auto">
        {/* Mobile: Single Column Stack */}
        <div className="block md:hidden" style={{ marginBottom: '24px' }}> {/* 8-point grid spacing */}
          <div style={{ marginBottom: '16px' }}> {/* 8-point grid spacing between elements */}
            {/* Brand Tile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ height: '64px' }} /* 8-point grid: 64px height */
            >
              <GlowingCard 
                className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 h-full flex items-center justify-center hover:-translate-y-1"
                style={{ 
                  borderRadius: '16px', /* 8-point grid radius */
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)' /* Apple-style subtle shadow */
                }}
                glowColor="rgba(0, 122, 255, 0.1)"
                strength={0.3}
              >
                <h1 className="font-space font-bold text-gray-900" style={{ fontSize: '32px' }}> {/* Apple HIG: Page title 32-36px */}
                  Nick<span className="text-primary">.</span>Lanahan
                </h1>
              </GlowingCard>
            </motion.div>
          </div>
          
          {/* Action Buttons */}
          <div style={{ marginBottom: '32px' }}> {/* 8-point grid spacing */}
            <div style={{ marginBottom: '12px' }}>
              <ActionButton
                title="Contact Me"
                linkTo="/contact"
                delay={0.2}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <ActionButton
                title="Download my Resume"
                linkTo="/resume.pdf"
                delay={0.3}
              />
            </div>
            <div>
              <ActionButton
                title="Connect with me on LinkedIn"
                linkTo="https://linkedin.com/in/nicklanahan"
                delay={0.4}
              />
            </div>
          </div>
        </div>

        {/* Desktop: Brand Tile and Action Buttons */}
        <div className="hidden md:block">
          {/* Brand Tile - Full Width */}
          <div style={{ marginBottom: '24px' }}> {/* 8-point grid spacing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ height: '80px' }} /* 8-point grid: 80px height */
            >
              <GlowingCard 
                className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 h-full flex items-center justify-center hover:-translate-y-1"
                style={{ 
                  borderRadius: '16px', /* 8-point grid radius */
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)' /* Apple-style subtle shadow */
                }}
                glowColor="rgba(0, 122, 255, 0.1)"
                strength={0.3}
              >
                <h1 className="font-space font-bold text-gray-900" style={{ fontSize: '48px' }}> {/* Apple HIG: Page title 32-48px */}
                  Nick<span className="text-primary"> </span>Lanahan
                </h1>
              </GlowingCard>
            </motion.div>
          </div>
          
          {/* Action Buttons Row */}
          <div className="flex justify-center space-x-4" style={{ marginBottom: '32px' }}> {/* 8-point grid spacing */}
            <ActionButton
              title="Contact Me"
              linkTo="/contact"
              delay={0.2}
            />
            <ActionButton
              title="Download my Resume"
              linkTo="/resume.pdf"
              delay={0.3}
            />
            <ActionButton
              title="Connect with me on LinkedIn"
              linkTo="https://linkedin.com/in/nicklanahan"
              delay={0.4}
            />
          </div>
        </div>
        
        {/* Main Navigation Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: '16px' }}> {/* 8-point grid spacing */}
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