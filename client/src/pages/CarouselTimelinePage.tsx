import { useEffect, useRef, useState } from 'react';
import { getExperienceProfile, ExperienceEntry } from '@/data/resume';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/carousel-timeline.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(Draggable);

// Modified version of work experience card for carousel display
interface CarouselCardProps {
  job: ExperienceEntry;
  index: number;
}

const CarouselCard = ({ job, index }: CarouselCardProps) => {
  // Get appropriate background colors based on job type/company
  const getCardColor = () => {
    if (job.company.name.includes('Army')) {
      return 'army-card';
    } else if (job.company.name.includes('OSU')) {
      return 'osu-card';
    } else if (job.company.name.includes('EY')) {
      return 'ey-card';
    } else {
      return 'default-card';
    }
  };

  // Handle logo selection
  const getLogoSrc = () => {
    if (job.company.name.includes('Army')) {
      return '/src/assets/images/logos/us-army-logo.svg';
    } else if (job.company.name.includes('OSU')) {
      return '/src/assets/images/logos/osu-logo.svg';
    } else if (job.company.name.includes('EY')) {
      return '/src/assets/images/logos/ey-logo.svg';
    } else {
      return '';
    }
  };

  return (
    <div className={`carousel-card ${getCardColor()}`} data-id={job.id}>
      <div className="card-content">
        <div className="card-header">
          <span className="year-marker">{new Date(job.period.start).getFullYear()}</span>
          <h3>{job.title}</h3>
        </div>
        <div className="card-body">
          <div className="company-info">
            {getLogoSrc() && <img src={getLogoSrc()} alt={`${job.company.name} logo`} className="company-logo" />}
            <span className="company-name">{job.company.name}</span>
          </div>
          <p className="card-description">{job.description.substring(0, 150)}...</p>
        </div>
      </div>
    </div>
  );
};

const CarouselTimelinePage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/resume'],
    queryFn: () => Promise.resolve(getExperienceProfile()),
  });
  
  const [jobList, setJobList] = useState<ExperienceEntry[]>([]);
  const boxesRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const dragProxyRef = useRef<HTMLDivElement>(null);
  
  // Initialize timeline data
  useEffect(() => {
    if (data) {
      // Process work experience entries
      const sortedJobs = [...data.workExperience].sort((a, b) => {
        const dateA = new Date(a.period.start).getTime();
        const dateB = new Date(b.period.start).getTime();
        return dateB - dateA; // Most recent first
      });
      
      setJobList(sortedJobs);
    }
  }, [data]);
  
  // Initialize GSAP animations
  useEffect(() => {
    if (jobList.length === 0 || !boxesRef.current) return;
    
    // Clean up any existing animations
    const cleanup = () => {
      const triggers = ScrollTrigger.getAll();
      triggers.forEach(trigger => trigger.kill());
    };
    
    // Set up the carousel
    const setupCarousel = () => {
      const boxes = gsap.utils.toArray('.carousel-card');
      if (!boxes.length) return;
      
      // Position cards in 3D space
      gsap.set('.carousel-card', {
        yPercent: -50,
        display: 'block',
      });
      
      // Set up the main loop timeline
      const loop = gsap.timeline({
        paused: true,
        repeat: -1,
        ease: 'none',
      });
      
      const stagger = 0.1;
      const duration = 1;
      const offset = 0;
      
      // For infinite loop effect, triple the cards
      const shifts = [...boxes, ...boxes, ...boxes];
      
      shifts.forEach((box, index) => {
        const boxTl = gsap.timeline()
          .set(box, {
            xPercent: 250,
            rotateY: -50,
            opacity: 0,
            scale: 0.5,
          })
          // Opacity & Scale
          .to(box, {
            opacity: 1,
            scale: 1,
            duration: 0.1,
          }, 0)
          .to(box, {
            opacity: 0,
            scale: 0.5,
            duration: 0.1,
          }, 0.9)
          // Panning
          .fromTo(box, {
            xPercent: 250,
          }, {
            xPercent: -350,
            duration: 1,
            immediateRender: false,
            ease: 'power1.inOut',
          }, 0)
          // Rotations
          .fromTo(box, {
            rotateY: -50,
          }, {
            rotateY: 50,
            immediateRender: false,
            duration: 1,
            ease: 'power4.inOut',
          }, 0)
          // Scale & Z
          .to(box, {
            z: 100,
            scale: 1.25,
            duration: 0.1,
            repeat: 1,
            yoyo: true,
          }, 0.4)
          .fromTo(box, {
            zIndex: 1,
          }, {
            zIndex: boxes.length,
            repeat: 1,
            yoyo: true,
            ease: 'none',
            duration: 0.5,
            immediateRender: false,
          }, 0);
          
        loop.add(boxTl, index * stagger);
      });
      
      const cycleDuration = stagger * boxes.length;
      const startTime = cycleDuration + duration * 0.5 + offset;
      
      // Drive the animation
      const loopHead = gsap.fromTo(loop, {
        totalTime: startTime,
      }, {
        totalTime: `+=${cycleDuration}`,
        duration: 1,
        ease: 'none',
        repeat: -1,
        paused: true,
      });
      
      const playhead = { position: 0 };
      const positionWrap = gsap.utils.wrap(0, loopHead.duration());
      
      const scrub = gsap.to(playhead, {
        position: 0,
        onUpdate: () => {
          loopHead.totalTime(positionWrap(playhead.position));
        },
        paused: true,
        duration: 0.25,
        ease: 'power3',
      });
      
      let iteration = 0;
      
      // Set up ScrollTrigger for scroll-based animation
      const trigger = ScrollTrigger.create({
        start: 0,
        end: '+=2000',
        horizontal: false,
        pin: '.timeline-carousel',
        onUpdate: self => {
          const scroll = self.scroll();
          if (scroll > self.end - 1) {
            // Forward in time
            wrap(1, 1);
          } else if (scroll < 1 && self.direction < 0) {
            // Backward in time
            wrap(-1, self.end - 1);
          } else {
            const newPos = (iteration + self.progress) * loopHead.duration();
            scrub.vars.position = newPos;
            scrub.invalidate().restart();
          }
        },
      });
      
      const wrap = (iterationDelta: number, scrollTo: number) => {
        iteration += iterationDelta;
        trigger.scroll(scrollTo);
        trigger.update();
      };
      
      const snap = gsap.utils.snap(1 / boxes.length);
      
      const progressToScroll = (progress: number) => {
        return gsap.utils.clamp(
          1,
          trigger.end - 1,
          gsap.utils.wrap(0, 1, progress) * trigger.end
        );
      };
      
      const scrollToPosition = (position: number) => {
        const snapPos = snap(position);
        const progress = (snapPos - loopHead.duration() * iteration) / loopHead.duration();
        const scroll = progressToScroll(progress);
        
        if (progress >= 1 || progress < 0) {
          return wrap(Math.floor(progress), scroll);
        }
        
        trigger.scroll(scroll);
      };
      
      ScrollTrigger.addEventListener('scrollEnd', () => {
        scrollToPosition(scrub.vars.position);
      });
      
      // Navigation functions
      const next = () => scrollToPosition(scrub.vars.position - 1 / boxes.length);
      const prev = () => scrollToPosition(scrub.vars.position + 1 / boxes.length);
      
      // Button click handlers
      const prevButton = document.querySelector('.prev-button');
      const nextButton = document.querySelector('.next-button');
      
      if (prevButton) prevButton.addEventListener('click', prev);
      if (nextButton) nextButton.addEventListener('click', next);
      
      // Card click handler
      boxesRef.current.addEventListener('click', e => {
        const box = (e.target as HTMLElement).closest('.carousel-card');
        if (box) {
          const target = Array.from(boxes).indexOf(box);
          const current = gsap.utils.wrap(
            0,
            boxes.length,
            Math.floor(boxes.length * scrub.vars.position)
          );
          
          let bump = target - current;
          
          if (target > current && target - current > boxes.length * 0.5) {
            bump = (boxes.length - bump) * -1;
          }
          
          if (current > target && current - target > boxes.length * 0.5) {
            bump = boxes.length + bump;
          }
          
          scrollToPosition(scrub.vars.position + bump * (1 / boxes.length));
        }
      });
      
      // Setup dragging
      if (dragProxyRef.current) {
        Draggable.create(dragProxyRef.current, {
          type: 'x',
          trigger: '.carousel-card',
          onPress() {
            this.startOffset = scrub.vars.position;
          },
          onDrag() {
            scrub.vars.position = this.startOffset + (this.startX - this.x) * 0.001;
            scrub.invalidate().restart();
          },
          onDragEnd() {
            scrollToPosition(scrub.vars.position);
          },
        });
      }
      
      // Keyboard navigation
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.code === 'ArrowLeft' || event.code === 'KeyA') next();
        if (event.code === 'ArrowRight' || event.code === 'KeyD') prev();
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      // Cleanup
      return () => {
        const triggers = ScrollTrigger.getAll();
        triggers.forEach(trigger => trigger.kill());
        
        if (prevButton) prevButton.removeEventListener('click', prev);
        if (nextButton) nextButton.removeEventListener('click', next);
        document.removeEventListener('keydown', handleKeyDown);
      };
    };
    
    const timer = setTimeout(() => {
      cleanup();
      setupCarousel();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [jobList]);
  
  if (isLoading) return <div className="py-20 text-center">Loading timeline...</div>;
  
  return (
    <div className="timeline-container">
      <div className="py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">Career Journey</h1>
        <p className="text-center max-w-2xl mx-auto mb-12 text-muted-foreground">
          Scroll through my professional experience in this interactive 3D timeline. Click on a card to learn more, or use the controls to navigate.
        </p>
      </div>
      
      <div className="timeline-main">
        <div className="timeline-carousel" ref={boxesRef}>
          {jobList.map((job, index) => (
            <CarouselCard key={job.id} job={job} index={index} />
          ))}
          
          <div className="timeline-controls">
            <Button className="prev-button control-button" variant="secondary">
              <ChevronLeft className="w-5 h-5" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button className="next-button control-button" variant="secondary">
              <ChevronRight className="w-5 h-5" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
        
        <div className="drag-proxy" ref={dragProxyRef}></div>
        
        <div className="timeline-instructions">
          <div className="instruction-text">
            <p>Use arrow keys or buttons to navigate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselTimelinePage;