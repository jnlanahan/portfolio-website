export interface ListItemType {
  title: string;
  description: string;
}

export interface ListType {
  title: string;
  icon: string;
  items: ListItemType[];
}

export type ListsType = ListType[];

export function getLists(): ListsType {
  return [
    {
      title: "Dev Tools I Can't Live Without",
      icon: "ri-code-box-line",
      items: [
        {
          title: "VS Code + Vim Extension",
          description: "The perfect combination of modern IDE features with Vim's efficiency."
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
      items: [
        {
          title: "Clean Code by Robert C. Martin",
          description: "Transformed how I think about writing maintainable, readable code."
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
      items: [
        {
          title: "Syntax",
          description: "Wes Bos and Scott Tolinski deliver web development news and tips with personality."
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
