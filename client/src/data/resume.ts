// Types for experience data structure
export interface Skill {
  name: string;
  category?: 'frontend' | 'backend' | 'design' | 'leadership' | 'other';
  icon?: string; // Optional icon name for future enhancement
}

export interface Company {
  name: string;
  location?: string;
  industry?: string; 
  logoUrl?: string; // For future enhancement to display logos
}

export interface ExperienceEntry {
  id: string;  // Unique identifier
  title: string;
  company: Company;
  period: {
    start: string;
    end: string | 'Present';
  };
  description: string;
  achievements?: string[]; // Bullet points of key achievements
  skills: Skill[];
  projectImageUrl?: string; // For future enhancement to display work samples
}

export interface Education {
  degree: string;
  institution: string;
  location?: string;
  period: {
    start: string;
    end: string;
  };
  description?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  expiration?: string;
  credentialUrl?: string;
}

// Complete experience profile structure
export interface ExperienceProfile {
  workExperience: ExperienceEntry[];
  education?: Education[];
  certifications?: Certification[];
  skills?: {
    technical: string[];
    leadership: string[];
    other: string[];
  };
}

// Helper function to format period for display
export const formatPeriod = (period: ExperienceEntry['period']): string => {
  return `${period.start} - ${period.end}`;
};

// Get work experience entries only
export function getWorkExperience(): ExperienceEntry[] {
  return experienceData.workExperience;
}

// Get complete experience profile
export function getExperienceProfile(): ExperienceProfile {
  return experienceData;
}

// Legacy function for compatibility
export function getResume(): ExperienceEntry[] {
  return experienceData.workExperience;
}

// Single source of truth for experience data
const experienceData: ExperienceProfile = {
  workExperience: [
    {
      id: "job-1",
      title: "Senior Frontend Developer",
      company: {
        name: "TechVision Inc.",
        location: "San Francisco, CA"
      },
      period: {
        start: "2022",
        end: "Present"
      },
      description: "Leading the frontend development team for an AI-powered analytics platform with 50,000+ users. Architected a component system that increased development velocity by 35%.",
      achievements: [
        "Led a team of 5 developers to deliver a major platform redesign on time and under budget",
        "Reduced bundle size by 45% through code splitting and lazy loading strategies",
        "Implemented modern state management techniques that improved performance by 60%"
      ],
      skills: [
        { name: "React", category: "frontend" },
        { name: "TypeScript", category: "frontend" },
        { name: "GraphQL", category: "frontend" },
        { name: "Tailwind", category: "frontend" }
      ]
    },
    {
      id: "job-2",
      title: "Full-Stack Developer",
      company: {
        name: "InnovateLab",
        location: "Austin, TX"
      },
      period: {
        start: "2019",
        end: "2022"
      },
      description: "Developed and scaled a SaaS platform serving 200+ business clients. Built RESTful APIs, implemented CI/CD pipelines, and led migration to a microservices architecture.",
      achievements: [
        "Architected and implemented a microservices-based backend that scales to 10,000+ concurrent users",
        "Reduced infrastructure costs by 30% through AWS optimization",
        "Delivered 99.9% service uptime through robust error handling and monitoring"
      ],
      skills: [
        { name: "Node.js", category: "backend" },
        { name: "React", category: "frontend" },
        { name: "PostgreSQL", category: "backend" },
        { name: "Docker", category: "backend" }
      ]
    },
    {
      id: "job-3",
      title: "Frontend Developer",
      company: {
        name: "Digital Wave Agency",
        location: "Seattle, WA"
      },
      period: {
        start: "2017",
        end: "2019"
      },
      description: "Created responsive interfaces for enterprise clients in finance and healthcare. Collaborated with designers to implement pixel-perfect UIs and improve accessibility.",
      achievements: [
        "Improved accessibility scores to 98/100 across all client projects",
        "Reduced page load times by 40% through performance optimization",
        "Created a reusable component library that reduced development time by 25%"
      ],
      skills: [
        { name: "JavaScript", category: "frontend" },
        { name: "Vue.js", category: "frontend" },
        { name: "SCSS", category: "frontend" },
        { name: "Webpack", category: "frontend" }
      ]
    },
    {
      id: "job-4",
      title: "Junior Web Developer",
      company: {
        name: "CodeCraft Studios",
        location: "Portland, OR"
      },
      period: {
        start: "2015",
        end: "2017"
      },
      description: "Built and maintained websites for small businesses and startups. Developed custom WordPress themes and plugins to enhance site functionality.",
      achievements: [
        "Developed 20+ custom WordPress themes for client websites",
        "Created an e-commerce solution that increased client sales by 35%",
        "Implemented SEO best practices that improved client search rankings by 40%"
      ],
      skills: [
        { name: "HTML/CSS", category: "frontend" },
        { name: "JavaScript", category: "frontend" },
        { name: "PHP", category: "backend" },
        { name: "WordPress", category: "backend" }
      ]
    }
  ],
  education: [
    {
      degree: "B.S. Computer Science",
      institution: "UC Berkeley",
      location: "Berkeley, CA",
      period: {
        start: "2011",
        end: "2015"
      },
      description: "Focused on web technologies and software engineering. Senior project: Developing an AI-driven content recommendation system."
    }
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2020",
      credentialUrl: "https://aws.amazon.com/certification/"
    },
    {
      name: "Professional Scrum Master I",
      issuer: "Scrum.org",
      date: "2019",
      credentialUrl: "https://www.scrum.org/certificates"
    }
  ],
  skills: {
    technical: [
      "JavaScript/TypeScript", "React/Next.js", "Vue.js", "Node.js", 
      "GraphQL", "REST API Design", "PostgreSQL", "MongoDB", 
      "AWS", "Docker", "CI/CD", "TailwindCSS"
    ],
    leadership: [
      "Team Leadership", "Agile/Scrum", "Technical Planning", "Mentoring"
    ],
    other: [
      "UI/UX Principles", "Performance Optimization", "Accessibility", "SEO"
    ]
  }
};
