import { Link } from "wouter";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 bg-background/30 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="text-xl font-bold font-space text-foreground">
              Alex<span className="text-secondary">.</span>Chen
            </Link>
            <p className="text-muted-foreground mt-2">
              Full-Stack Developer & UX Enthusiast
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
            <Link href="/about">
              <a className="text-muted-foreground hover:text-secondary transition-colors">
                About
              </a>
            </Link>
            <Link href="/resume">
              <a className="text-muted-foreground hover:text-secondary transition-colors">
                Resume
              </a>
            </Link>
            <Link href="/portfolio">
              <a className="text-muted-foreground hover:text-secondary transition-colors">
                Portfolio
              </a>
            </Link>
            <Link href="/blog">
              <a className="text-muted-foreground hover:text-secondary transition-colors">
                Blog
              </a>
            </Link>
            <Link href="/top5">
              <a className="text-muted-foreground hover:text-secondary transition-colors">
                Top 5
              </a>
            </Link>
            <Link href="/contact">
              <a className="text-muted-foreground hover:text-secondary transition-colors">
                Contact
              </a>
            </Link>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © {currentYear} Alex Chen. All rights reserved.
          </p>

          <div className="flex space-x-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-secondary transition-colors"
              aria-label="GitHub"
            >
              <i className="ri-github-fill"></i>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-secondary transition-colors"
              aria-label="LinkedIn"
            >
              <i className="ri-linkedin-box-fill"></i>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-secondary transition-colors"
              aria-label="Twitter"
            >
              <i className="ri-twitter-fill"></i>
            </a>
            <a
              href="https://codepen.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-secondary transition-colors"
              aria-label="CodePen"
            >
              <i className="ri-codepen-line"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
