#!/bin/bash

echo "🚀 Deploying session fix for Anocab backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Test nginx configuration
echo -e "${YELLOW}📝 Testing nginx configuration...${NC}"
sudo nginx -t
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx configuration test failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Nginx configuration is valid${NC}"

# Step 2: Reload nginx
echo -e "${YELLOW}🔄 Reloading nginx...${NC}"
sudo systemctl reload nginx
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx reload failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"

# Step 3: Restart PM2 backend processes
echo -e "${YELLOW}🔄 Restarting PM2 backend processes...${NC}"
pm2 restart anocab-website-backend
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ PM2 restart failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend restarted successfully${NC}"

# Step 4: Wait for services to stabilize
echo -e "${YELLOW}⏳ Waiting for services to stabilize (5 seconds)...${NC}"
sleep 5

# Step 5: Check PM2 status
echo -e "${YELLOW}📊 Checking PM2 status...${NC}"
pm2 status

# Step 6: Show recent logs
echo -e "${YELLOW}📋 Recent backend logs:${NC}"
pm2 logs anocab-website-backend --lines 20 --nostream

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "🔍 To monitor logs in real-time, run:"
echo "   pm2 logs anocab-website-backend"
echo ""
echo "🧪 Test the fix:"
echo "   1. Login at: https://anocab.com/login_panel/login.html"
echo "   2. Check auth: curl -b cookies.txt https://anocab.com/check-auth"
echo "   3. Access blogs: curl -b cookies.txt https://anocab.com/api/admin/blogs"
echo ""
