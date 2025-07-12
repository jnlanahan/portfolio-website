import { 
  type User, 
  type InsertUser, 
  type Project,
  type InsertProject,
  type BlogPost,
  type InsertBlogPost,
  type BlogSeries,
  type InsertBlogSeries,
  type ContactSubmission,
  type InsertContact,
  type Admin,
  type InsertAdmin,
  type Resume,
  type InsertResume,
  type TopFiveList,
  type InsertTopFiveList,
  type TopFiveListItem,
  type InsertTopFiveListItem
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
  
  // Blog series methods
  getAllBlogSeries(): Promise<BlogSeries[]>;
  getBlogSeriesById(id: number): Promise<BlogSeries | undefined>;
  getBlogSeriesBySlug(slug: string): Promise<BlogSeries | undefined>;
  createBlogSeries(series: InsertBlogSeries): Promise<BlogSeries>;
  updateBlogSeries(id: number, series: Partial<InsertBlogSeries>): Promise<BlogSeries>;
  deleteBlogSeries(id: number): Promise<void>;
  
  // Blog post methods
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  getBlogPostsBySeriesId(seriesId: number): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
  
  // Resume methods
  getResume(): Promise<Resume | undefined>;
  saveResume(resume: InsertResume): Promise<Resume>;
  
  // Lists methods
  getLists(): Promise<any[]>;
  
  // Top 5 Lists methods
  getAllTopFiveLists(): Promise<TopFiveList[]>;
  getTopFiveListById(id: number): Promise<TopFiveList | undefined>;
  createTopFiveList(list: InsertTopFiveList): Promise<TopFiveList>;
  updateTopFiveList(id: number, list: Partial<InsertTopFiveList>): Promise<TopFiveList>;
  deleteTopFiveList(id: number): Promise<void>;
  
  // Top 5 List Items methods
  getTopFiveListItems(listId: number): Promise<TopFiveListItem[]>;
  createTopFiveListItem(item: InsertTopFiveListItem): Promise<TopFiveListItem>;
  updateTopFiveListItem(id: number, item: Partial<InsertTopFiveListItem>): Promise<TopFiveListItem>;
  deleteTopFiveListItem(id: number): Promise<void>;
  
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
  
  // Blog series methods (placeholder implementation for MemStorage)
  async getAllBlogSeries(): Promise<BlogSeries[]> {
    // MemStorage doesn't implement series yet
    return [];
  }

  async getBlogSeriesById(id: number): Promise<BlogSeries | undefined> {
    return undefined;
  }

  async getBlogSeriesBySlug(slug: string): Promise<BlogSeries | undefined> {
    return undefined;
  }

  async createBlogSeries(insertSeries: InsertBlogSeries): Promise<BlogSeries> {
    throw new Error("Blog series not implemented for MemStorage");
  }

  async updateBlogSeries(id: number, updateData: Partial<InsertBlogSeries>): Promise<BlogSeries> {
    throw new Error("Blog series not implemented for MemStorage");
  }

  async deleteBlogSeries(id: number): Promise<void> {
    throw new Error("Blog series not implemented for MemStorage");
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

  async getBlogPostsBySeriesId(seriesId: number): Promise<BlogPost[]> {
    // MemStorage doesn't implement series yet
    return [];
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
  
  // Top 5 Lists methods (placeholder implementation for MemStorage)
  async getAllTopFiveLists(): Promise<TopFiveList[]> {
    // Since this is MemStorage, we'll return empty for now
    // In a real implementation, this would store in memory
    return [];
  }

  async getTopFiveListById(id: number): Promise<TopFiveList | undefined> {
    return undefined;
  }

  async createTopFiveList(insertList: InsertTopFiveList): Promise<TopFiveList> {
    throw new Error("Top 5 Lists not implemented for MemStorage");
  }

  async updateTopFiveList(id: number, updateData: Partial<InsertTopFiveList>): Promise<TopFiveList> {
    throw new Error("Top 5 Lists not implemented for MemStorage");
  }

  async deleteTopFiveList(id: number): Promise<void> {
    throw new Error("Top 5 Lists not implemented for MemStorage");
  }

  async getTopFiveListItems(listId: number): Promise<TopFiveListItem[]> {
    return [];
  }

  async createTopFiveListItem(insertItem: InsertTopFiveListItem): Promise<TopFiveListItem> {
    throw new Error("Top 5 Lists not implemented for MemStorage");
  }

  async updateTopFiveListItem(id: number, updateData: Partial<InsertTopFiveListItem>): Promise<TopFiveListItem> {
    throw new Error("Top 5 Lists not implemented for MemStorage");
  }

  async deleteTopFiveListItem(id: number): Promise<void> {
    throw new Error("Top 5 Lists not implemented for MemStorage");
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

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const { db } = await import('./db');
    const { users } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { db } = await import('./db');
    const { users } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { db } = await import('./db');
    const { users } = await import('@shared/schema');
    
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Admin methods
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const { db } = await import('./db');
    const { admins } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const { db } = await import('./db');
    const { admins } = await import('@shared/schema');
    
    const [admin] = await db.insert(admins).values(insertAdmin).returning();
    return admin;
  }

  // Project methods
  async getAllProjects(): Promise<Project[]> {
    const { db } = await import('./db');
    const { projects } = await import('@shared/schema');
    const { desc } = await import('drizzle-orm');
    
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    const { db } = await import('./db');
    const { projects } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const { db } = await import('./db');
    const { projects } = await import('@shared/schema');
    
    const [project] = await db.insert(projects).values(insertProject).returning();
    console.log(`Created project: ID=${project.id}, Title="${project.title}"`);
    return project;
  }

  async updateProject(id: number, updateData: Partial<InsertProject>): Promise<Project> {
    const { db } = await import('./db');
    const { projects } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [project] = await db.update(projects)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    
    if (!project) {
      throw new Error(`Project with ID ${id} not found`);
    }
    
    console.log(`Updated project: ID=${id}, Title="${project.title}"`);
    return project;
  }

  async deleteProject(id: number): Promise<void> {
    const { db } = await import('./db');
    const { projects } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const result = await db.delete(projects).where(eq(projects.id, id));
    console.log(`Deleted project: ID=${id}`);
  }

  // Blog series methods
  async getAllBlogSeries(): Promise<BlogSeries[]> {
    const { db } = await import('./db');
    const { blogSeries } = await import('@shared/schema');
    const { desc } = await import('drizzle-orm');
    
    return await db.select().from(blogSeries).orderBy(desc(blogSeries.position));
  }

  async getBlogSeriesById(id: number): Promise<BlogSeries | undefined> {
    const { db } = await import('./db');
    const { blogSeries } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [series] = await db.select().from(blogSeries).where(eq(blogSeries.id, id));
    return series || undefined;
  }

  async getBlogSeriesBySlug(slug: string): Promise<BlogSeries | undefined> {
    const { db } = await import('./db');
    const { blogSeries } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [series] = await db.select().from(blogSeries).where(eq(blogSeries.slug, slug));
    return series || undefined;
  }

  async createBlogSeries(insertSeries: InsertBlogSeries): Promise<BlogSeries> {
    const { db } = await import('./db');
    const { blogSeries } = await import('@shared/schema');
    
    const [series] = await db.insert(blogSeries).values(insertSeries).returning();
    console.log(`Created blog series: ID=${series.id}, Title="${series.title}"`);
    return series;
  }

  async updateBlogSeries(id: number, updateData: Partial<InsertBlogSeries>): Promise<BlogSeries> {
    const { db } = await import('./db');
    const { blogSeries } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [series] = await db.update(blogSeries)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(blogSeries.id, id))
      .returning();
    
    if (!series) {
      throw new Error(`Blog series with ID ${id} not found`);
    }
    
    console.log(`Updated blog series: ID=${id}, Title="${series.title}"`);
    return series;
  }

  async deleteBlogSeries(id: number): Promise<void> {
    const { db } = await import('./db');
    const { blogSeries } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    await db.delete(blogSeries).where(eq(blogSeries.id, id));
    console.log(`Deleted blog series: ID=${id}`);
  }

  // Blog methods
  async getAllBlogPosts(): Promise<BlogPost[]> {
    const { db } = await import('./db');
    const { blogPosts } = await import('@shared/schema');
    const { desc } = await import('drizzle-orm');
    
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const { db } = await import('./db');
    const { blogPosts } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async getBlogPostsBySeriesId(seriesId: number): Promise<BlogPost[]> {
    const { db } = await import('./db');
    const { blogPosts } = await import('@shared/schema');
    const { eq, asc } = await import('drizzle-orm');
    
    return await db.select().from(blogPosts)
      .where(eq(blogPosts.seriesId, seriesId))
      .orderBy(asc(blogPosts.seriesPosition));
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const { db } = await import('./db');
    const { blogPosts } = await import('@shared/schema');
    
    const [post] = await db.insert(blogPosts).values(insertPost).returning();
    console.log(`Created blog post: ID=${post.id}, Title="${post.title}"`);
    return post;
  }

  async updateBlogPost(id: number, updateData: Partial<InsertBlogPost>): Promise<BlogPost> {
    const { db } = await import('./db');
    const { blogPosts } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [post] = await db.update(blogPosts)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    
    if (!post) {
      throw new Error(`Blog post with ID ${id} not found`);
    }
    
    console.log(`Updated blog post: ID=${id}, Title="${post.title}"`);
    return post;
  }

  async deleteBlogPost(id: number): Promise<void> {
    const { db } = await import('./db');
    const { blogPosts } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    console.log(`Deleted blog post: ID=${id}`);
  }

  // Resume methods
  async getResume(): Promise<Resume | undefined> {
    const { db } = await import('./db');
    const { resumeContent } = await import('@shared/schema');
    
    const [resume] = await db.select().from(resumeContent).limit(1);
    return resume || undefined;
  }

  async saveResume(insertResume: InsertResume): Promise<Resume> {
    const { db } = await import('./db');
    const { resumeContent } = await import('@shared/schema');
    
    // Delete existing resume and insert new one
    await db.delete(resumeContent);
    const [resume] = await db.insert(resumeContent).values(insertResume).returning();
    
    console.log(`Updated resume content`);
    return resume;
  }

  // Lists methods
  async getLists(): Promise<any[]> {
    const { getLists } = await import('../client/src/data/lists');
    return getLists();
  }

  // Top 5 Lists methods
  async getAllTopFiveLists(): Promise<TopFiveList[]> {
    const { db } = await import('./db');
    const { topFiveLists } = await import('@shared/schema');
    const { asc } = await import('drizzle-orm');
    
    return await db.select().from(topFiveLists).orderBy(asc(topFiveLists.position));
  }

  async getTopFiveListById(id: number): Promise<TopFiveList | undefined> {
    const { db } = await import('./db');
    const { topFiveLists } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [list] = await db.select().from(topFiveLists).where(eq(topFiveLists.id, id));
    return list || undefined;
  }

  async createTopFiveList(insertList: InsertTopFiveList): Promise<TopFiveList> {
    const { db } = await import('./db');
    const { topFiveLists } = await import('@shared/schema');
    
    const [list] = await db.insert(topFiveLists).values(insertList).returning();
    return list;
  }

  async updateTopFiveList(id: number, updateData: Partial<InsertTopFiveList>): Promise<TopFiveList> {
    const { db } = await import('./db');
    const { topFiveLists } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [list] = await db.update(topFiveLists)
      .set(updateData)
      .where(eq(topFiveLists.id, id))
      .returning();
    
    if (!list) {
      throw new Error(`Top 5 list with ID ${id} not found`);
    }
    
    return list;
  }

  async deleteTopFiveList(id: number): Promise<void> {
    const { db } = await import('./db');
    const { topFiveLists, topFiveListItems } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    // Delete all items first
    await db.delete(topFiveListItems).where(eq(topFiveListItems.listId, id));
    // Then delete the list
    await db.delete(topFiveLists).where(eq(topFiveLists.id, id));
  }

  // Top 5 List Items methods
  async getTopFiveListItems(listId: number): Promise<TopFiveListItem[]> {
    const { db } = await import('./db');
    const { topFiveListItems } = await import('@shared/schema');
    const { eq, asc } = await import('drizzle-orm');
    
    return await db.select().from(topFiveListItems)
      .where(eq(topFiveListItems.listId, listId))
      .orderBy(asc(topFiveListItems.position));
  }

  async createTopFiveListItem(insertItem: InsertTopFiveListItem): Promise<TopFiveListItem> {
    const { db } = await import('./db');
    const { topFiveListItems } = await import('@shared/schema');
    
    const [item] = await db.insert(topFiveListItems).values(insertItem).returning();
    return item;
  }

  async updateTopFiveListItem(id: number, updateData: Partial<InsertTopFiveListItem>): Promise<TopFiveListItem> {
    const { db } = await import('./db');
    const { topFiveListItems } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [item] = await db.update(topFiveListItems)
      .set(updateData)
      .where(eq(topFiveListItems.id, id))
      .returning();
    
    if (!item) {
      throw new Error(`Top 5 list item with ID ${id} not found`);
    }
    
    return item;
  }

  async deleteTopFiveListItem(id: number): Promise<void> {
    const { db } = await import('./db');
    const { topFiveListItems } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    await db.delete(topFiveListItems).where(eq(topFiveListItems.id, id));
  }

  // Contact methods
  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    const { db } = await import('./db');
    const { contactSubmissions } = await import('@shared/schema');
    const { desc } = await import('drizzle-orm');
    
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async saveContactSubmission(insertSubmission: InsertContact): Promise<ContactSubmission> {
    const { db } = await import('./db');
    const { contactSubmissions } = await import('@shared/schema');
    
    const [submission] = await db.insert(contactSubmissions).values(insertSubmission).returning();
    return submission;
  }

  async deleteContactSubmission(id: number): Promise<void> {
    const { db } = await import('./db');
    const { contactSubmissions } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
  }
}

export const storage = new DatabaseStorage();
