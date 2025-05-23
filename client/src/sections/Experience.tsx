import { motion } from "framer-motion";
import { ExperienceEntry } from "@/data/resume";

interface ExperienceProps {
  resume: ExperienceEntry[];
  education: any[];
}

export const Experience: React.FC<ExperienceProps> = ({ resume, education }) => {
  const combinedItems = [...resume, ...education.map(edu => ({
    id: edu.id,
    title: `Student: ${edu.degree}`,
    company: { name: edu.institution, location: edu.location || "" },
    period: edu.period,
    description: "Relevant Coursework:",
    achievements: edu.courses || [],
    skills: [],
    isEducation: true
  }))].sort((a, b) => {
    const aYear = parseInt(a.period.start);
    const bYear = parseInt(b.period.start);
    return bYear - aYear;
  });

  return (
    <section id="resume" className="py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-space mb-4">Experience</h2>
          <div className="w-24 h-1 bg-secondary mb-8"></div>
          <p className="text-lg text-muted-foreground text-center max-w-3xl">
            My professional journey through tech, design, and learning.
          </p>
        </div>

        <div className="timeline relative pl-8 md:pl-12 max-w-4xl mx-auto">
          <div className="timeline-line"></div>

          {combinedItems.map((item, index) => (
            <motion.div
              key={item.id}
              className={`timeline-item relative mb-16 ${index === combinedItems.length - 1 ? "" : "mb-16"}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="timeline-dot"></div>
              <div className="pl-8">
                <h3 className="text-2xl font-space font-semibold">{item.title}</h3>
                <div className="flex flex-wrap items-center text-muted-foreground mb-4">
                  <span className="font-medium text-secondary">{item.company.name}</span>
                  {item.company.location && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{item.company.location}</span>
                    </>
                  )}
                  <span className="mx-2">•</span>
                  <span>{`${item.period.start} - ${item.period.end}`}</span>
                </div>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  {item.skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-3 py-1 bg-background text-muted-foreground text-sm rounded-full"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="/resume.pdf"
            className="inline-flex items-center px-6 py-3 bg-[#1E1E1E] border border-border hover:border-secondary text-foreground font-medium rounded-md transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="ri-download-line mr-2"></i> Download Full Resume
          </a>
        </div>
      </div>
    </section>
  );
};