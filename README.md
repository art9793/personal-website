# Arshad Teli - Personal Portfolio Website

A modern, full-stack personal portfolio website with a built-in CMS for managing content.

## Features

- **Portfolio Showcase** - Display projects, work experience, and articles
- **Blog System** - Rich text editor for writing articles
- **Admin Panel** - Full CMS for managing all content
- **File Uploads** - Vercel Blob integration for images
- **Responsive Design** - Beautiful UI that works on all devices
- **Dark Mode** - Built-in theme switching

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Database**: PostgreSQL (Neon via Vercel Marketplace)
- **Storage**: Vercel Blob
- **Authentication**: NextAuth credentials
- **ORM**: Drizzle ORM
- **Hosting**: Vercel

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Vercel Blob store

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
npm start
```

### Production Env Preflight

```bash
npm run check:prod-env
```

Required in production:
- `DATABASE_URL`
- `NEXTAUTH_SECRET` (or `AUTH_SECRET`)
- `BLOB_READ_WRITE_TOKEN` (for file uploads)

## Admin Access

The admin email is configured via the `ADMIN_EMAIL` environment variable.
Default: `art9793@gmail.com`

## License

MIT

## Author

Arshad Teli - [arshad-teli.com](https://arshad-teli.com)
