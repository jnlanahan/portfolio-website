import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import "./types"; // Import session types
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { 
  insertContactSchema,
  insertBlogPostSchema,
  insertBlogSeriesSchema,
  insertProjectSchema,
  insertAdminSchema,
  insertResumeSchema,
  insertTopFiveListSchema,
  insertTopFiveListItemSchema,
  insertChatbotDocumentSchema,
  insertChatbotTrainingSessionSchema,
  insertChatbotConversationSchema,
  insertChatbotEvaluationSchema,
  insertUserFeedbackSchema
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

import { sendContactEmail, verifyConnection } from "./mailer";
import { 
  generateTrainingQuestion, 
  processRecruiterQuestion, 
  processTrainingConversation,
  extractTextFromFile 
} from "./chatbotService";
import { 
  processMessage as processLangChainMessage,
  addDocumentToVectorStore,
  refreshVectorStore,
  getLangSmithStats,
  createEvaluationDataset,
  runEvaluation
} from "./langchainChatbotService";
import { evaluateChatbotResponse, batchEvaluateConversations, getEvaluationStats } from "./chatbotEvaluator";
import { testPrebuiltEvaluators, runComprehensiveEvaluation } from "./prebuiltEvaluators";
import { 
  extractLearningInsights, 
  processRecentEvaluations, 
  getLearningInsightsStats,
  updateSystemPromptWithLearning
} from "./chatbotLearningService";
import {
  processUserFeedback,
  processConversationSession,
  deduplicateInsights,
  convertToLearningInsights,
  createKnowledgeFact
} from "./chatbotKnowledgeService";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directories if they don't exist
  const uploadsDir = path.join(process.cwd(), 'uploads', 'projects');
  const resumeUploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
  const chatbotUploadsDir = path.join(process.cwd(), 'uploads', 'chatbot');
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(resumeUploadsDir, { recursive: true });
    await fs.mkdir(chatbotUploadsDir, { recursive: true });
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }

  // Multer configuration for file uploads
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept images, gifs, and videos
      const allowedMimes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/ogg'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images, GIFs, and videos are allowed.'));
      }
    }
  });

  // Resume upload configuration
  const resumeUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, resumeUploadsDir);
      },
      filename: (req, file, cb) => {
        // Always use the same filename to replace the existing resume
        cb(null, 'resume.pdf');
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit for resumes
    },
    fileFilter: (req, file, cb) => {
      // Accept only PDF files
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF files are allowed.'));
      }
    }
  });

  // Markdown upload configuration
  const markdownUpload = multer({
    storage: multer.memoryStorage(), // Store in memory for processing
    limits: {
      fileSize: 1 * 1024 * 1024, // 1MB limit for markdown files
    },
    fileFilter: (req, file, cb) => {
      // Accept markdown files
      if (file.mimetype === 'text/markdown' || file.mimetype === 'text/plain' || file.originalname.endsWith('.md')) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only markdown (.md) files are allowed.'));
      }
    }
  });

  // Chatbot document upload configuration
  const chatbotUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, chatbotUploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `chatbot-${uniqueSuffix}${ext}`);
      }
    }),
    limits: {
      fileSize: 25 * 1024 * 1024, // 25MB limit for training documents
    },
    fileFilter: (req, file, cb) => {
      // Accept various document types
      const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown',
        'application/rtf',
        'text/rtf'
      ];
      
      if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.md') || file.originalname.endsWith('.txt')) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF, Word, text, and markdown files are allowed.'));
      }
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // PUBLIC ROUTES - These must be registered before any catch-all routes
  // Direct resume download endpoint - now password protected
  app.get('/resume.pdf', async (req, res) => {
    // Return information about password protection instead of the file
    res.status(401).json({ 
      error: 'Password protected download',
      message: 'This download is password protected. Please contact Nick for more details.'
    });
  });

  // Public resume status endpoint (for testing)
  app.get('/api/resume/status', async (req, res) => {
    try {
      const resume = await storage.getResume();
      res.json({ 
        hasResume: !!resume,
        resume: resume || null
      });
    } catch (error) {
      console.error('Error checking resume status:', error);
      res.status(500).json({ error: 'Failed to check resume status' });
    }
  });

  // Middleware to check admin authentication
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session.isAdmin) {
      return res.status(401).json({ error: "Admin authentication required" });
    }
    next();
  };

  // Check authentication endpoint
  app.get('/api/admin/check-auth', (req, res) => {
    if (req.session.isAdmin) {
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ error: "Admin authentication required" });
    }
  });

  // File upload endpoint
  app.post('/api/admin/upload', requireAdmin, upload.array('files', 8), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }
      
      const fileUrls = files.map(file => `/uploads/projects/${file.filename}`);
      
      res.json({ 
        message: 'Files uploaded successfully',
        files: fileUrls
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ error: 'Failed to upload files' });
    }
  });

  // Resume upload endpoint
  app.post('/api/admin/resume/upload', requireAdmin, resumeUpload.single('resume'), async (req, res) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: 'No resume file uploaded' });
      }
      
      // Save resume metadata to storage
      const resumeData = {
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/resumes/${file.filename}`,
        size: file.size
      };
      
      await storage.saveResume(resumeData);
      
      res.json({ 
        message: 'Resume uploaded successfully',
        resume: resumeData
      });
    } catch (error) {
      console.error('Error uploading resume:', error);
      res.status(500).json({ error: 'Failed to upload resume' });
    }
  });

  // Resume status endpoint (for admin to check if resume exists)
  app.get('/api/admin/resume/status', requireAdmin, async (req, res) => {
    try {
      const resume = await storage.getResume();
      res.json({ 
        hasResume: !!resume,
        resume: resume || null
      });
    } catch (error) {
      console.error('Error checking resume status:', error);
      res.status(500).json({ error: 'Failed to check resume status' });
    }
  });

  // Password-protected resume download endpoint
  app.post('/api/resume/download', async (req, res) => {
    try {
      const { password } = req.body;
      
      // Check password
      if (!password || password !== 'wolfpack') {
        return res.status(401).json({ error: 'Invalid password' });
      }
      
      const resume = await storage.getResume();
      
      if (!resume) {
        return res.status(404).json({ error: 'No resume available' });
      }
      
      const resumePath = path.join(process.cwd(), 'uploads', 'resumes', resume.filename);
      
      // Check if file exists
      try {
        await fs.access(resumePath);
      } catch (err) {
        return res.status(404).json({ error: 'Resume file not found' });
      }
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${resume.originalName || 'Nick Lanahan Resume.pdf'}"`);
      res.sendFile(resumePath);
    } catch (error) {
      console.error('Error downloading resume:', error);
      res.status(500).json({ error: 'Failed to download resume' });
    }
  });

  // Handle API routes with prefix
  
  // Get all projects
  app.get("/api/portfolio", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get specific project by ID or slug
  app.get("/api/portfolio/:identifier", async (req, res) => {
    try {
      const identifier = req.params.identifier;
      let project;
      
      // Try as ID first if identifier is a number
      const numericId = parseInt(identifier);
      if (!isNaN(numericId) && numericId.toString() === identifier) {
        project = await storage.getProjectById(numericId);
      }
      
      // If not found as ID or identifier is not numeric, try as slug
      if (!project) {
        const projects = await storage.getAllProjects();
        project = projects.find(p => p.slug === identifier);
      }
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });





  // Get all blog posts
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Blog Series API Routes (before blog posts to avoid conflicts)
  
  // Get all blog series
  app.get("/api/blog/series", async (req, res) => {
    try {
      const series = await storage.getAllBlogSeries();
      res.json(series);
    } catch (error) {
      console.error("Error fetching blog series:", error);
      res.status(500).json({ message: "Failed to fetch blog series" });
    }
  });

  // Get specific blog series by ID or slug
  app.get("/api/blog/series/:identifier", async (req, res) => {
    try {
      const identifier = req.params.identifier;
      let series;
      
      // Try as ID first if identifier is a number
      const numericId = parseInt(identifier);
      if (!isNaN(numericId) && numericId.toString() === identifier) {
        series = await storage.getBlogSeriesById(numericId);
      }
      
      // If not found as ID or identifier is not numeric, try as slug
      if (!series) {
        series = await storage.getBlogSeriesBySlug(identifier);
      }
      
      if (!series) {
        return res.status(404).json({ message: "Blog series not found" });
      }
      
      // Also get all posts in this series
      const posts = await storage.getBlogPostsBySeriesId(series.id);
      
      res.json({ ...series, posts });
    } catch (error) {
      console.error("Error fetching blog series:", error);
      res.status(500).json({ message: "Failed to fetch blog series" });
    }
  });

  // Get specific blog post by ID or slug
  app.get("/api/blog/:identifier", async (req, res) => {
    try {
      const identifier = req.params.identifier;
      let post;
      
      // Try as ID first if identifier is a number
      const numericId = parseInt(identifier);
      if (!isNaN(numericId) && numericId.toString() === identifier) {
        post = await storage.getBlogPostById(numericId);
      }
      
      // If not found as ID or identifier is not numeric, try as slug
      if (!post) {
        const posts = await storage.getAllBlogPosts();
        post = posts.find(p => p.slug === identifier);
      }
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Create new blog series (admin only)
  app.post("/api/admin/blog/series", requireAdmin, async (req, res) => {
    try {
      const seriesData = insertBlogSeriesSchema.parse(req.body);
      const series = await storage.createBlogSeries(seriesData);
      res.status(201).json(series);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromZodError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      console.error("Error creating blog series:", error);
      res.status(500).json({ message: "Failed to create blog series" });
    }
  });

  // Update blog series (admin only)
  app.put("/api/admin/blog/series/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertBlogSeriesSchema.partial().parse(req.body);
      const series = await storage.updateBlogSeries(id, updateData);
      res.json(series);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromZodError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      console.error("Error updating blog series:", error);
      res.status(500).json({ message: "Failed to update blog series" });
    }
  });

  // Delete blog series (admin only)
  app.delete("/api/admin/blog/series/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogSeries(id);
      res.json({ message: "Blog series deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog series:", error);
      res.status(500).json({ message: "Failed to delete blog series" });
    }
  });

  // Get top 5 lists
  app.get("/api/lists", async (req, res) => {
    try {
      const lists = await storage.getLists();
      res.json(lists);
    } catch (error) {
      console.error("Error fetching lists:", error);
      res.status(500).json({ message: "Failed to fetch lists" });
    }
  });

  // Handle contact form submissions
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      
      // Save to database
      await storage.saveContactSubmission(contactData);
      
      // Send email notification
      const emailResult = await sendContactEmail({
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject,
        message: contactData.message
      });
      
      if (!emailResult.success) {
        console.warn("Email notification could not be sent:", emailResult.error);
        // Still return success since we saved to database
        return res.status(201).json({ 
          message: "Contact form submitted successfully, but email notification could not be sent."
        });
      }
      
      res.status(201).json({ 
        message: "Contact form submitted successfully and notification email sent."
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error processing contact submission:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const admin = await storage.getAdminByUsername(username);
      
      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set session
      req.session.adminId = admin.id;
      req.session.isAdmin = true;
      
      res.json({ message: "Login successful", admin: { id: admin.id, username: admin.username } });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/admin/status", (req, res) => {
    if (req.session.isAdmin) {
      res.json({ isAdmin: true, adminId: req.session.adminId });
    } else {
      res.json({ isAdmin: false });
    }
  });

  // Admin project management routes
  app.post("/api/admin/projects", requireAdmin, async (req, res) => {
    try {
      // Handle date conversion from string to Date object
      if (req.body.date && typeof req.body.date === 'string') {
        req.body.date = new Date(req.body.date);
      }
      
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.put("/api/admin/projects/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Handle date conversion from string to Date object
      if (req.body.date && typeof req.body.date === 'string') {
        req.body.date = new Date(req.body.date);
      }
      
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, validatedData);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/admin/projects/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Admin blog management routes
  app.post("/api/admin/blog", requireAdmin, async (req, res) => {
    try {
      // Handle date conversion from string to Date object
      if (req.body.date && typeof req.body.date === 'string') {
        req.body.date = new Date(req.body.date);
      }
      
      // Calculate read time if not provided (estimate 200 words per minute)
      if (!req.body.readTime && req.body.content) {
        const wordCount = req.body.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        req.body.readTime = Math.max(1, Math.ceil(wordCount / 200));
      }
      
      // For draft posts, ensure we have required fields with defaults
      if (!req.body.published) {
        if (!req.body.title) req.body.title = "Untitled Draft";
        if (!req.body.slug) req.body.slug = `draft-${Date.now()}`;
      }
      
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      res.json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ error: "Failed to create blog post" });
    }
  });

  app.put("/api/admin/blog/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Handle date conversion from string to Date object
      if (req.body.date && typeof req.body.date === 'string') {
        req.body.date = new Date(req.body.date);
      }
      
      // Calculate read time if not provided (estimate 200 words per minute)
      if (!req.body.readTime && req.body.content) {
        const wordCount = req.body.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        req.body.readTime = Math.max(1, Math.ceil(wordCount / 200));
      }
      
      // For draft posts, ensure we have required fields with defaults
      if (!req.body.published) {
        if (!req.body.title) req.body.title = "Untitled Draft";
        if (!req.body.slug) req.body.slug = `draft-${Date.now()}`;
      }
      
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(id, validatedData);
      res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  app.delete("/api/admin/blog/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // Markdown import endpoint
  app.post("/api/admin/blog/import", requireAdmin, markdownUpload.single('markdown'), async (req, res) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: 'No markdown file uploaded' });
      }
      
      const markdownContent = file.buffer.toString('utf-8');
      
      // Simple markdown-to-HTML conversion and frontmatter parsing
      const lines = markdownContent.split('\n');
      let frontmatter = {};
      let content = markdownContent;
      
      // Check for frontmatter
      if (lines[0] === '---') {
        const frontmatterEndIndex = lines.findIndex((line, index) => index > 0 && line === '---');
        if (frontmatterEndIndex !== -1) {
          const frontmatterLines = lines.slice(1, frontmatterEndIndex);
          content = lines.slice(frontmatterEndIndex + 1).join('\n');
          
          // Parse simple YAML frontmatter
          frontmatterLines.forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
              const value = valueParts.join(':').trim();
              frontmatter[key.trim()] = value.replace(/^["']|["']$/g, ''); // Remove quotes
            }
          });
        }
      }
      
      // Basic markdown to HTML conversion
      const htmlContent = content
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(.+)$/gm, '<p>$1</p>')
        .replace(/<p><h/g, '<h')
        .replace(/<\/h([1-6])><\/p>/g, '</h$1>');
      
      // Generate slug from title
      const generateSlug = (title) => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      };
      
      const blogData = {
        title: frontmatter.title || 'Imported Blog Post',
        slug: frontmatter.slug || generateSlug(frontmatter.title || 'imported-blog-post'),
        excerpt: frontmatter.excerpt || frontmatter.description || 'Imported from markdown file',
        content: htmlContent,
        coverImage: frontmatter.coverImage || frontmatter.image || '',
        tags: frontmatter.tags ? frontmatter.tags.split(',').map(tag => tag.trim()) : [],
        category: frontmatter.category || 'General',
        featured: frontmatter.featured === 'true' || false,
        published: frontmatter.published === 'true' || false,
        date: frontmatter.date ? new Date(frontmatter.date) : new Date(),
      };
      
      res.json({ 
        message: 'Markdown imported successfully',
        data: blogData
      });
    } catch (error) {
      console.error('Error importing markdown:', error);
      res.status(500).json({ error: 'Failed to import markdown file' });
    }
  });

  // Markdown export endpoint
  app.get("/api/admin/blog/:id/export", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getBlogPostById(id);
      
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      // Convert HTML back to markdown (basic conversion)
      const markdownContent = post.content
        .replace(/<h1>(.*?)<\/h1>/g, '# $1')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]*>/g, ''); // Remove remaining HTML tags
      
      // Create frontmatter
      const frontmatter = [
        '---',
        `title: "${post.title}"`,
        `slug: "${post.slug}"`,
        `excerpt: "${post.excerpt}"`,
        `category: "${post.category}"`,
        `tags: "${Array.isArray(post.tags) ? post.tags.join(', ') : post.tags}"`,
        `featured: ${post.featured}`,
        `published: ${post.published}`,
        `date: "${post.date}"`,
        post.coverImage ? `coverImage: "${post.coverImage}"` : '',
        '---',
        '',
        markdownContent
      ].filter(Boolean).join('\n');
      
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="${post.slug}.md"`);
      res.send(frontmatter);
    } catch (error) {
      console.error('Error exporting markdown:', error);
      res.status(500).json({ error: 'Failed to export markdown file' });
    }
  });

  // AI Content Polisher endpoints
  app.post("/api/admin/polish-content", requireAdmin, async (req, res) => {
    try {
      const { content, contentType } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Content is required' });
      }

      const { polishContent } = await import('./aiPolisher');
      const result = await polishContent(content, contentType || 'blog');
      
      res.json(result);
    } catch (error) {
      console.error('Error polishing content:', error);
      res.status(500).json({ error: 'Failed to analyze content' });
    }
  });

  app.post("/api/admin/quick-suggestions", requireAdmin, async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Content is required' });
      }

      const { getQuickSuggestions } = await import('./aiPolisher');
      const suggestions = await getQuickSuggestions(content);
      
      res.json({ suggestions });
    } catch (error) {
      console.error('Error getting quick suggestions:', error);
      res.status(500).json({ error: 'Failed to get suggestions' });
    }
  });

  app.post("/api/admin/improve-selection", requireAdmin, async (req, res) => {
    try {
      const { selectedText, context } = req.body;
      
      if (!selectedText || typeof selectedText !== 'string') {
        return res.status(400).json({ error: 'Selected text is required' });
      }

      const { improveSelection } = await import('./aiPolisher');
      const improved = await improveSelection(selectedText, context || '');
      
      res.json({ improved });
    } catch (error) {
      console.error('Error improving selection:', error);
      res.status(500).json({ error: 'Failed to improve text' });
    }
  });

  // Admin resume management routes
  app.get("/api/admin/resume", requireAdmin, async (req, res) => {
    try {
      const resume = await storage.getResume();
      res.json(resume || { content: "" });
    } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({ error: "Failed to fetch resume" });
    }
  });

  app.post("/api/admin/resume", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertResumeSchema.parse(req.body);
      const resume = await storage.saveResume(validatedData);
      res.json(resume);
    } catch (error) {
      console.error("Error saving resume:", error);
      res.status(500).json({ error: "Failed to save resume" });
    }
  });

  // Admin contact submissions management
  app.get("/api/admin/contact", requireAdmin, async (req, res) => {
    try {
      const submissions = await storage.getAllContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ error: "Failed to fetch contact submissions" });
    }
  });

  app.delete("/api/admin/contact/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContactSubmission(id);
      res.json({ message: "Contact submission deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact submission:", error);
      res.status(500).json({ error: "Failed to delete contact submission" });
    }
  });

  // Top 5 Lists API routes
  app.get("/api/admin/top5-lists", requireAdmin, async (req, res) => {
    try {
      const lists = await storage.getAllTopFiveLists();
      res.json(lists);
    } catch (error) {
      console.error("Error fetching top 5 lists:", error);
      res.status(500).json({ error: "Failed to fetch top 5 lists" });
    }
  });

  app.get("/api/admin/top5-lists/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const list = await storage.getTopFiveListById(id);
      if (!list) {
        return res.status(404).json({ error: "List not found" });
      }
      res.json(list);
    } catch (error) {
      console.error("Error fetching top 5 list:", error);
      res.status(500).json({ error: "Failed to fetch top 5 list" });
    }
  });

  app.post("/api/admin/top5-lists", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertTopFiveListSchema.parse(req.body);
      const list = await storage.createTopFiveList(validatedData);
      res.json(list);
    } catch (error) {
      console.error("Error creating top 5 list:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Failed to create top 5 list" });
      }
    }
  });

  app.put("/api/admin/top5-lists/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTopFiveListSchema.partial().parse(req.body);
      const list = await storage.updateTopFiveList(id, validatedData);
      res.json(list);
    } catch (error) {
      console.error("Error updating top 5 list:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Failed to update top 5 list" });
      }
    }
  });

  app.delete("/api/admin/top5-lists/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTopFiveList(id);
      res.json({ message: "Top 5 list deleted successfully" });
    } catch (error) {
      console.error("Error deleting top 5 list:", error);
      res.status(500).json({ error: "Failed to delete top 5 list" });
    }
  });

  // Top 5 List Items API routes
  app.get("/api/admin/top5-lists/:listId/items", requireAdmin, async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const items = await storage.getTopFiveListItems(listId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching top 5 list items:", error);
      res.status(500).json({ error: "Failed to fetch top 5 list items" });
    }
  });

  app.post("/api/admin/top5-lists/:listId/items", requireAdmin, async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const validatedData = insertTopFiveListItemSchema.parse({
        ...req.body,
        listId
      });
      const item = await storage.createTopFiveListItem(validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error creating top 5 list item:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Failed to create top 5 list item" });
      }
    }
  });

  app.put("/api/admin/top5-list-items/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTopFiveListItemSchema.partial().parse(req.body);
      const item = await storage.updateTopFiveListItem(id, validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error updating top 5 list item:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Failed to update top 5 list item" });
      }
    }
  });

  app.delete("/api/admin/top5-list-items/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTopFiveListItem(id);
      res.json({ message: "Top 5 list item deleted successfully" });
    } catch (error) {
      console.error("Error deleting top 5 list item:", error);
      res.status(500).json({ error: "Failed to delete top 5 list item" });
    }
  });

  // CHATBOT API ROUTES
  
  // Public chatbot endpoint for recruiters (VISITOR MODE)
  app.post("/api/chatbot/ask", async (req, res) => {
    try {
      const { question, sessionId } = req.body;
      
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: "Question is required" });
      }

      // Process the question using the new VISITOR MODE function
      const response = await processRecruiterQuestion(question, sessionId);
      
      res.json({
        response: response.response,
        isOnTopic: response.isOnTopic,
        confidence: response.confidence
      });
    } catch (error) {
      console.error("Error processing chatbot question:", error);
      res.status(500).json({ error: "Failed to process question" });
    }
  });

  // Training chatbot endpoint for admin (TRAINING MODE)
  app.post("/api/admin/chatbot/train", requireAdmin, async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }

      // Process the training conversation using TRAINING MODE
      const response = await processTrainingConversation(message, sessionId);
      
      // Only increment progress when user provides substantial information (not just short responses)
      // This helps track actual answered questions rather than every message exchange
      if (message.length > 10 && !message.toLowerCase().includes('hello') && !message.toLowerCase().includes('hi')) {
        const currentProgress = await storage.getChatbotTrainingProgress();
        const newQuestionCount = (currentProgress?.totalQuestions || 0) + 1;
        
        await storage.updateChatbotTrainingProgress({
          totalQuestions: newQuestionCount,
          lastTrainingDate: new Date()
        });
      }
      
      res.json({
        response: response.response,
        isOnTopic: response.isOnTopic,
        confidence: response.confidence
      });
    } catch (error) {
      console.error("Error processing training conversation:", error);
      res.status(500).json({ error: "Failed to process training message" });
    }
  });

  // Admin chatbot management routes
  
  // Get training progress
  app.get("/api/admin/chatbot/progress", requireAdmin, async (req, res) => {
    try {
      const progress = await storage.getChatbotTrainingProgress();
      const documentsCount = (await storage.getAllChatbotDocuments()).length;
      
      res.json({
        ...progress,
        documentsCount
      });
    } catch (error) {
      console.error("Error fetching chatbot progress:", error);
      res.status(500).json({ error: "Failed to fetch training progress" });
    }
  });

  // Get all training documents
  app.get("/api/admin/chatbot/documents", requireAdmin, async (req, res) => {
    try {
      const documents = await storage.getAllChatbotDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching chatbot documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Upload training document
  app.post("/api/admin/chatbot/upload", requireAdmin, chatbotUpload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Read file content
      const fileBuffer = await fs.readFile(req.file.path);
      const extractedContent = await extractTextFromFile(fileBuffer, req.file.mimetype, req.file.originalname);

      // Create document record
      const document = await storage.createChatbotDocument({
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        content: extractedContent
      });

      // Update progress
      const currentProgress = await storage.getChatbotTrainingProgress();
      const documentsCount = (await storage.getAllChatbotDocuments()).length;
      
      await storage.updateChatbotTrainingProgress({
        documentsCount,
        lastTrainingDate: new Date()
      });

      res.json({
        document,
        message: "Document uploaded and processed successfully"
      });
    } catch (error) {
      console.error("Error uploading chatbot document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  // Delete training document
  app.delete("/api/admin/chatbot/documents/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getChatbotDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Delete file from filesystem
      try {
        await fs.unlink(path.join(chatbotUploadsDir, document.filename));
      } catch (error) {
        console.warn("Could not delete file from filesystem:", error);
      }

      // Delete from database
      await storage.deleteChatbotDocument(id);
      
      // Update progress
      const documentsCount = (await storage.getAllChatbotDocuments()).length;
      await storage.updateChatbotTrainingProgress({
        documentsCount,
        lastTrainingDate: new Date()
      });

      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting chatbot document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // Generate training question
  app.post("/api/admin/chatbot/training/question", requireAdmin, async (req, res) => {
    try {
      const documents = await storage.getAllChatbotDocuments();
      const trainingSessions = await storage.getAllChatbotTrainingSessions();
      const progress = await storage.getChatbotTrainingProgress();
      
      const question = await generateTrainingQuestion(documents, trainingSessions, progress);
      
      res.json(question);
    } catch (error) {
      console.error("Error generating training question:", error);
      res.status(500).json({ error: "Failed to generate training question" });
    }
  });

  // Submit training answer
  app.post("/api/admin/chatbot/training/answer", requireAdmin, async (req, res) => {
    try {
      const { question, answer, category } = req.body;
      
      if (!question || !answer) {
        return res.status(400).json({ error: "Question and answer are required" });
      }

      // Save training session
      const session = await storage.createChatbotTrainingSession({
        question,
        answer,
        category
      });

      // Update progress
      const currentProgress = await storage.getChatbotTrainingProgress();
      const newTotalQuestions = (currentProgress?.totalQuestions || 0) + 1;
      
      await storage.updateChatbotTrainingProgress({
        totalQuestions: newTotalQuestions,
        lastTrainingDate: new Date()
      });

      res.json({
        session,
        totalQuestions: newTotalQuestions,
        message: "Training answer saved successfully"
      });
    } catch (error) {
      console.error("Error saving training answer:", error);
      res.status(500).json({ error: "Failed to save training answer" });
    }
  });

  // Get training sessions
  app.get("/api/admin/chatbot/training/sessions", requireAdmin, async (req, res) => {
    try {
      const sessions = await storage.getAllChatbotTrainingSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching training sessions:", error);
      res.status(500).json({ error: "Failed to fetch training sessions" });
    }
  });

  // Get conversation analytics
  app.get("/api/admin/chatbot/analytics", requireAdmin, async (req, res) => {
    try {
      const conversations = await storage.getAllChatbotConversations();
      
      // Basic analytics
      const analytics = {
        totalConversations: conversations.length,
        recentConversations: conversations.slice(0, 50),
        topQuestions: conversations.reduce((acc, conv) => {
          const question = conv.userQuestion.toLowerCase();
          acc[question] = (acc[question] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching chatbot analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Public chatbot routes (for visitor mode)
  app.post("/api/chatbot/chat", async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = await processRecruiterQuestion(message, sessionId);
      
      // Automatically evaluate the conversation if it was saved
      if (response.conversationId) {
        // Run evaluation in the background without blocking the response
        setTimeout(async () => {
          try {
            await evaluateChatbotResponse(response.conversationId);
            console.log(`Evaluation completed for conversation ${response.conversationId}`);
          } catch (error) {
            console.error(`Error evaluating conversation ${response.conversationId}:`, error);
          }
        }, 1000); // Small delay to ensure conversation is saved
      }
      
      res.json(response);
    } catch (error) {
      console.error("Error processing chatbot message:", error);
      res.status(500).json({ error: "Failed to process message", details: error.message });
    }
  });

  // Admin chatbot training conversation
  app.post("/api/admin/chatbot/train", requireAdmin, async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = await processTrainingConversation(message, sessionId);
      
      // Automatically evaluate training conversations if they were saved
      if (response.conversationId) {
        // Run evaluation in the background without blocking the response
        setTimeout(async () => {
          try {
            await evaluateChatbotResponse(response.conversationId);
            console.log(`Training evaluation completed for conversation ${response.conversationId}`);
          } catch (error) {
            console.error(`Error evaluating training conversation ${response.conversationId}:`, error);
          }
        }, 1000); // Small delay to ensure conversation is saved
      }
      
      res.json(response);
    } catch (error) {
      console.error("Error processing training conversation:", error);
      res.status(500).json({ error: "Failed to process training conversation" });
    }
  });

  // Chatbot evaluation routes
  app.get("/api/admin/chatbot/evaluations", requireAdmin, async (req, res) => {
    try {
      const evaluations = await storage.getChatbotEvaluations();
      res.json(evaluations);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      res.status(500).json({ error: "Failed to fetch evaluations" });
    }
  });

  // Get chatbot evaluations with conversation details
  app.get("/api/admin/chatbot/evaluations/detailed", requireAdmin, async (req, res) => {
    try {
      const evaluations = await storage.getChatbotEvaluations();
      const conversations = await storage.getAllChatbotConversations();
      
      // Create a map of conversation details
      const conversationMap = new Map();
      conversations.forEach(conv => {
        conversationMap.set(conv.id, {
          userQuestion: conv.userQuestion,
          aiResponse: conv.botResponse,
          sessionId: conv.sessionId,
          createdAt: conv.createdAt
        });
      });
      
      // Combine evaluations with conversation details
      const detailedEvaluations = evaluations.map(evaluation => ({
        ...evaluation,
        conversation: conversationMap.get(evaluation.conversationId) || null
      }));
      
      res.json(detailedEvaluations);
    } catch (error) {
      console.error("Error fetching detailed chatbot evaluations:", error);
      res.status(500).json({ error: "Failed to fetch detailed chatbot evaluations" });
    }
  });

  app.get("/api/admin/chatbot/evaluations/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await getEvaluationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching evaluation stats:", error);
      res.status(500).json({ error: "Failed to fetch evaluation stats" });
    }
  });

  app.get("/api/admin/chatbot/evaluations/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const evaluation = await storage.getChatbotEvaluationById(id);
      if (!evaluation) {
        return res.status(404).json({ error: "Evaluation not found" });
      }
      res.json(evaluation);
    } catch (error) {
      console.error("Error fetching evaluation:", error);
      res.status(500).json({ error: "Failed to fetch evaluation" });
    }
  });

  app.post("/api/admin/chatbot/evaluations/evaluate/:conversationId", requireAdmin, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const evaluation = await evaluateChatbotResponse(conversationId);
      res.json(evaluation);
    } catch (error) {
      console.error("Error evaluating conversation:", error);
      res.status(500).json({ error: "Failed to evaluate conversation" });
    }
  });

  // Batch evaluate all unevaluated conversations
  app.post("/api/admin/chatbot/evaluations/batch", requireAdmin, async (req, res) => {
    try {
      const conversations = await storage.getAllChatbotConversations();
      const evaluations = await storage.getChatbotEvaluations();
      
      // Find conversations that haven't been evaluated yet
      const evaluatedConversationIds = new Set(evaluations.map(e => e.conversationId));
      const unevaluatedConversations = conversations.filter(conv => !evaluatedConversationIds.has(conv.id));
      
      console.log(`Starting batch evaluation for ${unevaluatedConversations.length} conversations`);
      
      // Use the existing batch evaluation function
      const conversationIds = unevaluatedConversations.map(conv => conv.id);
      const results = await batchEvaluateConversations(conversationIds);
      
      res.json({
        totalConversations: conversations.length,
        evaluatedBefore: evaluatedConversationIds.size,
        newlyEvaluated: results.length,
        results
      });
    } catch (error) {
      console.error("Error in batch evaluation:", error);
      res.status(500).json({ error: "Failed to perform batch evaluation" });
    }
  });

  // Test prebuilt evaluators
  app.get("/api/admin/chatbot/test-prebuilt-evaluators", requireAdmin, async (req, res) => {
    try {
      console.log("Testing prebuilt evaluators...");
      
      const testResult = await testPrebuiltEvaluators();
      
      if (testResult) {
        res.json({
          success: true,
          message: "Prebuilt evaluators are working correctly",
          evaluatorsAvailable: [
            "Correctness",
            "Conciseness", 
            "Comprehensiveness",
            "Coherence"
          ]
        });
      } else {
        res.json({
          success: false,
          message: "Prebuilt evaluators test failed"
        });
      }
    } catch (error) {
      console.error("Error testing prebuilt evaluators:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to test prebuilt evaluators",
        details: error.message 
      });
    }
  });

  // Run comprehensive evaluation on a specific conversation
  app.post("/api/admin/chatbot/evaluate-comprehensive/:conversationId", requireAdmin, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      
      const conversation = await storage.getChatbotConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      // Get context for evaluation
      const documents = await storage.getChatbotDocuments();
      const trainingData = await storage.getChatbotTrainingSessions();
      
      let context = "Available knowledge about Nick Lanahan:\n\n";
      documents.forEach(doc => {
        context += `From ${doc.originalName}: ${doc.content.substring(0, 400)}...\n\n`;
      });
      trainingData.forEach(session => {
        context += `Q: ${session.question}\nA: ${session.answer}\n\n`;
      });
      
      const evaluation = await runComprehensiveEvaluation(
        conversation.userQuestion,
        conversation.botResponse,
        context.substring(0, 2000)
      );
      
      res.json({
        success: true,
        conversation: {
          id: conversationId,
          userQuestion: conversation.userQuestion,
          botResponse: conversation.botResponse.substring(0, 200) + "..."
        },
        evaluation: {
          overall: evaluation.overallScore,
          correctness: evaluation.correctnessScore,
          conciseness: evaluation.concisenessScore,
          comprehensiveness: evaluation.comprehensivenessScore,
          coherence: evaluation.coherenceScore,
          feedback: evaluation.feedback,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          evaluatorInsights: evaluation.evaluatorInsights
        }
      });
    } catch (error) {
      console.error("Error in comprehensive evaluation:", error);
      res.status(500).json({ error: "Failed to perform comprehensive evaluation" });
    }
  });

  // Re-extract all documents with updated extraction logic
  app.post("/api/admin/chatbot/documents/re-extract", requireAdmin, async (req, res) => {
    try {
      const documents = await storage.getAllChatbotDocuments();
      console.log(`Starting re-extraction for ${documents.length} documents`);
      
      const results = [];
      
      for (const document of documents) {
        try {
          const filePath = path.join(chatbotUploadsDir, document.filename);
          
          // Check if file exists
          if (!await fs.access(filePath).then(() => true).catch(() => false)) {
            results.push({
              documentId: document.id,
              filename: document.originalName,
              success: false,
              error: 'File not found on disk'
            });
            continue;
          }
          
          // Re-extract content
          const fileBuffer = await fs.readFile(filePath);
          const extractedContent = await extractTextFromFile(fileBuffer, document.fileType, document.originalName);
          
          // Update document in database
          await storage.updateChatbotDocument(document.id, {
            content: extractedContent
          });
          
          results.push({
            documentId: document.id,
            filename: document.originalName,
            success: true,
            contentLength: extractedContent.length,
            preview: extractedContent.substring(0, 100) + '...'
          });
          
          console.log(`Re-extracted content for ${document.originalName}: ${extractedContent.length} characters`);
        } catch (error) {
          console.error(`Error re-extracting ${document.originalName}:`, error);
          results.push({
            documentId: document.id,
            filename: document.originalName,
            success: false,
            error: error.message
          });
        }
      }
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      res.json({
        totalDocuments: documents.length,
        successful,
        failed,
        results
      });
    } catch (error) {
      console.error("Error in batch re-extraction:", error);
      res.status(500).json({ error: "Failed to perform batch re-extraction" });
    }
  });

  app.post("/api/admin/chatbot/evaluations/batch", requireAdmin, async (req, res) => {
    try {
      const { conversationIds } = req.body;
      if (!Array.isArray(conversationIds)) {
        return res.status(400).json({ error: "conversationIds must be an array" });
      }
      
      const evaluations = await batchEvaluateConversations(conversationIds);
      res.json(evaluations);
    } catch (error) {
      console.error("Error batch evaluating conversations:", error);
      res.status(500).json({ error: "Failed to batch evaluate conversations" });
    }
  });

  // User feedback routes
  app.post("/api/chatbot/feedback", async (req, res) => {
    try {
      const validatedData = insertUserFeedbackSchema.parse(req.body);
      const feedback = await storage.saveUserFeedback(validatedData);
      res.json(feedback);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error saving user feedback:", error);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  app.get("/api/admin/chatbot/feedback", requireAdmin, async (req, res) => {
    try {
      const feedback = await storage.getUserFeedback();
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching user feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  app.get("/api/admin/chatbot/feedback/:conversationId", requireAdmin, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const feedback = await storage.getUserFeedbackByConversationId(conversationId);
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback for conversation:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // Learning system routes
  app.get("/api/admin/chatbot/learning/insights", requireAdmin, async (req, res) => {
    try {
      const insights = await storage.getChatbotLearningInsights();
      res.json(insights);
    } catch (error) {
      console.error("Error fetching learning insights:", error);
      res.status(500).json({ error: "Failed to fetch learning insights" });
    }
  });

  app.get("/api/admin/chatbot/learning/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await getLearningInsightsStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching learning stats:", error);
      res.status(500).json({ error: "Failed to fetch learning stats" });
    }
  });

  app.post("/api/admin/chatbot/learning/extract/:evaluationId", requireAdmin, async (req, res) => {
    try {
      const evaluationId = parseInt(req.params.evaluationId);
      const insights = await extractLearningInsights(evaluationId);
      res.json(insights);
    } catch (error) {
      console.error("Error extracting learning insights:", error);
      res.status(500).json({ error: "Failed to extract insights" });
    }
  });

  app.post("/api/admin/chatbot/learning/process-recent", requireAdmin, async (req, res) => {
    try {
      const result = await processRecentEvaluations();
      res.json(result);
    } catch (error) {
      console.error("Error processing recent evaluations:", error);
      res.status(500).json({ error: "Failed to process recent evaluations" });
    }
  });

  app.post("/api/admin/chatbot/learning/process-user-feedback", requireAdmin, async (req, res) => {
    try {
      const { processUserFeedbackForLearning } = await import('./chatbotLearningService');
      const insights = await processUserFeedbackForLearning();
      res.json({
        message: "User feedback processed successfully",
        insights,
        insightsCreated: insights.length
      });
    } catch (error) {
      console.error("Error processing user feedback:", error);
      res.status(500).json({ error: "Failed to process user feedback" });
    }
  });

  app.post("/api/admin/chatbot/learning/generate-suggestion", requireAdmin, async (req, res) => {
    try {
      // Generate AI suggestion based on current insights and feedback
      const suggestedPrompt = await generateEnhancedSystemPrompt();
      res.json({ prompt: suggestedPrompt });
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      res.status(500).json({ error: "Failed to generate AI suggestion" });
    }
  });

  app.post("/api/admin/chatbot/learning/update-prompt", requireAdmin, async (req, res) => {
    try {
      const { customPrompt } = req.body;
      
      if (customPrompt) {
        // Save the custom system prompt
        await storage.saveSystemPromptTemplate({
          name: 'custom',
          template: customPrompt,
          isActive: true
        });
        res.json({ message: "Custom system prompt saved successfully", prompt: customPrompt });
      } else {
        // Use the auto-generated prompt
        const updatedPrompt = await updateSystemPromptWithLearning();
        res.json({ message: "System prompt updated successfully", prompt: updatedPrompt });
      }
    } catch (error) {
      console.error("Error updating system prompt:", error);
      res.status(500).json({ error: "Failed to update system prompt" });
    }
  });

  app.delete("/api/admin/chatbot/learning/insights/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteChatbotLearningInsight(id);
      res.json({ message: "Learning insight deleted successfully" });
    } catch (error) {
      console.error("Error deleting learning insight:", error);
      res.status(500).json({ error: "Failed to delete insight" });
    }
  });

  app.patch("/api/admin/chatbot/learning/insights/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActive, importance } = req.body;
      
      const updateData: any = {};
      if (typeof isActive === 'boolean') updateData.isActive = isActive;
      if (typeof importance === 'number') updateData.importance = importance;
      
      const updatedInsight = await storage.updateChatbotLearningInsight(id, updateData);
      res.json(updatedInsight);
    } catch (error) {
      console.error("Error updating learning insight:", error);
      res.status(500).json({ error: "Failed to update insight" });
    }
  });

  // New knowledge-based learning routes
  app.post("/api/admin/chatbot/knowledge/process-feedback/:feedbackId", requireAdmin, async (req, res) => {
    try {
      const feedbackId = parseInt(req.params.feedbackId);
      const knowledgeUpdate = await processUserFeedback(feedbackId);
      
      // Create knowledge facts from the feedback
      for (const gap of knowledgeUpdate.knowledgeGaps) {
        await createKnowledgeFact(gap, 'user_feedback', feedbackId);
      }
      
      for (const correction of knowledgeUpdate.factCorrections) {
        await createKnowledgeFact(correction, 'user_feedback', feedbackId);
      }
      
      res.json({
        message: "Feedback processed successfully",
        knowledgeUpdate,
        factsCreated: knowledgeUpdate.knowledgeGaps.length + knowledgeUpdate.factCorrections.length
      });
    } catch (error) {
      console.error("Error processing user feedback:", error);
      res.status(500).json({ error: "Failed to process feedback" });
    }
  });

  app.post("/api/admin/chatbot/knowledge/process-session/:conversationId", requireAdmin, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const sessionInsights = await processConversationSession(conversationId);
      const learningInsights = await convertToLearningInsights(sessionInsights, conversationId);
      
      res.json({
        message: "Session processed successfully",
        sessionInsights,
        learningInsights,
        insightsCreated: learningInsights.length
      });
    } catch (error) {
      console.error("Error processing conversation session:", error);
      res.status(500).json({ error: "Failed to process session" });
    }
  });

  app.post("/api/admin/chatbot/knowledge/deduplicate", requireAdmin, async (req, res) => {
    try {
      const deduplicatedCount = await deduplicateInsights();
      res.json({
        message: "Deduplication complete",
        deduplicatedCount,
        status: deduplicatedCount > 0 ? "Insights merged successfully" : "No duplicates found"
      });
    } catch (error) {
      console.error("Error deduplicating insights:", error);
      res.status(500).json({ error: "Failed to deduplicate insights" });
    }
  });

  app.get("/api/admin/chatbot/learning/system-prompt", requireAdmin, async (req, res) => {
    try {
      // Check if there's a custom prompt saved first
      const customPrompt = await storage.getActiveSystemPromptTemplate();
      
      if (customPrompt && customPrompt.name === 'custom') {
        // Return the custom prompt
        const documents = await storage.getChatbotDocuments();
        const trainingData = await storage.getChatbotTrainingSessions();
        const learningInsights = await storage.getChatbotLearningInsights();
        const factInsights = learningInsights.filter(i => 
          i.isActive && i.insight.startsWith('FACT:')
        );
        
        res.json({
          prompt: customPrompt.template,
          stats: {
            documents: documents.length,
            trainingSessions: trainingData.length,
            learningInsights: learningInsights.length,
            activeFacts: factInsights.length
          },
          isCustom: true
        });
        return;
      }
      
      // If no custom prompt, generate the default one
      const trainingData = await storage.getChatbotTrainingSessions();
      const documents = await storage.getChatbotDocuments();
      const learningInsights = await storage.getChatbotLearningInsights();
      
      // Build a list of important facts from learning insights
      const factInsights = learningInsights.filter(i => 
        i.isActive && i.insight.startsWith('FACT:')
      );
      
      let factsSection = "";
      if (factInsights.length > 0) {
        factsSection = "\n\nIMPORTANT FACTS (from user feedback):\n";
        factInsights.forEach(fact => {
          const factText = fact.insight.replace('FACT: ', '');
          factsSection += `• ${factText}\n`;
        });
      }

      const systemPrompt = `You are Nack, a professional AI assistant specifically designed to represent Nick Lanahan to recruiters and hiring managers. Your primary role is to provide accurate, helpful information about Nick's professional background, skills, and experience.

CRITICAL INSTRUCTIONS:
- Always search available documents before answering questions
- When asked about specific topics, look for relevant documents:
  * For coursework or education details → Check for transcripts or academic records
  * For work experience or duration → Check resume and LinkedIn profile 
  * For project details → Check portfolio documents or project descriptions
  * For technical skills → Check resume, LinkedIn, and project documentation
  * For certifications or achievements → Check resume and professional documents
- Never assume information is not available without checking all documents
- If you cannot find specific information after searching, say "I don't have that specific information in the documents available"
- Be confident when information is found in documents
- Maintain a professional, helpful tone suitable for recruiter interactions
- Focus on Nick's achievements, experience, and qualifications

AVAILABLE DOCUMENT TYPES:
- Resume documents
- LinkedIn profile
- Academic transcripts (MBA and MS transcripts)
- Project documentation
- Professional certifications
- Work samples and portfolio pieces${factsSection}`;
      
      res.json({
        prompt: systemPrompt,
        stats: {
          documents: documents.length,
          trainingSessions: trainingData.length,
          learningInsights: learningInsights.length,
          activeFacts: factInsights.length
        },
        isCustom: false
      });
    } catch (error) {
      console.error("Error getting system prompt:", error);
      res.status(500).json({ error: "Failed to get system prompt" });
    }
  });

  // Get preview of updated system prompt
  app.get("/api/admin/chatbot/learning/prompt-preview", requireAdmin, async (req, res) => {
    try {
      // Get all the same data as the system prompt endpoint
      const trainingData = await storage.getChatbotTrainingSessions();
      const documents = await storage.getChatbotDocuments();
      const learningInsights = await storage.getChatbotLearningInsights();
      
      // Build a list of ALL active facts from learning insights
      const factInsights = learningInsights.filter(i => 
        i.isActive && i.insight.startsWith('FACT:')
      );
      
      let factsSection = "";
      if (factInsights.length > 0) {
        factsSection = "\n\nIMPORTANT FACTS (from user feedback):\n";
        factInsights.forEach(fact => {
          const factText = fact.insight.replace('FACT: ', '');
          factsSection += `• ${factText}\n`;
        });
      }

      const systemPrompt = `You are Nack, a professional AI assistant specifically designed to represent Nick Lanahan to recruiters and hiring managers. Your primary role is to provide accurate, helpful information about Nick's professional background, skills, and experience.

CRITICAL INSTRUCTIONS:
- Always search available documents before answering questions
- When asked about specific topics, look for relevant documents:
  * For coursework or education details → Check for transcripts or academic records
  * For work experience or duration → Check resume and LinkedIn profile 
  * For project details → Check portfolio documents or project descriptions
  * For technical skills → Check resume, LinkedIn, and project documentation
  * For certifications or achievements → Check resume and professional documents
- Never assume information is not available without checking all documents
- If you cannot find specific information after searching, say "I don't have that specific information in the documents available"
- Be confident when information is found in documents
- Maintain a professional, helpful tone suitable for recruiter interactions
- Focus on Nick's achievements, experience, and qualifications

AVAILABLE DOCUMENT TYPES:
- Resume documents
- LinkedIn profile
- Academic transcripts (MBA and MS transcripts)
- Project documentation
- Professional certifications
- Work samples and portfolio pieces${factsSection}`;
      
      res.json({
        prompt: systemPrompt,
        stats: {
          documents: documents.length,
          trainingSessions: trainingData.length,
          learningInsights: learningInsights.length,
          activeFacts: factInsights.length
        }
      });
    } catch (error) {
      console.error("Error getting system prompt preview:", error);
      res.status(500).json({ error: "Failed to get system prompt preview" });
    }
  });

  app.post("/api/admin/chatbot/knowledge/process-all-feedback", requireAdmin, async (req, res) => {
    try {
      // Get all negative feedback with comments
      const allFeedback = await storage.getUserFeedback();
      const negativeFeedback = allFeedback.filter(fb => 
        fb.rating === 'thumbs_down' && fb.comment && fb.comment.length > 0
      );
      
      let processedCount = 0;
      const knowledgeUpdates = [];
      
      for (const feedback of negativeFeedback) {
        try {
          const update = await processUserFeedback(feedback.id);
          if (update.knowledgeGaps.length > 0 || update.factCorrections.length > 0) {
            knowledgeUpdates.push({
              feedbackId: feedback.id,
              conversationId: feedback.conversationId,
              update
            });
            
            // Create knowledge facts
            for (const gap of update.knowledgeGaps) {
              await createKnowledgeFact(gap, 'user_feedback', feedback.id);
            }
            
            for (const correction of update.factCorrections) {
              await createKnowledgeFact(correction, 'user_feedback', feedback.id);
            }
            
            processedCount++;
          }
        } catch (error) {
          console.error(`Error processing feedback ${feedback.id}:`, error);
        }
      }
      
      res.json({
        message: "All feedback processed",
        totalFeedback: negativeFeedback.length,
        processedCount,
        knowledgeUpdates
      });
    } catch (error) {
      console.error("Error processing all feedback:", error);
      res.status(500).json({ error: "Failed to process all feedback" });
    }
  });

  // ======================================
  // LangChain + LangSmith Integration Routes
  // ======================================

  // LangChain chatbot message processing
  app.post("/api/langchain/chatbot/chat", async (req, res) => {
    try {
      const { message, conversationId } = req.body;
      
      if (!message || !conversationId) {
        return res.status(400).json({ error: "Message and conversationId are required" });
      }
      
      // Process message through LangChain RAG pipeline
      const response = await processLangChainMessage(message, conversationId);
      
      res.json({ response });
    } catch (error) {
      console.error("Error in LangChain chatbot:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Add document to LangChain vector store
  app.post("/api/langchain/documents/add", requireAdmin, async (req, res) => {
    try {
      const { content, filename, type, id } = req.body;
      
      if (!content || !filename || !type || !id) {
        return res.status(400).json({ error: "Content, filename, type, and id are required" });
      }
      
      await addDocumentToVectorStore(content, { filename, type, id });
      
      res.json({ message: "Document added to vector store successfully" });
    } catch (error) {
      console.error("Error adding document to vector store:", error);
      res.status(500).json({ error: "Failed to add document to vector store" });
    }
  });

  // Refresh vector store with all documents
  app.post("/api/langchain/documents/refresh", requireAdmin, async (req, res) => {
    try {
      await refreshVectorStore();
      res.json({ message: "Vector store refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing vector store:", error);
      res.status(500).json({ error: "Failed to refresh vector store" });
    }
  });

  // Get LangSmith dashboard statistics
  app.get("/api/langchain/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await getLangSmithStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting LangSmith stats:", error);
      res.status(500).json({ error: "Failed to get LangSmith stats" });
    }
  });

  // Create evaluation dataset
  app.post("/api/langchain/evaluation/dataset", requireAdmin, async (req, res) => {
    try {
      const { name, examples } = req.body;
      
      if (!name || !examples || !Array.isArray(examples)) {
        return res.status(400).json({ error: "Name and examples array are required" });
      }
      
      const dataset = await createEvaluationDataset(name, examples);
      res.json(dataset);
    } catch (error) {
      console.error("Error creating evaluation dataset:", error);
      res.status(500).json({ error: "Failed to create evaluation dataset" });
    }
  });

  // Run evaluation on dataset
  app.post("/api/langchain/evaluation/run/:datasetId", requireAdmin, async (req, res) => {
    try {
      const { datasetId } = req.params;
      const results = await runEvaluation(datasetId);
      res.json(results);
    } catch (error) {
      console.error("Error running evaluation:", error);
      res.status(500).json({ error: "Failed to run evaluation" });
    }
  });

  // Get LangSmith project dashboard URL
  app.get("/api/langchain/dashboard", requireAdmin, async (req, res) => {
    try {
      res.json({
        projectName: "My Portfolio Chatbot",
        projectId: process.env.LANGCHAIN_PROJECT_ID,
        dashboardUrl: `https://smith.langchain.com/o/projects/${process.env.LANGCHAIN_PROJECT_ID}`,
        tracesUrl: `https://smith.langchain.com/o/projects/${process.env.LANGCHAIN_PROJECT_ID}/traces`,
        datasetsUrl: "https://smith.langchain.com/o/datasets"
      });
    } catch (error) {
      console.error("Error getting dashboard info:", error);
      res.status(500).json({ error: "Failed to get dashboard info" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
