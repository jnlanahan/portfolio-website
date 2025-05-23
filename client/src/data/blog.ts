export interface Author {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  bio?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface BlogPostType {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  lastUpdated?: string;
  readTime: number;
  coverImage: string;
  content: string;
  tags: BlogTag[];
  category?: BlogCategory;
  author?: Author;
  featured?: boolean;
  views?: number;
  likes?: number;
  relatedPosts?: number[]; // IDs of related posts
}

// Author information
export const authors: Author[] = [
  {
    id: 'nick-lanahan',
    name: 'Nick Lanahan',
    avatar: '/assets/avatar.jpg',
    role: 'Product Manager & Developer',
    bio: 'With 8+ years of experience building digital products, I write about development, design, and product strategy.'
  }
];

// Blog categories
export const categories: BlogCategory[] = [
  {
    id: 'development',
    name: 'Development',
    slug: 'development',
    description: 'Articles about coding, development practices, and technical tutorials'
  },
  {
    id: 'design',
    name: 'Design',
    slug: 'design',
    description: 'Insights on UI/UX design, design systems, and creative processes'
  },
  {
    id: 'strategy',
    name: 'Strategy',
    slug: 'strategy',
    description: 'Discussions on product strategy, team management, and career growth'
  }
];

// Blog tags with color coding
export const tags: BlogTag[] = [
  { id: 'react', name: 'React', slug: 'react', color: '#61dafb' },
  { id: 'javascript', name: 'JavaScript', slug: 'javascript', color: '#f7df1e' },
  { id: 'typescript', name: 'TypeScript', slug: 'typescript', color: '#3178c6' },
  { id: 'performance', name: 'Performance', slug: 'performance', color: '#00c853' },
  { id: 'accessibility', name: 'Accessibility', slug: 'accessibility', color: '#7952b3' },
  { id: 'design', name: 'Design', slug: 'design', color: '#ff5722' },
  { id: 'product-management', name: 'Product Management', slug: 'product-management', color: '#0288d1' },
  { id: 'strategy', name: 'Strategy', slug: 'strategy', color: '#9c27b0' }
];

// Helper function to get a tag by ID
export const getTagById = (id: string): BlogTag => {
  return tags.find(tag => tag.id === id) || { id, name: id, slug: id };
};

// Helper function to get category by ID
export const getCategoryById = (id: string): BlogCategory | undefined => {
  return categories.find(category => category.id === id);
};

// Helper function to format date
export const formatBlogDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export function getBlogPosts(): BlogPostType[] {
  return [
    {
      id: 1,
      title: "Building Accessible React Components from Scratch",
      slug: "building-accessible-react-components",
      excerpt: "A deep dive into creating React components that are both beautiful and accessible, following WCAG guidelines and best practices.",
      date: "2023-04-15",
      lastUpdated: "2023-04-20",
      readTime: 5,
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=450",
      tags: [
        getTagById('react'),
        getTagById('accessibility'),
        getTagById('javascript'),
      ],
      category: getCategoryById('development'),
      author: authors[0],
      featured: true,
      views: 1248,
      likes: 56,
      content: `
        <p>
          Creating truly accessible components is more than just adding ARIA attributes—it's about understanding how people with disabilities actually use the web. In this post, I'll share what I've learned building accessible UI libraries.
        </p>
        
        <h2>Why Accessibility Matters</h2>
        <p>
          At least 15% of the global population lives with some form of disability. Building accessible interfaces isn't just about compliance—it's about creating experiences that work for everyone.
        </p>
        
        <p>
          Most React developers know the basics of accessibility, but implementation details often get overlooked in the rush to ship new features. Let's explore how to build truly inclusive components from the ground up.
        </p>
        
        <h2>The Core Principles</h2>
        <p>
          When building accessible React components, start with these key principles:
        </p>
        
        <ul class="list-disc pl-6 mb-6 space-y-2">
          <li>Semantic HTML as your foundation</li>
          <li>Keyboard navigation for all interactive elements</li>
          <li>ARIA attributes only when HTML semantics aren't enough</li>
          <li>Color contrast ratios that meet WCAG AA standards</li>
          <li>Focus management for complex widgets</li>
        </ul>
        
        <p>
          I'll be back next week with part two of this series, where we'll build a fully accessible dropdown component together, step by step.
        </p>
      `
    },
    {
      id: 2,
      title: "10 Performance Optimization Tips for Modern Web Apps",
      slug: "performance-optimization-tips",
      excerpt: "Practical strategies to improve load times, reduce bundle sizes, and create smoother user experiences in JavaScript applications.",
      date: "2023-03-22",
      lastUpdated: "2023-03-25",
      readTime: 8,
      coverImage: "https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=450",
      tags: [
        getTagById('javascript'),
        getTagById('performance'),
        getTagById('strategy'),
      ],
      category: getCategoryById('development'),
      author: authors[0],
      views: 892,
      likes: 42,
      content: `
        <p>
          With users expecting near-instant interactions, web performance has never been more critical. In this post, I'll share 10 battle-tested strategies to optimize your JavaScript applications.
        </p>
        
        <h2>1. Code Splitting</h2>
        <p>
          Don't load everything upfront. Use dynamic imports and React.lazy to split your code into smaller chunks that load on demand.
        </p>
        
        <h2>2. Tree Shaking</h2>
        <p>
          Use ES modules and a bundler like webpack to automatically remove unused code from your final bundle.
        </p>
        
        <h2>3. Optimize Images</h2>
        <p>
          Compress images, use WebP format when possible, and implement responsive images with srcset and sizes attributes.
        </p>
        
        <h2>4. Virtualize Long Lists</h2>
        <p>
          For lengthy scrollable content, render only the visible items to significantly reduce DOM nodes and improve performance.
        </p>
        
        <h2>5. Memoize Expensive Computations</h2>
        <p>
          Use React.memo, useMemo, and useCallback hooks to prevent unnecessary re-renders and recalculations.
        </p>
        
        <p>
          I'll dive deeper into the remaining five strategies in the second part of this series next week.
        </p>
      `
    },
    {
      id: 3,
      title: "Creating a Design System That Scales with Your Project",
      slug: "creating-scalable-design-system",
      excerpt: "How to build a comprehensive design system that maintains consistency while allowing flexibility as your application grows.",
      date: "2023-02-08",
      lastUpdated: "2023-02-15",
      readTime: 12,
      coverImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=450",
      tags: [
        getTagById('design'),
        getTagById('product-management'),
        getTagById('strategy'),
      ],
      category: getCategoryById('design'),
      author: authors[0],
      views: 1467,
      likes: 87,
      featured: true,
      content: `
        <p>
          A well-crafted design system is the backbone of any polished product. It ensures consistency, speeds up development, and creates a cohesive user experience. Here's how to build one that scales.
        </p>
        
        <h2>Start with Tokens, Not Components</h2>
        <p>
          Begin by defining your design tokens: colors, typography, spacing, shadows, and other primitive values. These form the foundation of your entire system.
        </p>
        
        <h2>Build a Component Hierarchy</h2>
        <p>
          Create a logical progression from atoms (buttons, inputs) to molecules (form groups, search bars) to organisms (navigation, cards).
        </p>
        
        <h2>Document Everything</h2>
        <p>
          Great design systems have great documentation. Use tools like Storybook to showcase components with examples, props, and usage guidelines.
        </p>
        
        <h2>Plan for Variation and Composition</h2>
        <p>
          Components should be flexible enough to handle multiple use cases through props, but not so complex that they're difficult to understand.
        </p>
        
        <h2>Create Governance Processes</h2>
        <p>
          Define how changes are proposed, reviewed, and implemented. This prevents the system from becoming fragmented over time.
        </p>
        
        <p>
          Creating a design system is a significant investment, but one that pays dividends in development speed, product quality, and team collaboration.
        </p>
      `
    }
  ];
}

export function getBlogPostById(id: number): BlogPostType | undefined {
  return getBlogPosts().find(post => post.id === id);
}
