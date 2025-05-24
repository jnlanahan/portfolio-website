import { useEffect, useRef, useState } from 'react';
import { getExperienceProfile, ExperienceEntry } from '@/data/resume';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/carousel-timeline.css';

// Need to import GSAP in a way that allows for proper code splitting and type safety
import { gsap } from 'gsap';

// Register GSAP plugins (we'll do this in the effect)
let ScrollTrigger: any;
let Draggable: any;

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
  
  // Initialize GSAP and plugins
  useEffect(() => {
    // Dynamically import ScrollTrigger and Draggable
    const initGSAP = async () => {
      try {
        // Import GSAP plugins
        ScrollTrigger = (await import('gsap/ScrollTrigger')).ScrollTrigger;
        Draggable = (await import('gsap/Draggable')).Draggable;
        
        // Register plugins
        gsap.registerPlugin(ScrollTrigger);
        gsap.registerPlugin(Draggable);
        
        // Display all cards by default so they're visible even without animation
        gsap.set('.carousel-card', { display: 'block' });
        
        // Now we can set up the carousel if jobList is loaded
        if (jobList.length > 0 && boxesRef.current) {
          setupCarousel();
        }
      } catch (error) {
        console.error('Failed to load GSAP plugins:', error);
      }
    };
    
    initGSAP();
    
    // Cleanup function
    return () => {
      if (ScrollTrigger) {
        const triggers = ScrollTrigger.getAll();
        triggers.forEach((trigger: any) => trigger.kill());
      }
    };
  }, []); // This effect runs only once to load plugins
  
  // Set up carousel when jobList changes
  useEffect(() => {
    if (jobList.length === 0 || !boxesRef.current) return;
    
    // Make sure GSAP plugins are loaded
    if (!ScrollTrigger || !Draggable) {
      // Just to be safe, make the cards visible immediately
      const cards = document.querySelectorAll('.carousel-card');
      cards.forEach((card: any) => {
        card.style.display = 'block';
      });
      return;
    }
    
    // Clean up existing animations first
    const cleanup = () => {
      if (ScrollTrigger) {
        const triggers = ScrollTrigger.getAll();
        triggers.forEach((trigger: any) => trigger.kill());
      }
    };
    
    cleanup();
    
    // Simple fallback position if animation fails
    const positionCards = () => {
      const cards = document.querySelectorAll('.carousel-card');
      cards.forEach((card: any, index: number) => {
        card.style.display = 'block';
        card.style.transform = `translate(-50%, -50%) translateX(${index * 50 - 100}px)`;
        card.style.zIndex = 10 - Math.abs(index * 50 - 100);
      });
    };
    
    try {
      setupCarousel();
    } catch (error) {
      console.error('Failed to set up carousel:', error);
      positionCards(); // Fallback to simple positioning
    }
    
    return cleanup;
  }, [jobList]); // Run this effect when jobList changes
  
  // Setup carousel function (moved outside the effect to avoid re-creation on render)
  const setupCarousel = () => {
    if (!boxesRef.current || !ScrollTrigger || !Draggable) return;
    
    const boxes = gsap.utils.toArray('.carousel-card');
    if (!boxes.length) return;
    
    // Position cards in 3D space
    gsap.set('.carousel-card', {
      yPercent: -50,
      display: 'block',
    });
    
    // Set up main loop timeline
    const loop = gsap.timeline({
      paused: true,
      repeat: -1,
      ease: 'none',
    });
    
    const stagger = 0.1;
    const duration = 1;
    const offset = 0;
    
    // Triple cards for infinite loop effect
    const shifts = [...boxes, ...boxes, ...boxes];
    
    shifts.forEach((box: any, index) => {
      const boxTl = gsap.timeline()
        .set(box, {
          xPercent: 250,
          rotateY: -50,
          opacity: 0,
          scale: 0.5,
        })
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
        .fromTo(box, {
          xPercent: 250,
        }, {
          xPercent: -350,
          duration: 1,
          immediateRender: false,
          ease: 'power1.inOut',
        }, 0)
        .fromTo(box, {
          rotateY: -50,
        }, {
          rotateY: 50,
          immediateRender: false,
          duration: 1,
          ease: 'power4.inOut',
        }, 0)
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
    
    // Drive animation
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
        if (playhead.position !== undefined) {
          loopHead.totalTime(positionWrap(playhead.position));
        }
      },
      paused: true,
      duration: 0.25,
      ease: 'power3',
    });
    
    let iteration = 0;
    
    // Set up ScrollTrigger
    const trigger = ScrollTrigger.create({
      start: 0,
      end: '+=2000',
      horizontal: false,
      pin: '.timeline-carousel',
      onUpdate: (self: any) => {
        const scroll = self.scroll();
        if (scroll > self.end - 1) {
          wrap(1, 1);
        } else if (scroll < 1 && self.direction < 0) {
          wrap(-1, self.end - 1);
        } else {
          const newPos = (iteration + self.progress) * loopHead.duration();
          if (scrub.vars.position !== undefined) {
            scrub.vars.position = newPos;
            scrub.invalidate().restart();
          }
        }
      },
    });
    
    // Helper functions
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
      if (position === undefined) return;
      
      const snapPos = snap(position);
      const progress = (snapPos - loopHead.duration() * iteration) / loopHead.duration();
      const scroll = progressToScroll(progress);
      
      if (progress >= 1 || progress < 0) {
        return wrap(Math.floor(progress), scroll);
      }
      
      trigger.scroll(scroll);
    };
    
    // Navigation functions
    const next = () => {
      if (scrub.vars.position !== undefined) {
        scrollToPosition(scrub.vars.position - 1 / boxes.length);
      }
    };
    
    const prev = () => {
      if (scrub.vars.position !== undefined) {
        scrollToPosition(scrub.vars.position + 1 / boxes.length);
      }
    };
    
    // Set up event listeners
    ScrollTrigger.addEventListener('scrollEnd', () => {
      if (scrub.vars.position !== undefined) {
        scrollToPosition(scrub.vars.position);
      }
    });
    
    // Button click handlers
    const addButtonListeners = () => {
      const prevButton = document.querySelector('.prev-button');
      const nextButton = document.querySelector('.next-button');
      
      if (prevButton) prevButton.addEventListener('click', prev);
      if (nextButton) nextButton.addEventListener('click', next);
      
      return () => {
        if (prevButton) prevButton.removeEventListener('click', prev);
        if (nextButton) nextButton.removeEventListener('click', next);
      };
    };
    
    const removeButtonListeners = addButtonListeners();
    
    // Card click handler
    const handleCardClick = (e: MouseEvent) => {
      const box = (e.target as HTMLElement).closest('.carousel-card');
      if (!box || scrub.vars.position === undefined) return;
      
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
    };
    
    if (boxesRef.current) {
      boxesRef.current.addEventListener('click', handleCardClick);
    }
    
    // Keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') next();
      if (event.code === 'ArrowRight' || event.code === 'KeyD') prev();
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Setup dragging
    if (dragProxyRef.current) {
      Draggable.create(dragProxyRef.current, {
        type: 'x',
        trigger: '.carousel-card',
        onPress: function(this: any) {
          this.startOffset = scrub.vars.position;
        },
        onDrag: function(this: any) {
          if (this.startOffset !== undefined) {
            scrub.vars.position = this.startOffset + (this.startX - this.x) * 0.001;
            scrub.invalidate().restart();
          }
        },
        onDragEnd: function(this: any) {
          if (scrub.vars.position !== undefined) {
            scrollToPosition(scrub.vars.position);
          }
        },
      });
    }
    
    // Cleanup function for all event listeners
    const cleanup = () => {
      removeButtonListeners();
      if (boxesRef.current) {
        boxesRef.current.removeEventListener('click', handleCardClick);
      }
      document.removeEventListener('keydown', handleKeyDown);
      
      if (ScrollTrigger) {
        const triggers = ScrollTrigger.getAll();
        triggers.forEach((trigger: any) => trigger.kill());
      }
    };
    
    // Add cleanup to component unmount
    return cleanup;
  };
  
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
            <Button className="prev-button control-button" variant="secondary" size="lg">
              <ChevronLeft className="w-6 h-6" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button className="next-button control-button" variant="secondary" size="lg">
              <ChevronRight className="w-6 h-6" />
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
      
      {/* Space to avoid footer overlap */}
      <div className="py-16"></div>
    </div>
  );
};

export default CarouselTimelinePage;