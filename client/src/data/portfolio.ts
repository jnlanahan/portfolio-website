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
  category?: ProjectCategory;
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
}

// Project categories
export const projectCategories: ProjectCategory[] = [
  {
    id: 'web-development',
    name: 'Web Development',
    slug: 'web-development',
    description: 'Full-stack and frontend web applications'
  },
  {
    id: 'mobile',
    name: 'Mobile Apps',
    slug: 'mobile',
    description: 'iOS and Android mobile applications'
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    slug: 'ai-ml',
    description: 'Projects utilizing artificial intelligence and machine learning'
  },
  {
    id: 'ui-ux',
    name: 'UI/UX Design',
    slug: 'ui-ux',
    description: 'User interface and experience design projects'
  }
];

// Helper function to get category by ID
export const getCategoryById = (id: string): ProjectCategory | undefined => {
  return projectCategories.find(category => category.id === id);
};

export function getPortfolio(): ProjectType[] {
  return [
    // Add your projects here
  ];
}
