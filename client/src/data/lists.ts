export interface ListItemType {
  title: string;
  description: string;
  link?: string;
  linkText?: string;
  image?: string; // Optional small picture for this item
  highlight?: boolean;
}

export interface ListType {
  title: string;
  icon: string;
  color?: string; // Optional color for theming each list
  description?: string; // Optional description for the list
  mainImage?: string; // Main picture for the entire list
  items: ListItemType[];
}

export type ListsType = ListType[];

export function getLists(): ListsType {
  return [
    {
      title: "Dev Tools I Can't Live Without",
      icon: "ri-code-box-line",
      color: "#22c55e",
      mainImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
      description: "Tools that have significantly improved my development workflow and productivity.",
      items: [
        {
          title: "VS Code + Vim Extension",
          description: "The perfect combination of modern IDE features with Vim's efficiency.",
          link: "https://code.visualstudio.com/",
          linkText: "Get VS Code",
          image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          highlight: true
        },
        {
          title: "React DevTools",
          description: "Essential for debugging component hierarchies and performance issues.",
          image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
        },
        {
          title: "Warp Terminal",
          description: "The AI-powered terminal that makes command-line work a pleasure."
        },
        {
          title: "Notion",
          description: "For project documentation, coding notes, and personal knowledge base."
        },
        {
          title: "Postman",
          description: "Still the best tool for API testing and documentation."
        }
      ]
    },
    {
      title: "Tech Books That Changed My Perspective",
      icon: "ri-book-read-line",
      color: "#22c55e",
      mainImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2086&q=80",
      description: "Books that fundamentally altered how I approach software development and design.",
      items: [
        {
          title: "Clean Code by Robert C. Martin",
          description: "Transformed how I think about writing maintainable, readable code.",
          link: "https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882",
          linkText: "View on Amazon",
          image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          highlight: true
        },
        {
          title: "Designing Data-Intensive Applications",
          description: "A must-read on building systems that scale and perform."
        },
        {
          title: "Refactoring UI",
          description: "Practical design advice for developers who aren't designers."
        },
        {
          title: "Eloquent JavaScript",
          description: "The book that made me truly understand JavaScript's deeper concepts."
        },
        {
          title: "The Pragmatic Programmer",
          description: "Timeless advice on the craft of software development."
        }
      ]
    },
    {
      title: "Podcasts for Developers",
      icon: "ri-mic-line",
      color: "#22c55e",
      mainImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2148&q=80",
      description: "Audio content that keeps me informed and inspired during commutes and workouts.",
      items: [
        {
          title: "Syntax",
          description: "Wes Bos and Scott Tolinski deliver web development news and tips with personality.",
          link: "https://syntax.fm/",
          linkText: "Listen Now",
          image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          highlight: true
        },
        {
          title: "Frontend Happy Hour",
          description: "Engineers from Netflix, Twitch, and other tech companies discuss frontend topics."
        },
        {
          title: "The Changelog",
          description: "Conversations with the hackers, leaders, and innovators of software development."
        },
        {
          title: "JS Party",
          description: "A weekly celebration of JavaScript and the web development community."
        },
        {
          title: "Developer Tea",
          description: "Short, focused episodes on career development and engineering mindset."
        }
      ]
    },
    {
      title: "Top Learning Resources",
      icon: "ri-graduation-cap-line",
      color: "#22c55e",
      mainImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
      description: "Platforms and sites I consistently turn to for expanding my knowledge and skills.",
      items: [
        {
          title: "Frontend Masters",
          description: "In-depth courses taught by industry experts on modern web development.",
          link: "https://frontendmasters.com/",
          linkText: "Start Learning",
          image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          highlight: true
        },
        {
          title: "Josh Comeau's Courses",
          description: "Uniquely interactive learning experiences for CSS and React."
        },
        {
          title: "Egghead.io",
          description: "Concise, focused video lessons on specific web development topics."
        },
        {
          title: "Web.dev by Google",
          description: "Free resources for modern web best practices and performance."
        },
        {
          title: "CSS-Tricks",
          description: "The ultimate resource for CSS techniques and web design patterns."
        }
      ]
    }
  ];
}
