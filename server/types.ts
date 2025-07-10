// Extend Express Session to include admin properties
declare module 'express-session' {
  interface SessionData {
    adminId?: number;
    isAdmin?: boolean;
  }
}

export {};

declare global {
  interface Project {
    id: number;
    title: string;
    description: string;
    imageUrl?: string;
    githubUrl?: string;
    liveUrl?: string;
    date?: string;
    lessonsLearned?: string;
  }
}