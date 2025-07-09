// Extend Express Session to include admin properties
declare module 'express-session' {
  interface SessionData {
    adminId?: number;
    isAdmin?: boolean;
  }
}

export {};