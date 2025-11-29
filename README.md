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

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **Storage**: Google Cloud Storage
- **Authentication**: Passport.js with session-based auth
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

# Start client only
npm run dev:client
```

### Build

```bash
npm run build
npm start
```

## 🔐 Admin Access

Default admin email: `art9793@gmail.com`

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
