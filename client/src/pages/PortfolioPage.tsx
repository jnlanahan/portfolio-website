import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ProjectCategory, projectCategories } from "@/data/portfolio";
import { useState, useMemo, useRef } from "react";
import { Link } from "wouter";

// Tech badge component
const TechBadge = ({ tech }: { tech: string }) => (
  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full transition-all duration-300 hover:scale-105" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
    {tech}
  </span>
);

// Scrollable Image Component
const ScrollableImageContainer = ({ project }: { project: any }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const images = project.mediaFiles && project.mediaFiles.length > 0 
    ? project.mediaFiles 
    : [project.image];
  
  const scrollToImage = (index: number) => {
    if (scrollRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth;
      const containerWidth = scrollRef.current.clientWidth;
      const scrollLeft = (scrollWidth / images.length) * index;
      scrollRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
    setCurrentImageIndex(index);
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const containerWidth = scrollRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / containerWidth);
      setCurrentImageIndex(newIndex);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((image: string, index: number) => (
          <div key={index} className="min-w-full snap-start">
            <img
              src={image}
              alt={`${project.title} - Image ${index + 1}`}
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
      
      {/* Image indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scrollToImage(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-secondary scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
      
      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const prevIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
              scrollToImage(prevIndex);
            }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <i className="ri-arrow-left-line text-sm"></i>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const nextIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
              scrollToImage(nextIndex);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <i className="ri-arrow-right-line text-sm"></i>
          </button>
        </>
      )}
      
      {/* Category badge */}
      {project.category && (
        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
          {project.category.name}
        </div>
      )}
      
      {/* Featured badge */}
      {project.featured && (
        <div className="absolute top-3 right-3 bg-secondary px-3 py-1 rounded-full text-xs font-medium text-secondary-foreground">
          Featured
        </div>
      )}
      
      {/* Image counter */}
      {images.length > 1 && (
        <div className={`absolute top-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs ${
          project.featured ? 'right-20' : 'right-3'
        }`}>
          {currentImageIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

// Project card component
const ProjectCard = ({ project, index }: { project: any; index: number }) => (
  <motion.div
    key={project.id}
    className="group relative rounded-xl overflow-hidden border border-gray-200 hover:border-blue-600 transition-all duration-300 bg-white"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -5 }}
  >
    <ScrollableImageContainer project={project} />

    <div className="p-6">
      {/* Project date */}
      <div className="text-xs text-gray-500 mb-2" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        {new Date(project.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long'
        })}
      </div>
      
      {/* Project title */}
      <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        <Link href={`/portfolio/${project.slug}`} className="block text-gray-900 hover:text-blue-600">
          {project.title}
        </Link>
      </h3>
      
      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        {project.shortDescription}
      </p>
      
      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.technologies.slice(0, 3).map((tech: string, techIndex: number) => (
          <TechBadge key={techIndex} tech={tech} />
        ))}
        {project.technologies.length > 3 && (
          <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
            +{project.technologies.length - 3} more
          </span>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
        <Link 
          href={`/portfolio/${project.slug}`} 
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center"
        >
          View Details <i className="ri-arrow-right-line ml-1"></i>
        </Link>
        <div className="flex space-x-3">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-secondary/10 rounded-full text-secondary hover:bg-secondary/20 transition-colors"
              aria-label="View Live Demo"
            >
              <i className="ri-eye-line"></i>
            </a>
          )}
          {project.codeUrl && (
            <a
              href={project.codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-background/60 border border-border rounded-full text-foreground hover:border-secondary transition-colors"
              aria-label="View Code"
            >
              <i className="ri-github-line"></i>
            </a>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const PortfolioPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/portfolio"],
  });

  // Filter projects by category
  const filteredProjects = useMemo(() => {
    if (!projects || !selectedCategory) return projects || [];
    return projects.filter(project => 
      project.category && project.category.id === selectedCategory
    );
  }, [projects, selectedCategory]);

  // Extract featured projects
  const featuredProjects = useMemo(() => 
    projects ? projects.filter(project => project.featured) : [], 
    [projects]
  );

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header section */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-gray-900 mb-6" style={{ 
          fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: '700',
          fontSize: 'clamp(32px, 5vw, 48px)',
          lineHeight: '1.2'
        }}>My Portfolio</h1>
        <p className="text-gray-600 max-w-3xl mx-auto mb-8" style={{ 
          fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '17px',
          lineHeight: '1.5'
        }}>
          A showcase of my recent projects, experiments, and collaborations.
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              !selectedCategory
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            All Projects
          </button>
          {projectCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Featured projects section */}
      {featuredProjects.length > 0 && !selectedCategory && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif', color: '#1a1a1a' }}>
            <i className="ri-star-fill text-blue-600 mr-2"></i> Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Projects grid */}
      <div className="mb-8">
        {selectedCategory && (
          <h2 className="text-2xl font-bold mb-6 text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            {projectCategories.find(c => c.id === selectedCategory)?.name || 'Projects'}
          </h2>
        )}
        
        {!selectedCategory && featuredProjects.length > 0 && (
          <h2 className="text-2xl font-bold mb-6 text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>All Projects</h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(selectedCategory ? filteredProjects : (projects || []).filter(p => !p.featured)).map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filteredProjects.length === 0 && selectedCategory && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4 opacity-30">
            <i className="ri-folder-unknow-line"></i>
          </div>
          <p className="text-gray-600 text-lg mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>No projects found in this category.</p>
          <button
            onClick={() => setSelectedCategory(null)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            View all projects
          </button>
        </div>
      )}

      {/* Call to action */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Let's work together</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
        </p>
        <Link 
          href="/contact" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
        >
          Get in Touch
        </Link>
      </div>
    </div>
  );
};

export default PortfolioPage;