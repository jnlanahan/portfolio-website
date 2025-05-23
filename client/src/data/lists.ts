export interface ListItemType {
  title: string;
  description: string;
  link?: string;
  linkText?: string;
  image?: string;
  highlight?: boolean;
}

export interface ListType {
  title: string;
  icon: string;
  color?: string; // Optional color for theming each list
  description?: string; // Optional description for the list
  items: ListItemType[];
}

export type ListsType = ListType[];

export function getLists(): ListsType {
  return [
    {
      title: "Dev Tools I Can't Live Without",
      icon: "ri-code-box-line",
      color: "#22c55e", // Green for development
      description: "Tools that have significantly improved my development workflow and productivity.",
      items: [
        {
          title: "VS Code + Vim Extension",
          description: "The perfect combination of modern IDE features with Vim's efficiency.",
          link: "https://code.visualstudio.com/",
          linkText: "Get VS Code",
          highlight: true
        },
        {
          title: "React DevTools",
          description: "Essential for debugging component hierarchies and performance issues."
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
      color: "#3b82f6", // Blue for books/reading
      description: "Books that fundamentally altered how I approach software development and design.",
      items: [
        {
          title: "Clean Code by Robert C. Martin",
          description: "Transformed how I think about writing maintainable, readable code.",
          link: "https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882",
          linkText: "View on Amazon",
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
      color: "#ec4899", // Pink for podcasts/media
      description: "Audio content that keeps me informed and inspired during commutes and workouts.",
      items: [
        {
          title: "Syntax",
          description: "Wes Bos and Scott Tolinski deliver web development news and tips with personality.",
          link: "https://syntax.fm/",
          linkText: "Listen Now",
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
      color: "#9333ea", // Purple for education
      description: "Platforms and sites I consistently turn to for expanding my knowledge and skills.",
      items: [
        {
          title: "Frontend Masters",
          description: "In-depth courses taught by industry experts on modern web development."
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
