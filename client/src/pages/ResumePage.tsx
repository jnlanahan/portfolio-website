import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getExperienceProfile, formatPeriod, ExperienceEntry, Skill } from "@/data/resume";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useRef, useState } from "react";
import '../styles/timeline.css';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { X, Briefcase, Calendar, MapPin, GraduationCap, Award } from "lucide-react";

// Component for displaying skills with category-based styling
const SkillBadge = ({ 
  skill, 
  index, 
  parentIndex 
}: { 
  skill: Skill; 
  index: number; 
  parentIndex: number;
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
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        delay: 0.3 + parentIndex * 0.1 + index * 0.05,
        duration: 0.3
      }}
    >
      {skill.name}
    </motion.span>
  );
};

// Component for displaying achievements as bullet points
const Achievements = ({ 
  achievements, 
  parentIndex 
}: { 
  achievements?: string[]; 
  parentIndex: number;
}) => {
  if (!achievements || achievements.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="font-medium text-sm text-secondary mb-2">Key Achievements</h4>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {achievements.map((achievement, idx) => (
          <motion.li 
            key={idx}
            className="list-disc ml-4"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ 
              delay: 0.4 + parentIndex * 0.1 + idx * 0.1,
              duration: 0.3
            }}
          >
            {achievement}
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

// Component for a single experience entry
const ExperienceItem = ({ 
  job, 
  index, 
  totalItems 
}: { 
  job: ExperienceEntry; 
  index: number; 
  totalItems: number;
}) => {
  return (
    <motion.div
      key={job.id}
      className={`timeline-item relative mb-16 ${index === totalItems - 1 ? "" : "mb-16"}`}
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
            <span className="font-medium text-secondary">{job.company.name}</span>
            <span className="mx-2">•</span>
            <span>{formatPeriod(job.period)}</span>
          </div>

          {job.company.location && (
            <div className="text-sm text-muted-foreground mb-4">
              <i className="ri-map-pin-line mr-1"></i> {job.company.location}
            </div>
          )}

          {/* Logo placeholder or actual logo if available */}
          <div className="hidden md:block w-full aspect-square relative mb-4 overflow-hidden rounded-lg company-logo-placeholder">
            {job.company.logoUrl ? (
              <img 
                src={job.company.logoUrl} 
                alt={`${job.company.name} logo`}
                className="w-full h-full object-contain" 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-secondary text-xs">
                  {job.company.name} Logo
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right content - Job details */}
        <div className="col-span-2">
          {/* Project image placeholder or actual image if available */}
          <div className="w-full aspect-video relative mb-4 overflow-hidden rounded-lg project-image-placeholder">
            {job.projectImageUrl ? (
              <img 
                src={job.projectImageUrl} 
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

          <p className="text-muted-foreground mb-4">{job.description}</p>

          {/* Achievements section */}
          <Achievements achievements={job.achievements} parentIndex={index} />

          {/* Skills section */}
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, skillIndex) => (
              <SkillBadge 
                key={skillIndex}
                skill={skill} 
                index={skillIndex} 
                parentIndex={index} 
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Component for education section
const EducationSection = ({ 
  education 
}: { 
  education: any[] 
}) => {
  if (!education || education.length === 0) return null;

  return (
    <div className="mt-20 mb-12">
      <motion.h2 
        className="text-3xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Education & Certification
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {education.map((edu, index) => (
          <motion.div 
            key={index}
            className="bg-card p-6 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <h3 className="text-xl font-bold">{edu.degree}</h3>
            <div className="text-secondary font-medium">{edu.institution}</div>
            <div className="text-sm text-muted-foreground mb-2">
              {edu.period.start} - {edu.period.end}
              {edu.location && ` • ${edu.location}`}
            </div>
            {edu.description && <p className="text-muted-foreground text-sm">{edu.description}</p>}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Main Experience Page Component
const ExperiencePage = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/resume"],
    initialData: getExperienceProfile(),
  });

  // Timeline scrolling animation
  const timelineRef = useRef<HTMLDivElement>(null);
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
      <div className="mb-8 max-w-4xl mx-auto pl-8 md:pl-12">
        <motion.div 
          className="flex flex-wrap justify-center gap-6 p-3 rounded-lg border border-border"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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

      {/* Interactive Timeline */}
      <div className="mb-16 max-w-6xl mx-auto px-4">
        <motion.div
          className="interactive-timeline relative bg-card/30 p-5 rounded-lg shadow-sm border border-border overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold mb-8 text-center text-secondary">Career Journey</h3>
          
          {/* Horizontal Timeline */}
          <div className="relative pb-12">
            {/* Timeline Line */}
            <div className="absolute top-14 left-0 right-0 h-1 bg-border"></div>
            
            {/* Timeline Items */}
            <div className="flex justify-between">
              {/* Professional Experience Group */}
              <div className="relative px-4 flex flex-col items-center">
                <motion.button
                  onClick={() => openExperienceDialog(workExperience.find(job => job.id === 'ey-manager')!)}
                  className="timeline-marker w-12 h-12 bg-card rounded-full border-2 border-secondary flex items-center justify-center z-10 hover:scale-110 transition-transform"
                  whileHover={{ y: -5 }}
                >
                  <img src="/src/assets/images/logos/ey-logo.svg" alt="EY" className="w-7 h-7" />
                </motion.button>
                <span className="absolute -bottom-10 text-sm font-medium">2021-Present</span>
                <motion.div 
                  className="mt-4 w-48 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <h4 className="font-semibold">EY</h4>
                  <p className="text-xs text-muted-foreground">Product Manager</p>
                </motion.div>
              </div>
              
              <div className="relative px-4 flex flex-col items-center">
                <motion.button
                  onClick={() => openExperienceDialog(workExperience.find(job => job.id === 'osu-professor')!)}
                  className="timeline-marker w-12 h-12 bg-card rounded-full border-2 border-amber-500 flex items-center justify-center z-10 hover:scale-110 transition-transform"
                  whileHover={{ y: -5 }}
                >
                  <img src="/src/assets/images/logos/osu-logo.svg" alt="OSU" className="w-7 h-7" />
                </motion.button>
                <span className="absolute -bottom-10 text-sm font-medium">2018-2021</span>
                <motion.div 
                  className="mt-4 w-48 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <h4 className="font-semibold">Ohio State University</h4>
                  <p className="text-xs text-muted-foreground">Assistant Professor</p>
                </motion.div>
              </div>
              
              <div className="relative px-4 flex flex-col items-center">
                <motion.button
                  onClick={() => openExperienceDialog(workExperience.find(job => job.id === 'army-commander')!)}
                  className="timeline-marker w-12 h-12 bg-card rounded-full border-2 border-green-700 flex items-center justify-center z-10 hover:scale-110 transition-transform"
                  whileHover={{ y: -5 }}
                >
                  <img src="/src/assets/images/logos/us-army-logo.svg" alt="Army" className="w-7 h-7" />
                </motion.button>
                <span className="absolute -bottom-10 text-sm font-medium">2017-2018</span>
                <motion.div 
                  className="mt-4 w-48 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <h4 className="font-semibold">US Army</h4>
                  <p className="text-xs text-muted-foreground">Company Commander</p>
                </motion.div>
              </div>
              
              <div className="relative px-4 flex flex-col items-center">
                <motion.button
                  onClick={() => openExperienceDialog(workExperience.find(job => job.id === 'army-pm')!)}
                  className="timeline-marker w-12 h-12 bg-card rounded-full border-2 border-purple-500 flex items-center justify-center z-10 hover:scale-110 transition-transform"
                  whileHover={{ y: -5 }}
                >
                  <img src="/src/assets/images/logos/us-army-logo.svg" alt="Army" className="w-7 h-7" />
                </motion.button>
                <span className="absolute -bottom-10 text-sm font-medium">2016-2017</span>
                <motion.div 
                  className="mt-4 w-48 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <h4 className="font-semibold">US Army</h4>
                  <p className="text-xs text-muted-foreground">Program Manager</p>
                </motion.div>
              </div>
              
              <div className="relative px-4 flex flex-col items-center">
                <motion.button
                  onClick={() => openExperienceDialog(workExperience.find(job => job.id === 'operations-logistics-manager')!)}
                  className="timeline-marker w-12 h-12 bg-card rounded-full border-2 border-orange-500 flex items-center justify-center z-10 hover:scale-110 transition-transform"
                  whileHover={{ y: -5 }}
                >
                  <img src="/src/assets/images/logos/us-army-logo.svg" alt="Army" className="w-7 h-7" />
                </motion.button>
                <span className="absolute -bottom-10 text-sm font-medium">2013-2015</span>
                <motion.div 
                  className="mt-4 w-48 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <h4 className="font-semibold">US Army</h4>
                  <p className="text-xs text-muted-foreground">Operations Manager</p>
                </motion.div>
              </div>
            </div>
            
            {/* Second Row */}
            <div className="flex justify-center mt-24">
              <div className="relative px-4 flex flex-col items-center">
                <motion.button
                  onClick={() => openExperienceDialog(workExperience.find(job => job.id === 'usace-officer')!)}
                  className="timeline-marker w-12 h-12 bg-card rounded-full border-2 border-secondary flex items-center justify-center z-10 hover:scale-110 transition-transform"
                  whileHover={{ y: -5 }}
                >
                  <img src="/src/assets/images/logos/us-army-logo.svg" alt="USACE" className="w-7 h-7" />
                </motion.button>
                <span className="absolute -bottom-10 text-sm font-medium">2021-Present</span>
                <motion.div 
                  className="mt-4 w-48 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  <h4 className="font-semibold">US Army Reserve</h4>
                  <p className="text-xs text-muted-foreground">USACE Plans Officer</p>
                </motion.div>
              </div>
              
              <div className="relative px-4 flex flex-col items-center">
                <motion.button
                  onClick={() => openExperienceDialog(workExperience.find(job => job.id === 'h2l-intern')!)}
                  className="timeline-marker w-12 h-12 bg-card rounded-full border-2 border-blue-400 flex items-center justify-center z-10 hover:scale-110 transition-transform"
                  whileHover={{ y: -5 }}
                >
                  <span className="text-sm font-bold text-blue-400">H2L</span>
                </motion.button>
                <span className="absolute -bottom-10 text-sm font-medium">2021</span>
                <motion.div 
                  className="mt-4 w-48 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                >
                  <h4 className="font-semibold">H2L</h4>
                  <p className="text-xs text-muted-foreground">Product Management Intern</p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Work Experience Timeline */}
      <div ref={timelineRef} className="timeline relative pl-8 md:pl-12 max-w-4xl mx-auto" style={{ position: 'relative' }}>
        {/* Animated timeline line that grows with scroll */}
        <motion.div 
          className="timeline-line"
          style={{ height: timelineHeight }}
        ></motion.div>

        {combinedItems.map((item, index) => (
          <motion.div
            id={item.id}
            key={item.id}
            className={`timeline-item relative mb-16 ${index === combinedItems.length - 1 ? "" : "mb-16"} ${item.isEducation ? 'education-entry' : ''}`}
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
                <h3 className="text-2xl font-space font-semibold">{item.title}</h3>
                <div className="flex flex-wrap items-center text-muted-foreground mb-4">
                  <span className="font-medium text-secondary">{item.company.name}</span>
                  <span className="mx-2">•</span>
                  <span>{formatPeriod(item.period)}</span>
                </div>

                {item.company.location && (
                  <div className="text-sm text-muted-foreground mb-4">
                    <i className="ri-map-pin-line mr-1"></i> {item.company.location}
                  </div>
                )}

                {/* Logo placeholder or actual logo if available */}
                <div className="hidden md:block w-full aspect-square relative mb-4 overflow-hidden rounded-lg company-logo-placeholder">
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
                <Achievements achievements={item.achievements} parentIndex={index} />

                {/* Skills section */}
                <div className="flex flex-wrap gap-2">
                  {item.skills.map((skill, skillIndex) => (
                    <SkillBadge 
                      key={skillIndex}
                      skill={skill} 
                      index={skillIndex} 
                      parentIndex={index} 
                    />
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

export default ExperiencePage;