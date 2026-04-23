#!/bin/bash

# Anocab Unified Backend Deployment Script
# This script deploys ONLY the unified backend on port 1111

set -e

echo "🚀 Starting Anocab Unified Backend Deployment..."

# Navigate to project directory
cd /var/www/anocab

# Pull latest code
echo "📥 Pulling latest code..."
git stash
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
cd backend && npm install --production && cd ..

# Update nginx configuration
echo "🔧 Updating Nginx configuration..."
sudo cp -f nginx.conf /etc/nginx/sites-available/anocab-website

# Remove old conflicting configs
if [ -f "/etc/nginx/sites-enabled/anocab" ]; then
    sudo rm /etc/nginx/sites-enabled/anocab
    echo "🗑️  Removed old anocab config"
fi

# Ensure symlink exists
if [ ! -L "/etc/nginx/sites-enabled/anocab-website" ]; then
    sudo ln -sf /etc/nginx/sites-available/anocab-website /etc/nginx/sites-enabled/anocab-website
    echo "🔗 Created nginx symlink"
fi

# Test and reload nginx
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx config test passed"
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully"
else
    echo "❌ Nginx config test failed"
    exit 1
fi

# Stop all old PM2 processes
echo "🛑 Stopping old PM2 processes..."
pm2 delete all || true

# Start unified backend
echo "🚀 Starting unified backend..."
pm2 start ecosystem.config.js
pm2 save

# Show status
echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "🔍 Testing endpoints..."
sleep 3

# Test JWT endpoint
echo "Testing JWT..."
curl -s http://localhost:1111/test-jwt | jq '.' || echo "JWT test endpoint not responding"

echo ""
echo "Testing prices API..."
curl -s http://localhost:1111/api/prices | jq '.' || echo "Prices API not responding"

echo ""
echo "✅ All done! Unified backend is running on port 1111"
echo "🌐 Access at: https://anocab.com"
