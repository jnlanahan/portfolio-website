export interface ResumeJobType {
  title: string;
  company: string;
  period: string;
  description: string;
  skills: string[];
}

export type ResumeType = ResumeJobType[];

export function getResume(): ResumeType {
  return [
    {
      title: "Senior Frontend Developer",
      company: "TechVision Inc.",
      period: "2022 - Present",
      description: "Leading the frontend development team for an AI-powered analytics platform with 50,000+ users. Architected a component system that increased development velocity by 35%.",
      skills: ["React", "TypeScript", "GraphQL", "Tailwind"]
    },
    {
      title: "Full-Stack Developer",
      company: "InnovateLab",
      period: "2019 - 2022",
      description: "Developed and scaled a SaaS platform serving 200+ business clients. Built RESTful APIs, implemented CI/CD pipelines, and led migration to a microservices architecture.",
      skills: ["Node.js", "React", "PostgreSQL", "Docker"]
    },
    {
      title: "Frontend Developer",
      company: "Digital Wave Agency",
      period: "2017 - 2019",
      description: "Created responsive interfaces for enterprise clients in finance and healthcare. Collaborated with designers to implement pixel-perfect UIs and improve accessibility.",
      skills: ["JavaScript", "Vue.js", "SCSS", "Webpack"]
    },
    {
      title: "Junior Web Developer",
      company: "CodeCraft Studios",
      period: "2015 - 2017",
      description: "Built and maintained websites for small businesses and startups. Developed custom WordPress themes and plugins to enhance site functionality.",
      skills: ["HTML/CSS", "JavaScript", "PHP", "WordPress"]
    }
  ];
}
