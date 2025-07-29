# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (runs both frontend and backend)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check

# Database operations
npm run db:push  # Push schema changes to database
```

## Architecture Overview

This is a full-stack personal portfolio application with the following structure:

- **Frontend**: React + TypeScript + Vite (located in `client/`)
- **Backend**: Express.js server (located in `server/`)
- **Database**: PostgreSQL with Drizzle ORM
- **Shared**: Common types and schemas (located in `shared/`)

### Key Architectural Patterns

1. **Monorepo Structure**: Single repository with client, server, and shared code
2. **Database First**: Schema defined in `shared/schema.ts` using Drizzle ORM
3. **Type Safety**: Shared TypeScript types between frontend and backend
4. **Path Aliases**: `@/` for client src, `@shared/` for shared code, `@assets/` for attached assets

### Database Schema

The application uses a comprehensive database schema (`shared/schema.ts`) including:
- User authentication (admins, users, security questions)
- Content management (projects, blog posts, blog series)
- Interactive features (contact submissions, top 5 lists, carousel images)
- AI chatbot system (documents, conversations, evaluations, training)
- Analytics and feedback systems

### Frontend Architecture

- **UI Framework**: React with shadcn/ui components
- **Styling**: Tailwind CSS with custom theme system
- **Routing**: Wouter for client-side routing
- **State Management**: React Query for server state
- **Analytics**: PostHog integration

### Backend Architecture

- **Framework**: Express.js with TypeScript
- **Authentication**: Session-based auth with express-session
- **File Handling**: Multer for uploads (supports PDF, DOCX, images)
- **AI Integration**: OpenAI GPT for chatbot functionality with ChromaDB vector storage
- **Email**: SendGrid for contact form notifications

### Important Configuration

- **Vite Config**: Custom path resolution with Railway deployment compatibility
- **TypeScript**: Shared paths configuration for monorepo structure
- **Database**: Uses environment variable `DATABASE_URL` for PostgreSQL connection
- **Deployment**: Configured for Railway platform with nixpacks builder

### Testing

Tests are located in the `tests/` directory with various test suites:
- API functionality tests
- Frontend component tests
- LangSmith integration tests
- Content management tests

### File Upload System

The application handles multiple file types:
- **Project files**: Images, videos, documents (stored in `uploads/projects/`)
- **Chatbot documents**: PDFs, DOCX files for AI training (stored in `uploads/chatbot/`)
- **Carousel images**: Profile and lifestyle photos (stored in `uploads/carousel/`)
- **Resume uploads**: PDF resumes (stored in `uploads/resumes/`)

### AI Chatbot Features

Advanced chatbot system with:
- Document ingestion (PDF/DOCX parsing)
- Vector storage using ChromaDB
- LangChain integration for enhanced responses
- Automated evaluation system with scoring
- Learning insights from conversation analysis
- System prompt template management

### Development Notes

- Uses Railway for production deployment
- Migrated from Replit (migration tools available in `migration-tools/`)
- Supports both development and production static file serving
- Comprehensive error handling and logging system
- Session-based admin authentication with recovery questions