#!/bin/bash

# Helper script to set up .env file
# Run this after you have your JSON key and DATABASE_URL

echo "🔧 Setting up .env file..."
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Get DATABASE_URL
echo "📝 Enter your DATABASE_URL (from Replit or your database):"
echo "   Format: postgresql://user:password@host:5432/dbname"
read -p "DATABASE_URL: " DATABASE_URL

# Generate SESSION_SECRET
SESSION_SECRET=$(openssl rand -base64 32)
echo "✅ Generated SESSION_SECRET"

# Get JSON file path
echo ""
echo "📁 Enter the path to your downloaded JSON key file:"
echo "   (e.g., ~/Downloads/your-project-xxxxx.json)"
read -p "JSON file path: " JSON_PATH

# Read JSON content
if [ -f "$JSON_PATH" ]; then
    JSON_CONTENT=$(cat "$JSON_PATH")
    echo "✅ Read JSON file"
else
    echo "❌ JSON file not found at: $JSON_PATH"
    exit 1
fi

# Create .env file
cat > .env << EOF
# Database Configuration
DATABASE_URL=$DATABASE_URL

# Session Secret
SESSION_SECRET=$SESSION_SECRET

# Google Cloud Storage Configuration
GOOGLE_CLOUD_CREDENTIALS='$JSON_CONTENT'

# Storage Paths
PRIVATE_OBJECT_DIR=/art9793-personal-website/uploads
PUBLIC_OBJECT_SEARCH_PATHS=/art9793-personal-website/public

# Server Port
PORT=5000
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "📋 Summary:"
echo "   - DATABASE_URL: Set"
echo "   - SESSION_SECRET: Generated"
echo "   - GOOGLE_CLOUD_CREDENTIALS: Set from JSON file"
echo "   - Bucket paths: /art9793-personal-website/uploads"
echo ""
echo "🚀 Next step: npm run export-data"

