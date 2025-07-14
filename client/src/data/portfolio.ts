export interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ProjectType {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  image: string;
  technologies: string[];
  demoUrl: string;
  codeUrl: string;
  featured?: boolean;
  categories?: string[]; // Changed to array of category names
  date: string;
  lessonsLearned?: string;
  testimonial?: {
    quote: string;
    author: string;
    role?: string;
  };
  challenge?: string;
  solution?: string;
  results?: string;
  gallery?: string[];
  mediaFiles?: string[];
}

// Default project categories - these will be merged with dynamic ones
export const defaultProjectCategories: ProjectCategory[] = [
  {
    id: 'prototype',
    name: 'Prototype',
    slug: 'prototype',
    description: 'Early-stage prototypes and proof of concepts'
  },
  {
    id: 'personal-tool',
    name: 'Personal Tool',
    slug: 'personal-tool',
    description: 'Tools built for personal productivity and use'
  },
  {
    id: 'enterprise-tool',
    name: 'Enterprise Tool',
    slug: 'enterprise-tool',
    description: 'Professional tools for business and enterprise use'
  }
];

// Helper function to get all unique categories from projects
export const getAllCategoriesFromProjects = (projects: ProjectType[]): string[] => {
  const allCategories = new Set<string>();
  projects.forEach(project => {
    if (project.categories) {
      project.categories.forEach(category => allCategories.add(category));
    }
  });
  return Array.from(allCategories).sort();
};

export function getPortfolio(): ProjectType[] {
  return [
    {
      id: 1,
      title: "Analytics Dashboard",
      slug: "analytics-dashboard",
      shortDescription: "Real-time data visualization platform",
      description: "Real-time data visualization platform with customizable widgets and interactive charts for business intelligence.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      technologies: ["React", "D3.js", "Firebase", "TypeScript", "Material UI"],
      demoUrl: "https://example.com/demo1",
      codeUrl: "https://github.com/example/demo1",
      featured: true,
      categories: ["Enterprise Tool", "Prototype"],
      date: "2023-12-10",
      lessonsLearned: "Building this dashboard taught me the importance of modular architecture and real-time data synchronization at scale.",
      testimonial: {
        quote: "This dashboard revolutionized how we analyze our data. The real-time insights have been invaluable to our business decisions.",
        author: "Sarah Johnson",
        role: "CTO at TechCorp"
      },
      challenge: "The client needed a way to visualize complex data relationships in real-time across multiple departments with different access levels and data needs.",
      solution: "I developed a modular dashboard with role-based access control and customizable widgets. The system uses WebSockets for real-time updates and implements sophisticated data visualization with D3.js.",
      results: "The solution reduced decision-making time by 40% and improved data accessibility across the organization. User engagement with analytics increased by 78%.",
      gallery: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
      ]
    },
    {
      id: 2,
      title: "FitTrack Mobile App",
      slug: "fittrack-mobile-app",
      shortDescription: "Fitness tracking with social features",
      description: "Fitness tracking application with social features, progress analytics, and personalized workout recommendations.",
      image: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      technologies: ["React Native", "Redux", "Node.js", "Express", "MongoDB"],
      demoUrl: "https://example.com/demo2",
      codeUrl: "https://github.com/example/demo2",
      categories: ["Personal Tool"],
      date: "2023-08-15",
      lessonsLearned: "This project reinforced the value of user-centered design and the importance of gamification in health apps.",
      challenge: "Create a fitness app that stands out in a crowded market by adding social connectivity and data-driven insights.",
      solution: "Built a cross-platform mobile app that combines workout tracking with social networking features. Implemented machine learning for personalized workout recommendations and a gamification system to increase engagement.",
      results: "The app reached 50,000 downloads in the first month with a 4.8/5 rating on app stores. User retention rate is 25% higher than industry average."
    },
    {
      id: 3,
      title: "CodeCollab Platform",
      slug: "codecollab-platform",
      shortDescription: "Real-time collaborative code editor",
      description: "Real-time collaborative code editor with integrated version control and code execution environment.",
      image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      technologies: ["WebSockets", "Monaco Editor", "Express", "Docker", "Redis"],
      demoUrl: "https://example.com/demo3",
      codeUrl: "https://github.com/example/demo3",
      featured: true,
      categories: ["Enterprise Tool", "Prototype"],
      date: "2023-06-20",
      lessonsLearned: "Implementing real-time collaboration taught me about WebSocket optimization and the complexities of conflict resolution in collaborative editing.",
      challenge: "Create an educational platform that allows students to collaborate on coding projects in real-time while giving instructors the ability to monitor and provide feedback.",
      solution: "Developed a web-based collaborative code editor with real-time syncing using WebSockets, syntax highlighting for multiple languages, and an integrated terminal for running code. Added features for version control, commenting, and code reviews.",
      results: "The platform is now used by 15 universities and coding bootcamps, serving over 5,000 students. Average assignment completion rates increased by 30%."
    },
    {
      id: 4,
      title: "Modern E-commerce",
      slug: "modern-ecommerce",
      shortDescription: "Headless e-commerce platform",
      description: "Full-featured online store with headless CMS, payment integration, and advanced product filtering capabilities.",
      image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      technologies: ["Next.js", "Stripe", "Sanity CMS", "Tailwind CSS", "TypeScript"],
      demoUrl: "https://example.com/demo4",
      codeUrl: "https://github.com/example/demo4",
      categories: ["Enterprise Tool"],
      date: "2023-09-05",
      lessonsLearned: "This project taught me the critical importance of performance optimization in e-commerce and how to balance functionality with speed.",
      testimonial: {
        quote: "Our online sales increased by 200% within the first quarter of launching the new platform. The user experience is excellent, and the backend is incredibly easy to manage.",
        author: "Michael Thompson",
        role: "E-commerce Director"
      },
      challenge: "The client needed to transition from a legacy e-commerce platform to a modern, high-performance solution that could handle their growing product catalog and support custom checkout flows.",
      solution: "Implemented a JAMstack e-commerce architecture with Next.js for the frontend, Sanity CMS for content management, and Stripe for payment processing. Created a custom checkout flow with multi-step validation and shipping calculator.",
      results: "Page load times decreased by 65%, cart abandonment rate dropped by 28%, and mobile conversions increased by 45%. The business saw a 200% increase in online sales within three months of launch."
    },
    {
      id: 5,
      title: "AI Experiment Platform",
      slug: "ai-experiment-platform",
      shortDescription: "ML model visualization tool",
      description: "Interactive platform for visualizing and experimenting with machine learning models in the browser.",
      image: "https://images.unsplash.com/photo-1677442135416-4078e85a9a2a?q=80&w=2532&auto=format&fit=crop",
      technologies: ["TensorFlow.js", "Three.js", "WebGL", "React", "Python"],
      demoUrl: "https://example.com/demo5",
      codeUrl: "https://github.com/example/demo5",
      featured: true,
      categories: ["Prototype", "Personal Tool"],
      date: "2023-11-15",
      lessonsLearned: "Working with TensorFlow.js taught me the importance of optimizing ML models for browser performance and managing memory efficiently in client-side applications.",
      challenge: "Create an accessible platform for data scientists and ML engineers to visualize complex neural networks and experiment with different model architectures without requiring specialized hardware.",
      solution: "Developed a browser-based platform that leverages TensorFlow.js to run machine learning models directly in the browser. Created interactive 3D visualizations of neural networks with Three.js and implemented a no-code interface for model experimentation.",
      results: "The platform is now used by over 3,000 data scientists and has been featured in several AI conferences. It has significantly reduced the barrier to entry for machine learning experimentation."
    },
    {
      id: 6,
      title: "MindSpace App",
      slug: "mindspace-app",
      shortDescription: "Mental wellness mobile application",
      description: "Mental wellness application with guided meditation, mood tracking, and personalized mental health insights.",
      image: "https://images.unsplash.com/photo-1579762593175-20226054cad0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      technologies: ["Flutter", "Firebase", "TensorFlow Lite", "Dart", "Cloud Functions"],
      demoUrl: "https://example.com/demo6",
      codeUrl: "https://github.com/example/demo6",
      categories: ["Personal Tool"],
      date: "2023-10-01",
      lessonsLearned: "Developing a mental wellness app taught me the importance of empathetic design and how technology can positively impact mental health.",
      testimonial: {
        quote: "The MindSpace app has transformed how we deliver mental wellness resources to our customers. The personalized recommendations and beautiful interface have set us apart from competitors.",
        author: "Jennifer Lee",
        role: "Wellness Program Director"
      },
      challenge: "Create a mental wellness app that goes beyond basic meditation features to provide a comprehensive and personalized mental health companion.",
      solution: "Built a cross-platform mobile app using Flutter with a clean, calming UI. Implemented mood tracking with visual analytics, a library of guided meditations, and a journaling feature. Used TensorFlow Lite to analyze mood patterns and provide personalized recommendations.",
      results: "The app has a 4.9/5 star rating on app stores with over 100,000 downloads. User retention is 45% higher than the industry average, and 92% of users report improved well-being after 30 days of use."
    }
  ];
}
