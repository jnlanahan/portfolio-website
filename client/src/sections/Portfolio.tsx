import { motion } from "framer-motion";
import { ProjectType } from "@/data/portfolio";

interface PortfolioProps {
  projects: ProjectType[];
}

export const Portfolio: React.FC<PortfolioProps> = ({ projects }) => {
  return (
    <section id="portfolio" className="py-24 bg-[#1E1E1E]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-space mb-4">Portfolio</h2>
          <div className="w-24 h-1 bg-secondary mb-8"></div>
          <p className="text-lg text-muted-foreground text-center max-w-3xl">
            A showcase of my recent projects, experiments, and collaborations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              className="project-card group relative rounded-xl overflow-hidden border border-border hover:border-secondary transition-all duration-300 bg-background relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
                    className="p-2 bg-[#1E1E1E] border border-border rounded-full text-foreground hover:border-secondary transition-colors"
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
                      className="px-3 py-1 bg-[#00ff00] text-black text-xs font-bold rounded-full shadow-md z-50 border-2 border-black relative"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-md transition-colors"
          >
            View All Projects <i className="ri-arrow-right-line ml-2"></i>
          </a>
        </div>
      </div>
    </section>
  );
};
