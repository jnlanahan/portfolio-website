// Types for experience data structure
export interface Skill {
  name: string;
  category?: 'leadership' | 'business' | 'product' | 'other';
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
    leadership: string[];
    business: string[];
    product: string[];
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
        location: "Columbus, OH",
        logoUrl: "/src/assets/images/logos/ey-logo.svg"
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
        { name: "Strategy", category: "product" },
        { name: "Critical Thinking", category: "business" },
        { name: "Change Management", category: "business" },
        { name: "Financial Services", category: "business" },
        { name: "Product Transformation", category: "product" },
        { name: "OKRs", category: "product" },
        { name: "Client Engagement", category: "business" }
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
      description: "I've created an independent consultancy where I help startups and small businesses implement AI and make smarter product decisions. I perform AI integrations and develop strategic product roadmaps that help under-resourced teams achieve maximum impact.",
      achievements: [
        "Built a client-focused strategic advisory practice delivering expertise in AI integration and product management",
        "Architected a custom knowledge base retrieval system for a financial services firm using OpenAI APIs",
        "Constructed a content generation pipeline for a legal resource company, accelerating content production by 60%",
        "Developed comprehensive product management structures for early-stage companies with limited PM experience"
      ],
      skills: [
        { name: "Consulting", category: "business" },
        { name: "AI Applications", category: "product" },
        { name: "Entrepreneurship", category: "business" },
        { name: "LLM Integration", category: "product" },
        { name: "Business Strategy", category: "business" },
        { name: "Product Roadmapping", category: "product" },
        { name: "Tech Startup Advising", category: "business" }
      ]
    },
    {
      id: "usace-officer",
      title: "Plans Officer – USACE",
      company: {
        name: "US Army Reserve",
        location: "Columbus, OH",
        logoUrl: "/src/assets/images/logos/us-army-logo.svg"
      },
      period: {
        start: "2021",
        end: "Present"
      },
      description: "I serve in the Army Reserve as a technical engineering officer, bringing civilian digital product expertise to military planning. Working on infrastructure protection across the Great Lakes, I participate in annual training and monthly drills focusing on disaster readiness and response.",
      achievements: [
        "Developed comprehensive deployment readiness programs optimizing unit mobilization timelines",
        "Streamlined tactical communications procedures enhancing cross-functional coordination",
        "Instituted leadership development initiatives preparing junior officers for increased responsibility",
        "Orchestrated multiple field training exercises building essential engineering capabilities"
      ],
      skills: [
        { name: "Military Engineering", category: "product" },
        { name: "Critical Infrastructure", category: "product" },
        { name: "Disaster Response", category: "leadership" },
        { name: "Mission Planning", category: "leadership" },
        { name: "Readiness", category: "leadership" }
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
      description: "I held a brief but impactful internship with a healthcare AI startup, where I focused on early-stage product management processes. My work helped establish foundational customer discovery practices and market validation approaches for their radiology-focused computer vision product.",
      achievements: [
        "Developed comprehensive user persona profiles shaping initial product development directions",
        "Constructed a systematic customer validation framework for evaluating technical solution fit",
        "Orchestrated initial market research validating AI radiology scanning software market opportunities",
        "Established product requirement documentation standards supporting the engineering roadmap"
      ],
      skills: [
        { name: "Customer Discovery", category: "product" },
        { name: "Healthcare Technology", category: "product" },
        { name: "MVP Development", category: "product" },
        { name: "Market Validation", category: "business" },
        { name: "Product Requirements", category: "product" }
      ]
    },
    {
      id: "osu-professor",
      title: "Assistant Professor of Practice - Engineering & Business",
      company: {
        name: "The Ohio State University",
        location: "Columbus, OH",
        logoUrl: "/src/assets/images/logos/osu-logo.svg"
      },
      period: {
        start: "2018",
        end: "2021"
      },
      description: "I taught engineering leadership and management courses while pursuing my MBA. As a Professor of Practice, I drew on industry experience to develop practical, project-focused learning experiences for undergraduates and graduate students. My teaching focused on building critical thinking and problem-solving skills while incorporating real-world engineering challenges.",
      achievements: [
        "Taught 14 courses across engineering and business disciplines to over 1,200 undergraduate and graduate students",
        "Pioneered new experiential curriculum for Engineering Technical Management program with 95%+ positive student feedback",
        "Created industry-partnered capstone program connecting student teams to solve real business engineering problems",
        "Developed and delivered new product management curriculum for engineering students transitioning to industry"
      ],
      skills: [
        { name: "Curriculum Development", category: "product" },
        { name: "Technical Communication", category: "leadership" },
        { name: "Engineering Education", category: "leadership" },
        { name: "Project-Based Learning", category: "leadership" },
        { name: "Mentoring", category: "leadership" },
        { name: "Public Speaking", category: "leadership" }
      ]
    },
    {
      id: "army-commander",
      title: "Company Commander",
      company: {
        name: "U.S. Army",
        location: "Fort Hood, TX",
        logoUrl: "/src/assets/images/logos/us-army-logo.svg"
      },
      period: {
        start: "2017",
        end: "2018"
      },
      description: "I commanded a company of 160 soldiers, leading training and readiness for a combat engineering unit. Beyond technical responsibilities, I focused on building a positive command climate that supported soldiers' personal and professional development. This role taught me how to balance strict accountability with compassionate leadership during challenging situations.",
      achievements: [
        "Led 160+ soldiers and managed $15M+ in equipment through comprehensive training operations",
        "Improved company operational readiness ratings from 76% to 96% through targeted improvement programs",
        "Instituted new safety protocols reducing reportable incidents by 34% during high-risk training exercises",
        "Developed and implemented mentorship program for junior leaders raising NCO promotion rates by 15%"
      ],
      skills: [
        { name: "Organizational Leadership", category: "leadership" },
        { name: "Crisis Management", category: "leadership" },
        { name: "Team Building", category: "leadership" },
        { name: "Performance Management", category: "leadership" },
        { name: "Resource Management", category: "business" },
        { name: "Logistics Planning", category: "business" }
      ]
    },
    {
      id: "army-pm",
      title: "Program Manager",
      company: {
        name: "U.S. Army",
        location: "Fort Hood, TX",
        logoUrl: "/src/assets/images/logos/us-army-logo.svg"
      },
      period: {
        start: "2016",
        end: "2017"
      },
      description: "I managed a portfolio of engineering construction projects on one of the Army's largest installations. As the primary project manager for barracks renovations and force protection upgrades, I worked with contractors, engineers, and multiple stakeholders to deliver critical infrastructure improvements on time and within budget.",
      achievements: [
        "Managed 38 concurrent construction and engineering projects worth over $35M for Fort Hood Directorate of Public Works",
        "Orchestrated barracks renovation program improving living conditions for 1,200+ soldiers",
        "Implemented streamlined approval processes reducing project initiation timeline by 40%",
        "Developed comprehensive cost estimation tool improving project budgeting accuracy by 25%"
      ],
      skills: [
        { name: "Construction Management", category: "product" },
        { name: "Budget Management", category: "business" },
        { name: "Stakeholder Communication", category: "leadership" },
        { name: "Contract Management", category: "business" },
        { name: "Quality Assurance", category: "product" },
        { name: "Risk Management", category: "business" }
      ]
    },
    {
      id: "captains-career-course",
      title: "Engineer Captain's Career Course Student",
      company: {
        name: "U.S. Army",
        location: "Fort Leonard Wood, MO",
        logoUrl: "/src/assets/images/logos/us-army-logo.svg"
      },
      period: {
        start: "2015",
        end: "2016"
      },
      description: "Advanced leadership and tactics training focused on complex engineering scenarios and combined arms operations.",
      achievements: [
        "Led complex engineering projects in bridging, combat engineering, and construction, driving operational readiness",
        "Drafted comprehensive operational orders shaping strategic approaches",
        "Facilitated cross-disciplinary coordination across units",
        "Enhanced professional leadership and critical thinking skills",
        "Acted as sponsor and mentor for international military students from Vietnam and Moldova"
      ],
      skills: [
        { name: "Leadership", category: "leadership" },
        { name: "Problem Solving", category: "leadership" },
        { name: "Communication", category: "leadership" },
        { name: "Civil Engineering", category: "product" },
        { name: "Cross-team Collaboration", category: "leadership" }
      ]
    },
    {
      id: "assistant-project-engineer",
      title: "Assistant Project Engineer",
      company: {
        name: "U.S. Army Corps of Engineers",
        location: "Fort Hood, TX",
        logoUrl: "/src/assets/images/logos/us-army-logo.svg"
      },
      period: {
        start: "2015",
        end: "2015"
      },
      description: "Provided project management and engineering support for significant infrastructure projects.",
      achievements: [
        "Managed contract administration for renovations exceeding $98M, ensuring safety and environmental compliance",
        "Facilitated contract modifications adapting to changing project objectives",
        "Supported diverse construction projects, enhancing critical infrastructure",
        "Conducted analysis mitigating a significant contract dispute, enhancing collaboration with contractors"
      ],
      skills: [
        { name: "Project Management", category: "leadership" },
        { name: "Civil Engineering", category: "product" },
        { name: "Government Contract Administration", category: "business" },
        { name: "Negotiation", category: "leadership" },
        { name: "Management", category: "leadership" }
      ]
    },
    {
      id: "operations-logistics-manager",
      title: "Operations and Logistics Manager - Executive Officer",
      company: {
        name: "U.S. Army",
        location: "Fort Hood, TX",
        logoUrl: "/src/assets/images/logos/us-army-logo.svg"
      },
      period: {
        start: "2013",
        end: "2015"
      },
      description: "Directed operational logistics and administrative management for a combat engineer company.",
      achievements: [
        "Managed logistical and maintenance operations for assets exceeding $39M",
        "Anticipated and provided sustainment and training resource requirements",
        "Facilitated effective property transfers enhancing mission capabilities",
        "Enhanced clarity in communications, fostering effective information flow"
      ],
      skills: [
        { name: "Operational Leadership", category: "leadership" },
        { name: "Logistics Management", category: "business" },
        { name: "Personnel Management", category: "leadership" },
        { name: "Strategic Planning", category: "leadership" }
      ]
    },
    {
      id: "platoon-leader",
      title: "Manager - Platoon Leader",
      company: {
        name: "U.S. Army",
        location: "Fort Hood, TX",
        logoUrl: "/src/assets/images/logos/us-army-logo.svg"
      },
      period: {
        start: "2013",
        end: "2013"
      },
      description: "Led and managed operational readiness for an Engineer platoon preparing for global deployments.",
      achievements: [
        "Managed training, operations, security, and logistics for assets valued at over $13M",
        "Implemented training plans enhancing combat vehicle operations",
        "Executed skills testing and training certifications, achieving top performance ratings"
      ],
      skills: [
        { name: "Leadership Development", category: "leadership" },
        { name: "Training Program Design", category: "product" },
        { name: "Resource Management", category: "business" },
        { name: "Tactical Planning", category: "leadership" }
      ]
    },
    {
      id: "assistant-operations-officer",
      title: "Strategic and Operational Planner - Assistant Operations Officer",
      company: {
        name: "U.S. Army",
        location: "Fort Hood, TX",
        logoUrl: "/src/assets/images/logos/us-army-logo.svg"
      },
      period: {
        start: "2011",
        end: "2013"
      },
      description: "Coordinated strategic and operational planning, enhancing communication and efficiency at battalion level.",
      achievements: [
        "Organized and executed over 89 diverse training events",
        "Managed resource scheduling optimizing operations for over 1000 personnel",
        "Enhanced strategic decision-making through clear situational reporting",
        "Served dual roles managing HAZMAT and energy conservation programs"
      ],
      skills: [
        { name: "Strategic Planning", category: "leadership" },
        { name: "Cross-team Collaboration", category: "leadership" },
        { name: "Training Program Design", category: "product" },
        { name: "Operational Planning", category: "leadership" }
      ]
    },
    {
      id: "bolc-student",
      title: "Basic Officer Leadership Course Student",
      company: {
        name: "U.S. Army",
        location: "Fort Leonard Wood, MO",
        logoUrl: "/src/assets/images/logos/us-army-logo.svg"
      },
      period: {
        start: "2011",
        end: "2011"
      },
      description: "Foundational leadership and engineering training in tactical military scenarios.",
      achievements: [
        "Gained competencies in construction, combat engineering, and explosives",
        "Developed skills in teamwork, project management, and ethical decision-making",
        "Engaged with modern engineering technologies and tactical scenarios"
      ],
      skills: [
        { name: "Leadership", category: "leadership" },
        { name: "Problem Solving", category: "leadership" },
        { name: "Communication", category: "leadership" },
        { name: "Engineering Management", category: "product" }
      ]
    },
    {
      id: "trainer-fort-knox",
      title: "Trainer - Leadership and Military Tactics (CTLT)",
      company: {
        name: "U.S. Army",
        location: "Fort Knox, KY",
        logoUrl: "/src/assets/images/logos/us-army-logo.svg"
      },
      period: {
        start: "2011",
        end: "2011"
      },
      description: "Delivered training and mentorship focused on leadership and tactical proficiency.",
      achievements: [
        "Conducted leadership and tactical training enhancing team effectiveness",
        "Promoted cross-functional collaboration and effective communication"
      ],
      skills: [
        { name: "Leadership", category: "leadership" },
        { name: "Communication", category: "leadership" },
        { name: "Mentoring", category: "leadership" },
        { name: "Cross-team Collaboration", category: "leadership" }
      ]
    }
  ],
  education: [
    {
      degree: "Master of Business Administration (MBA)",
      institution: "The Ohio State University",
      location: "Columbus, OH",
      period: {
        start: "2019",
        end: "2021"
      },
      description: "Specialized in Strategy and Leadership with a focus on technology management and digital transformation."
    },
    {
      degree: "MS, Engineering Management",
      institution: "Missouri University of Science and Technology",
      location: "Rolla, MO",
      period: {
        start: "2014",
        end: "2016"
      },
      description: "Focused on leadership in technical organizations and engineering project management.",
      courses: [
        "Advanced Project Management",
        "Engineering Leadership",
        "Technical Management",
        "Financial Decision Making"
      ]
    },
    {
      degree: "BS, Civil Engineering",
      institution: "North Carolina State University",
      location: "Raleigh, NC",
      period: {
        start: "2007",
        end: "2011"
      },
      description: "ABET-accredited program with focus on structural engineering and construction management.",
      courses: [
        "Structural Analysis",
        "Construction Engineering",
        "Environmental Engineering",
        "Engineering Economics"
      ]
    }
  ],
  certifications: [
    {
      name: "Project Management Professional (PMP)",
      issuer: "Project Management Institute",
      date: "2018",
      expiration: "2024"
    },
    {
      name: "Certified ScrumMaster (CSM)",
      issuer: "Scrum Alliance",
      date: "2020",
      expiration: "2022"
    },
    {
      name: "Professional Engineer (PE)",
      issuer: "State of Ohio",
      date: "2017",
      expiration: "2025"
    }
  ],
  skills: {
    leadership: [
      "Strategic Planning",
      "Team Leadership",
      "Change Management",
      "Mentoring",
      "Crisis Management",
      "Public Speaking"
    ],
    business: [
      "Product Strategy",
      "Stakeholder Management",
      "Business Development",
      "Financial Forecasting",
      "Contract Management",
      "Resource Planning"
    ],
    product: [
      "Product Management",
      "User Research",
      "AI Integration",
      "OKR Implementation",
      "Roadmapping",
      "Prototyping"
    ]
  }
};
