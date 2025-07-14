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
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  shortDescription: text('short_description').notNull(),
  description: text('description').notNull(),
  image: text('image'),
  technologies: json('technologies').$type<string[]>().default([]),
  categories: json('categories').$type<string[]>().default([]),
  demoUrl: text('demo_url'),
  codeUrl: text('code_url'),
  featured: boolean('featured').default(false),
  date: timestamp('date').defaultNow(),
  lessonsLearned: text('lessons_learned'),
  challenge: text('challenge'),
  solution: text('solution'),
  results: text('results'),
  mediaFiles: json('media_files').$type<string[]>().default([]),
  customColor: text('custom_color'),
  testimonial: json('testimonial').$type<{
    quote: string;
    author: string;
    role?: string;
  }>(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Blog series model
export const blogSeries = pgTable("blog_series", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  coverImage: text("cover_image"),
  featured: boolean("featured").default(false).notNull(),
  published: boolean("published").default(false).notNull(),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlogSeriesSchema = createInsertSchema(blogSeries).omit({
  id: true,
  createdAt: true,
});

export type InsertBlogSeries = z.infer<typeof insertBlogSeriesSchema>;
export type BlogSeries = typeof blogSeries.$inferSelect;

// Blog posts model
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
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
  // Series support
  seriesId: integer("series_id").references(() => blogSeries.id),
  seriesPosition: integer("series_position").default(0),
  // References and citations
  references: text("references").array().default([]).notNull(), // JSON array of reference objects
  footnotes: text("footnotes").array().default([]).notNull(), // JSON array of footnote objects
  // Cross-linking
  relatedPosts: text("related_posts").array().default([]).notNull(), // Array of post IDs
  // SEO enhancements
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  // Content enhancements
  tableOfContents: text("table_of_contents"), // JSON array of TOC items
  wordCount: integer("word_count").default(0).notNull(),
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
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  path: text("path").notNull(),
  size: integer("size").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertResumeSchema = createInsertSchema(resumeContent).omit({
  id: true,
  uploadedAt: true,
  updatedAt: true,
});

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumeContent.$inferSelect;

// Top 5 Lists model
export const topFiveLists = pgTable("top_five_lists", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  icon: text("icon").notNull(),
  color: text("color"),
  description: text("description"),
  mainImage: text("main_image"),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTopFiveListSchema = createInsertSchema(topFiveLists).omit({
  id: true,
  createdAt: true,
});

export type InsertTopFiveList = z.infer<typeof insertTopFiveListSchema>;
export type TopFiveList = typeof topFiveLists.$inferSelect;

// Top 5 List Items model
export const topFiveListItems = pgTable("top_five_list_items", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").references(() => topFiveLists.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  link: text("link"),
  linkText: text("link_text"),
  image: text("image"),
  highlight: boolean("highlight").default(false).notNull(),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTopFiveListItemSchema = createInsertSchema(topFiveListItems).omit({
  id: true,
  createdAt: true,
});

export type InsertTopFiveListItem = z.infer<typeof insertTopFiveListItemSchema>;
export type TopFiveListItem = typeof topFiveListItems.$inferSelect;

// Chatbot Training Documents model
export const chatbotDocuments = pgTable("chatbot_documents", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  content: text("content").notNull(), // Extracted text content
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertChatbotDocumentSchema = createInsertSchema(chatbotDocuments).omit({
  id: true,
  uploadedAt: true,
});

export type InsertChatbotDocument = z.infer<typeof insertChatbotDocumentSchema>;
export type ChatbotDocument = typeof chatbotDocuments.$inferSelect;

// Chatbot Training Sessions model
export const chatbotTrainingSessions = pgTable("chatbot_training_sessions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category"), // career, skills, personal, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatbotTrainingSessionSchema = createInsertSchema(chatbotTrainingSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertChatbotTrainingSession = z.infer<typeof insertChatbotTrainingSessionSchema>;
export type ChatbotTrainingSession = typeof chatbotTrainingSessions.$inferSelect;

// Chatbot Conversations model (for analytics)
export const chatbotConversations = pgTable("chatbot_conversations", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(), // Browser session ID
  userQuestion: text("user_question").notNull(),
  botResponse: text("bot_response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatbotConversationSchema = createInsertSchema(chatbotConversations).omit({
  id: true,
  createdAt: true,
});

export type InsertChatbotConversation = z.infer<typeof insertChatbotConversationSchema>;
export type ChatbotConversation = typeof chatbotConversations.$inferSelect;

// Chatbot Training Progress model
export const chatbotTrainingProgress = pgTable("chatbot_training_progress", {
  id: serial("id").primaryKey(),
  totalQuestions: integer("total_questions").default(0).notNull(),
  lastTrainingDate: timestamp("last_training_date").defaultNow().notNull(),
  documentsCount: integer("documents_count").default(0).notNull(),
});

export const insertChatbotTrainingProgressSchema = createInsertSchema(chatbotTrainingProgress).omit({
  id: true,
});

export type InsertChatbotTrainingProgress = z.infer<typeof insertChatbotTrainingProgressSchema>;
export type ChatbotTrainingProgress = typeof chatbotTrainingProgress.$inferSelect;

// Chatbot Evaluations model - AI-powered evaluation of chatbot responses
export const chatbotEvaluations = pgTable("chatbot_evaluations", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => chatbotConversations.id).notNull(),
  accuracyScore: integer("accuracy_score").notNull(), // 1-10 scale
  helpfulnessScore: integer("helpfulness_score").notNull(), // 1-10 scale
  relevanceScore: integer("relevance_score").notNull(), // 1-10 scale
  clarityScore: integer("clarity_score").notNull(), // 1-10 scale
  overallScore: integer("overall_score").notNull(), // 1-10 scale
  feedback: text("feedback").notNull(), // Detailed AI feedback
  strengths: text("strengths").array().default([]).notNull(), // Array of strengths
  improvements: text("improvements").array().default([]).notNull(), // Array of suggested improvements
  evaluatedAt: timestamp("evaluated_at").defaultNow().notNull(),
});

export const insertChatbotEvaluationSchema = createInsertSchema(chatbotEvaluations).omit({
  id: true,
  evaluatedAt: true,
});

export type InsertChatbotEvaluation = z.infer<typeof insertChatbotEvaluationSchema>;
export type ChatbotEvaluation = typeof chatbotEvaluations.$inferSelect;

// User Feedback model - thumbs up/down from users
export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => chatbotConversations.id).notNull(),
  sessionId: text("session_id").notNull(),
  rating: text("rating").notNull(), // 'thumbs_up' or 'thumbs_down'
  comment: text("comment"), // Optional user comment
  userAgent: text("user_agent"), // Browser/device info
  ipAddress: text("ip_address"), // For analytics (anonymized)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  createdAt: true,
});

export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;

// Chatbot Learning Insights model - stores key lessons from evaluations
export const chatbotLearningInsights = pgTable("chatbot_learning_insights", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // 'improvement', 'best_practice', 'avoid_pattern'
  insight: text("insight").notNull(), // The key learning or pattern
  examples: text("examples").array().default([]).notNull(), // Example phrases or patterns
  sourceEvaluationId: integer("source_evaluation_id").references(() => chatbotEvaluations.id),
  importance: integer("importance").default(5).notNull(), // 1-10 scale
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatbotLearningInsightSchema = createInsertSchema(chatbotLearningInsights).omit({
  id: true,
  createdAt: true,
});

export type InsertChatbotLearningInsight = z.infer<typeof insertChatbotLearningInsightSchema>;
export type ChatbotLearningInsight = typeof chatbotLearningInsights.$inferSelect;

// System prompt template model
export const systemPromptTemplate = pgTable("system_prompt_template", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("default"),
  template: text("template").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSystemPromptTemplateSchema = createInsertSchema(systemPromptTemplate).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSystemPromptTemplate = z.infer<typeof insertSystemPromptTemplateSchema>;
export type SystemPromptTemplate = typeof systemPromptTemplate.$inferSelect;

// Response Formatting Rules model
export const responseFormattingRules = pgTable("response_formatting_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique().default("default"),
  instructions: text("instructions").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertResponseFormattingRulesSchema = createInsertSchema(responseFormattingRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertResponseFormattingRules = z.infer<typeof insertResponseFormattingRulesSchema>;
export type ResponseFormattingRules = typeof responseFormattingRules.$inferSelect;