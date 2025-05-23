import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getExperienceProfile, formatPeriod, ExperienceEntry, Skill } from "@/data/resume";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import '../styles/timeline.css';

// Component for displaying skills with category-based styling
const SkillBadge = ({ 
  skill, 
  index, 
  parentIndex = 0 
}: { 
  skill: Skill; 
  index: number; 
  parentIndex?: number;
}) => {
  // Determine color based on skill category
  const getSkillStyles = (category?: string) => {
    switch (category) {
      case 'leadership': 
        return { bg: 'bg-blue-500/10', text: 'text-blue-500' };
      case 'business': 
        return { bg: 'bg-amber-500/10', text: 'text-amber-500' };
      case 'product': 
        return { bg: 'bg-green-500/10', text: 'text-green-500' };
      default: 
        return { bg: 'bg-secondary/10', text: 'text-secondary' };
    }
  };

  const styles = getSkillStyles(skill.category);
  
  return (
    <motion.span
      key={index}
      className={`px-3 py-1 ${styles.bg} ${styles.text} text-sm rounded-full`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay: 0.1 + index * 0.05,
        duration: 0.3
      }}
    >
      {skill.name}
    </motion.span>
  );
};

// Component for a compact timeline entry that opens a detailed dialog when clicked
const CompactTimelineItem = ({ 
  item, 
  index, 
  totalItems 
}: { 
  item: ExperienceEntry | any; 
  index: number; 
  totalItems: number;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Determine card style based on whether it's a job or education
  const isEducation = 'isEducation' in item && item.isEducation;
  
  return (
    <>
      <motion.div
        className={`relative cursor-pointer group`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        onClick={() => setIsDialogOpen(true)}
      >
        <div className={`compact-timeline-dot ${isEducation ? 'bg-blue-400' : 'bg-secondary'} absolute left-0 top-5 w-3 h-3 rounded-full`}></div>
        <div className="ml-6 pb-8 border-l border-border pl-4">
          <div className="text-sm text-muted-foreground">{formatPeriod(item.period)}</div>
          <h3 className="text-lg font-bold group-hover:text-secondary transition-colors">{item.title}</h3>
          <div className="text-sm font-medium">{item.company.name}</div>
          <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.description}</div>
        </div>
      </motion.div>

      {/* Detailed Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{item.title}</DialogTitle>
            <DialogDescription className="text-base">
              <span className="font-medium">{item.company.name}</span> • {formatPeriod(item.period)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-3 gap-6 mt-4">
            {/* Left content - Company info */}
            <div className="col-span-1">
              {item.company.location && (
                <div className="text-sm text-muted-foreground mb-4">
                  <i className="ri-map-pin-line mr-1"></i> {item.company.location}
                </div>
              )}

              {/* Logo placeholder or actual logo if available */}
              <div className="w-full aspect-square relative mb-4 overflow-hidden rounded-lg company-logo-placeholder">
                {item.company.logoUrl ? (
                  <img 
                    src={item.company.logoUrl} 
                    alt={`${item.company.name} logo`}
                    className="w-full h-full object-contain" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-secondary text-xs">
                      {item.company.name} Logo
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right content - Job details */}
            <div className="col-span-2">
              {/* Project image placeholder or actual image if available */}
              <div className="w-full aspect-video relative mb-4 overflow-hidden rounded-lg project-image-placeholder">
                {item.projectImageUrl ? (
                  <img 
                    src={item.projectImageUrl} 
                    alt="Project showcase" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-secondary text-sm">
                      Project Image
                    </span>
                  </div>
                )}
              </div>

              <p className="text-muted-foreground mb-4">{item.description}</p>

              {/* Achievements section */}
              {item.achievements && item.achievements.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-sm text-secondary mb-2">Key Achievements</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {item.achievements.map((achievement: string, idx: number) => (
                      <li key={idx} className="list-disc ml-4">{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills section */}
              <div className="flex flex-wrap gap-2 mt-4">
                {item.skills.map((skill: any, skillIndex: number) => (
                  <SkillBadge 
                    key={skillIndex}
                    skill={skill} 
                    index={skillIndex} 
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Main Resume Page Component with Compact Timeline
const ResumePage2 = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/resume"],
    initialData: getExperienceProfile(),
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

  const resume = profile.workExperience;
  const education = profile.education;

  // Convert education items to the right format
  const educationItems = education?.map(edu => ({
    id: edu.id,
    title: edu.degree,
    company: { name: edu.institution, location: edu.location || "" },
    period: edu.period,
    description: edu.description || "",
    achievements: edu.highlightedCourses?.map(course => `Completed ${course}`) || [],
    skills: edu.highlightedCourses?.map(course => ({ name: course, category: 'education' })) || [],
    isEducation: true
  })) || [];

  // Find the EY manager position to put at the top
  const eyManagerPosition = resume.find(job => job.id === "ey-manager");
  const otherPositions = resume.filter(job => job.id !== "ey-manager");
  
  // Sort other positions by date (newest first)
  const sortedOtherPositions = [...otherPositions].sort((a, b) => {
    const dateA = new Date(a.period.start);
    const dateB = new Date(b.period.start);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Combine all items with EY position at the top, followed by other sorted positions, then education
  const combinedItems = [
    ...(eyManagerPosition ? [eyManagerPosition] : []),
    ...sortedOtherPositions,
    ...educationItems
  ];

  const timelineStart = Math.min(...combinedItems.map(item => parseInt(item.period.start)));
  const timelineEnd = new Date().getFullYear();

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
              href="/assets/nick-lanahan-cv.pdf"
              className="inline-flex items-center px-6 py-3 bg-secondary/10 border-2 border-secondary text-secondary font-medium rounded-md transition-all duration-300 hover:bg-secondary hover:text-secondary-foreground hover:scale-105 hover:shadow-lg hover:shadow-secondary/20"
              target="_blank"
              rel="noopener noreferrer"
              download="nick-lanahan-cv.pdf"
            >
              <i className="ri-download-line mr-2"></i> Download CV
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

      {/* Skill Category Color Key */}
      <div className="mb-8 max-w-4xl mx-auto">
        <motion.div 
          className="flex flex-wrap justify-center gap-6 p-3 rounded-lg border border-border"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-sm font-medium text-blue-500">Leadership Skills</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-sm font-medium text-amber-500">Business Skills</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-sm font-medium text-green-500">Product Management Skills</span>
          </div>
        </motion.div>
      </div>

      {/* Timeline Overview with Year Markers */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="flex justify-between mb-1 text-xs text-muted-foreground">
          <span>{timelineStart}</span>
          <span>{Math.floor((timelineStart + timelineEnd) / 2)}</span>
          <span>{timelineEnd}</span>
        </div>
        <div className="h-1 w-full bg-border rounded-full mb-6 relative">
          {combinedItems.map((item, index) => {
            const startYear = parseInt(item.period.start);
            const position = ((startYear - timelineStart) / (timelineEnd - timelineStart)) * 100;
            return (
              <div 
                key={item.id} 
                className={`absolute w-2 h-2 rounded-full ${item.isEducation ? 'bg-blue-400' : 'bg-secondary'} -translate-y-0.5`}
                style={{ left: `${position}%` }}
                title={`${item.title} (${item.period.start})`}
              />
            );
          })}
        </div>
      </div>

      {/* Compact Timeline */}
      <div className="max-w-3xl mx-auto">
        {combinedItems.map((item, index) => (
          <CompactTimelineItem 
            key={item.id}
            item={item} 
            index={index} 
            totalItems={combinedItems.length} 
          />
        ))}
      </div>
    </div>
  );
};

export default ResumePage2;