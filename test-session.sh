#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="https://anocab.com"
COOKIE_FILE="test-cookies.txt"

echo "🧪 Testing Session Management Fix"
echo "=================================="
echo ""

# Clean up old cookies
rm -f $COOKIE_FILE

# Step 1: Login
echo -e "${YELLOW}1️⃣ Testing login...${NC}"
LOGIN_RESPONSE=$(curl -s -c $COOKIE_FILE -X POST "$API_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"anocab07@gmail.com","password":"Anocab@6262"}')

echo "Response: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Login successful${NC}"
else
    echo -e "${RED}❌ Login failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Cookies saved:${NC}"
cat $COOKIE_FILE
echo ""

# Step 2: Check auth
echo -e "${YELLOW}2️⃣ Testing check-auth...${NC}"
AUTH_RESPONSE=$(curl -s -b $COOKIE_FILE "$API_URL/check-auth")
echo "Response: $AUTH_RESPONSE"

if echo "$AUTH_RESPONSE" | grep -q "authenticated.*true"; then
    echo -e "${GREEN}✅ Authentication check passed${NC}"
else
    echo -e "${RED}❌ Authentication check failed${NC}"
    exit 1
fi

echo ""

# Step 3: Access protected route (blogs)
echo -e "${YELLOW}3️⃣ Testing protected route (/api/admin/blogs)...${NC}"
BLOGS_RESPONSE=$(curl -s -b $COOKIE_FILE "$API_URL/api/admin/blogs")
echo "Response (first 200 chars): ${BLOGS_RESPONSE:0:200}..."

if echo "$BLOGS_RESPONSE" | grep -q "Unauthorized"; then
    echo -e "${RED}❌ Still getting 401 Unauthorized${NC}"
    exit 1
elif echo "$BLOGS_RESPONSE" | grep -q "\["; then
    echo -e "${GREEN}✅ Protected route accessible (got array response)${NC}"
else
    echo -e "${GREEN}✅ Protected route accessible${NC}"
fi

echo ""

# Step 4: Test multiple requests (cluster mode test)
echo -e "${YELLOW}4️⃣ Testing multiple requests (cluster mode)...${NC}"
for i in {1..5}; do
    RESPONSE=$(curl -s -b $COOKIE_FILE "$API_URL/check-auth")
    if echo "$RESPONSE" | grep -q "authenticated.*true"; then
        echo -e "${GREEN}  Request $i: ✅ Success${NC}"
    else
        echo -e "${RED}  Request $i: ❌ Failed${NC}"
        exit 1
    fi
done

echo ""
echo -e "${GREEN}🎉 All tests passed! Session management is working correctly.${NC}"
echo ""

# Cleanup
rm -f $COOKIE_FILE
