import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trackEvent } from "@/lib/analytics";
import { PasswordDialog } from "@/components/PasswordDialog";

// Define navigation item type
export interface NavItem {
  path: string;
  label: string;
  icon?: string;
  highlight?: boolean;
  isActiveCheck?: (path: string) => boolean;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle navbar transparency on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleResumeClick = (e: React.MouseEvent, location: string) => {
    e.preventDefault();
    setShowPasswordDialog(true);
    trackEvent('resume_download_click', { location });
  };

  const handlePasswordSubmit = async (password: string) => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/resume/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      if (response.ok) {
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

  const isActive = (path: string) => {
    if (path === '/') {
      return location === path;
    }
    return location.startsWith(path);
  };

  // Navigation items with enhanced structure
  const navItems: NavItem[] = [
    { 
      path: "/", 
      label: "Home", 
      icon: "ri-home-line",
      isActiveCheck: (path: string) => location === path 
    },
    { 
      path: "/about", 
      label: "About Me", 
      icon: "ri-user-line",
      isActiveCheck: (path: string) => isActive(path) 
    },
    { 
      path: "/portfolio", 
      label: "Portfolio", 
      icon: "ri-folder-line",
      highlight: true,
      isActiveCheck: (path: string) => isActive(path) 
    },
    { 
      path: "/blog", 
      label: "Blog", 
      icon: "ri-article-line",
      isActiveCheck: (path: string) => isActive(path) && location !== '/blog/[id]' 
    },
    { 
      path: "/top5", 
      label: "Top 5", 
      icon: "ri-star-line",
      isActiveCheck: (path: string) => isActive(path) 
    },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-md shadow-sm' 
        : 'bg-background/40 backdrop-blur-sm'
      } border-b border-border`}
    >
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold font-space text-foreground group">
            Nick<span className="text-secondary group-hover:text-primary transition-colors">.</span>Lanahan
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                href={item.path}
                onClick={() => trackEvent('nav_click', { section: item.label, path: item.path })}
                className={`nav-link font-medium hover:text-secondary transition-colors flex items-center ${
                  item.isActiveCheck ? (item.isActiveCheck(item.path) ? 'text-secondary' : '') : ''
                }`}
              >
                {item.icon && <i className={`${item.icon} mr-1.5 text-sm`}></i>}
                {item.label}
              </Link>
            ))}
            <div className="flex space-x-3 ml-4">
              <button 
                onClick={(e) => handleResumeClick(e, 'navbar')}
                className="px-5 py-2 bg-secondary text-background rounded-md font-medium hover:bg-secondary/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <i className="ri-download-line mr-1.5"></i>
                Resume
              </button>
              <Link 
                href="/contact"
                onClick={() => trackEvent('contact_button_click', { location: 'navbar' })}
                className="px-5 py-2 bg-secondary text-background rounded-md font-medium hover:bg-secondary/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <i className="ri-mail-line mr-1.5"></i>
                Email
              </Link>
              <a 
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('linkedin_button_click', { location: 'navbar' })}
                className="px-5 py-2 bg-secondary text-background rounded-md font-medium hover:bg-secondary/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <i className="ri-linkedin-box-line mr-1.5"></i>
                LinkedIn
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            id="mobileMenuButton"
            className="md:hidden text-2xl"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <i className="ri-close-line"></i>
            ) : (
              <i className="ri-menu-line"></i>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu with Animation */}
      <div
        id="mobileMenu"
        className={`${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } md:hidden bg-background/95 backdrop-blur-md border-b border-border overflow-hidden transition-all duration-300`}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          {navItems.map((item, index) => (
            <Link 
              key={item.path}
              href={item.path}
              className={`py-2 font-medium hover:text-secondary transition-colors flex items-center ${
                item.isActiveCheck ? (item.isActiveCheck(item.path) ? 'text-secondary' : '') : ''
              }`}
              onClick={() => {
                trackEvent('nav_click', { section: item.label, path: item.path, device: 'mobile' });
                setIsMenuOpen(false);
              }}
              style={{ 
                transitionDelay: `${index * 50}ms`, 
                opacity: isMenuOpen ? 1 : 0,
                transform: isMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'opacity 300ms, transform 300ms'
              }}
            >
              {item.icon && <i className={`${item.icon} mr-3 text-lg`}></i>}
              {item.label}
            </Link>
          ))}
          <div className="flex flex-col space-y-3 mt-4">
            <button 
              onClick={(e) => {
                handleResumeClick(e, 'mobile_menu');
                setIsMenuOpen(false);
              }}
              className="py-2 px-4 bg-secondary text-background rounded-md font-medium hover:bg-secondary/90 transition-colors text-center flex items-center justify-center"
              style={{ 
                transitionDelay: `${navItems.length * 50}ms`, 
                opacity: isMenuOpen ? 1 : 0,
                transform: isMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'opacity 300ms, transform 300ms'
              }}
            >
              <i className="ri-download-line mr-2"></i>
              Resume
            </button>
            <Link 
              href="/contact"
              className="py-2 px-4 bg-secondary text-background rounded-md font-medium hover:bg-secondary/90 transition-colors text-center flex items-center justify-center"
              onClick={() => {
                trackEvent('contact_button_click', { location: 'mobile_menu' });
                setIsMenuOpen(false);
              }}
              style={{ 
                transitionDelay: `${(navItems.length + 1) * 50}ms`, 
                opacity: isMenuOpen ? 1 : 0,
                transform: isMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'opacity 300ms, transform 300ms'
              }}
            >
              <i className="ri-mail-line mr-2"></i>
              Email
            </Link>
            <a 
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 bg-secondary text-background rounded-md font-medium hover:bg-secondary/90 transition-colors text-center flex items-center justify-center"
              onClick={() => {
                trackEvent('linkedin_button_click', { location: 'mobile_menu' });
                setIsMenuOpen(false);
              }}
              style={{ 
                transitionDelay: `${(navItems.length + 2) * 50}ms`, 
                opacity: isMenuOpen ? 1 : 0,
                transform: isMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'opacity 300ms, transform 300ms'
              }}
            >
              <i className="ri-linkedin-box-line mr-2"></i>
              LinkedIn
            </a>
          </div>
        </div>
      </div>
      
      <PasswordDialog
        isOpen={showPasswordDialog}
        onClose={handlePasswordDialogClose}
        onPasswordSubmit={handlePasswordSubmit}
        isLoading={isLoading}
        error={error}
      />
    </nav>
  );
};

export default Navbar;
