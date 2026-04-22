#!/bin/bash

echo "🔍 Debug Session Issue - Anocab Backend"
echo "========================================"
echo ""

# Check if .env file exists and has MONGODB_URI
echo "1️⃣ Checking .env file..."
if [ -f "/var/www/anocab/backend/.env" ]; then
    echo "✅ .env file exists"
    if grep -q "MONGODB_URI" /var/www/anocab/backend/.env; then
        echo "✅ MONGODB_URI found in .env"
        echo "   Value: $(grep MONGODB_URI /var/www/anocab/backend/.env | cut -d'=' -f1)=***"
    else
        echo "❌ MONGODB_URI NOT found in .env"
    fi
else
    echo "❌ .env file NOT found"
fi
echo ""

# Check ecosystem.config.js
echo "2️⃣ Checking ecosystem.config.js..."
if grep -q "MONGODB_URI" /var/www/anocab/ecosystem.config.js; then
    echo "✅ MONGODB_URI found in ecosystem.config.js"
else
    echo "❌ MONGODB_URI NOT found in ecosystem.config.js"
fi
echo ""

# Check server.js for session configuration
echo "3️⃣ Checking server.js session configuration..."
if grep -q "MongoStore.create" /var/www/anocab/backend/server.js; then
    echo "✅ MongoStore.create found in server.js"
else
    echo "❌ MongoStore.create NOT found - still using MemoryStore!"
fi
echo ""

# Check if connect-mongo is installed
echo "4️⃣ Checking if connect-mongo is installed..."
if [ -d "/var/www/anocab/backend/node_modules/connect-mongo" ]; then
    echo "✅ connect-mongo is installed"
else
    echo "❌ connect-mongo NOT installed"
    echo "   Run: cd /var/www/anocab/backend && npm install connect-mongo"
fi
echo ""

# Check PM2 environment variables
echo "5️⃣ Checking PM2 environment variables..."
pm2 show anocab-website-backend | grep -A 20 "env:"
echo ""

# Check recent logs for errors
echo "6️⃣ Checking recent error logs..."
pm2 logs anocab-website-backend --err --lines 10 --nostream
echo ""

echo "7️⃣ Checking if session is being saved..."
pm2 logs anocab-website-backend --lines 50 --nostream | grep -i "session"
echo ""

echo "✅ Debug complete!"
