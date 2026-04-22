#!/bin/bash

echo "🔍 Verifying Files on Server"
echo "============================="
echo ""

# Check server.js
echo "1️⃣ Checking backend/server.js:"
echo ""
echo "   Looking for MongoStore.create..."
if grep -q "MongoStore.create" /var/www/anocab/backend/server.js; then
    echo "   ✅ Found MongoStore.create"
    echo ""
    echo "   Session store configuration:"
    grep -A 10 "const sessionStore = MongoStore.create" /var/www/anocab/backend/server.js | head -15
else
    echo "   ❌ MongoStore.create NOT found!"
    echo "   Still using old code!"
fi
echo ""

# Check if session middleware is using the store
echo "2️⃣ Checking session middleware configuration:"
echo ""
grep -A 5 "app.use(session" /var/www/anocab/backend/server.js | head -10
echo ""

# Check .env file
echo "3️⃣ Checking backend/.env:"
echo ""
if grep -q "MONGODB_URI" /var/www/anocab/backend/.env; then
    echo "   ✅ MONGODB_URI found"
    echo "   Value: $(grep MONGODB_URI /var/www/anocab/backend/.env | cut -d'=' -f1)=***"
else
    echo "   ❌ MONGODB_URI NOT found"
fi
echo ""

if grep -q "anocab07@gmail.com" /var/www/anocab/backend/.env; then
    echo "   ✅ Admin email: anocab07@gmail.com"
else
    echo "   ⚠️  Admin email different"
    grep "ADMIN_EMAIL" /var/www/anocab/backend/.env
fi
echo ""

# Check ecosystem.config.js
echo "4️⃣ Checking ecosystem.config.js environment:"
echo ""
grep -A 3 "MONGODB_URI" /var/www/anocab/ecosystem.config.js
echo ""

# Check if connect-mongo is installed
echo "5️⃣ Checking connect-mongo installation:"
if [ -d "/var/www/anocab/backend/node_modules/connect-mongo" ]; then
    echo "   ✅ connect-mongo installed"
    CONNECT_MONGO_VERSION=$(cat /var/www/anocab/backend/node_modules/connect-mongo/package.json | grep '"version"' | cut -d'"' -f4)
    echo "   Version: $CONNECT_MONGO_VERSION"
else
    echo "   ❌ connect-mongo NOT installed!"
fi
echo ""

echo "============================="
echo "Verification complete!"
