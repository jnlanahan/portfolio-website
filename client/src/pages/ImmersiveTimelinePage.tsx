import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getExperienceProfile, formatPeriod, ExperienceEntry } from "@/data/resume";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import "../styles/immersive-timeline.css";

interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  company: string;
  location: string;
  image?: string;
  position: "left" | "center" | "right";
}

const ImmersiveTimelinePage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/resume'],
    queryFn: () => Promise.resolve(getExperienceProfile()),
  });

  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Convert experience data to timeline events
  useEffect(() => {
    if (data) {
      const events: TimelineEvent[] = [];
      
      // Add work experience
      data.workExperience.forEach((job: ExperienceEntry) => {
        const startYear = new Date(job.period.start).getFullYear();
        const endYear = job.period.end === "Present" 
          ? new Date().getFullYear() 
          : new Date(job.period.end).getFullYear();
        
        // Determine position for visual design
        const positions: ("left" | "center" | "right")[] = ["left", "center", "right"];
        const randomPosition = positions[Math.floor(Math.random() * positions.length)];
        
        events.push({
          id: job.id,
          year: startYear,
          title: job.title,
          description: job.description,
          company: job.company.name,
          location: job.company.location || "",
          position: randomPosition
        });
      });
      
      // Sort events by year
      events.sort((a, b) => a.year - b.year);
      setTimelineEvents(events);
    }
  }, [data]);

  // Handle timeline scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (timelineRef.current?.offsetLeft || 0));
    setScrollLeft(timelineRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (timelineRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // Scroll speed multiplier
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleScroll = () => {
    if (timelineRef.current && timelineEvents.length > 0) {
      const scrollPosition = timelineRef.current.scrollLeft;
      const itemWidth = timelineRef.current.scrollWidth / timelineEvents.length;
      const newIndex = Math.round(scrollPosition / itemWidth);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < timelineEvents.length) {
        setCurrentIndex(newIndex);
      }
    }
  };

  const scrollToEvent = (index: number) => {
    if (timelineRef.current && index >= 0 && index < timelineEvents.length) {
      const itemWidth = timelineRef.current.scrollWidth / timelineEvents.length;
      timelineRef.current.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      scrollToEvent(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < timelineEvents.length - 1) {
      scrollToEvent(currentIndex + 1);
    }
  };

  if (isLoading) return <div className="py-20 text-center">Loading experience timeline...</div>;

  const currentEvent = timelineEvents[currentIndex] || null;

  return (
    <div className="min-h-screen flex flex-col" ref={containerRef}>
      <div className="container px-4 mx-auto max-w-6xl py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Career Journey</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore my professional timeline through an interactive experience.
          </p>
        </div>
      </div>

      {/* Main content area - 3D perspective */}
      <div className="flex-1 relative overflow-hidden perspective-container bg-gradient-to-b from-background/80 to-background">
        <div className="absolute inset-0 bg-[url('/src/assets/images/grid-pattern.svg')] bg-center opacity-10"></div>
        
        {/* Navigation arrows */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-background/80 rounded-full h-12 w-12"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-background/80 rounded-full h-12 w-12"
          onClick={handleNext}
          disabled={currentIndex === timelineEvents.length - 1}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
        
        {/* 3D Timeline Content */}
        <div className="relative h-full w-full">
          <AnimatePresence mode="wait">
            {currentEvent && (
              <motion.div
                key={currentEvent.id}
                className={`timeline-event-card absolute z-10 max-w-md bg-card/90 backdrop-blur-sm border rounded-lg overflow-hidden shadow-lg 
                  ${currentEvent.position === 'left' ? 'left-[10%] top-1/3' : 
                    currentEvent.position === 'right' ? 'right-[10%] top-1/3' : 
                    'left-1/2 -translate-x-1/2 top-1/4'}`}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.8 }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {currentEvent.year}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{currentEvent.title}</h2>
                  <div className="flex items-center text-muted-foreground mb-3">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span>{currentEvent.company}</span>
                  </div>
                  {currentEvent.location && (
                    <div className="flex items-center text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{currentEvent.location}</span>
                    </div>
                  )}
                  <p className="text-muted-foreground">{currentEvent.description.slice(0, 180)}...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Background 3D elements - Only visible on larger screens */}
          <div className="hidden md:block">
            <div className="perspective-line-left"></div>
            <div className="perspective-line-right"></div>
            <div className="perspective-grid"></div>
          </div>
        </div>
      </div>

      {/* Bottom timeline */}
      <div
        className="timeline-scroller w-full bg-card/30 border-t border-border overflow-x-auto py-6 px-4"
        ref={timelineRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onScroll={handleScroll}
      >
        <div className="timeline-track relative h-20 min-w-max flex items-center">
          {/* Scale markings */}
          <div className="absolute left-0 right-0 h-1 bg-border/50 top-12"></div>
          
          {/* Year markers and events */}
          <div className="flex items-center">
            {timelineEvents.map((event, index) => (
              <div 
                key={event.id} 
                className="timeline-marker px-16 relative"
                onClick={() => scrollToEvent(index)}
              >
                <div className={`w-4 h-4 rounded-full mb-2 cursor-pointer transition-all duration-300
                  ${index === currentIndex 
                    ? 'bg-primary scale-125' 
                    : 'bg-muted-foreground/40 hover:bg-muted-foreground/80'}`}
                ></div>
                <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className={`text-sm font-medium transition-all duration-300 
                    ${index === currentIndex ? 'text-primary' : 'text-muted-foreground'}`}>
                    {event.year}
                  </span>
                </div>
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className={`text-xs transition-all duration-300 
                    ${index === currentIndex ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {event.title.length > 20 ? `${event.title.slice(0, 20)}...` : event.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImmersiveTimelinePage;