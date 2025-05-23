import { motion, useScroll, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getResume } from "@/data/resume";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useRef } from "react";
import '../styles/timeline.css';

const ResumePage = () => {
  const { data: resume, isLoading } = useQuery({
    queryKey: ["/api/resume"],
    initialData: getResume(),
  });

  // Timeline scrolling animation
  const timelineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start end", "end end"]
  });
  
  // Timeline line growing animation
  const timelineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

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

      <div ref={timelineRef} className="timeline relative pl-8 md:pl-12 max-w-4xl mx-auto" style={{ position: 'relative' }}>
        {/* Animated timeline line that grows with scroll */}
        <motion.div 
          className="timeline-line"
          style={{ height: timelineHeight }}
        ></motion.div>

        {resume.map((job, index) => (
          <motion.div
            key={index}
            className={`timeline-item relative mb-16 ${index === resume.length - 1 ? "" : "mb-16"}`}
            initial={{ opacity: 0, y: 50 }}
            viewport={{ once: true, amount: 0.3 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.7, 
              delay: index * 0.15,
              type: "spring",
              stiffness: 50
            }}
          >
            {/* Animated dot */}
            <motion.div 
              className="timeline-dot"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: 0.2 + index * 0.15,
                type: "spring", 
                bounce: 0.4 
              }}
            ></motion.div>
            
            <div className="md:grid md:grid-cols-3 md:gap-6 pl-8">
              {/* Left content - Company info */}
              <div className="col-span-1">
                <h3 className="text-2xl font-space font-semibold">{job.title}</h3>
                <div className="flex flex-wrap items-center text-muted-foreground mb-4">
                  <span className="font-medium text-secondary">{job.company}</span>
                  <span className="mx-2">•</span>
                  <span>{job.period}</span>
                </div>
                
                {/* Image placeholder */}
                <div className="hidden md:block w-full aspect-square relative mb-4 overflow-hidden rounded-lg company-logo-placeholder">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-secondary text-xs">
                      {job.company} Logo
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Right content - Job details */}
              <div className="col-span-2">
                {/* Project image placeholder */}
                <div className="w-full aspect-video relative mb-4 overflow-hidden rounded-lg project-image-placeholder">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-secondary text-sm">
                      Project Image
                    </span>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">{job.description}</p>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, skillIndex) => (
                    <motion.span
                      key={skillIndex}
                      className="px-3 py-1 bg-primary/80 text-primary-foreground text-sm rounded-full"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: 0.3 + index * 0.1 + skillIndex * 0.05,
                        duration: 0.3
                      }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ResumePage;