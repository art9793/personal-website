# 🚂 Railway Deployment Guide - Step by Step

This guide will walk you through deploying your portfolio to Railway, including migrating your existing dev data.

## 📋 Prerequisites Checklist

Before we start, make sure you have:
- [ ] A GitHub account (to push your code)
- [ ] Your code pushed to a GitHub repository
- [ ] A Google Cloud account (for file storage - we'll set this up)

---

## Step 1: Export Your Development Data

First, let's save all your current data from your local development database:

```bash
# Make sure your local .env has your dev DATABASE_URL
npm run export-data
```

This will create a file in the `exports/` folder with all your data. **Keep this file safe!**

---

## Step 2: Set Up Google Cloud Storage

We need Google Cloud Storage for file uploads (images, avatars). Let's set it up:

### 2.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Name it something like "arshad-portfolio-storage"
4. Click "Create"

### 2.2 Enable Cloud Storage API

1. In the search bar, type "Cloud Storage API"
2. Click on it and press "Enable"

### 2.3 Create a Storage Bucket

1. Go to "Cloud Storage" → "Buckets" in the left menu
2. Click "Create Bucket"
3. Name it: `arshad-portfolio-storage` (or your preferred name)
4. Choose a location (e.g., `us-central1`)
5. Choose "Standard" storage class
6. Choose "Uniform" access control
7. Click "Create"

### 2.4 Create a Service Account

1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: `portfolio-storage-service`
4. Click "Create and Continue"
5. Grant role: **"Storage Admin"**
6. Click "Continue" → "Done"

### 2.5 Download Service Account Key

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON"
5. Click "Create" - this downloads a JSON file
6. **Save this file securely** - we'll need it in Step 4

---

## Step 3: Set Up Railway

### 3.1 Install Railway CLI

```bash
npm install -g @railway/cli
```

### 3.2 Login to Railway

```bash
railway login
```

This will open your browser to authenticate.

### 3.3 Create a New Project

```bash
# Navigate to your project directory
cd /Users/arshadteli/Desktop/my-projects/Arshad-Personal-Website

# Initialize Railway project
railway init
```

When prompted:
- Choose "Empty Project"
- Name it: `arshad-portfolio` (or your preferred name)

### 3.4 Add PostgreSQL Database

```bash
railway add postgresql
```

Railway will automatically:
- Create a PostgreSQL database
- Set the `DATABASE_URL` environment variable

### 3.5 Link Your GitHub Repository (Optional but Recommended)

1. Go to [railway.app](https://railway.app)
2. Open your project
3. Click "Settings" → "Source"
4. Connect your GitHub repository
5. Select your repository
6. Railway will auto-deploy on every push!

---

## Step 4: Set Environment Variables

Now let's configure all the environment variables Railway needs:

### 4.1 Generate Session Secret

```bash
# Generate a random secret
openssl rand -base64 32
```

Copy this output - we'll use it in the next step.

### 4.2 Set Variables via Railway CLI

```bash
# Set session secret (paste the output from above)
railway variables set SESSION_SECRET="<paste-your-generated-secret-here>"

# Set Google Cloud credentials
# Open the JSON file you downloaded in Step 2.5
# Copy the ENTIRE contents (it's one long JSON object)
# Then run:
railway variables set GOOGLE_CLOUD_CREDENTIALS='<paste-entire-json-here>'

# Set storage paths (replace 'arshad-portfolio-storage' with your bucket name)
railway variables set PRIVATE_OBJECT_DIR="/arshad-portfolio-storage/uploads"
railway variables set PUBLIC_OBJECT_SEARCH_PATHS="/arshad-portfolio-storage/public"

# Set deployment URL (Railway will provide this after first deploy)
# We'll set this after deployment, but you can set it now if you know it
# railway variables set DEPLOYMENT_URL="https://your-app.railway.app"
```

**Important Notes:**
- For `GOOGLE_CLOUD_CREDENTIALS`, paste the ENTIRE JSON file content as a single string
- Make sure to use single quotes around the JSON to preserve it
- The bucket name in paths should match your GCS bucket name

### 4.3 Alternative: Set Variables via Railway Dashboard

If you prefer using the web interface:

1. Go to [railway.app](https://railway.app)
2. Open your project
3. Click on your service
4. Go to "Variables" tab
5. Add each variable:
   - `SESSION_SECRET` = (your generated secret)
   - `GOOGLE_CLOUD_CREDENTIALS` = (your JSON string)
   - `PRIVATE_OBJECT_DIR` = `/your-bucket-name/uploads`
   - `PUBLIC_OBJECT_SEARCH_PATHS` = `/your-bucket-name/public`

---

## Step 5: Deploy to Railway

### 5.1 Push Your Code to GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 5.2 Deploy via Railway CLI

```bash
railway up
```

Or if you connected GitHub, Railway will auto-deploy!

### 5.3 Get Your Deployment URL

After deployment:

```bash
railway domain
```

Or check the Railway dashboard - your app URL will be shown there.

---

## Step 6: Set Up Database

### 6.1 Run Database Migrations

```bash
railway run npm run db:push
```

This creates all the tables in your production database.

### 6.2 Import Your Development Data

```bash
# First, make sure your local DATABASE_URL points to PRODUCTION
# Get your production DATABASE_URL from Railway:
railway variables

# Copy the DATABASE_URL value, then:
# Update your local .env file with the production DATABASE_URL temporarily
# OR use Railway's run command with the production database

# Import the data
railway run tsx scripts/import-data.ts
```

**Important:** When prompted, select the export file you created in Step 1.

### 6.3 Create Admin Account

```bash
railway run tsx scripts/setup-admin.ts
```

Enter a strong password for your admin account (email: art9793@gmail.com).

### 6.4 Update Deployment URL

After you have your Railway URL:

```bash
railway variables set DEPLOYMENT_URL="https://your-app.railway.app"
```

Replace `your-app.railway.app` with your actual Railway domain.

---

## Step 7: Verify Everything Works

1. **Visit your site:** Open your Railway URL in a browser
2. **Test login:** Go to `/admin/login` and log in
3. **Test file upload:** Try uploading an image in the admin panel
4. **Check your data:** Verify all your articles, projects, etc. are there

---

## 🎉 You're Live!

Your portfolio is now deployed! Railway will:
- Auto-deploy on every git push (if connected to GitHub)
- Handle SSL certificates automatically
- Scale as needed

---

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check your DATABASE_URL
railway variables

# Test connection
railway run node -e "console.log(process.env.DATABASE_URL)"
```

### File Upload Not Working
- Verify `GOOGLE_CLOUD_CREDENTIALS` is set correctly
- Check bucket name matches in `PRIVATE_OBJECT_DIR`
- Ensure service account has "Storage Admin" role

### Build Failures
- Check Railway logs: `railway logs`
- Verify Node.js version (should be 18+)
- Ensure all dependencies are in `package.json`

### Can't Access Admin
- Make sure you ran `setup-admin.ts` in production
- Check that your email matches `art9793@gmail.com`
- Verify `SESSION_SECRET` is set

---

## 📚 Next Steps

- [ ] Set up a custom domain (optional)
- [ ] Configure monitoring/alerts
- [ ] Set up backups for your database
- [ ] Review Railway usage/billing

---

## 💡 Tips

1. **Keep your export file safe** - it's your backup!
2. **Use Railway's dashboard** for easy variable management
3. **Check logs regularly** - `railway logs` is your friend
4. **Test locally first** - use production DATABASE_URL in local `.env` to test

---

Need help? Check Railway's docs: https://docs.railway.app

