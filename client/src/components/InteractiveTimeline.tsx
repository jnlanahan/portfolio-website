import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { X, Briefcase, Calendar, MapPin } from 'lucide-react';
import { ExperienceEntry, formatPeriod } from '@/data/resume';

// Experience Detail Dialog for timeline items
const ExperienceDetailDialog = ({ 
  experience, 
  isOpen, 
  onClose 
}: { 
  experience: ExperienceEntry | null; 
  isOpen: boolean; 
  onClose: () => void 
}) => {
  if (!experience) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{experience.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-md font-medium">{experience.company.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatPeriod(experience.period)}</span>
            </div>
            {experience.company.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{experience.company.location}</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <h4 className="text-lg font-medium mb-2">Overview</h4>
            <p className="text-muted-foreground whitespace-pre-line">{experience.description}</p>
          </div>
          
          {experience.achievements && experience.achievements.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-2">Key Achievements</h4>
              <ul className="space-y-2 ml-5 list-disc text-muted-foreground">
                {experience.achievements.map((achievement, i) => (
                  <li key={i}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}
          
          {experience.skills && experience.skills.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-2">Skills & Competencies</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {experience.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className={`px-2.5 py-1 text-xs rounded-full ${
                      skill.category === 'leadership' ? 'bg-blue-500/10 text-blue-500' :
                      skill.category === 'business' ? 'bg-amber-500/10 text-amber-500' :
                      skill.category === 'product' ? 'bg-green-500/10 text-green-500' :
                      'bg-secondary/10 text-secondary'
                    }`}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface TimelineItemProps {
  experience: ExperienceEntry;
  position: {
    left: string;
    top: string;
  };
  color: string;
  delay: number;
  onClick: (experience: ExperienceEntry) => void;
}

const TimelineItem = ({ experience, position, color, delay, onClick }: TimelineItemProps) => {
  // Get the organization logo or placeholder
  const getLogo = () => {
    if (experience.company.name.includes("Army") || experience.company.name.includes("USACE")) {
      return <img src="/src/assets/images/logos/us-army-logo.svg" alt="Army" className="w-7 h-7" />;
    } else if (experience.company.name.includes("OSU") || experience.company.name.includes("Ohio State")) {
      return <img src="/src/assets/images/logos/osu-logo.svg" alt="OSU" className="w-7 h-7" />;
    } else if (experience.company.name.includes("EY")) {
      return <img src="/src/assets/images/logos/ey-logo.svg" alt="EY" className="w-7 h-7" />;
    } else if (experience.company.name.includes("H2L")) {
      return <span className="text-sm font-bold text-blue-400">H2L</span>;
    } else {
      return <span className="text-sm font-bold">{experience.company.name.substring(0, 2)}</span>;
    }
  };

  // Format date for display
  const getDateDisplay = () => {
    return formatPeriod(experience.period);
  };

  return (
    <div className="absolute" style={{ left: position.left, top: position.top }}>
      <motion.button
        onClick={() => onClick(experience)}
        className={`timeline-marker w-12 h-12 bg-card rounded-full border-2 border-${color} flex items-center justify-center z-10 hover:scale-110 transition-transform`}
        whileHover={{ y: -5 }}
      >
        {getLogo()}
      </motion.button>
      <span className="absolute -bottom-8 whitespace-nowrap text-sm font-medium translate-x-[-30%]">
        {getDateDisplay()}
      </span>
      <motion.div 
        className="mt-4 w-48 text-center translate-x-[-30%]"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
      >
        <h4 className="font-semibold text-base">{experience.title}</h4>
        <p className="text-xs text-muted-foreground">{experience.company.name}</p>
      </motion.div>
    </div>
  );
};

interface InteractiveTimelineProps {
  experiences: ExperienceEntry[];
}

export const InteractiveTimeline = ({ experiences }: InteractiveTimelineProps) => {
  const [selectedExperience, setSelectedExperience] = useState<ExperienceEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openExperienceDialog = (experience: ExperienceEntry) => {
    setSelectedExperience(experience);
    setDialogOpen(true);
  };

  const closeExperienceDialog = () => {
    setDialogOpen(false);
  };

  // Timeline item positions and styling data
  const timelineItems = [
    // Current roles (2021-Present)
    { 
      id: 'ey-manager', 
      position: { left: 'calc(80% - 24px)', top: '0px' },
      color: 'secondary',
      delay: 0.1
    },
    { 
      id: 'usace-officer', 
      position: { left: 'calc(80% - 24px)', top: '80px' },
      color: 'green-700',
      delay: 0.2
    },
    { 
      id: 'h2l-intern', 
      position: { left: 'calc(80% - 24px)', top: '160px' },
      color: 'blue-400',
      delay: 0.3
    },
    
    // 2018-2021
    { 
      id: 'osu-professor', 
      position: { left: 'calc(65% - 24px)', top: '0px' },
      color: 'amber-500',
      delay: 0.4
    },
    
    // 2017-2018
    { 
      id: 'army-commander', 
      position: { left: 'calc(60% - 24px)', top: '80px' },
      color: 'green-700',
      delay: 0.5
    },
    
    // 2016-2017
    { 
      id: 'army-pm', 
      position: { left: 'calc(55% - 24px)', top: '0px' },
      color: 'purple-500',
      delay: 0.6
    },
    
    // 2015-2016
    { 
      id: 'captains-career-course', 
      position: { left: 'calc(50% - 24px)', top: '80px' },
      color: 'yellow-500',
      delay: 0.7
    },
    
    // 2015
    { 
      id: 'assistant-project-engineer', 
      position: { left: 'calc(45% - 24px)', top: '0px' },
      color: 'purple-500',
      delay: 0.8
    },
    
    // 2013-2015
    { 
      id: 'operations-logistics-manager', 
      position: { left: 'calc(40% - 24px)', top: '80px' },
      color: 'orange-500',
      delay: 0.9
    },
    
    // 2013
    { 
      id: 'platoon-leader', 
      position: { left: 'calc(35% - 24px)', top: '0px' },
      color: 'green-500',
      delay: 1.0
    },
    
    // 2011-2013
    { 
      id: 'assistant-operations-officer', 
      position: { left: 'calc(30% - 24px)', top: '80px' },
      color: 'purple-500',
      delay: 1.1
    },
    
    // 2011
    { 
      id: 'bolc-student', 
      position: { left: 'calc(25% - 24px)', top: '0px' },
      color: 'yellow-500',
      delay: 1.2
    }
  ];

  return (
    <div className="mb-16 max-w-7xl mx-auto px-4">
      <motion.div
        className="interactive-timeline relative bg-card/30 p-8 rounded-lg shadow-sm border border-border overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold mb-10 text-center text-secondary">Career Journey (2005-Present)</h3>
        
        {/* Horizontal Timeline */}
        <div className="relative pb-12">
          {/* Timeline Line */}
          <div className="absolute top-14 left-0 right-0 h-1 bg-border"></div>
          
          {/* Year Markers */}
          <div className="absolute top-6 left-0 right-0 flex justify-between text-xs text-muted-foreground px-4">
            <span>2005</span>
            <span>2010</span>
            <span>2015</span>
            <span>2020</span>
            <span>2025</span>
          </div>
          
          {/* Timeline Items */}
          <div className="mt-6 relative" style={{ height: "280px" }}>
            {timelineItems.map(item => {
              const exp = experiences.find(e => e.id === item.id);
              if (!exp) return null;
              
              return (
                <TimelineItem
                  key={item.id}
                  experience={exp}
                  position={item.position}
                  color={item.color}
                  delay={item.delay}
                  onClick={openExperienceDialog}
                />
              );
            })}
          </div>
        </div>
      </motion.div>
      
      {/* Experience Detail Dialog */}
      <ExperienceDetailDialog 
        experience={selectedExperience} 
        isOpen={dialogOpen} 
        onClose={closeExperienceDialog} 
      />
    </div>
  );
};