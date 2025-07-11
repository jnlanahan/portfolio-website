import { motion } from "framer-motion";
import { Link } from "wouter";
import { trackEvent } from "@/lib/analytics";
import { GlowingCard } from "@/components/ui/glowing-card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Mail, Download, Linkedin } from "lucide-react";
import { SiGmail } from "react-icons/si";
import { useState, useEffect } from "react";

// Import logos
import missouriLogo from '@assets/MissouriS&T Logo_1752203136367.png';
import ncStateLogo from '@assets/NCSU_1752203527903.png';
import osuLogo from '@assets/OSU Logo_1752203136368.png';
import usaceLogo from '@assets/US-ArmyCorpsOfEngineers-Logo.svg_1752203527903.png';
import armyLogo from '@assets/army-logo-2844_1752203136369.png';
import eyLogo from '@assets/EY_1752203527904.png';

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
    <SpotlightCard 
      className="relative border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden flex items-center justify-center bg-white hover:-translate-y-1"
      style={{ 
        borderRadius: '16px', /* 8-point grid radius */
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', /* Apple-style subtle shadow */
        height: '64px' /* 8-point grid height */
      }}
      spotlightColor="rgba(144, 238, 144, 0.15)"
    >
      <h3 className="font-futura font-medium text-gray-900 group-hover:text-primary transition-colors" style={{ fontSize: '14px' }}> {/* Consistent sizing */}
        {title}
      </h3>
    </SpotlightCard>
  ) : (
    <SpotlightCard 
      className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 h-full cursor-pointer group overflow-hidden hover:-translate-y-1"
      style={{ 
        borderRadius: '16px', /* 8-point grid radius */
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' /* Apple-style subtle shadow */
      }}
      spotlightColor="rgba(144, 238, 144, 0.15)"
    >
      {/* Header with title */}
      <div style={{ padding: '16px 16px 8px' }}> {/* 8-point grid padding */}
        <h3 className="font-futura font-medium text-gray-900 group-hover:text-primary transition-colors" style={{ fontSize: '20px' }}> {/* Apple HIG: Section headings 20-24px */}
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
    </SpotlightCard>
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

  // Get icon component based on title
  const getIconComponent = () => {
    if (title.includes('Contact')) return <SiGmail size={24} className="text-red-500 group-hover:text-red-600 transition-colors" />;
    if (title.includes('Resume')) return <Download size={24} className="text-gray-900 group-hover:text-primary transition-colors" />;
    if (title.includes('LinkedIn')) return <Linkedin size={24} className="text-blue-600 group-hover:text-blue-700 transition-colors" />;
    return <SiGmail size={24} className="text-red-500 group-hover:text-red-600 transition-colors" />;
  };

  const buttonContent = (
    <div className="flex flex-col items-center text-center cursor-pointer group transition-all duration-300 max-w-20">
      {/* Icon Circle */}
      <div 
        className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 flex items-center justify-center hover:shadow-lg group-hover:-translate-y-1"
        style={{ 
          borderRadius: '50%', /* Perfect circle */
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', /* Apple-style subtle shadow */
          width: '56px', /* 8-point grid: 56px */
          height: '56px' /* 8-point grid: 56px */
        }}
      >
        {getIconComponent()}
      </div>
      
      {/* Text Label */}
      <span className="font-futura font-medium text-gray-900 group-hover:text-primary transition-colors mt-2 text-center leading-tight" style={{ fontSize: '14px' }}>
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
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ padding: '24px 16px' }}> {/* 8-point grid: 24px vertical, 16px horizontal */}
      {/* Navigation Tiles Grid */}
      <div className="max-w-6xl mx-auto">
        {/* Hero Section - Like the screenshot */}
        <div className="text-center relative" style={{ marginBottom: '160px', marginTop: '80px', zIndex: 10 }}>
          {/* Glowing circle with logos following circular path */}
          <div className="absolute inset-0 pointer-events-none overflow-visible glowing-circle-container" style={{ zIndex: 1 }}>
            {/* Glowing Circle Background */}
            <div className="glowing-circle"></div>
            
            {/* EY Logo - Static Position 1 (Top) */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2">
              <div className="static-logo-1">
                <img 
                  src={eyLogo} 
                  alt="EY" 
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
                />
              </div>
            </div>

            {/* US Army Logo - Static Position 2 (Top Right) */}
            <div className="absolute top-16 right-16">
              <div className="static-logo-2">
                <img 
                  src={armyLogo} 
                  alt="U.S. Army" 
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
                />
              </div>
            </div>

            {/* Ohio State Fisher College of Business Logo - Static Position 3 (Right) */}
            <div className="absolute top-1/2 right-8 -translate-y-1/2">
              <div className="static-logo-3">
                <img 
                  src={osuLogo} 
                  alt="Ohio State Fisher College of Business" 
                  className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 object-contain"
                />
              </div>
            </div>

            {/* NC State College of Engineering Logo - Static Position 4 (Bottom Right) */}
            <div className="absolute bottom-16 right-16">
              <div className="static-logo-4">
                <img 
                  src={ncStateLogo} 
                  alt="NC State" 
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
                />
              </div>
            </div>

            {/* Missouri S&T Logo - Static Position 5 (Bottom) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <div className="static-logo-5">
                <img 
                  src={missouriLogo} 
                  alt="Missouri S&T" 
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain"
                />
              </div>
            </div>

            {/* US Army Corps of Engineers Logo - Static Position 6 (Left) */}
            <div className="absolute top-1/2 left-8 -translate-y-1/2">
              <div className="static-logo-6">
                <img 
                  src={usaceLogo} 
                  alt="US Army Corps of Engineers" 
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
                />
              </div>
            </div>
          </div>
          
          {/* Small subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ marginBottom: '16px', marginTop: '40px' }}
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
                fontWeight: '700',
                fontSize: 'clamp(36px, 6vw, 54px)', 
                lineHeight: '1.1', 
                letterSpacing: '-0.02em',
                textShadow: '2px 2px 8px rgba(255,255,255,0.9), -2px -2px 8px rgba(255,255,255,0.9)',
                zIndex: 20,
                position: 'relative'
              }}
            >
              NICK<br/>LANAHAN
            </h1>
          </motion.div>
        </div>
        
        {/* Main Navigation Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: '16px', marginBottom: '32px' }}> {/* 8-point grid spacing */}
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
        
        {/* Action Buttons - Desktop and Mobile */}
        <div className="flex justify-center space-x-12 md:space-x-12" style={{ marginBottom: '24px' }}> {/* 8-point grid spacing */}
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