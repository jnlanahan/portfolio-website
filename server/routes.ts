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
  insertProjectSchema,
  insertAdminSchema,
  insertResumeSchema,
  insertTopFiveListSchema,
  insertTopFiveListItemSchema
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

import { sendContactEmail, verifyConnection } from "./mailer";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directories if they don't exist
  const uploadsDir = path.join(process.cwd(), 'uploads', 'projects');
  const resumeUploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(resumeUploadsDir, { recursive: true });
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

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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

  // Public resume download endpoint
  app.get('/api/resume/download', async (req, res) => {
    try {
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
      res.setHeader('Content-Disposition', `attachment; filename="${resume.originalName || 'resume.pdf'}"`);
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

  const httpServer = createServer(app);
  return httpServer;
}
