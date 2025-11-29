# GitHub Setup & Deployment Guide

## Current Situation
- ✅ Folder renamed to `arshad-personal-website` (lowercase)
- ✅ Old repo: `https://github.com/art9793/personal-website.git` (static HTML site)
- ✅ Domain: `arshad-teli.com` → Currently pointing to old static site via Cloudflare

## Step 1: Prepare Code for GitHub

### 1.1 Commit All Changes
```bash
cd /Users/arshadteli/Desktop/my-projects/arshad-personal-website

# Stage all changes
git add .

# Commit
git commit -m "feat: complete portfolio website with CMS

- Full-stack Express + React application
- PostgreSQL database with Drizzle ORM
- Google Cloud Storage for file uploads
- Admin panel for content management
- Clean, production-ready codebase
- Railway deployment configuration"

# Check status
git status
```

### 1.2 Push to GitHub

**Option A: Replace Old Repo (Recommended)**
```bash
# This will replace your old static site
git push origin main --force
```

**Option B: Create New Branch First (Safer)**
```bash
# Create a backup branch of old site first
git checkout -b backup-old-static-site
git push origin backup-old-static-site

# Go back to main
git checkout main

# Push new code
git push origin main --force
```

**Option C: Create New Repo (Safest)**
```bash
# Create a new repo on GitHub (e.g., "personal-website-v2")
# Then:
git remote set-url origin https://github.com/art9793/personal-website-v2.git
git push origin main
```

---

## Step 2: Deploy to Railway

Since your app is **full-stack** (needs Node.js server, database, file uploads), Railway is the best choice.

### 2.1 Follow Railway Setup
See `RAILWAY_SETUP.md` for complete instructions.

Quick steps:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Add PostgreSQL
railway add postgresql

# Set environment variables
railway variables set SESSION_SECRET="$(openssl rand -base64 32)"
railway variables set GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account",...}'
railway variables set PRIVATE_OBJECT_DIR="/your-bucket/uploads"
railway variables set PUBLIC_OBJECT_SEARCH_PATHS="/your-bucket/public"

# Deploy
railway up

# Get your Railway URL
railway domain
```

### 2.2 Set Up Database
```bash
# Run migrations
railway run npm run db:push

# Import your data (if you exported it)
railway run tsx scripts/import-data.ts

# Create admin account
railway run tsx scripts/setup-admin.ts
```

---

## Step 3: Connect Domain to Railway

### 3.1 Add Custom Domain in Railway
1. Go to Railway Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter: `arshad-teli.com`
4. Railway will give you DNS instructions

### 3.2 Update Cloudflare DNS

Railway will provide DNS records. Update in Cloudflare:

**Option A: CNAME (Recommended)**
- Type: `CNAME`
- Name: `@` (or `arshad-teli.com`)
- Target: `your-app.railway.app` (or Railway's provided domain)
- Proxy: ✅ Enabled (orange cloud)

**Option B: A Record**
- Type: `A`
- Name: `@`
- Target: Railway's IP address (if provided)
- Proxy: ✅ Enabled

**Also add www subdomain:**
- Type: `CNAME`
- Name: `www`
- Target: `your-app.railway.app`
- Proxy: ✅ Enabled

### 3.3 Wait for SSL
- Railway automatically provisions SSL via Let's Encrypt
- Takes ~5-10 minutes
- Check Railway dashboard for status

---

## Step 4: Update Cloudflare Pages (If Using)

If your old site was on Cloudflare Pages, you can:

1. **Disable/Delete the old Pages project** (since Railway handles everything now)
2. **Or keep it** for a different subdomain

---

## Recommended Approach

### Best Option: Railway + Custom Domain

1. ✅ Deploy to Railway (follow `RAILWAY_SETUP.md`)
2. ✅ Add custom domain in Railway: `arshad-teli.com`
3. ✅ Update Cloudflare DNS as Railway instructs
4. ✅ Wait for SSL (~5 minutes)
5. ✅ Done!

**Why Railway?**
- ✅ Full-stack app support (not just static)
- ✅ Built-in PostgreSQL
- ✅ Handles SSL automatically
- ✅ Easy custom domains
- ✅ Better for CMS/admin features

---

## Alternative: Keep Old Site + New Subdomain

If you want to keep your old static site:

1. Deploy new app to Railway
2. Add subdomain in Cloudflare:
   - `app.arshad-teli.com` → Railway
   - `arshad-teli.com` → Keep old site
3. Or use path-based routing (more complex)

---

## Quick Checklist

- [ ] Commit all changes to git
- [ ] Push to GitHub (replace old repo or create new)
- [ ] Set up Railway account
- [ ] Deploy to Railway
- [ ] Set up PostgreSQL database
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Import your data
- [ ] Create admin account
- [ ] Add custom domain in Railway
- [ ] Update Cloudflare DNS
- [ ] Wait for SSL
- [ ] Test the site!

---

## Need Help?

See:
- `RAILWAY_SETUP.md` - Detailed Railway deployment
- `DEPLOY_TO_EXISTING_DOMAIN.md` - Domain deployment options
- `QUICK_START.md` - Quick reference

