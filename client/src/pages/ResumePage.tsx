import { motion, useScroll, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getExperienceProfile, formatPeriod, ExperienceEntry, Skill } from "@/data/resume";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useRef } from "react";
import '../styles/timeline.css';

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

      {/* Career Timeline Navigator */}
      <div className="mb-28 max-w-4xl mx-auto px-4 mt-10">
        <motion.div
          className="horizontal-timeline relative bg-card/30 p-5 rounded-lg shadow-sm border border-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold mb-6 text-center text-secondary">Career Timeline</h3>
          
          {/* Year markers */}
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
            <div>2025</div>
            <div>2023</div>
            <div>2021</div>
            <div>2019</div>
            <div>2017</div>
            <div>2015</div>
            <div>2013</div>
            <div>2011</div>
            <div>2009</div>
            <div>2007</div>
          </div>
          
          {/* Timeline grid with duration bars */}
          <div className="relative h-[350px] border-t border-border">
            {/* Vertical grid lines for years */}
            <div className="absolute inset-0 grid grid-cols-9 w-full h-full pointer-events-none">
              {Array(9).fill(0).map((_, i) => (
                <div key={`grid-${i}`} className="border-r border-border/30 h-full"></div>
              ))}
            </div>
            
            {/* Timeline items with duration bars */}
            
            {/* EY Manager: 2021-Present */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: '20%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="absolute h-12 bg-secondary/10 border-l-4 border-secondary rounded-r-md flex items-center left-0 top-4"
              style={{ width: '20%' }}
            >
              <a href="#ey-manager" className="flex items-center pl-2 hover:underline">
                <div className="w-8 h-8 bg-card mr-2 shadow-md rounded-md overflow-hidden flex items-center justify-center">
                  <img 
                    src="/src/assets/images/logos/ey-logo.svg" 
                    alt="EY logo"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium">EY</div>
                  <div className="text-[10px] text-muted-foreground">Manager - Product Management (2021-Present)</div>
                </div>
              </a>
            </motion.div>
            
            {/* Lanahan Innovations: 2023-Present */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: '12%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="absolute h-12 bg-secondary/10 border-l-4 border-secondary rounded-r-md flex items-center left-0 top-20"
              style={{ width: '12%' }}
            >
              <a href="#lanahan-innovations" className="flex items-center pl-2 hover:underline">
                <div className="w-8 h-8 bg-card mr-2 shadow-md rounded-md overflow-hidden flex items-center justify-center">
                  <div className="w-6 h-6 flex items-center justify-center text-[8px] text-center text-secondary font-bold bg-secondary/5">
                    LA
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium">Lanahan Innovations</div>
                  <div className="text-[10px] text-muted-foreground">Founder (2023-Present)</div>
                </div>
              </a>
            </motion.div>
            
            {/* USACE Officer: 2021-Present */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: '20%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute h-12 bg-secondary/10 border-l-4 border-secondary rounded-r-md flex items-center left-0 top-36"
              style={{ width: '20%' }}
            >
              <a href="#usace-officer" className="flex items-center pl-2 hover:underline">
                <div className="w-8 h-8 bg-card mr-2 shadow-md rounded-md overflow-hidden flex items-center justify-center">
                  <img 
                    src="/src/assets/images/logos/us-army-logo.svg" 
                    alt="US Army logo"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium">US Army Reserve</div>
                  <div className="text-[10px] text-muted-foreground">Plans Officer – USACE (2021-Present)</div>
                </div>
              </a>
            </motion.div>
            
            {/* H2L Intern: 2021 */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: '3%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute h-12 bg-blue-400/10 border-l-4 border-blue-400 rounded-r-md flex items-center left-[20%] top-4"
              style={{ width: '3%' }}
            >
              <a href="#h2l-intern" className="flex items-center pl-2 hover:underline">
                <div className="w-8 h-8 bg-card mr-2 shadow-md rounded-md overflow-hidden flex items-center justify-center">
                  <div className="w-6 h-6 flex items-center justify-center text-[8px] text-center text-blue-400 font-bold bg-blue-400/5">
                    H2L
                  </div>
                </div>
                <div className="absolute -top-5 left-2 whitespace-nowrap">
                  <div className="text-xs font-medium">H2L</div>
                  <div className="text-[10px] text-muted-foreground">Product Management Intern (2021)</div>
                </div>
              </a>
            </motion.div>
            
            {/* OSU Assistant Professor: 2018-2021 */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: '15%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute h-12 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-md flex items-center left-[23%] top-20"
              style={{ width: '15%' }}
            >
              <a href="#osu-professor" className="flex items-center pl-2 hover:underline">
                <div className="w-8 h-8 bg-card mr-2 shadow-md rounded-md overflow-hidden flex items-center justify-center">
                  <img 
                    src="/src/assets/images/logos/osu-logo.svg" 
                    alt="OSU logo"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium">OSU</div>
                  <div className="text-[10px] text-muted-foreground">Assistant Professor (2018-2021)</div>
                </div>
              </a>
            </motion.div>
            
            {/* Army Commander: 2017-2018 */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: '5%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute h-12 bg-green-500/10 border-l-4 border-green-500 rounded-r-md flex items-center left-[38%] top-36"
              style={{ width: '5%' }}
            >
              <a href="#army-commander" className="flex items-center pl-2 hover:underline">
                <div className="w-8 h-8 bg-card mr-2 shadow-md rounded-md overflow-hidden flex items-center justify-center">
                  <img 
                    src="/src/assets/images/logos/us-army-logo.svg" 
                    alt="US Army logo"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium">US Army</div>
                  <div className="text-[10px] text-muted-foreground">Company Commander (2017-2018)</div>
                </div>
              </a>
            </motion.div>
            
            {/* Army Program Manager: 2016-2017 */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: '5%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute h-12 bg-purple-500/10 border-l-4 border-purple-500 rounded-r-md flex items-center left-[43%] top-4"
              style={{ width: '5%' }}
            >
              <a href="#army-pm" className="flex items-center pl-2 hover:underline">
                <div className="w-8 h-8 bg-card mr-2 shadow-md rounded-md overflow-hidden flex items-center justify-center">
                  <img 
                    src="/src/assets/images/logos/us-army-logo.svg" 
                    alt="US Army logo"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium">US Army</div>
                  <div className="text-[10px] text-muted-foreground">Program Manager (2016-2017)</div>
                </div>
              </a>
            </motion.div>
            
            {/* MBA OSU: 2019-2021 */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: '10%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="absolute h-12 bg-indigo-500/10 border-l-4 border-indigo-500 rounded-r-md flex items-center left-[23%] top-52"
              style={{ width: '10%' }}
            >
              <a href="#mba-osu" className="flex items-center pl-2 hover:underline">
                <div className="w-8 h-8 bg-card mr-2 shadow-md rounded-md overflow-hidden flex items-center justify-center">
                  <img 
                    src="/src/assets/images/logos/osu-logo.svg" 
                    alt="OSU logo"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium">OSU</div>
                  <div className="text-[10px] text-muted-foreground">MBA (2019-2021)</div>
                </div>
              </a>
            </motion.div>
            
            {/* MS Missouri: 2014-2016 */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: '10%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute h-12 bg-pink-500/10 border-l-4 border-pink-500 rounded-r-md flex items-center left-[48%] top-52"
              style={{ width: '10%' }}
            >
              <a href="#ms-missouri" className="flex items-center pl-2 hover:underline">
                <div className="w-8 h-8 bg-card mr-2 shadow-md rounded-md overflow-hidden flex items-center justify-center">
                  <div className="w-6 h-6 flex items-center justify-center text-[8px] text-center text-pink-500 font-bold bg-pink-500/5">
                    MS&T
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium">MS&T</div>
                  <div className="text-[10px] text-muted-foreground">MS, Engineering Management (2014-2016)</div>
                </div>
              </a>
            </motion.div>
            
            {/* BS NCSU: 2007-2011 */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: '20%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="absolute h-12 bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-md flex items-center right-0 top-52"
              style={{ width: '20%' }}
            >
              <a href="#bs-ncsu" className="flex items-center pl-2 hover:underline">
                <div className="w-8 h-8 bg-card mr-2 shadow-md rounded-md overflow-hidden flex items-center justify-center">
                  <div className="w-6 h-6 flex items-center justify-center text-[8px] text-center text-cyan-500 font-bold bg-cyan-500/5">
                    NCSU
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium">NCSU</div>
                  <div className="text-[10px] text-muted-foreground">BS, Civil Engineering (2007-2011)</div>
                </div>
              </a>
            </motion.div>
            
            {/* Legend */}
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4 flex-wrap text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-secondary mr-1"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-blue-400 mr-1"></div>
                <span>Internship</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-amber-500 mr-1"></div>
                <span>Academic</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-green-500 mr-1"></div>
                <span>Leadership</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-purple-500 mr-1"></div>
                <span>Program Management</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-indigo-500 mr-1"></div>
                <span>MBA</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-pink-500 mr-1"></div>
                <span>MS Engineering</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-cyan-500 mr-1"></div>
                <span>BS Engineering</span>
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