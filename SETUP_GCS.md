# Google Cloud Storage Setup - Quick Guide

## Step 1: Create Bucket ✅
1. Click "+ Create bucket" or go to "Buckets" → "Create bucket"
2. Name: `arshad-portfolio-storage` (or your choice)
3. Location: Choose a region (e.g., `us-central1`)
4. Storage class: Standard
5. Access control: Uniform
6. Click "Create"

## Step 2: Create Service Account
1. Go to ☰ Menu → "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: `portfolio-storage-service`
4. Click "Create and Continue"
5. Grant role: **"Storage Admin"**
6. Click "Continue" → "Done"

## Step 3: Download JSON Key
1. Click on the service account you created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON"
5. Click "Create" - file downloads automatically
6. **Save this file securely!** You'll need it for Railway

## Step 4: Note Your Bucket Name
- Write down your bucket name (e.g., `arshad-portfolio-storage`)

## Step 5: Set Environment Variables

### For Local Development (.env file):
```bash
# Create .env file
cat > .env << 'EOF'
DATABASE_URL=your-database-url-here
SESSION_SECRET=$(openssl rand -base64 32)
GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account",...}' # Paste entire JSON content here
PRIVATE_OBJECT_DIR=/your-bucket-name/uploads
PUBLIC_OBJECT_SEARCH_PATHS=/your-bucket-name/public
EOF
```

### For Railway (after deployment):
```bash
# Set the JSON credentials (paste entire JSON file content)
railway variables set GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'

# Set bucket paths (replace with your actual bucket name)
railway variables set PRIVATE_OBJECT_DIR="/arshad-portfolio-storage/uploads"
railway variables set PUBLIC_OBJECT_SEARCH_PATHS="/arshad-portfolio-storage/public"
```

## Important Notes:
- The JSON file contains sensitive credentials - never commit it to git
- The `.env` file is already in `.gitignore` - safe to use locally
- For Railway, paste the ENTIRE JSON content as a string in the environment variable

