# Portfolio Website

## Overview

A modern, full-stack personal portfolio website built for a Product Manager. The application features a content management system (CMS) for managing articles, projects, work experience, and reading lists. The site includes both a public-facing portfolio and an authenticated admin dashboard for content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (alternative to React Router)
- TanStack Query (React Query) for server state management and data fetching

**UI Component Library**
- Shadcn UI with Radix UI primitives for accessible, customizable components
- Tailwind CSS v4 (via @tailwindcss/vite plugin) for utility-first styling
- New York style variant with neutral base color scheme
- Lucide React for consistent iconography

**Rich Text Editing - World-Class Editor**
- TipTap editor with comprehensive formatting capabilities comparable to Notion/Google Docs
- **Toolbar Features:**
  - Text formatting: Bold, italic, underline, strikethrough, inline code, highlight
  - Headings: H1, H2, H3, H4
  - Lists: Bullet lists, numbered lists
  - Blocks: Blockquotes, code blocks with syntax highlighting, horizontal rules
  - Media: Images (base64 upload), links with auto-detection
  - History: Undo/redo support
- **Slash Commands:**
  - Type "/" to open quick formatting menu
  - Keyboard navigation (arrow keys + enter) and mouse selection
  - Filterable options for instant access to formatting
  - Commands: Headings (1-3), Bullet List, Numbered List, Quote, Code Block, Divider
- **Code Block Syntax Highlighting:**
  - CodeBlockLowlight with lowlight library
  - Common language pack support (JavaScript, TypeScript, Python, etc.)
  - Color-coded syntax tokens (keywords, strings, comments, etc.)
  - Light/dark mode compatible highlighting
- **Technical Implementation:**
  - Extensions: StarterKit, Underline, Strike, Highlight, CodeBlockLowlight, HorizontalRule, TextStyle, Color, Image, Link, Placeholder
  - Custom slash command extension using TipTap Suggestion plugin
  - Tippy.js for dropdown positioning
  - ReactRenderer for menu component integration
  - Comprehensive prose CSS for both editor (.ProseMirror) and public website (.prose)

**Design System**
- Custom CSS variables for theming (light/dark mode support)
- Consistent spacing, typography, and color tokens
- Component variants using class-variance-authority (CVA)

### Backend Architecture

**Server Framework**
- Express.js for the HTTP server and API routing
- Separate development (index-dev.ts) and production (index-prod.ts) entry points
- Development mode integrates Vite middleware for HMR
- Production mode serves pre-built static assets

**API Design Pattern**
- RESTful API endpoints under `/api` namespace
- Route handlers in `server/routes.ts` for centralized API logic
- Storage abstraction layer (`server/storage.ts`) implementing the repository pattern
- Middleware-based authentication and authorization

**Authentication & Authorization**
- Replit Auth integration via OpenID Connect (OIDC)
- Passport.js strategy for session-based authentication
- Email-based access control (hardcoded admin email: art9793@gmail.com)
- Protected routes using `isAuthenticated` and `isAdmin` middleware
- Session storage in PostgreSQL database

### Data Storage

**Database**
- PostgreSQL via Neon serverless driver (@neondatabase/serverless)
- WebSocket connection pooling for serverless environments
- Drizzle ORM for type-safe database operations
- Schema-first approach with shared types between client and server

**Database Schema**
- `sessions`: OIDC session storage for authentication
- `users`: User profile information from Replit Auth
- `profiles`: Site owner profile information (singleton)
- `articles`: Blog posts with slug-based routing, SEO metadata, and publishing workflow
- `projects`: Portfolio projects with featured flag and status
- `workExperiences`: Employment history timeline
- `readingList`: Books with ratings and reading status

**Data Validation**
- Zod schemas derived from Drizzle table definitions via `drizzle-zod`
- Input validation on API endpoints using schema parsing
- Type safety across the full stack (shared schema types)

### External Dependencies

**Database**
- Neon PostgreSQL (serverless) - DATABASE_URL environment variable required
- Connection pooling via @neondatabase/serverless with WebSocket support (ws package)

**Authentication**
- Replit Auth OIDC provider
- Required environment variables: ISSUER_URL, REPL_ID, SESSION_SECRET
- Session store: connect-pg-simple for PostgreSQL session persistence

**Development Tools**
- Replit-specific Vite plugins:
  - @replit/vite-plugin-runtime-error-modal for error overlay
  - @replit/vite-plugin-cartographer for code exploration
  - @replit/vite-plugin-dev-banner for development indicators
- Custom vite-plugin-meta-images for OpenGraph image URL injection

**Build & Deployment**
- esbuild for server-side bundling in production
- Vite for client-side bundling and optimization
- Static asset serving from dist/public in production

**Type System**
- TypeScript with strict mode enabled
- Path aliases: @/ (client), @shared/ (shared schema), @assets/ (attached assets)
- Module resolution: bundler mode for maximum compatibility