# Arshad Teli - Personal Portfolio Website

A modern, full-stack personal portfolio website with a built-in CMS for managing content.

## 🚀 Features

- **Portfolio Showcase** - Display projects, work experience, and articles
- **Blog System** - Rich text editor for writing articles
- **Admin Panel** - Full CMS for managing all content
- **File Uploads** - Google Cloud Storage integration for images
- **Responsive Design** - Beautiful UI that works on all devices
- **Dark Mode** - Built-in theme switching

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Database**: PostgreSQL
- **Storage**: Google Cloud Storage
- **Authentication**: NextAuth credentials
- **ORM**: Drizzle ORM

## 📦 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Cloud Storage bucket

### Installation

```bash
npm install
```

### Development

```bash
# Start dev server
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

If object storage features are enabled, also set:
- `PRIVATE_OBJECT_DIR`
- `PUBLIC_OBJECT_SEARCH_PATHS`
- `GOOGLE_CLOUD_CREDENTIALS` (or `GOOGLE_APPLICATION_CREDENTIALS`)

## 🔐 Admin Access

The admin email is configured via the `ADMIN_EMAIL` environment variable.
Default: `art9793@gmail.com`

To set up admin account:

```bash
tsx scripts/setup-admin.ts
```

For production (Railway):

```bash
railway run tsx scripts/setup-admin-noninteractive.ts
```

## 📝 License

MIT

## 👤 Author

Arshad Teli - [arshad-teli.com](https://arshad-teli.com)
