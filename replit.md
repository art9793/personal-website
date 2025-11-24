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
- Email/password authentication system
- Passport.js Local Strategy for credential verification
- Bcrypt for password hashing (10 salt rounds)
- Email-based access control (hardcoded admin email: art9793@gmail.com)
- Protected routes using `isAuthenticated` and `isAdmin` middleware
- Session storage in PostgreSQL database via connect-pg-simple

### Data Storage

**Database**
- PostgreSQL via Neon serverless driver (@neondatabase/serverless)
- WebSocket connection pooling for serverless environments
- Drizzle ORM for type-safe database operations
- Schema-first approach with shared types between client and server

**Database Schema**
- `sessions`: Express session storage for authentication
- `users`: User accounts with email/password credentials
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
- Email/password authentication with Passport Local Strategy
- Bcrypt for secure password hashing
- Required environment variables: SESSION_SECRET, DATABASE_URL
- Session store: connect-pg-simple for PostgreSQL session persistence
- Admin setup script: `tsx scripts/setup-admin.ts` for initial account creation

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

**Object Storage**
- Replit Object Storage integration for file uploads
- @google-cloud/storage for GCS bucket access
- Custom ObjectUploader component with minimal UI design
- Per-modal Uppy instance lifecycle for clean state management
- ACL-based access control for public/private objects
- Profile avatars stored with public visibility for homepage display

## Recent Changes

### November 24, 2025: Authentication System Migration
- Migrated from Replit Auth (OIDC) to email/password authentication
- Implemented Passport Local Strategy for credential verification
- Added password field to users table with bcrypt hashing (10 salt rounds)
- Created new login page with email/password form
- Updated authentication routes: POST /api/auth/login and /api/auth/logout
- Simplified middleware (removed token refresh logic)
- Created admin setup script (`tsx scripts/setup-admin.ts`) for initial account creation
- Removed Replit Auth dependencies (openid-client, google-auth-library)
- Session management remains unchanged (connect-pg-simple with PostgreSQL)

### November 23, 2025: Admin Dashboard UI/UX Refinements - World-Class Minimalistic Design
- **Custom Upload Modal**: Replaced Uppy Dashboard with custom minimal design
  - Clean drag-and-drop area with image preview
  - Refined upload/cancel buttons with loading states and progress indicator
  - Per-modal Uppy instance lifecycle (create on open, destroy on close) for reliable uploads
  - Proper cleanup and retry handling to prevent duplicate file errors
- **Home Page Settings Redesign**: Restructured with improved visual hierarchy
  - Sectioned layout: Profile Picture, Profile Information, Social Links
  - Each section has descriptive header and muted background containers
  - Cleaner social links with icon badges and inline toggle switches
  - Improved spacing and breathing room throughout
- **Writing Table Enhancement**: Added word count column
  - Positioned before "Read Time" column
  - Calculates actual words from article content (not HTML)
  - Displays formatted numbers (e.g., "1,234") with monospace font
- **Article Editor Polish**: Refined header and title input
  - Reduced header height to h-14 (3.5rem) for more minimal feel
  - Cleaner word count display with monospace font and subtle separators
  - Notion-style title input: borderless, shadowless, seamless integration
  - Viewport calculations properly aligned (h-14 matches calc(100vh-3.5rem))
- **Design Philosophy**: Consistent minimalistic aesthetic throughout admin interface
  - Subtle borders and muted backgrounds for visual hierarchy
  - Reduced visual noise with smaller icons and cleaner layouts
  - Better spacing and use of whitespace
  - Monospace fonts for numerical data

### November 23, 2025: Profile Avatar Upload Feature
- Removed hardcoded placeholder profile image (logo.jpg)
- Implemented avatar upload functionality through admin dashboard
- Built ObjectUploader component using Uppy Dashboard with image-only restrictions
- Integrated with Replit Object Storage for secure cloud hosting
- Avatars stored with public ACL, accessible to unauthenticated homepage visitors
- Upload flow: presigned URL generation → Uppy upload → ACL configuration → database persistence
- Homepage conditionally renders avatar only when profile.avatarUrl exists
- Enhanced social icons with brand-specific colors (Twitter blue, LinkedIn blue, GitHub dark) and hover effects

### November 22-23, 2025: Article Editor Redesign & Publishing Workflow
- Redesigned article editor into world-class publishing experience
- Split editing into two distinct modes: Write Mode (clean distraction-free editor) and Publish Mode (comprehensive metadata and publishing controls)
- Publish Mode uses Sheet overlay with validation checklist (title, slug, description, cover image, featured image, excerpt, SEO)
- Removed inline publish button from editor for cleaner UX
- Added auto-save functionality for drafts
- Improved cache invalidation after article updates
- Fixed back button routing from article detail to proper list view
- Enhanced routing with consistent /admin/articles/* pattern