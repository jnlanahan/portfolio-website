import { 
  type User, 
  type InsertUser, 
  type Project,
  type InsertProject,
  type BlogPost,
  type InsertBlogPost,
  type ContactSubmission,
  type InsertContact,
  type Admin,
  type InsertAdmin,
  type Resume,
  type InsertResume
} from "@shared/schema";
import { getBlogPosts, getBlogPostById } from "../client/src/data/blog";
import { getPortfolio } from "../client/src/data/portfolio";

import { getLists } from "../client/src/data/lists";

// Modify the interface with all CRUD methods needed
export interface IStorage {
  // User methods (existing)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Admin methods
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Project methods
  getAllProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // Blog post methods
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
  
  // Resume methods
  getResume(): Promise<Resume | undefined>;
  saveResume(resume: InsertResume): Promise<Resume>;
  
  // Lists methods
  getLists(): Promise<any[]>;
  
  // Contact methods
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  saveContactSubmission(submission: InsertContact): Promise<ContactSubmission>;
  deleteContactSubmission(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private admins: Map<number, Admin>;
  private projects: Map<number, Project>;
  private blogPosts: Map<number, BlogPost>;
  private contactSubmissions: Map<number, ContactSubmission>;
  private resumeContent: Resume | undefined;
  
  private userId: number;
  private adminId: number;
  private projectId: number;
  private blogPostId: number;
  private contactId: number;

  constructor() {
    this.users = new Map();
    this.admins = new Map();
    this.projects = new Map();
    this.blogPosts = new Map();
    this.contactSubmissions = new Map();
    this.resumeContent = undefined;
    
    this.userId = 1;
    this.adminId = 1;
    this.projectId = 1;
    this.blogPostId = 1;
    this.contactId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }
  
  private initializeData() {
    try {
      // Initialize default admin
      const defaultAdmin: Admin = {
        id: 1,
        username: "admin",
        password: "admin123", // In production, this would be hashed
        createdAt: new Date()
      };
      this.admins.set(1, defaultAdmin);
      this.adminId = 2;
      
      // Initialize projects
      console.log("Initializing project data...");
      const portfolioData = getPortfolio();
      portfolioData.forEach(project => {
        this.projects.set(project.id, {
          id: project.id,
          title: project.title,
          slug: project.slug,
          shortDescription: project.shortDescription,
          description: project.description,
          image: project.image,
          mediaFiles: project.gallery || [project.image],
          thumbnailIndex: 0,
          technologies: project.technologies,
          demoUrl: project.demoUrl,
          codeUrl: project.codeUrl,
          featured: project.featured || false,
          date: new Date(project.date),
          client: project.client || null,
          createdAt: new Date()
        } as Project);
        this.projectId = Math.max(this.projectId, project.id + 1);
      });
      console.log(`Loaded ${portfolioData.length} projects successfully.`);
      
      // Initialize blog posts
      console.log("Initializing blog post data...");
      const blogData = getBlogPosts();
      blogData.forEach(post => {
        // Ensure the date is a valid Date object
        const parsedDate = post.date ? new Date(post.date) : new Date();
        this.blogPosts.set(post.id, {
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          tags: post.tags ? post.tags.map(tag => tag.name) : [],
          category: post.category?.name || null,
          featured: post.featured || false,
          published: true, // Existing posts are published
          readTime: post.readTime,
          date: parsedDate,
          createdAt: new Date()
        } as BlogPost);
        this.blogPostId = Math.max(this.blogPostId, post.id + 1);
      });
      console.log(`Loaded ${blogData.length} blog posts successfully.`);
      
      // Initialize default resume content (no resume by default)
      this.resumeContent = undefined;
    } catch (error) {
      console.error("Error initializing data:", error);
      throw error;
    }
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

  // Admin methods
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(
      (admin) => admin.username === username,
    );
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = this.adminId++;
    const admin: Admin = { 
      ...insertAdmin, 
      id,
      createdAt: new Date()
    };
    this.admins.set(id, admin);
    return admin;
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
      id,
      title: insertProject.title,
      slug: insertProject.slug || null,
      shortDescription: insertProject.shortDescription || null,
      description: insertProject.description,
      image: insertProject.image || null,
      mediaFiles: insertProject.mediaFiles || [],
      thumbnailIndex: insertProject.thumbnailIndex || 0,
      technologies: insertProject.technologies || [],
      demoUrl: insertProject.demoUrl || null,
      codeUrl: insertProject.codeUrl || null,
      featured: insertProject.featured || false,
      date: insertProject.date || new Date(),
      client: insertProject.client || null,
      createdAt: new Date()
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updateData: Partial<InsertProject>): Promise<Project> {
    const existingProject = this.projects.get(id);
    if (!existingProject) {
      throw new Error(`Project with ID ${id} not found`);
    }
    
    const updatedProject: Project = {
      ...existingProject,
      ...updateData,
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    const deleted = this.projects.delete(id);
    if (!deleted) {
      throw new Error(`Project with ID ${id} not found`);
    }
  }
  
  // Blog post methods
  async getAllBlogPosts(): Promise<BlogPost[]> {
    console.log("Fetching all blog posts");
    const posts = Array.from(this.blogPosts.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    console.log(`Returning ${posts.length} blog posts`);
    return posts;
  }
  
  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    console.log(`Fetching blog post with ID: ${id}`);
    const post = this.blogPosts.get(id);
    if (post) {
      console.log(`Found blog post: "${post.title}"`);
    } else {
      console.log(`Blog post with ID ${id} not found`);
    }
    return post;
  }
  
  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostId++;
    const post: BlogPost = {
      id,
      title: insertPost.title || null,
      slug: insertPost.slug || null,
      excerpt: insertPost.excerpt || null,
      content: insertPost.content || null,
      coverImage: insertPost.coverImage || null,
      tags: insertPost.tags || [],
      category: insertPost.category || null,
      featured: insertPost.featured || false,
      published: insertPost.published || false,
      readTime: insertPost.readTime || 5,
      date: insertPost.date || new Date(),
      createdAt: new Date()
    };
    this.blogPosts.set(id, post);
    console.log(`Created new blog post: ID=${id}, Title="${post.title}"`);
    return post;
  }

  async updateBlogPost(id: number, updateData: Partial<InsertBlogPost>): Promise<BlogPost> {
    const existingPost = this.blogPosts.get(id);
    if (!existingPost) {
      throw new Error(`Blog post with ID ${id} not found`);
    }
    
    const updatedPost: BlogPost = {
      ...existingPost,
      ...updateData,
      id: existingPost.id, // Preserve ID
      createdAt: existingPost.createdAt, // Preserve created timestamp
    };
    
    this.blogPosts.set(id, updatedPost);
    console.log(`Updated blog post: ID=${id}, Title="${updatedPost.title}"`);
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    const deleted = this.blogPosts.delete(id);
    if (!deleted) {
      throw new Error(`Blog post with ID ${id} not found`);
    }
    console.log(`Deleted blog post: ID=${id}`);
  }
  

  
  // Resume methods
  async getResume(): Promise<Resume | undefined> {
    return this.resumeContent;
  }

  async saveResume(insertResume: InsertResume): Promise<Resume> {
    const resume: Resume = {
      id: 1,
      ...insertResume,
      uploadedAt: new Date(),
      updatedAt: new Date()
    };
    this.resumeContent = resume;
    console.log(`Updated resume content`);
    return resume;
  }

  // Lists methods
  async getLists(): Promise<any[]> {
    return getLists();
  }
  
  // Contact methods
  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

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

  async deleteContactSubmission(id: number): Promise<void> {
    const deleted = this.contactSubmissions.delete(id);
    if (!deleted) {
      throw new Error(`Contact submission with ID ${id} not found`);
    }
  }
}

export const storage = new MemStorage();
