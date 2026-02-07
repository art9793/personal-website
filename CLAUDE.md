# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack personal portfolio website with a built-in CMS. React 19 frontend + Express.js backend, PostgreSQL database, Google Cloud Storage for files, deployed on Railway.

## Commands

```bash
npm run dev              # Full-stack dev server with Vite HMR (port 5000)
npm run dev:client       # Vite client-only dev server (port 5000)
npm run build            # Production build (Vite + esbuild)
npm start                # Run production server from dist/
npm run check            # TypeScript type-check (tsc)
npm run db:push          # Apply Drizzle schema changes to database
npm run export-data      # Export database to JSON
npm run import-data      # Import JSON to database
tsx scripts/setup-admin.ts  # Interactive admin account setup
```

No test framework is configured. No linter/formatter is configured.

## Architecture

### Monorepo Structure (3 zones)

- **`client/src/`** — React 19 SPA (Vite, Tailwind CSS 4, wouter for routing)
- **`server/`** — Express.js API server
- **`shared/schema.ts`** — Single source of truth for database schema (Drizzle ORM) and Zod validators, imported by both client and server

### Path Aliases

- `@/` → `client/src/`
- `@shared/` → `shared/`

### Frontend (`client/src/`)

- **Routing:** Wouter (not React Router). Routes defined in `App.tsx`.
- **Data fetching:** TanStack React Query. Custom hooks in `lib/content-hooks.tsx`.
- **UI components:** shadcn/ui + Radix UI primitives in `components/ui/`.
- **Pages:** `pages/` for public, `pages/admin/` for CMS. Admin dashboard uses tab components in `pages/admin/dashboard-tabs/`.
- **Rich text editor:** TipTap with custom extensions (images with resize, code blocks, tasks). Editor component at `components/admin/editor.tsx`.
- **Theming:** next-themes (dark/light mode).
- **Code splitting:** Manual chunks configured in `vite.config.ts` for leaflet, tiptap, framer-motion, recharts.

### Backend (`server/`)

- **`app.ts`** — Express app configuration, middleware stack (Helmet CSP, compression, sessions, CSRF, rate limiting)
- **`routes.ts`** — All API routes (~900 lines). Public endpoints serve content, admin endpoints require auth.
- **`auth.ts`** — Passport.js local strategy, session-based auth with PostgreSQL session store. Admin determined by `ADMIN_EMAIL` env var.
- **`storage.ts`** — Data access layer (IStorage interface) using Drizzle ORM.
- **`objectStorage.ts`** — Google Cloud Storage service for file uploads.
- **`index-dev.ts`** / **`index-prod.ts`** — Dev (Vite HMR middleware) and production (static file serving) entry points.

### Database

PostgreSQL via Drizzle ORM. Schema in `shared/schema.ts`. Tables: users, profiles, sessions, articles (with slug index), projects, workExperiences, readingList, travelHistory, seoSettings.

Migrations output to `migrations/` directory. Use `npm run db:push` to apply schema changes (not migration files).

### Security Patterns

- CSRF: Origin/Referer validation on mutating requests (strict in production)
- Rate limiting: Auth endpoints (5/15min), view tracking (10/min), general API (100/min)
- CSP via Helmet: allows Umami analytics, GCS images, YouTube/Vimeo/CodePen embeds
- Admin routes protected by `isAuthenticated` + `isAdmin` middleware

### Key Environment Variables

`DATABASE_URL`, `SESSION_SECRET`, `GOOGLE_CLOUD_CREDENTIALS` (JSON), `ADMIN_EMAIL`, `VITE_ADMIN_EMAIL`, `PRIVATE_OBJECT_DIR`, `PUBLIC_OBJECT_SEARCH_PATHS`, `DEPLOYMENT_URL`

### Build Pipeline

- Client: Vite builds to `dist/public/`
- Server: esbuild bundles `server/index-prod.ts` to `dist/index.js`
- Docker: Multi-stage build (Node 20 Alpine)
- Railway: Nixpacks builder with `railway.json` config
