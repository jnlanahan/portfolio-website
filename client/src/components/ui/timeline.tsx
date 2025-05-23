
import { motion, useScroll } from "framer-motion";
import { useRef } from "react";

interface TimelineItemProps {
  year: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
}

export const TimelineItem = ({ year, title, company, description, skills }: TimelineItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.5 1"]
  });

  return (
    <motion.div
      ref={ref}
      className="relative mb-16 grid grid-cols-[80px_1fr] gap-8 items-start"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="sticky top-1/4 text-xl font-space font-semibold text-secondary"
        style={{ opacity: scrollYProgress }}
      >
        {year}
      </motion.div>
      <div>
        <h3 className="text-2xl font-space font-semibold">{title}</h3>
        <div className="flex flex-wrap items-center text-muted-foreground mb-4">
          <span className="font-medium text-secondary">{company}</span>
        </div>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, skillIndex) => (
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
  );
};
