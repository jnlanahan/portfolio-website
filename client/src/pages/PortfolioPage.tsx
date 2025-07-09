import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ProjectCategory, projectCategories } from "@/data/portfolio";
import { useState, useMemo } from "react";
import { Link } from "wouter";

// Tech badge component
const TechBadge = ({ tech }: { tech: string }) => (
  <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full transition-all duration-300 hover:scale-105">
    {tech}
  </span>
);

// Project card component
const ProjectCard = ({ project, index }: { project: any; index: number }) => (
  <motion.div
    key={project.id}
    className="group relative rounded-xl overflow-hidden border border-border hover:border-secondary transition-all duration-300 bg-background/30 backdrop-blur-sm"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -5 }}
  >
    <div className="relative overflow-hidden">
      <img
        src={project.image}
        alt={project.title}
        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
      />
      
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
    </div>

    <div className="p-6">
      {/* Project date */}
      <div className="text-xs text-muted-foreground mb-2">
        {new Date(project.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long'
        })}
      </div>
      
      {/* Project title */}
      <h3 className="text-xl font-space font-semibold mb-2 group-hover:text-secondary transition-colors">
        <Link href={`/portfolio/${project.slug}`} className="block">
          {project.title}
        </Link>
      </h3>
      
      {/* Description */}
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
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
          className="text-sm font-medium hover:text-secondary transition-colors flex items-center"
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
        <h1 className="text-4xl md:text-5xl font-bold mb-6">My Portfolio</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
          A showcase of my recent projects, experiments, and collaborations.
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              !selectedCategory
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted hover:bg-muted/80 text-foreground"
            }`}
          >
            All Projects
          </button>
          {projectCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedCategory === category.id
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Featured projects section */}
      {featuredProjects.length > 0 && !selectedCategory && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <i className="ri-star-fill text-secondary mr-2"></i> Featured Projects
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
          <h2 className="text-2xl font-bold mb-6">
            {projectCategories.find(c => c.id === selectedCategory)?.name || 'Projects'}
          </h2>
        )}
        
        {!selectedCategory && featuredProjects.length > 0 && (
          <h2 className="text-2xl font-bold mb-6">All Projects</h2>
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
          <p className="text-muted-foreground text-lg mb-4">No projects found in this category.</p>
          <button
            onClick={() => setSelectedCategory(null)}
            className="mt-4 px-6 py-2 bg-secondary text-secondary-foreground rounded-md"
          >
            View all projects
          </button>
        </div>
      )}

      {/* Call to action */}
      <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-8 mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Let's work together</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
        </p>
        <Link 
          href="/contact" 
          className="inline-block px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
        >
          Get in Touch
        </Link>
      </div>
    </div>
  );
};

export default PortfolioPage;