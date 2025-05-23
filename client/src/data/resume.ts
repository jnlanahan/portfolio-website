
// Types for experience data structure
export interface Skill {
  name: string;
  category?: 'frontend' | 'backend' | 'design' | 'leadership' | 'other';
  icon?: string;
}

export interface Company {
  name: string;
  location?: string;
  industry?: string;
  logoUrl?: string;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: Company;
  period: {
    start: string;
    end: string | 'Present';
  };
  description: string;
  achievements?: string[];
  skills: Skill[];
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
  courses?: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  expiration?: string;
  credentialUrl?: string;
}

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

export const formatPeriod = (period: ExperienceEntry['period']): string => {
  return `${period.start} - ${period.end}`;
};

export function getWorkExperience(): ExperienceEntry[] {
  return experienceData.workExperience;
}

export function getExperienceProfile(): ExperienceProfile {
  return experienceData;
}

export function getResume(): ExperienceEntry[] {
  return experienceData.workExperience;
}

const experienceData: ExperienceProfile = {
  workExperience: [
    {
      id: "ey-manager",
      title: "Manager – Product Management",
      company: {
        name: "EY",
        location: "Columbus, OH"
      },
      period: {
        start: "2021",
        end: "Present"
      },
      description: "I lead high-impact product transformations for major financial institutions, often under urgent conditions that require creative problem-solving, clear communication, and quick execution. My work balances delivering value to demanding clients with aligning diverse stakeholders—helping teams stay focused and strategic under pressure.",
      achievements: [
        "Led modernization efforts for global product orgs, impacting 1,000s of PMs, engineers, and functional partners",
        "Designed and deployed a global OKR framework at a multinational bank to drive decentralized, strategic decision-making",
        "Shaped the product strategy for a major consumer bank's partner ecosystem shift—enabling self-service tooling at scale",
        "Co-authored EY's global Product Playbook, components of it used by 100+ product teams",
        "Supported critical internal and external communications during a regional bank acquisition"
      ],
      skills: [
        { name: "Strategy", category: "leadership" },
        { name: "Critical Thinking", category: "leadership" },
        { name: "Change Management", category: "leadership" },
        { name: "Financial Services", category: "other" },
        { name: "Product Transformation", category: "other" },
        { name: "OKRs", category: "other" },
        { name: "Client Engagement", category: "leadership" }
      ]
    },
    {
      id: "lanahan-innovations",
      title: "Founder",
      company: {
        name: "Lanahan Innovations",
        location: "Columbus, OH"
      },
      period: {
        start: "2023",
        end: "Present"
      },
      description: "Started a wellness-focused product company to explore design, licensing, and direct-to-consumer innovation.",
      achievements: [
        "Virtually prototyped first product concept; preparing for licensing pitch",
        "Researched 400+ pieces of fitness equipment to identify gaps in the industry",
        "Developed a short and long term supplement formula for memory, focus, and anxiety"
      ],
      skills: [
        { name: "Product Design", category: "design" },
        { name: "Startups", category: "other" },
        { name: "Consumer Innovation", category: "other" },
        { name: "Licensing", category: "other" }
      ]
    },
    {
      id: "usace-officer",
      title: "Plans Officer – U.S. Army Corps of Engineers (USACE)",
      company: {
        name: "U.S. Army Reserve",
        location: "Seoul, South Korea"
      },
      period: {
        start: "2021",
        end: "Present"
      },
      description: "Supports multinational engineering and contingency planning across U.S. and Korean forces.",
      achievements: [
        "Developed engineering contingency plans supporting joint U.S. and South Korean military operations",
        "Annually leads multiple strategic planning efforts for USACE Pacific Ocean Division Commander"
      ],
      skills: [
        { name: "Strategic Planning", category: "leadership" },
        { name: "Military Engineering", category: "other" },
        { name: "Joint Operations", category: "leadership" }
      ]
    },
    {
      id: "h2l-intern",
      title: "Product Management Intern",
      company: {
        name: "Horizon Two Labs",
        location: "Columbus, OH"
      },
      period: {
        start: "2021",
        end: "2021"
      },
      description: "Worked in a venture studio supporting MVP validation and early product research.",
      achievements: [
        "Led beta testing for QA tool; results led to product pivot and saved efforts",
        "Delivered competitive analysis for blockchain and IT services markets",
        "Conducted 20+ user interviews to refine early-stage concepts"
      ],
      skills: [
        { name: "Market Research", category: "other" },
        { name: "MVP Validation", category: "other" },
        { name: "Startups", category: "other" }
      ]
    },
    {
      id: "osu-professor",
      title: "Assistant Professor of Military Science",
      company: {
        name: "U.S. Army – Ohio State University",
        location: "Columbus, OH"
      },
      period: {
        start: "2018",
        end: "2021"
      },
      description: "Taught, coached, and developed future Army leaders through experiential curriculum.",
      achievements: [
        "Trained and coached 70+ cadets, leading to the program's highest-ever number of Distinguished Graduates",
        "Redesigned hybrid training model that improved content delivery efficiency",
        "Boosted cadet retention by 20% through leadership engagement and mentorship"
      ],
      skills: [
        { name: "Leadership Development", category: "leadership" },
        { name: "Education", category: "other" },
        { name: "Coaching", category: "leadership" }
      ]
    },
    {
      id: "army-commander",
      title: "Company Commander",
      company: {
        name: "U.S. Army",
        location: "Pyeongtaek, South Korea"
      },
      period: {
        start: "2017",
        end: "2018"
      },
      description: "Commanded 138 soldiers and managed $24M in assets while leading strategic relocation and integration missions.",
      achievements: [
        "Led organizational transformation to build and train a new combat engineer unit",
        "Rated most disciplined of 6 companies and earned top readiness scores",
        "Cut training cycle time by 50% by implementing bottom-up SOP development"
      ],
      skills: [
        { name: "Operational Leadership", category: "leadership" },
        { name: "Strategic Planning", category: "leadership" },
        { name: "SOP Development", category: "other" }
      ]
    },
    {
      id: "army-pm",
      title: "Program Manager – Host Nation Construction",
      company: {
        name: "U.S. Army",
        location: "Seoul, South Korea"
      },
      period: {
        start: "2016",
        end: "2017"
      },
      description: "Oversaw $901M in military construction, leading one of DoD's largest overseas realignment efforts.",
      achievements: [
        "Negotiated 50% of $350M joint construction budget with service branches",
        "Created strategically aligned prioritization system for 150+ projects",
        "Defined project scope and requirements for $900M+ in new construction"
      ],
      skills: [
        { name: "Program Management", category: "leadership" },
        { name: "Military Infrastructure", category: "other" },
        { name: "International Negotiation", category: "leadership" }
      ]
    }
  ],
  education: [
    {
      id: "mba-osu",
      degree: "MBA",
      institution: "The Ohio State University – Fisher College of Business",
      location: "Columbus, OH",
      period: {
        start: "2019",
        end: "2021"
      },
      courses: [
        "Corporate Financing",
        "Investment Theory and Practice",
        "FINTECH",
        "Organizational Business Coaching",
        "Marketing",
        "Organizational Behavior",
        "Data Analysis",
        "Entrepreneurship & The Business Plan",
        "Global Environment of Business",
        "Strategy",
        "Entrepreneurial Finance",
        "Data Visualization",
        "Discovery Workshop",
        "Innovation Practice"
      ],
      highlightedCourses: [
        "Corporate Financing",
        "FINTECH",
        "Data Analysis",
        "Strategy"
      ]
    },
    {
      id: "ms-missouri",
      degree: "MS, Engineering Management",
      institution: "Missouri University of Science and Technology",
      period: {
        start: "2014",
        end: "2016"
      },
      courses: [
        "Global Project Management",
        "Case Studies in Project Management",
        "Advanced Financial Management",
        "Strategic Human Resource Management & Measurement",
        "Operations Management Science",
        "Economic Decision Analysis",
        "Organizational Behavior",
        "Managerial Decision Making"
      ],
      highlightedCourses: [
        "Global Project Management",
        "Advanced Financial Management",
        "Operations Management Science"
      ]
    },
    {
      id: "bs-ncsu",
      degree: "BS, Civil Engineering (Structural)",
      institution: "North Carolina State University",
      period: {
        start: "2007",
        end: "2011"
      },
      courses: [
        "Fundamentals of Economics",
        "Engineering Mechanics Statics",
        "Mechanics of Solids",
        "Civil Engineering Systems",
        "Structural Analysis",
        "Structural Steel Design",
        "Engineering Behavior of Soils",
        "Principles of Pavement Design",
        "Military Leadership Training Management",
        "Military Ethics & Professional Development"
      ],
      highlightedCourses: [
        "Civil Engineering Systems",
        "Structural Analysis",
        "Military Leadership Training Management"
      ]
    }
  ],
  skills: {
    technical: [
      "Project Management",
      "Data Analysis",
      "Process Optimization",
      "Strategic Planning",
      "Risk Management"
    ],
    leadership: [
      "Team Leadership",
      "Change Management",
      "Stakeholder Management",
      "Cross-functional Leadership",
      "Mentoring"
    ],
    other: [
      "Product Strategy",
      "Business Development",
      "Client Relations",
      "Military Operations",
      "Educational Development"
    ]
  }
};
