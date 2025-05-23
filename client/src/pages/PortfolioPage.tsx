import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getPortfolio } from "@/data/portfolio";

const PortfolioPage = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/portfolio"],
    initialData: getPortfolio(),
  });

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
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6">My Portfolio</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          A showcase of my recent projects, experiments, and collaborations.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            className="project-card group relative rounded-xl overflow-hidden border border-border hover:border-secondary transition-all duration-300 bg-background/30 backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-64 object-cover"
            />

            <div className="project-overlay absolute inset-0 bg-background/80 opacity-0 transition-opacity duration-300 flex flex-col justify-center items-center p-6">
              <h3 className="text-xl font-space font-semibold mb-2 text-center">
                {project.title}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {project.description}
              </p>
              <div className="flex space-x-3">
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-primary rounded-full text-white hover:bg-primary/90 transition-colors"
                  aria-label="View Project"
                >
                  <i className="ri-eye-line"></i>
                </a>
                <a
                  href={project.codeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-background/60 border border-border rounded-full text-foreground hover:border-secondary transition-colors"
                  aria-label="View Code"
                >
                  <i className="ri-github-line"></i>
                </a>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-space font-semibold mb-2">{project.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{project.shortDescription}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-3 py-1 bg-background/40 text-muted-foreground text-xs rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      </div>
  );
};

export default PortfolioPage;