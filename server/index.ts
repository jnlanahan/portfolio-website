import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pkg from "pg";
const { Pool } = pkg;
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { debugPaths, isRailwayEnvironment } from "./utils/paths.js";

// Initialize Express application
const app = express();

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Session configuration - using MemoryStore for now
app.use(session({
  secret: process.env.SESSION_SECRET || 'admin-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Enhanced logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const method = req.method;
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  // Log incoming request
  log(`⟶ [${requestId}] ${method} ${path} started`, 'request');
  
  // Capture request body for logging if appropriate
  const reqBody = req.body && Object.keys(req.body).length > 0 
    ? JSON.stringify(req.body) 
    : '(empty body)';
    
  if (path.startsWith("/api")) {
    log(`⟶ [${requestId}] Request body: ${reqBody}`, 'debug');
  }
  
  // Capture response data
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  const originalResJson = res.json;
  
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // On response completion
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Different log formatting based on status code
    let logPrefix = '✓';
    let logType = 'info';
    
    if (statusCode >= 400 && statusCode < 500) {
      logPrefix = '⚠';
      logType = 'warn';
    } else if (statusCode >= 500) {
      logPrefix = '✗';
      logType = 'error';
    }
    
    // Create log message
    let logLine = `${logPrefix} [${requestId}] ${method} ${path} ${statusCode} in ${duration}ms`;
    
    // Only log API responses with more detail
    if (path.startsWith("/api")) {
      if (capturedJsonResponse) {
        const responseStr = JSON.stringify(capturedJsonResponse);
        const shortResponse = responseStr.length > 100 
          ? responseStr.slice(0, 100) + '…' 
          : responseStr;
          
        logLine += ` :: ${shortResponse}`;
      }
      
      log(logLine, logType);
    }
  });

  next();
});

(async () => {
  // Debug path resolution in Railway
  if (isRailwayEnvironment()) {
    console.log("=== RAILWAY DEPLOYMENT DETECTED ===");
    debugPaths();
  }
  
  // Initialize data
  console.log("Initializing project data...");
  // Project and blog data initialization happens here
  
  // Verify email connection
  try {
    const { verifyConnection } = await import('./mailer.js');
    await verifyConnection();
  } catch (error) {
    console.warn("Email service connection failed:", error);
    console.warn("Contact form will save to database but won't send notification emails");
  }
  
  const server = await registerRoutes(app);

  // Add a simple API test to see if Express is working
  app.get('/debug', (req, res) => {
    res.json({ message: 'Express is working!', timestamp: new Date() });
  });

  // Enhanced error handling middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    // Get error details
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const stack = app.get('env') === 'development' ? err.stack : undefined;
    
    // Create error response object
    const errorResponse = { 
      message,
      status,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    };
    
    // Only include stack trace in development
    if (stack) {
      Object.assign(errorResponse, { stack });
    }
    
    // Log the error
    log(`ERROR [${req.method} ${req.path}]: ${message}`, 'error');
    if (stack) {
      log(`Stack: ${stack}`, 'error');
    }
    
    // Send error response
    res.status(status).json(errorResponse);
    
    // Don't throw error as that can crash the server
    // Instead, we've already logged it and sent a response
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Server port configuration  
  const port = process.env.PORT || 3001;
  const apiPort = process.env.API_PORT || 3002;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  server.listen(port, host, () => {
    log(`serving on http://${host}:${port}`);
  });
})();
