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

  return (
    <nav className="fixed top-0 w-full bg-background/40 backdrop-blur-sm z-50 border-b border-border">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold font-space text-foreground">
            Alex<span className="text-secondary">.</span>Chen
          </Link>

          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/">
              <a className={`nav-link font-medium hover:text-secondary transition-colors ${
                isActive('/') && location === '/' ? 'active' : ''
              }`}>
                Home
              </a>
            </Link>
            <Link href="/about">
              <a className={`nav-link font-medium hover:text-secondary transition-colors ${
                isActive('/about') ? 'active' : ''
              }`}>
                About
              </a>
            </Link>
            <Link href="/resume">
              <a className={`nav-link font-medium hover:text-secondary transition-colors ${
                isActive('/resume') ? 'active' : ''
              }`}>
                Resume
              </a>
            </Link>
            <Link href="/portfolio">
              <a className={`nav-link font-medium hover:text-secondary transition-colors ${
                isActive('/portfolio') ? 'active' : ''
              }`}>
                Portfolio
              </a>
            </Link>
            <Link href="/blog">
              <a className={`nav-link font-medium hover:text-secondary transition-colors ${
                isActive('/blog') && location !== '/blog/[id]' ? 'active' : ''
              }`}>
                Blog
              </a>
            </Link>
            <Link href="/top5">
              <a className={`nav-link font-medium hover:text-secondary transition-colors ${
                isActive('/top5') ? 'active' : ''
              }`}>
                Top 5
              </a>
            </Link>
            <Link href="/contact">
              <a className="ml-4 px-5 py-2 bg-secondary text-background rounded-md font-medium hover:bg-secondary/90 transition-colors">
                Contact
              </a>
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
          <Link href="/">
            <a 
              className={`py-2 font-medium hover:text-secondary transition-colors ${
                isActive('/') && location === '/' ? 'text-secondary' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </a>
          </Link>
          <Link href="/about">
            <a 
              className={`py-2 font-medium hover:text-secondary transition-colors ${
                isActive('/about') ? 'text-secondary' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
          </Link>
          <Link href="/resume">
            <a 
              className={`py-2 font-medium hover:text-secondary transition-colors ${
                isActive('/resume') ? 'text-secondary' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Resume
            </a>
          </Link>
          <Link href="/portfolio">
            <a 
              className={`py-2 font-medium hover:text-secondary transition-colors ${
                isActive('/portfolio') ? 'text-secondary' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Portfolio
            </a>
          </Link>
          <Link href="/blog">
            <a 
              className={`py-2 font-medium hover:text-secondary transition-colors ${
                isActive('/blog') && location !== '/blog/[id]' ? 'text-secondary' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </a>
          </Link>
          <Link href="/top5">
            <a 
              className={`py-2 font-medium hover:text-secondary transition-colors ${
                isActive('/top5') ? 'text-secondary' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Top 5
            </a>
          </Link>
          <Link href="/contact">
            <a 
              className="py-2 px-4 bg-secondary text-background rounded-md font-medium hover:bg-secondary/90 transition-colors text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
