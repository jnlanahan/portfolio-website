import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model (existing)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Projects model
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug"),
  shortDescription: text("short_description"),
  description: text("description").notNull(),
  image: text("image"), // Keep for backward compatibility - will be the thumbnail
  mediaFiles: text("media_files").array().default([]).notNull(), // Array of file paths
  thumbnailIndex: integer("thumbnail_index").default(0).notNull(), // Index of thumbnail in mediaFiles
  technologies: text("technologies").array().default([]).notNull(),
  demoUrl: text("demo_url"),
  codeUrl: text("code_url"),
  featured: boolean("featured").default(false).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  client: text("client"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Blog posts model
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title"),
  slug: text("slug"),
  excerpt: text("excerpt"),
  content: text("content"),
  coverImage: text("cover_image"),
  tags: text("tags").array().default([]).notNull(),
  category: text("category"),
  featured: boolean("featured").default(false).notNull(),
  published: boolean("published").default(false).notNull(),
  readTime: integer("read_time").default(5).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Contact submissions model
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// Admin model for authentication
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

// Resume content model
export const resumeContent = pgTable("resume_content", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertResumeSchema = createInsertSchema(resumeContent).omit({
  id: true,
  updatedAt: true,
});

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumeContent.$inferSelect;
