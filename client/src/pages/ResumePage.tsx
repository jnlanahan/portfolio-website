import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getResume } from "@/data/resume";
import { GlowingCard } from "@/components/ui/glowing-card";

const ResumePage = () => {
  const { data: resume, isLoading } = useQuery({
    queryKey: ["/api/resume"],
    initialData: getResume(),
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
      <div className="relative">
        <motion.div
          className="absolute right-0 top-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlowingCard 
            className="inline-block"
            glowColor="rgba(67, 186, 147, 0.4)"
          >
            <a
              href="/resume.pdf"
              className="inline-flex items-center px-6 py-3 bg-transparent border border-border hover:border-secondary text-foreground font-medium rounded-md transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="ri-download-line mr-2"></i> Download Full Resume
            </a>
          </GlowingCard>
        </motion.div>
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">My Experience</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            My professional journey through tech, design, and problem-solving.
          </p>
        </motion.div>
      </div>

      <div className="timeline relative pl-8 md:pl-12 max-w-4xl mx-auto">
        <div className="timeline-line"></div>

        {resume.map((job, index) => (
          <motion.div
            key={index}
            className={`timeline-item relative mb-16 ${index === resume.length - 1 ? "" : "mb-16"}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="timeline-dot"></div>
            <div className="pl-8">
              <h3 className="text-2xl font-space font-semibold">{job.title}</h3>
              <div className="flex flex-wrap items-center text-muted-foreground mb-4">
                <span className="font-medium text-secondary">{job.company}</span>
                <span className="mx-2">•</span>
                <span>{job.period}</span>
              </div>
              <p className="text-muted-foreground mb-4">{job.description}</p>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="px-3 py-1 bg-background/30 backdrop-blur-sm text-muted-foreground text-sm rounded-full"
                  >
                    {skill}
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

export default ResumePage;