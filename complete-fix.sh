#!/bin/bash

echo "🚀 Complete Session Fix - Anocab Backend"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Change to project directory
cd /var/www/anocab

echo -e "${BLUE}📁 Working directory: $(pwd)${NC}"
echo ""

# Step 1: Verify files are updated
echo -e "${YELLOW}1️⃣ Verifying updated files...${NC}"

if grep -q "MongoStore.create" backend/server.js; then
    echo -e "${GREEN}✅ server.js has MongoStore configuration${NC}"
else
    echo -e "${RED}❌ server.js NOT updated! Please upload the fixed server.js${NC}"
    exit 1
fi

if grep -q "proxy_cookie_flags" nginx.conf; then
    echo -e "${GREEN}✅ nginx.conf has updated proxy settings${NC}"
else
    echo -e "${YELLOW}⚠️  nginx.conf may need update${NC}"
fi
echo ""

# Step 2: Check and install dependencies
echo -e "${YELLOW}2️⃣ Checking dependencies...${NC}"
cd backend

if [ ! -d "node_modules/connect-mongo" ]; then
    echo -e "${YELLOW}📦 Installing connect-mongo...${NC}"
    npm install connect-mongo@5.1.0
else
    echo -e "${GREEN}✅ connect-mongo already installed${NC}"
fi
cd ..
echo ""

# Step 3: Test nginx configuration
echo -e "${YELLOW}3️⃣ Testing nginx configuration...${NC}"
sudo nginx -t
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx configuration test failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
echo ""

# Step 4: Reload nginx
echo -e "${YELLOW}4️⃣ Reloading nginx...${NC}"
sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"
echo ""

# Step 5: Stop PM2 process completely
echo -e "${YELLOW}5️⃣ Stopping PM2 backend process...${NC}"
pm2 stop anocab-website-backend
pm2 delete anocab-website-backend
echo -e "${GREEN}✅ Old process removed${NC}"
echo ""

# Step 6: Start fresh from ecosystem config
echo -e "${YELLOW}6️⃣ Starting backend with ecosystem.config.js...${NC}"
pm2 start ecosystem.config.js --only anocab-website-backend
echo ""

# Step 7: Save PM2 configuration
echo -e "${YELLOW}7️⃣ Saving PM2 configuration...${NC}"
pm2 save
echo ""

# Step 8: Wait for services to stabilize
echo -e "${YELLOW}8️⃣ Waiting for services to stabilize (15 seconds)...${NC}"
sleep 15

# Step 9: Check MongoDB connection
echo -e "${YELLOW}9️⃣ Checking MongoDB connection...${NC}"
if pm2 logs anocab-website-backend --lines 30 --nostream | grep -q "MongoDB Atlas connected successfully"; then
    echo -e "${GREEN}✅ MongoDB connected successfully${NC}"
else
    echo -e "${RED}❌ MongoDB connection failed!${NC}"
    pm2 logs anocab-website-backend --err --lines 20 --nostream
    exit 1
fi
echo ""

# Step 10: Check for MemoryStore warning
echo -e "${YELLOW}🔟 Checking for MemoryStore warning...${NC}"
if pm2 logs anocab-website-backend --lines 50 --nostream | grep -q "MemoryStore"; then
    echo -e "${RED}❌ Still using MemoryStore! Session store not configured properly.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ No MemoryStore warning - using MongoDB session store${NC}"
fi
echo ""

# Step 11: Test login and session
echo -e "${YELLOW}1️⃣1️⃣ Testing login and session...${NC}"
echo ""

# Login
echo -e "${BLUE}   → Attempting login...${NC}"
LOGIN_RESPONSE=$(curl -s -c /tmp/anocab-test-cookies.txt -X POST "https://anocab.com/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"anocab07@gmail.com","password":"Anocab@6262"}')

echo "   Response: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q '"status":"success"'; then
    echo -e "${GREEN}   ✅ Login successful${NC}"
    
    # Wait for session to be saved
    sleep 3
    
    # Check if session was saved in logs
    echo ""
    echo -e "${BLUE}   → Checking if session was saved...${NC}"
    if pm2 logs anocab-website-backend --lines 30 --nostream | grep -q "Session saved successfully"; then
        echo -e "${GREEN}   ✅ Session saved to MongoDB${NC}"
    else
        echo -e "${YELLOW}   ⚠️  'Session saved' message not found in logs${NC}"
    fi
    
    # Test check-auth
    echo ""
    echo -e "${BLUE}   → Testing check-auth endpoint...${NC}"
    AUTH_RESPONSE=$(curl -s -b /tmp/anocab-test-cookies.txt "https://anocab.com/check-auth")
    echo "   Response: $AUTH_RESPONSE"
    
    if echo "$AUTH_RESPONSE" | grep -q '"authenticated":true'; then
        echo -e "${GREEN}   ✅ Authentication check passed${NC}"
    else
        echo -e "${RED}   ❌ Authentication check failed${NC}"
    fi
    
    # Test protected route
    echo ""
    echo -e "${BLUE}   → Testing protected route (/api/admin/blogs)...${NC}"
    BLOGS_RESPONSE=$(curl -s -b /tmp/anocab-test-cookies.txt "https://anocab.com/api/admin/blogs")
    
    if echo "$BLOGS_RESPONSE" | grep -q "Unauthorized"; then
        echo -e "${RED}   ❌ Still getting 401 Unauthorized${NC}"
        echo "   Response: ${BLOGS_RESPONSE:0:200}"
        
        # Show auth check logs
        echo ""
        echo -e "${YELLOW}   📋 Recent auth check logs:${NC}"
        pm2 logs anocab-website-backend --lines 20 --nostream | grep -A 5 "Auth check"
    elif echo "$BLOGS_RESPONSE" | grep -q '\['; then
        echo -e "${GREEN}   ✅ Protected route accessible! Got blog data.${NC}"
    else
        echo -e "${GREEN}   ✅ Protected route accessible!${NC}"
        echo "   Response: ${BLOGS_RESPONSE:0:100}..."
    fi
    
    # Test multiple requests (cluster mode)
    echo ""
    echo -e "${BLUE}   → Testing cluster mode (5 requests)...${NC}"
    FAIL_COUNT=0
    for i in {1..5}; do
        RESPONSE=$(curl -s -b /tmp/anocab-test-cookies.txt "https://anocab.com/check-auth")
        if echo "$RESPONSE" | grep -q '"authenticated":true'; then
            echo -e "${GREEN}      Request $i: ✅${NC}"
        else
            echo -e "${RED}      Request $i: ❌${NC}"
            FAIL_COUNT=$((FAIL_COUNT + 1))
        fi
    done
    
    if [ $FAIL_COUNT -eq 0 ]; then
        echo -e "${GREEN}   ✅ All cluster mode tests passed!${NC}"
    else
        echo -e "${RED}   ❌ $FAIL_COUNT requests failed in cluster mode${NC}"
    fi
    
else
    echo -e "${RED}   ❌ Login failed${NC}"
    echo "   Full response: $LOGIN_RESPONSE"
fi

# Cleanup
rm -f /tmp/anocab-test-cookies.txt

echo ""
echo -e "${YELLOW}1️⃣2️⃣ Final Status Check${NC}"
echo ""
pm2 status anocab-website-backend
echo ""

echo -e "${YELLOW}📋 Recent logs (last 30 lines):${NC}"
pm2 logs anocab-website-backend --lines 30 --nostream
echo ""

echo "========================================="
echo -e "${GREEN}✅ Fix script completed!${NC}"
echo "========================================="
echo ""
echo "🔍 To monitor logs in real-time:"
echo "   pm2 logs anocab-website-backend"
echo ""
echo "🧪 To test manually:"
echo "   1. Open: https://anocab.com/login_panel/login.html"
echo "   2. Login with: anocab07@gmail.com / Anocab@6262"
echo "   3. Navigate to Blog Management"
echo "   4. Verify blogs load without 401 error"
echo ""
