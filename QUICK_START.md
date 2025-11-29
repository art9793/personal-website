# 🚀 Quick Start - Railway Deployment

This is a simplified guide to get you deployed quickly. For detailed steps, see `RAILWAY_SETUP.md`.

## ⚡ Fast Track (5 Steps)

### 1. Export Your Dev Data
```bash
npm run export-data
```
✅ Creates backup in `exports/` folder

### 2. Set Up Google Cloud Storage
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project
3. Enable "Cloud Storage API"
4. Create a bucket (remember the name!)
5. Create a service account with "Storage Admin" role
6. Download the JSON key file

### 3. Install Railway CLI & Login
```bash
npm install -g @railway/cli
railway login
```

### 4. Create Railway Project
```bash
cd /Users/arshadteli/Desktop/my-projects/Arshad-Personal-Website
railway init
railway add postgresql
```

### 5. Set Environment Variables
```bash
# Generate session secret
SESSION_SECRET=$(openssl rand -base64 32)

# Set all variables (replace values with your actual data)
railway variables set SESSION_SECRET="$SESSION_SECRET"
railway variables set GOOGLE_CLOUD_CREDENTIALS='<paste-your-json-key-here>'
railway variables set PRIVATE_OBJECT_DIR="/your-bucket-name/uploads"
railway variables set PUBLIC_OBJECT_SEARCH_PATHS="/your-bucket-name/public"
```

### 6. Deploy & Setup
```bash
# Deploy
railway up

# After deployment, get your URL
railway domain

# Set up database
railway run npm run db:push

# Import your data
railway run tsx scripts/import-data.ts

# Create admin account
railway run tsx scripts/setup-admin.ts

# Set deployment URL
railway variables set DEPLOYMENT_URL="https://your-app.railway.app"
```

## 🎯 That's It!

Visit your Railway URL and log in at `/admin/login`

---

## 📖 Need More Details?

See `RAILWAY_SETUP.md` for:
- Detailed GCS setup instructions
- Troubleshooting
- Best practices
- Custom domain setup

