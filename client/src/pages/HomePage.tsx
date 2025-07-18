import { motion } from "framer-motion";
import { Link } from "wouter";
import { trackEvent } from "@/lib/analytics";
import { GlowingCard } from "@/components/ui/glowing-card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Mail, Download, Linkedin } from "lucide-react";
import { SiGmail } from "react-icons/si";
import { useState, useEffect } from "react";
import { PasswordDialog } from "@/components/PasswordDialog";

// Import logos
import missouriLogo from '@assets/MissouriS&T Logo_1752203136367.png';
import ncStateLogo from '@assets/NCSU_1752203527903.png';
import osuLogo from '@assets/OSU Logo_1752203136368.png';
import usaceLogo from '@assets/US-ArmyCorpsOfEngineers-Logo.svg_1752203527903.png';
import armyLogo from '@assets/army-logo-2844_1752203136369.png';
import eyLogo from '@assets/EY_1752203527904.png';
import nickHeadshot from '@assets/PXL_20250628_182520391_1752206764378.jpg';
import gmailLogo from '@assets/gmail-new_1752207266229.png';

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
      spotlightColor="rgba(100, 116, 139, 0.1)"
    >
      <h3 className="font-futura font-medium text-gray-900 group-hover:text-slate-600 transition-colors" style={{ fontSize: '14px' }}> {/* Consistent sizing */}
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
      spotlightColor="rgba(100, 116, 139, 0.1)"
    >
      {/* Header with title */}
      <div style={{ padding: '16px 16px 8px' }}> {/* 8-point grid padding */}
        <h3 className="font-futura font-medium text-gray-900 group-hover:text-slate-600 transition-colors" style={{ fontSize: '20px' }}> {/* Apple HIG: Section headings 20-24px */}
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
              <i className={`${icon} text-slate-600 text-xl`}></i>
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
  const isDownload = linkTo.includes('resume.pdf') || linkTo.includes('download');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleClick = (e: React.MouseEvent) => {
    trackEvent('homepage_action_click', { 
      action: title, 
      destination: linkTo 
    });
    
    // If it's a resume download, show password dialog instead of direct download
    if (isDownload) {
      e.preventDefault();
      setShowPasswordDialog(true);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    setIsLoading(true);
    setError("");
    
    try {
      // Call the password-protected download endpoint
      const response = await fetch('/api/resume/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      if (response.ok) {
        // Create a blob from the response and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Nick Lanahan Resume.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setShowPasswordDialog(false);
        trackEvent('resume_download_success', { method: 'password_protected' });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid password');
        trackEvent('resume_download_failed', { method: 'password_protected', error: 'invalid_password' });
      }
    } catch (err) {
      setError('Download failed. Please try again.');
      trackEvent('resume_download_failed', { method: 'password_protected', error: 'network_error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordDialogClose = () => {
    setShowPasswordDialog(false);
    setError("");
    setIsLoading(false);
  };

  // Get icon component based on title
  const getIconComponent = () => {
    if (title.includes('Contact')) return <img src={gmailLogo} alt="Gmail" className="w-6 h-6" />;
    if (title.includes('Resume')) return <Download size={24} className="text-gray-900 group-hover:text-slate-600 transition-colors" />;
    if (title.includes('LinkedIn')) return (
      <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center group-hover:bg-blue-700 transition-colors">
        <span className="text-white font-bold text-sm">in</span>
      </div>
    );
    return <img src={gmailLogo} alt="Gmail" className="w-6 h-6" />;
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
      <span className="font-futura font-medium text-gray-900 group-hover:text-slate-600 transition-colors mt-2 text-center leading-tight" style={{ fontSize: '14px' }}>
        {title}
      </span>
    </div>
  );

  return (
    <>
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
        ) : isDownload ? (
          <div onClick={handleClick}>
            {buttonContent}
          </div>
        ) : (
          <Link 
            href={linkTo}
            onClick={handleClick}
          >
            {buttonContent}
          </Link>
        )}
      </motion.div>
      
      <PasswordDialog
        isOpen={showPasswordDialog}
        onClose={handlePasswordDialogClose}
        onPasswordSubmit={handlePasswordSubmit}
        isLoading={isLoading}
        error={error}
      />
    </>
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
        <div className="text-center relative" style={{ marginBottom: '40px', marginTop: '0px', zIndex: 10 }}>
          {/* Glowing circle with logos following circular path */}
          <div className="absolute inset-0 pointer-events-none overflow-visible glowing-circle-container" style={{ zIndex: 0, transform: 'translateY(-120px)' }}>
            {/* Glowing Circle Background */}
            <div className="glowing-circle"></div>
            

          </div>
          
          {/* Small subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ marginBottom: '16px', marginTop: '0px' }}
            className="relative z-10"
          >
            <p className="text-gray-600 tracking-wide uppercase text-[21px] font-normal pt-[-1px] pb-[-1px]" style={{ fontSize: '14px', letterSpacing: '0.1em' }}>
              PORTFOLIO
            </p>
          </motion.div>
          
          {/* Main title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ marginBottom: '2px' }}
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
          
          {/* Logo Grid - Two rows under Nick Lanahan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ marginBottom: '2px' }}
            className="relative z-10"
          >
            {/* Mobile: Two rows, Desktop: Single row */}
            <div className="flex flex-col items-center space-y-1 md:hidden">
              {/* First row on mobile */}
              <div className="flex items-center justify-center space-x-6">
                <div className="static-logo-1">
                  <img 
                    src={eyLogo} 
                    alt="EY" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="static-logo-2">
                  <img 
                    src={armyLogo} 
                    alt="U.S. Army" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="static-logo-3">
                  <img 
                    src={osuLogo} 
                    alt="Ohio State Fisher College of Business" 
                    className="w-28 h-28 object-contain"
                  />
                </div>
              </div>
              
              {/* Second row on mobile */}
              <div className="flex items-center justify-center space-x-6">
                <div className="static-logo-4">
                  <img 
                    src={ncStateLogo} 
                    alt="NC State" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="static-logo-5">
                  <img 
                    src={missouriLogo} 
                    alt="Missouri S&T" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <div className="static-logo-6">
                  <img 
                    src={usaceLogo} 
                    alt="US Army Corps of Engineers" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>
            </div>
            
            {/* Desktop: Single row */}
            <div className="hidden md:flex items-center justify-center space-x-8 lg:space-x-12 xl:space-x-16">
              <div className="static-logo-1">
                <img 
                  src={eyLogo} 
                  alt="EY" 
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div className="static-logo-2">
                <img 
                  src={armyLogo} 
                  alt="U.S. Army" 
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div className="static-logo-3">
                <img 
                  src={osuLogo} 
                  alt="Ohio State Fisher College of Business" 
                  className="w-36 h-36 object-contain"
                />
              </div>
              <div className="static-logo-4">
                <img 
                  src={ncStateLogo} 
                  alt="NC State" 
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div className="static-logo-5">
                <img 
                  src={missouriLogo} 
                  alt="Missouri S&T" 
                  className="w-28 h-28 object-contain"
                />
              </div>
              <div className="static-logo-6">
                <img 
                  src={usaceLogo} 
                  alt="US Army Corps of Engineers" 
                  className="w-14 h-14 object-contain"
                />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Main Navigation Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-4 relative" style={{ gap: '16px', marginBottom: '32px', zIndex: 20 }}> {/* 8-point grid spacing */}
          <HomeTile
            title="About"
            description="Learn more about me"
            icon="ri-user-line"
            linkTo="/about"
            delay={0.5}
            size="large"
            image={nickHeadshot}
          />
          
          <HomeTile
            title="Projects"
            description="See my side projects"
            icon="ri-briefcase-line"
            linkTo="/portfolio"
            delay={0.6}
            size="large"
            image="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop"
          />
          
          <HomeTile
            title="Blog"
            description="Read my thoughts"
            icon="ri-article-line"
            linkTo="/blog"
            delay={0.7}
            size="large"
            image="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1000&auto=format&fit=crop"
          />
          
          <HomeTile
            title="Top 5 Lists"
            description="Understand my preferences"
            icon="ri-list-check-line"
            linkTo="/top5"
            delay={0.8}
            size="large"
            image="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1000&auto=format&fit=crop"
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
            linkTo="https://www.linkedin.com/in/nick-lanahan/"
            delay={1.1}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;