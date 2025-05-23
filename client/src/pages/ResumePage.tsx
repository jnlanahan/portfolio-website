import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getResume } from "@/data/resume";
import { TimelineItem } from "@/components/ui/timeline";

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

      <div className="max-w-4xl mx-auto">
        {resume.map((job, index) => (
          <TimelineItem
            key={index}
            year={job.period}
            title={job.title}
            company={job.company}
            description={job.description}
            skills={job.skills}
          />
        ))}
      </div>

      <div className="mt-16 text-center">
        <a
          href="/resume.pdf"
          className="inline-flex items-center px-6 py-3 bg-background/30 backdrop-blur-sm border border-border hover:border-secondary text-foreground font-medium rounded-md transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="ri-download-line mr-2"></i> Download Full Resume
        </a>
      </div>
    </div>
  );
};

export default ResumePage;