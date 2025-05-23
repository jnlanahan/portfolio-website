import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const [activeSection, setActiveSection] = useState("home");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Set active section based on scroll position when on homepage
  useEffect(() => {
    if (location !== "/") return;

    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let currentSection = "home";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const scrollPosition = window.scrollY;

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          currentSection = section.getAttribute("id") || "home";
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  // Scroll to section when clicking nav link on homepage
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (location === "/") {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveSection(id);
      }
      
      // Close mobile menu if open
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-background/90 backdrop-blur-sm z-50 border-b border-border">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold font-space text-foreground">
            Alex<span className="text-secondary">.</span>Chen
          </Link>

          <div className="hidden md:flex space-x-8 items-center">
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, "home")}
              className={`nav-link font-medium hover:text-secondary transition-colors ${
                activeSection === "home" ? "active" : ""
              }`}
            >
              Home
            </a>
            <a
              href="#about"
              onClick={(e) => handleNavClick(e, "about")}
              className={`nav-link font-medium hover:text-secondary transition-colors ${
                activeSection === "about" ? "active" : ""
              }`}
            >
              About
            </a>
            <a
              href="#resume"
              onClick={(e) => handleNavClick(e, "resume")}
              className={`nav-link font-medium hover:text-secondary transition-colors ${
                activeSection === "resume" ? "active" : ""
              }`}
            >
              Resume
            </a>
            <a
              href="#portfolio"
              onClick={(e) => handleNavClick(e, "portfolio")}
              className={`nav-link font-medium hover:text-secondary transition-colors ${
                activeSection === "portfolio" ? "active" : ""
              }`}
            >
              Portfolio
            </a>
            <a
              href="#blog"
              onClick={(e) => handleNavClick(e, "blog")}
              className={`nav-link font-medium hover:text-secondary transition-colors ${
                activeSection === "blog" ? "active" : ""
              }`}
            >
              Blog
            </a>
            <a
              href="#top5"
              onClick={(e) => handleNavClick(e, "top5")}
              className={`nav-link font-medium hover:text-secondary transition-colors ${
                activeSection === "top5" ? "active" : ""
              }`}
            >
              Top 5
            </a>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "contact")}
              className="ml-4 px-5 py-2 bg-secondary text-background rounded-md font-medium hover:bg-secondary/90 transition-colors"
            >
              Contact
            </a>
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
        } md:hidden bg-background border-b border-border animate-fade-in`}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "home")}
            className={`py-2 font-medium hover:text-secondary transition-colors ${
              activeSection === "home" ? "text-secondary" : ""
            }`}
          >
            Home
          </a>
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, "about")}
            className={`py-2 font-medium hover:text-secondary transition-colors ${
              activeSection === "about" ? "text-secondary" : ""
            }`}
          >
            About
          </a>
          <a
            href="#resume"
            onClick={(e) => handleNavClick(e, "resume")}
            className={`py-2 font-medium hover:text-secondary transition-colors ${
              activeSection === "resume" ? "text-secondary" : ""
            }`}
          >
            Resume
          </a>
          <a
            href="#portfolio"
            onClick={(e) => handleNavClick(e, "portfolio")}
            className={`py-2 font-medium hover:text-secondary transition-colors ${
              activeSection === "portfolio" ? "text-secondary" : ""
            }`}
          >
            Portfolio
          </a>
          <a
            href="#blog"
            onClick={(e) => handleNavClick(e, "blog")}
            className={`py-2 font-medium hover:text-secondary transition-colors ${
              activeSection === "blog" ? "text-secondary" : ""
            }`}
          >
            Blog
          </a>
          <a
            href="#top5"
            onClick={(e) => handleNavClick(e, "top5")}
            className={`py-2 font-medium hover:text-secondary transition-colors ${
              activeSection === "top5" ? "text-secondary" : ""
            }`}
          >
            Top 5
          </a>
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "contact")}
            className="py-2 px-4 bg-secondary text-background rounded-md font-medium hover:bg-secondary/90 transition-colors text-center"
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
