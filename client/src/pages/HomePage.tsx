import { motion } from "framer-motion";
import { Link } from "wouter";
import { trackEvent } from "@/lib/analytics";
import { GlowingCard } from "@/components/ui/glowing-card";
import { Mail, Download, Linkedin } from "lucide-react";
import { SiGmail } from "react-icons/si";
import { useState, useEffect } from "react";
import { LampContainer } from "@/components/ui/lamp";

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
        height: '120px',
        padding: '16px' /* 8-point grid padding */
      }}
      onClick={handleClick}
    >
      <div className="text-center">
        <div 
          className="text-2xl mb-2 text-gray-600 group-hover:text-blue-600 transition-colors duration-300"
          style={{ 
            fontFamily: 'remixicon',
            fontSize: '32px',
            lineHeight: '1',
            marginBottom: '8px'
          }}
        >
          {icon}
        </div>
        <h3 
          className="text-gray-900 font-medium" 
          style={{ 
            fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '16px',
            lineHeight: '1.3'
          }}
        >
          {title}
        </h3>
      </div>
    </GlowingCard>
  ) : (
    <GlowingCard 
      className="relative border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden bg-white hover:-translate-y-1"
      style={{ 
        borderRadius: '16px', /* 8-point grid radius */
        height: size === "wide" ? "120px" : "180px",
        padding: '24px' /* 8-point grid padding */
      }}
      onClick={handleClick}
    >
      {image && (
        <div 
          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.05) 100%), url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '16px'
          }}
        />
      )}
      
      <div className="relative z-10 flex flex-col h-full">
        <div 
          className="text-3xl mb-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-300"
          style={{ 
            fontFamily: 'remixicon',
            fontSize: size === "wide" ? '32px' : '40px',
            lineHeight: '1',
            marginBottom: '16px'
          }}
        >
          {icon}
        </div>
        
        <h3 
          className="text-gray-900 font-semibold mb-2" 
          style={{ 
            fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: size === "wide" ? '18px' : '20px',
            lineHeight: '1.3',
            marginBottom: '8px'
          }}
        >
          {title}
        </h3>
        
        <p 
          className="text-gray-600 text-sm leading-relaxed mt-auto"
          style={{ 
            fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '14px',
            lineHeight: '1.4'
          }}
        >
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
      className="w-full"
    >
      {isExternal ? (
        <a 
          href={linkTo} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full"
        >
          {tileContent}
        </a>
      ) : (
        <Link href={linkTo} className="block w-full">
          {tileContent}
        </Link>
      )}
    </motion.div>
  );
};

const ActionButton = ({ 
  title, 
  linkTo, 
  delay = 0 
}: { 
  title: string; 
  linkTo: string; 
  delay?: number;
}) => {
  const isExternal = linkTo.startsWith('http') || linkTo.startsWith('mailto:');
  
  const handleClick = () => {
    trackEvent('homepage_action_click', { 
      action: title, 
      destination: linkTo 
    });
  };

  const getIcon = () => {
    if (title.includes('Contact')) return <SiGmail className="w-6 h-6" style={{ color: '#EA4335' }} />;
    if (title.includes('Resume')) return <Download className="w-6 h-6" style={{ color: '#666' }} />;
    if (title.includes('LinkedIn')) return <Linkedin className="w-6 h-6" style={{ color: '#0077B5' }} />;
    return <Mail className="w-6 h-6" style={{ color: '#666' }} />;
  };

  const buttonContent = (
    <div className="flex flex-col items-center">
      <motion.div
        className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center mb-3 border border-gray-200 hover:shadow-xl transition-all duration-300 group-hover:border-gray-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {getIcon()}
      </motion.div>
      <span 
        className="text-gray-900 font-medium text-center leading-snug"
        style={{ 
          fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '14px',
          lineHeight: '1.2',
          maxWidth: '100px'
        }}
      >
        {title}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group cursor-pointer"
      onClick={handleClick}
    >
      {isExternal ? (
        <a 
          href={linkTo} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          {buttonContent}
        </a>
      ) : (
        <Link href={linkTo} className="block">
          {buttonContent}
        </Link>
      )}
    </motion.div>
  );
};

const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ padding: '24px 16px' }}>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center relative" style={{ marginBottom: '120px' }}>
          {/* Circular glow background with parallax and animation */}
          <div 
            className="absolute inset-0 pointer-events-none animate-gradient-shift"
            style={{
              background: 'radial-gradient(circle at center top, rgba(144, 238, 144, 0.9) 0%, rgba(144, 238, 144, 0.8) 8%, rgba(144, 238, 144, 0.7) 15%, rgba(144, 238, 144, 0.5) 25%, rgba(144, 238, 144, 0.3) 35%, rgba(144, 238, 144, 0.15) 50%, rgba(144, 238, 144, 0.08) 65%, rgba(144, 238, 144, 0.03) 80%, transparent 90%)',
              width: '200%',
              height: '300%',
              left: '-50%',
              top: `${-150 + scrollY * 0.15}%`,
              borderRadius: '50%',
              filter: 'blur(3px)',
              transform: `translateY(${scrollY * 0.1}px)`
            }}
          />
          
          {/* Small subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ marginBottom: '16px' }}
            className="relative z-10"
          >
            <p className="font-medium text-gray-600 tracking-wide uppercase" style={{ fontSize: '14px', letterSpacing: '0.1em' }}>
              PORTFOLIO
            </p>
          </motion.div>
          
          {/* Main title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ marginBottom: '32px' }}
            className="relative z-10"
          >
            <h1 
              className="text-gray-900" 
              style={{ 
                fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '600',
                fontSize: 'clamp(48px, 8vw, 72px)', 
                lineHeight: '1.1', 
                letterSpacing: '-0.02em',
                textShadow: '0 0 30px rgba(144, 238, 144, 0.6), 0 0 60px rgba(144, 238, 144, 0.5), 0 0 90px rgba(144, 238, 144, 0.4)'
              }}
            >
              NICK<br/>LANAHAN
            </h1>
          </motion.div>

          {/* Lamp Component - positioned below the name */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative z-10"
          >
            <LampContainer />
          </motion.div>
        </div>
        
        {/* Main Navigation Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: '16px', marginBottom: '32px' }}>
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
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-12 md:space-x-12" style={{ marginBottom: '24px' }}>
          <ActionButton
            title="Contact Me"
            linkTo="/contact"
            delay={0.9}
          />
          <ActionButton
            title="Download my Resume"
            linkTo="/resume.pdf"
            delay={1.0}
          />
          <ActionButton
            title="Connect with me on LinkedIn"
            linkTo="https://linkedin.com/in/nicklanahan"
            delay={1.1}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;