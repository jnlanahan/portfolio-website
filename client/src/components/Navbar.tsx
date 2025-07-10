import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trackEvent } from "@/lib/analytics";

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
      label: "About", 
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
              <a 
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('resume_download_click', { location: 'navbar' })}
                className="px-5 py-2 bg-secondary text-background rounded-md font-medium hover:bg-secondary/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <i className="ri-download-line mr-1.5"></i>
                Resume
              </a>
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
            <a 
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 bg-secondary text-background rounded-md font-medium hover:bg-secondary/90 transition-colors text-center flex items-center justify-center"
              onClick={() => {
                trackEvent('resume_download_click', { location: 'mobile_menu' });
                setIsMenuOpen(false);
              }}
              style={{ 
                transitionDelay: `${navItems.length * 50}ms`, 
                opacity: isMenuOpen ? 1 : 0,
                transform: isMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'opacity 300ms, transform 300ms'
              }}
            >
              <i className="ri-download-line mr-2"></i>
              Resume
            </a>
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
    </nav>
  );
};

export default Navbar;
