# Portfolio Website - Dynamic Personal Portfolio

## Project Overview
A modern, responsive personal portfolio website built with React, TypeScript, and TailwindCSS. The site features a clean, professional design with smooth animations and interactive elements.

## Current Architecture
- Frontend: React with TypeScript, TailwindCSS, Shadcn UI components
- Backend: Node.js with Express
- Database: PostgreSQL with Drizzle ORM for data persistence
- Data: DatabaseStorage implementation for projects, blog posts, contact submissions, and resume files
- Animations: Framer Motion for smooth page transitions
- Analytics: PostHog for user behavior tracking

## Features
- Interactive homepage with navigation tiles
- Portfolio showcase with project filtering
- Blog section with categorized posts
- Top 5 Lists for curated content
- Contact form with email integration
- Responsive design for all devices
- Dark mode support

## Recent Changes
- **January 2025**: Restructured site navigation and home page
  - Moved personal introduction and skills section to dedicated About page (/about)
  - Created new Home page (/) with navigation tiles to all sections
  - Updated navigation bar to include separate Home and About links
  - Home page now focuses on site navigation rather than personal content
  - About page contains personal introduction, skills (Front-End/Back-End), and social links
  - Updated routing structure to reflect new page organization
- **January 2025**: Redesigned homepage with sleek tile-based interface
  - Completely removed top navigation bar for cleaner aesthetic
  - Created mixed asymmetrical layout with different sized tiles
  - Final layout: Large Nick.Lanahan brand tile (50% width) + 3 compact utility tiles (Contact, Resume, LinkedIn)
  - Bottom row: 4 main navigation tiles (About, Portfolio, Blog, Top 5 Lists)
  - Removed duplicate header section for maximum clean aesthetic
  - Implemented minimal navigation solution for non-home pages
  - Added support for external links (LinkedIn, Resume download)
  - Maintained all existing animations, glow effects, and color scheme
- **January 2025**: Implemented AI Content Polisher with anti-AI-detection measures
  - Created comprehensive OpenAI-powered content analysis system
  - Added real-time writing suggestions and style improvements
  - Integrated natural language processing for blog posts and excerpts
  - Implemented safeguards against AI-generated writing patterns
  - System specifically avoids telltale AI phrases like "Dive into," "It's important to note," "Certainly"
  - Encourages natural sentence variation, authentic voice, and specific details
  - Provides instant feedback through quick tips and comprehensive analysis
  - Integrated seamlessly into blog creation and editing workflow

- **January 2025**: Migrated from in-memory storage to PostgreSQL database persistence
  - Replaced MemStorage with DatabaseStorage class implementation
  - Created database tables for projects, blog posts, admins, contact submissions, and resume content
  - Migrated existing sample data to database with proper seeding
  - Updated API endpoints to use database storage instead of mock data
  - Added database schema synchronization with proper column handling
  - All content now persists across application restarts
  - Database credentials handled securely through environment variables

- **January 2025**: Created comprehensive test suite for quality assurance
  - Built automated API test suite covering all major functionality
  - Tests include admin authentication, project CRUD, blog management, contact forms, and public endpoints
  - Added test cleanup functionality to maintain clean test environment
  - Created simple test runner script (run-tests.js) for easy execution
  - Test coverage includes draft/publish workflow, file upload validation, and error handling
  - All tests pass with proper cleanup and session management

- **January 2025**: Enhanced admin system with improved navigation and content management
  - Added separate "Add New" and "Manage" buttons for better UX in admin dashboard
  - Created dedicated pages for adding new projects (AdminNewProjectPage) and blog posts (AdminNewBlogPage)
  - Enhanced project management with multi-media file upload support (up to 8 files per project)
  - Added thumbnail selection functionality for project media files
  - Improved admin dashboard layout with clearer separation of actions
  - Built complete admin system for content management with hidden authentication
  - Default admin credentials: username: admin, password: admin123
  - **Fixed project creation issues**: Made only title and description mandatory fields, added proper date handling for form submissions, and corrected image upload path issues
  - **Enhanced blog creation system**: 
    - Integrated Tiptap rich text editor with full WYSIWYG capabilities
    - Added cover image upload functionality with preview
    - Implemented draft mode system - all fields optional until published
    - Added separate "Save as Draft" and "Publish" buttons
    - Dynamic validation based on publish status
    - Fixed Tiptap extension conflicts
  - **Completed blog editing functionality**:
    - Fixed blog edit navigation paths and routing
    - Added comprehensive edit mode detection and data loading
    - Implemented proper form population for existing blog posts
    - Updated mutations to handle both create and update operations
    - Added loading states and dynamic UI text for edit mode
  - **Redesigned admin dashboard**:
    - Moved Quick Actions section to top of dashboard
    - Changed "Edit Resume" to "Upload Resume" button
    - Implemented single-resume system with automatic replacement
    - Added resume upload page with drag-and-drop functionality
    - Created resume file management with PDF-only support
    - Added public resume download endpoint
  - **Added markdown import/export functionality**:
    - Created markdown upload endpoint with frontmatter parsing
    - Added basic markdown-to-HTML conversion for imported content
    - Implemented markdown export with HTML-to-markdown conversion
    - Added import button on new blog post page for .md file uploads
    - Added export buttons on blog management and edit pages
    - Support for YAML frontmatter with metadata extraction
    - Automatic slug generation from imported titles
    - Fixed blog post update validation with proper date handling

- **January 2025**: Removed "My Experience" section completely
  - Removed navigation items and routes
  - Deleted ResumePage, ImmersiveTimelinePage, CarouselTimelinePage components
  - Removed resume data files and PDF generation
  - Cleaned up server routes and storage methods
  - Updated homepage grid to 3 columns (was 4)
  - Removed timeline CSS files and related assets

- **December 2024**: Integrated PostHog analytics
  - Added comprehensive event tracking for navigation, homepage tiles, and contact form
  - Privacy-conscious implementation (only tracks in production)
  - Configured with environment variables for API key and host

## Navigation Structure
- **Home** (/) - Homepage with navigation tiles to all sections
- **About** (/about) - Personal introduction, skills, and background
- **Portfolio** (/portfolio) - Project showcase and filtering
- **Blog** (/blog) - Blog posts with categories and tags
- **Top 5** (/top5) - Curated lists and recommendations
- **Contact** (/contact) - Contact form and social links

## User Preferences
- Clean, professional design aesthetic
- Focus on portfolio and blog content
- Privacy-conscious analytics implementation
- Responsive design for all screen sizes

## Development Notes
- Uses Replit's built-in development server
- Environment variables stored in Replit secrets
- PostHog analytics configured for production tracking only
- All components follow TypeScript best practices

## Testing
- Comprehensive test suite available in `/tests/` directory
- Run all tests with: `node run-tests.js`
- Individual API tests: `node tests/api-tests.js`
- Test coverage includes:
  - Admin authentication and session management
  - Project CRUD operations with image uploads
  - Blog management with draft/publish workflow
  - Contact form functionality
  - Public API endpoints
  - Resume management system
- Tests automatically clean up after execution
- Server must be running (npm run dev) before running tests