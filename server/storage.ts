import { 
  type User, 
  type InsertUser, 
  type Project,
  type InsertProject,
  type BlogPost,
  type InsertBlogPost,
  type ContactSubmission,
  type InsertContact
} from "@shared/schema";
import { getBlogPosts, getBlogPostById } from "../client/src/data/blog";
import { getPortfolio } from "../client/src/data/portfolio";
import { getResume } from "../client/src/data/resume";
import { getLists } from "../client/src/data/lists";

// Modify the interface with all CRUD methods needed
export interface IStorage {
  // User methods (existing)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getAllProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  
  // Blog post methods
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  
  // Resume methods
  getResume(): Promise<any[]>;
  
  // Lists methods
  getLists(): Promise<any[]>;
  
  // Contact methods
  saveContactSubmission(submission: InsertContact): Promise<ContactSubmission>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private blogPosts: Map<number, BlogPost>;
  private contactSubmissions: Map<number, ContactSubmission>;
  
  private userId: number;
  private projectId: number;
  private blogPostId: number;
  private contactId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.blogPosts = new Map();
    this.contactSubmissions = new Map();
    
    this.userId = 1;
    this.projectId = 1;
    this.blogPostId = 1;
    this.contactId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }
  
  private initializeData() {
    // Initialize projects
    const portfolioData = getPortfolio();
    portfolioData.forEach(project => {
      this.projects.set(project.id, {
        ...project,
        createdAt: new Date()
      } as Project);
      this.projectId = Math.max(this.projectId, project.id + 1);
    });
    
    // Initialize blog posts
    const blogData = getBlogPosts();
    blogData.forEach(post => {
      this.blogPosts.set(post.id, {
        ...post,
        date: new Date(post.date)
      } as BlogPost);
      this.blogPostId = Math.max(this.blogPostId, post.id + 1);
    });
  }

  // User methods (existing)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Project methods
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async getProjectById(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const project: Project = { 
      ...insertProject, 
      id,
      createdAt: new Date()
    };
    this.projects.set(id, project);
    return project;
  }
  
  // Blog post methods
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  
  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }
  
  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostId++;
    const post: BlogPost = {
      ...insertPost,
      id
    };
    this.blogPosts.set(id, post);
    return post;
  }
  
  // Resume methods
  async getResume(): Promise<any[]> {
    return getResume();
  }
  
  // Lists methods
  async getLists(): Promise<any[]> {
    return getLists();
  }
  
  // Contact methods
  async saveContactSubmission(insertSubmission: InsertContact): Promise<ContactSubmission> {
    const id = this.contactId++;
    const submission: ContactSubmission = {
      ...insertSubmission,
      id,
      createdAt: new Date()
    };
    this.contactSubmissions.set(id, submission);
    return submission;
  }
}

export const storage = new MemStorage();
