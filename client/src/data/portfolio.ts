export interface ProjectType {
  id: number;
  title: string;
  shortDescription: string;
  description: string;
  image: string;
  technologies: string[];
  demoUrl: string;
  codeUrl: string;
}

export function getPortfolio(): ProjectType[] {
  return [
    {
      id: 1,
      title: "Analytics Dashboard",
      shortDescription: "Real-time data visualization platform",
      description: "Real-time data visualization platform with customizable widgets.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      technologies: ["React", "D3.js", "Firebase"],
      demoUrl: "https://example.com/demo1",
      codeUrl: "https://github.com/example/demo1"
    },
    {
      id: 2,
      title: "FitTrack Mobile App",
      shortDescription: "Fitness tracking with social features",
      description: "Fitness tracking application with social features and progress analytics.",
      image: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      technologies: ["React Native", "Redux", "Node.js"],
      demoUrl: "https://example.com/demo2",
      codeUrl: "https://github.com/example/demo2"
    },
    {
      id: 3,
      title: "CodeCollab Platform",
      shortDescription: "Real-time collaborative code editor",
      description: "Real-time collaborative code editor with integrated version control.",
      image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      technologies: ["WebSockets", "Monaco Editor", "Express"],
      demoUrl: "https://example.com/demo3",
      codeUrl: "https://github.com/example/demo3"
    },
    {
      id: 4,
      title: "Modern E-commerce",
      shortDescription: "Headless e-commerce platform",
      description: "Full-featured online store with headless CMS and payment integration.",
      image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      technologies: ["Next.js", "Stripe", "Sanity CMS"],
      demoUrl: "https://example.com/demo4",
      codeUrl: "https://github.com/example/demo4"
    },
    {
      id: 5,
      title: "AI Experiment Platform",
      shortDescription: "ML model visualization tool",
      description: "Interactive platform for visualizing and experimenting with machine learning models.",
      image: "https://pixabay.com/get/g8fd4c906ca442a7a80dc5367c617042a9edcb35705af86113b56c2436accd038a8f7562ccf4176787a60b0eac531de50e316bb4d5adfe9083484d9cd5977c950_1280.jpg",
      technologies: ["TensorFlow.js", "Three.js", "WebGL"],
      demoUrl: "https://example.com/demo5",
      codeUrl: "https://github.com/example/demo5"
    },
    {
      id: 6,
      title: "MindSpace App",
      shortDescription: "Mental wellness mobile application",
      description: "Mental wellness application with guided meditation and mood tracking.",
      image: "https://images.unsplash.com/photo-1579762593175-20226054cad0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      technologies: ["Flutter", "Firebase", "TensorFlow Lite"],
      demoUrl: "https://example.com/demo6",
      codeUrl: "https://github.com/example/demo6"
    }
  ];
}
