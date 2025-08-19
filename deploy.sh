#!/bin/bash

# Deployment script for Next.js static export
# This ensures the correct Node.js version is used for building and includes S3 sync

set -e

echo "🚀 Starting deployment process..."

# Fix npm config prefix issue for nvm
unset npm_config_prefix 2>/dev/null || true

# Source NVM and use the correct Node.js version
source ~/.nvm/nvm.sh
nvm use 20.11.1

echo "✅ Using Node.js $(node --version)"
echo "✅ Using npm $(npm --version)"

# Clean previous build
if [ -d "out" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf out
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ -d "out" ]; then
    echo "✅ Build successful! Output directory created."
    
    # Copy RSC payload files to fix Next.js App Router navigation
    echo "� Fixing RSC payload file locations..."
    
    # Copy login/index.txt to login.txt for direct route access
    if [ -f "out/login/index.txt" ]; then
        cp "out/login/index.txt" "out/login.txt"
        echo "  ✅ Copied login/index.txt to login.txt"
    fi
    
    # Copy other route payload files if they exist
    for dir in out/*/; do
        if [ -d "$dir" ] && [ -f "${dir}index.txt" ]; then
            route_name=$(basename "$dir")
            if [ "$route_name" != "_next" ] && [ "$route_name" != "404" ]; then
                cp "${dir}index.txt" "out/${route_name}.txt"
                echo "  ✅ Copied ${route_name}/index.txt to ${route_name}.txt"
            fi
        fi
    done
    
    echo "�📊 Build statistics:"
    find out -type f -name "*.html" | wc -l | xargs echo "  - HTML files:"
    find out -type f -name "*.txt" | wc -l | xargs echo "  - RSC payload files:"
    find out -type f -name "*.js" | wc -l | xargs echo "  - JavaScript files:"
    
    echo "🔍 Critical files check:"
    if [ -f "out/login/index.txt" ]; then
        echo "  ✅ login/index.txt exists"
    else
        echo "  ❌ login/index.txt missing!"
        exit 1
    fi
    
    if [ -f "out/login.txt" ]; then
        echo "  ✅ login.txt exists (fixes RSC infinite loop)"
    else
        echo "  ❌ login.txt missing!"
        exit 1
    fi
    
else
    echo "❌ Build failed! Output directory not found."
    exit 1
fi

# Deploy to S3
echo "� Deploying to S3..."
echo "📤 Syncing files to s3://dashboard.glidexpay.com..."

# Check if AWS CLI is available
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    exit 1
fi

# Sync to S3 with cache control headers
aws s3 sync out/ s3://dashboard.glidexpay.com \
    --delete \
    --cache-control max-age=31536000,public \
    --exclude "*.html" \
    --exclude "*.txt"

# Upload HTML files with shorter cache (for dynamic content)
aws s3 sync out/ s3://dashboard.glidexpay.com \
    --cache-control max-age=300,public \
    --exclude "*" \
    --include "*.html"

# Upload RSC payload files with shorter cache (important for navigation)
aws s3 sync out/ s3://dashboard.glidexpay.com \
    --cache-control max-age=300,public \
    --exclude "*" \
    --include "*.txt"

echo "✅ S3 sync completed!"

# Optional: CloudFront invalidation (uncomment and add your distribution ID)
# echo "� Invalidating CloudFront cache..."
# aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
# echo "✅ CloudFront invalidation initiated!"

echo "🎉 Deployment completed successfully!"
echo "🌍 Your app is now live at: http://dashboard.glidexpay.com.s3-website.ap-south-1.amazonaws.com/"
