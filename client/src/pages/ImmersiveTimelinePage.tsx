import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getExperienceProfile, formatPeriod, ExperienceEntry } from "@/data/resume";
import { ChevronDown, Plus, BarChart3, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "../styles/immersive-timeline.css";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  company: string;
  location: string;
  position: "left" | "right";
  color: string;
  job: ExperienceEntry;
}

// Timeline Item Component
const TimelineItem = ({ event, index }: { event: TimelineEvent, index: number }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const iconColor = event.position === "left" ? "bg-cyan-400" : "bg-amber-400";
  const itemRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div 
        ref={itemRef}
        className={cn(
          'timeline-item',
          `timeline-item-${event.position}`,
          `timeline-item-${event.color}`
        )}
      >
        <div className={`timeline-connector-dot ${event.position === "left" ? "left-dot" : "right-dot"}`}>
          <div 
            className={`dot-icon ${iconColor}`}
            onClick={() => setIsDialogOpen(true)}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${event.title}`}
          >
            {index % 2 === 0 ? (
              <BarChart3 className="w-5 h-5" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>
        </div>
        
        <div className="timeline-content-wrapper">
          <div className="timeline-date">
            <span>{event.year}</span>
          </div>
          
          <div className="timeline-content">
            <h3 className="timeline-title">{event.title}</h3>
            <div className="timeline-company">
              <span>{event.company}</span>
              {event.location && <span className="timeline-location"> • {event.location}</span>}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="timeline-expand-btn mt-2"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" /> View Details
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{event.job.title}</DialogTitle>
            <DialogDescription className="flex items-center text-lg font-medium">
              {event.job.company.name}
              <span className="mx-2">•</span>
              <span className="text-muted-foreground">{formatPeriod(event.job.period)}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2">Description</h4>
                <p className="whitespace-pre-line">{event.job.description}</p>
              </div>
              
              {event.job.achievements && event.job.achievements.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Key Achievements</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {event.job.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {event.job.skills && event.job.skills.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Skills & Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.job.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-sm">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const ImmersiveTimelinePage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/resume'],
    queryFn: () => Promise.resolve(getExperienceProfile()),
  });
  
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Convert the resume data into timeline events
  useEffect(() => {
    if (data) {
      const events: TimelineEvent[] = [];
      
      // Sort by date first
      const sortedJobs = [...data.workExperience].sort((a, b) => {
        const dateA = new Date(a.period.start).getTime();
        const dateB = new Date(b.period.start).getTime();
        return dateB - dateA; // Most recent first
      });
      
      sortedJobs.forEach((job, index) => {
        // Alternate positions for visual interest
        const position = index % 2 === 0 ? "left" : "right";
        
        // Determine color based on company
        let color = "default";
        if (job.company.name.includes('Army')) color = "army";
        else if (job.company.name.includes('OSU')) color = "osu";
        else if (job.company.name.includes('EY')) color = "ey";
        
        const year = new Date(job.period.start).getFullYear();
        
        events.push({
          id: job.id,
          year,
          title: job.title,
          description: job.description,
          company: job.company.name,
          location: job.company.location || '',
          position,
          color,
          job,
        });
      });
      
      setTimelineEvents(events);
    }
  }, [data]);
  
  // Setup GSAP animations
  useEffect(() => {
    if (timelineEvents.length > 0 && timelineRef.current) {
      // Animate the vertical line
      gsap.fromTo(
        '.timeline-vertical-line',
        { height: 0 },
        {
          height: '100%',
          duration: 1.5,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: '.timeline-wrapper',
            start: 'top 60%',
            end: 'bottom 20%',
            scrub: 0.6,
          },
        }
      );
      
      // Animate each timeline item
      const timelineItems = document.querySelectorAll('.timeline-item');
      
      timelineItems.forEach((item, index) => {
        const isLeft = item.classList.contains('timeline-item-left');
        
        gsap.fromTo(
          item,
          { 
            opacity: 0,
            x: isLeft ? -50 : 50,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            delay: index * 0.1,
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
      
      // Animate the dots
      gsap.fromTo(
        '.timeline-connector-dot',
        { 
          opacity: 0,
          scale: 0.5,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.timeline-wrapper',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }
    
    return () => {
      // Clean up scroll triggers
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [timelineEvents]);
  
  if (isLoading) return <div className="py-20 text-center">Loading timeline...</div>;
  
  return (
    <div className="vertical-timeline-container py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Professional Timeline</h1>
        <p className="text-center max-w-2xl mx-auto text-muted-foreground">
          Explore my career journey through this interactive timeline. Click on any colored circle or plus button to view detailed information about my role and achievements.
        </p>
        <div className="flex justify-center mt-8">
          <ChevronDown className="animate-bounce w-6 h-6" />
        </div>
      </div>
      
      <div className="timeline-wrapper" ref={timelineRef}>
        <div className="timeline-vertical-line"></div>
        
        {timelineEvents.map((event, index) => (
          <TimelineItem key={event.id} event={event} index={index} />
        ))}
      </div>
      
      {/* Add padding at the bottom for better visibility */}
      <div className="py-16"></div>
    </div>
  );
};

export default ImmersiveTimelinePage;