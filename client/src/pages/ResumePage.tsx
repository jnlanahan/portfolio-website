import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getExperienceProfile, formatPeriod, ExperienceEntry } from "@/data/resume";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useRef, useState, useEffect } from "react";
import '../styles/horizontal-timeline.css';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Briefcase, Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

// Define timeline entries based on exact dates
interface TimelineEntry {
  id: string;
  period: string;
  title: string;
  company: string;
  location: string;
  groupDate?: string;
  type: 'education' | 'military' | 'industry';
}

const HorizontalTimeline = ({ entries }: { entries: TimelineEntry[] }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const scrollLeft = () => {
    if (timelineRef.current) {
      timelineRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (timelineRef.current) {
      timelineRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="timeline-container">
      <div className="timeline-wrapper">
        <button className="scroll-button scroll-left" onClick={scrollLeft}>
          <ChevronLeft size={18} />
        </button>
        
        <button className="scroll-button scroll-right" onClick={scrollRight}>
          <ChevronRight size={18} />
        </button>
        
        <div className="timeline-line"></div>
        
        <div className="timeline-events" ref={timelineRef}>
          {entries.map((entry, index) => (
            <div key={entry.id} className="timeline-event">
              {entry.groupDate && (
                <div className="group-date">
                  {entry.groupDate}
                </div>
              )}
              
              <div className={`timeline-marker ${entry.type}`}></div>
              
              <div className="timeline-year">
                {entry.period}
              </div>
              
              <div className="timeline-content">
                <span className="timeline-content-date">{entry.period}</span>
                <h3>{entry.title}</h3>
                <div className="timeline-content-company">
                  <Briefcase size={14} />
                  <span>{entry.company}</span>
                </div>
                <div className="timeline-content-company">
                  <MapPin size={14} />
                  <span>{entry.location}</span>
                </div>
                <div className={`${entry.type}-indicator`}></div>
              </div>
            </div>
          ))}
        </div>
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

  // Timeline data with exact dates as requested
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);

  // Initialize timeline with exact dates provided
  useEffect(() => {
    // Timeline entries with exact dates as specified
    const entries: TimelineEntry[] = [
      {
        id: "current1",
        period: "October 2021 – Present",
        title: "Manager – Technology Consulting",
        company: "EY",
        location: "Columbus, OH",
        groupDate: "2021 – Present",
        type: "industry"
      },
      {
        id: "current2",
        period: "July 2021 – Present",
        title: "Major – Plans Officer (S3)",
        company: "U.S. Army Corps of Engineers",
        location: "U.S. Army Reserve",
        type: "military"
      },
      {
        id: "current3",
        period: "June 2023 – Present",
        title: "Founder",
        company: "Lanahan Innovations",
        location: "Columbus, OH",
        type: "industry"
      },
      {
        id: "education1",
        period: "May 2021",
        title: "Master of Business Administration (MBA)",
        company: "The Ohio State University, Fisher College of Business",
        location: "Columbus, OH",
        groupDate: "May 2021",
        type: "education"
      },
      {
        id: "military-group",
        period: "May 2011 – June 2021",
        title: "U.S. Army Positions",
        company: "U.S. Army",
        location: "Multiple Locations",
        groupDate: "May 2011 – June 2021",
        type: "military"
      },
      {
        id: "military1",
        period: "Nov 2018 – Jun 2021",
        title: "Assistant Professor of Military Science & Leadership",
        company: "U.S. Army",
        location: "Columbus, OH",
        type: "military"
      },
      {
        id: "military2",
        period: "Jun 2017 – Nov 2018",
        title: "Senior Manager – Company Commander",
        company: "U.S. Army",
        location: "Pyeongtaek, South Korea",
        type: "military"
      },
      {
        id: "military3",
        period: "Jun 2016 – Jun 2017",
        title: "Program Manager – Host Nation Funded Construction",
        company: "U.S. Army",
        location: "Seoul, South Korea",
        type: "military"
      },
      {
        id: "education2",
        period: "May 2016",
        title: "Master of Science in Engineering Management",
        company: "Missouri University of Science and Technology",
        location: "Rolla, MO",
        groupDate: "May 2016",
        type: "education"
      },
      {
        id: "military4",
        period: "Jun 2015 – Jun 2016",
        title: "Engineer Captain's Career Course Student",
        company: "U.S. Army",
        location: "Fort Leonard Wood, MO",
        type: "military"
      },
      {
        id: "military5",
        period: "Jan 2015 – Jun 2015",
        title: "Assistant Project Engineer",
        company: "U.S. Army",
        location: "Fort Hood, TX",
        type: "military"
      },
      {
        id: "military6",
        period: "Oct 2013 – Jan 2015",
        title: "Operations and Logistics Manager – Executive Officer",
        company: "U.S. Army",
        location: "Fort Hood, TX",
        type: "military"
      },
      {
        id: "military7",
        period: "Jan 2013 – Oct 2013",
        title: "Manager – Platoon Leader",
        company: "U.S. Army",
        location: "Fort Hood, TX",
        type: "military"
      },
      {
        id: "military8",
        period: "Dec 2011 – Jan 2013",
        title: "Strategic and Operational Planner – Assistant Operations Officer",
        company: "U.S. Army",
        location: "Fort Hood, TX",
        type: "military"
      },
      {
        id: "military9",
        period: "Aug 2011 – Dec 2011",
        title: "Basic Officer Leadership Course Student",
        company: "U.S. Army",
        location: "Fort Leonard Wood, MO",
        type: "military"
      },
      {
        id: "military10",
        period: "May 2011 – Aug 2011",
        title: "Trainer – Leadership and Military Tactics (CTLT)",
        company: "U.S. Army",
        location: "Fort Knox, KY",
        type: "military"
      },
      {
        id: "education3",
        period: "May 2011",
        title: "Bachelor of Science in Civil Engineering",
        company: "North Carolina State University",
        location: "Raleigh, NC",
        groupDate: "May 2011",
        type: "education"
      }
    ];
    
    setTimelineEntries(entries);
  }, []);

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
            My professional journey through technology, leadership, and innovation.
          </p>
        </motion.div>
      </div>

      {/* Career Journey Timeline */}
      <div className="mb-16 max-w-6xl mx-auto px-4">
        <motion.div
          className="relative bg-card/30 p-5 rounded-lg shadow-sm border border-border overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold mb-8 text-center text-secondary">Career Journey</h3>
          
          {/* Horizontal Timeline with exact dates */}
          <HorizontalTimeline entries={timelineEntries} />
        </motion.div>
      </div>

      {/* Experience list display */}
      <div className="max-w-4xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold mb-6">Experience Details</h2>
        
        {profile.workExperience.map((job: ExperienceEntry, index: number) => (
          <div key={job.id} className="mb-10 p-6 bg-card rounded-lg border border-border">
            <h3 className="text-xl font-bold">{job.title}</h3>
            <div className="flex flex-wrap items-center text-muted-foreground mb-2">
              <span className="font-medium text-secondary">{job.company.name}</span>
              <span className="mx-2">•</span>
              <span>{formatPeriod(job.period)}</span>
            </div>
            
            {job.company.location && (
              <div className="text-sm text-muted-foreground mb-4">
                <MapPin size={14} className="inline mr-1" />
                {job.company.location}
              </div>
            )}
            
            <p className="text-muted-foreground mb-4">{job.description}</p>
            
            {job.achievements && job.achievements.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sm text-secondary mb-2">Key Achievements</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {job.achievements.map((achievement, idx) => (
                    <li key={idx} className="list-disc ml-4">
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {job.skills.map((skill, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-secondary/10 text-secondary text-sm rounded-full"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Education section */}
      <div className="max-w-4xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold mb-6">Education</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {profile.education && profile.education.map((edu: any, index: number) => (
            <div key={index} className="p-6 bg-card rounded-lg border border-border">
              <h3 className="text-xl font-bold">{edu.degree}</h3>
              <div className="text-secondary font-medium">{edu.institution}</div>
              <div className="text-sm text-muted-foreground mb-2">
                {edu.period.start} - {edu.period.end}
                {edu.location && ` • ${edu.location}`}
              </div>
              {edu.description && (
                <p className="text-muted-foreground text-sm">{edu.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperiencePage;