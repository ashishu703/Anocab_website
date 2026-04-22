#!/bin/bash

echo "🧪 Quick Session Test"
echo "===================="
echo ""

# Check PM2 status
echo "1️⃣ PM2 Status:"
pm2 status anocab-website-backend
echo ""

# Check recent logs for MongoDB
echo "2️⃣ MongoDB Connection:"
pm2 logs anocab-website-backend --lines 50 --nostream 2>/dev/null | grep -i "mongodb" | tail -5
echo ""

# Check for MemoryStore warning
echo "3️⃣ Checking for MemoryStore warning:"
if pm2 logs anocab-website-backend --lines 100 --nostream 2>/dev/null | grep -i "memorystore" > /dev/null; then
    echo "❌ MemoryStore warning found"
else
    echo "✅ No MemoryStore warning"
fi
echo ""

# Test login
echo "4️⃣ Testing Login:"
LOGIN_RESPONSE=$(curl -s -c /tmp/test-cookies.txt -X POST "https://anocab.com/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"anocab07@gmail.com","password":"Anocab@6262"}')

echo "$LOGIN_RESPONSE"
echo ""

if echo "$LOGIN_RESPONSE" | grep -q "success"; then
    echo "✅ Login successful"
    
    # Wait a bit
    sleep 2
    
    # Check if session was saved
    echo ""
    echo "5️⃣ Checking session save in logs:"
    pm2 logs anocab-website-backend --lines 30 --nostream 2>/dev/null | grep -i "session" | tail -5
    echo ""
    
    # Test check-auth
    echo "6️⃣ Testing check-auth:"
    AUTH_RESPONSE=$(curl -s -b /tmp/test-cookies.txt "https://anocab.com/check-auth")
    echo "$AUTH_RESPONSE"
    echo ""
    
    if echo "$AUTH_RESPONSE" | grep -q '"authenticated":true'; then
        echo "✅ Authentication working"
        
        # Test protected route
        echo ""
        echo "7️⃣ Testing protected route (blogs):"
        BLOGS_RESPONSE=$(curl -s -b /tmp/test-cookies.txt "https://anocab.com/api/admin/blogs")
        
        if echo "$BLOGS_RESPONSE" | grep -q "Unauthorized"; then
            echo "❌ Still getting 401 Unauthorized"
            echo "Response: $BLOGS_RESPONSE"
            
            # Show auth logs
            echo ""
            echo "Auth check logs:"
            pm2 logs anocab-website-backend --lines 20 --nostream 2>/dev/null | grep -A 5 "Auth check"
        else
            echo "✅ Protected route accessible!"
            echo "Response preview: ${BLOGS_RESPONSE:0:100}..."
        fi
    else
        echo "❌ Authentication failed"
    fi
else
    echo "❌ Login failed"
fi

# Cleanup
rm -f /tmp/test-cookies.txt

echo ""
echo "===================="
echo "Test complete!"
