#!/bin/bash

echo "🔧 Emergency Session Fix - Anocab Backend"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Check current PM2 status
echo -e "${YELLOW}📊 Current PM2 Status:${NC}"
pm2 status anocab-website-backend
echo ""

# Step 2: Delete PM2 process completely
echo -e "${YELLOW}🗑️  Deleting PM2 process...${NC}"
pm2 delete anocab-website-backend
echo ""

# Step 3: Start fresh from ecosystem config
echo -e "${YELLOW}🚀 Starting fresh from ecosystem.config.js...${NC}"
cd /var/www/anocab
pm2 start ecosystem.config.js --only anocab-website-backend
echo ""

# Step 4: Save PM2 config
echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save
echo ""

# Step 5: Wait for startup
echo -e "${YELLOW}⏳ Waiting for services to start (10 seconds)...${NC}"
sleep 10

# Step 6: Check logs
echo -e "${YELLOW}📋 Checking logs for MongoDB connection...${NC}"
pm2 logs anocab-website-backend --lines 30 --nostream | grep -i mongodb
echo ""

echo -e "${YELLOW}📋 Checking for MemoryStore warning...${NC}"
if pm2 logs anocab-website-backend --lines 30 --nostream | grep -i "MemoryStore"; then
    echo -e "${RED}❌ Still using MemoryStore! Code not updated properly.${NC}"
else
    echo -e "${GREEN}✅ No MemoryStore warning - using MongoDB session store${NC}"
fi
echo ""

# Step 7: Test login
echo -e "${YELLOW}🧪 Testing login...${NC}"
LOGIN_RESPONSE=$(curl -s -c /tmp/test-cookies.txt -X POST "https://anocab.com/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"anocab07@gmail.com","password":"Anocab@6262"}')

echo "Login Response: $LOGIN_RESPONSE"
echo ""

if echo "$LOGIN_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Login successful${NC}"
    
    # Check if session was saved
    echo -e "${YELLOW}📋 Checking if session was saved...${NC}"
    sleep 2
    if pm2 logs anocab-website-backend --lines 20 --nostream | grep -i "Session saved"; then
        echo -e "${GREEN}✅ Session saved successfully${NC}"
    else
        echo -e "${RED}⚠️  No 'Session saved' message in logs${NC}"
    fi
    
    # Test protected route
    echo ""
    echo -e "${YELLOW}🧪 Testing protected route...${NC}"
    BLOGS_RESPONSE=$(curl -s -b /tmp/test-cookies.txt "https://anocab.com/api/admin/blogs")
    
    if echo "$BLOGS_RESPONSE" | grep -q "Unauthorized"; then
        echo -e "${RED}❌ Still getting 401 Unauthorized${NC}"
        echo "Response: $BLOGS_RESPONSE"
    else
        echo -e "${GREEN}✅ Protected route accessible!${NC}"
    fi
else
    echo -e "${RED}❌ Login failed${NC}"
fi

echo ""
echo -e "${YELLOW}📊 Final PM2 Status:${NC}"
pm2 status
echo ""

echo -e "${YELLOW}📋 Recent logs (last 20 lines):${NC}"
pm2 logs anocab-website-backend --lines 20 --nostream

# Cleanup
rm -f /tmp/test-cookies.txt

echo ""
echo -e "${GREEN}✅ Fix script completed!${NC}"
echo ""
echo "🔍 To monitor logs in real-time:"
echo "   pm2 logs anocab-website-backend"
