# Portfolio Website - Dynamic Personal Portfolio

## Project Overview
A modern, responsive personal portfolio website built with React, TypeScript, and TailwindCSS. The site features a clean, professional design with smooth animations and interactive elements.

## Current Architecture
- Frontend: React with TypeScript, TailwindCSS, Shadcn UI components
- Backend: Node.js with Express
- Data: In-memory storage with flat file fallback
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
- **January 2025**: Built complete admin system for content management
  - Added hidden admin authentication system (/admin/login)
  - Created admin dashboard with project, blog, and contact management
  - Implemented admin routes for CRUD operations on content
  - Added session-based authentication with express-session
  - Built admin interface for project management with full CRUD
  - Added resume editor with markdown support for content management
  - Default admin credentials: username: admin, password: admin123

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
- **About** (/) - Homepage with overview and navigation tiles
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