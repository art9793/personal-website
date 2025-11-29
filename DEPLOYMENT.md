# Deployment Guide

This guide will help you deploy your personal portfolio website to various platforms.

## Prerequisites

Before deploying, you'll need:

1. **PostgreSQL Database** - You can get one from:
   - [Neon](https://neon.tech) (free tier available)
   - [Railway](https://railway.app) (includes database)
   - [Render](https://render.com) (includes database)
   - [Supabase](https://supabase.com) (free tier available)

2. **Google Cloud Storage** (for file uploads):
   - Create a GCS bucket
   - Create a service account with Storage Admin permissions
   - Download the service account JSON key

3. **Environment Variables** - See `.env.example` for all required variables

## Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Initialize project:**
   ```bash
   railway init
   ```

4. **Add PostgreSQL:**
   ```bash
   railway add postgresql
   ```

5. **Set environment variables:**
   ```bash
   # Generate a session secret
   railway variables set SESSION_SECRET=$(openssl rand -base64 32)
   
   # Set Google Cloud credentials (paste your JSON)
   railway variables set GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account",...}'
   
   # Set storage paths (replace with your bucket name)
   railway variables set PRIVATE_OBJECT_DIR=/your-bucket-name/uploads
   railway variables set PUBLIC_OBJECT_SEARCH_PATHS=/your-bucket-name/public
   
   # Set deployment URL (will be set automatically, but you can override)
   railway variables set DEPLOYMENT_URL=https://your-app.railway.app
   ```

6. **Deploy:**
   ```bash
   railway up
   ```

7. **Run database migrations:**
   ```bash
   railway run npm run db:push
   ```

8. **Set up admin account:**
   ```bash
   railway run tsx scripts/setup-admin.ts
   ```

### Option 2: Render

1. **Push your code to GitHub**

2. **Go to [Render Dashboard](https://dashboard.render.com)**

3. **Create a New Web Service:**
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`
   - Or manually configure:
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`

4. **Add PostgreSQL Database:**
   - Create a new PostgreSQL database
   - Render will automatically set `DATABASE_URL`

5. **Set Environment Variables:**
   - `SESSION_SECRET` - Generate with: `openssl rand -base64 32`
   - `GOOGLE_CLOUD_CREDENTIALS` - Your GCS service account JSON
   - `PRIVATE_OBJECT_DIR` - Your GCS bucket path
   - `PUBLIC_OBJECT_SEARCH_PATHS` - Your public bucket paths
   - `DEPLOYMENT_URL` - Your Render URL

6. **Deploy and run migrations:**
   ```bash
   # After first deployment, run migrations
   render run npm run db:push
   render run tsx scripts/setup-admin.ts
   ```

### Option 3: Fly.io

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Create app:**
   ```bash
   fly launch
   ```

4. **Add PostgreSQL:**
   ```bash
   fly postgres create
   fly postgres attach <postgres-app-name>
   ```

5. **Set secrets:**
   ```bash
   fly secrets set SESSION_SECRET=$(openssl rand -base64 32)
   fly secrets set GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account",...}'
   fly secrets set PRIVATE_OBJECT_DIR=/your-bucket-name/uploads
   fly secrets set PUBLIC_OBJECT_SEARCH_PATHS=/your-bucket-name/public
   ```

6. **Deploy:**
   ```bash
   fly deploy
   ```

7. **Run migrations:**
   ```bash
   fly ssh console -C "npm run db:push"
   fly ssh console -C "tsx scripts/setup-admin.ts"
   ```

## Setting Up Google Cloud Storage

1. **Create a GCS Bucket:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new bucket
   - Note the bucket name

2. **Create Service Account:**
   - Go to IAM & Admin > Service Accounts
   - Create a new service account
   - Grant "Storage Admin" role
   - Create and download JSON key

3. **Configure Environment Variables:**
   - Copy the entire JSON content
   - Set as `GOOGLE_CLOUD_CREDENTIALS` environment variable
   - Or save as file and set `GOOGLE_APPLICATION_CREDENTIALS` path

4. **Set Storage Paths:**
   - `PRIVATE_OBJECT_DIR`: `/your-bucket-name/uploads`
   - `PUBLIC_OBJECT_SEARCH_PATHS`: `/your-bucket-name/public`

## Post-Deployment Steps

1. **Run Database Migrations:**
   ```bash
   npm run db:push
   ```

2. **Create Admin Account:**
   ```bash
   tsx scripts/setup-admin.ts
   ```

3. **Test Your Deployment:**
   - Visit your app URL
   - Test login at `/admin/login`
   - Test file uploads in the admin panel

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Random secret for sessions (32+ chars) |
| `GOOGLE_CLOUD_CREDENTIALS` | ✅* | GCS service account JSON (string) |
| `GOOGLE_APPLICATION_CREDENTIALS` | ✅* | Path to GCS credentials file (alternative) |
| `PRIVATE_OBJECT_DIR` | ✅ | GCS bucket path for uploads |
| `PUBLIC_OBJECT_SEARCH_PATHS` | ✅ | Comma-separated public paths |
| `DEPLOYMENT_URL` | ⚠️ | Your app URL (for meta tags) |
| `PORT` | ⚠️ | Server port (auto-set by platform) |

*One of the Google Cloud credentials options is required

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database allows connections from your deployment IP
- Ensure SSL is configured if required

### File Upload Issues
- Verify GCS credentials are correct
- Check bucket permissions
- Ensure `PRIVATE_OBJECT_DIR` and `PUBLIC_OBJECT_SEARCH_PATHS` are correct

### Build Failures
- Ensure Node.js version is 18+ (check `package.json` engines)
- Check build logs for missing dependencies
- Verify all environment variables are set

## Support

If you encounter issues:
1. Check deployment logs
2. Verify all environment variables
3. Test locally with the same environment variables
4. Check platform-specific documentation

