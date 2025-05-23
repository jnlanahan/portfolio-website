import { useState } from "react";
import { Link, useLocation } from "wouter";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location === path;
    }
    return location.startsWith(path);
  };

  // Navigation items to avoid repetition
  const navItems = [
    { path: "/", label: "About", isActiveCheck: (path: string) => isActive(path) && location === path },
    { path: "/resume", label: "Resume", isActiveCheck: (path: string) => isActive(path) },
    { path: "/portfolio", label: "Portfolio", isActiveCheck: (path: string) => isActive(path) },
    { path: "/blog", label: "Blog", isActiveCheck: (path: string) => isActive(path) && location !== '/blog/[id]' },
    { path: "/top5", label: "Top 5", isActiveCheck: (path: string) => isActive(path) },
  ];

  return (
    <nav className="fixed top-0 w-full bg-background/40 backdrop-blur-sm z-50 border-b border-border">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold font-space text-foreground">
            Nick<span className="text-secondary">.</span>Lanahan
          </Link>

          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                href={item.path}
                className={`nav-link font-medium hover:text-secondary transition-colors ${
                  item.isActiveCheck(item.path) ? 'active' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link 
              href="/contact"
              className="ml-4 px-5 py-2 bg-secondary text-background rounded-md font-medium hover:bg-secondary/90 transition-colors"
            >
              Contact
            </Link>
          </div>

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

      {/* Mobile Menu */}
      <div
        id="mobileMenu"
        className={`${
          isMenuOpen ? "block" : "hidden"
        } md:hidden bg-background/40 backdrop-blur-sm border-b border-border animate-fade-in`}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              className={`py-2 font-medium hover:text-secondary transition-colors ${
                item.isActiveCheck(item.path) ? 'text-secondary' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link 
            href="/contact"
            className="py-2 px-4 bg-secondary text-background rounded-md font-medium hover:bg-secondary/90 transition-colors text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
