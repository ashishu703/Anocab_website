#!/bin/bash

echo "🔄 Restarting Backend with Fixed Session Name"
echo "=============================================="
echo ""

cd /var/www/anocab

# Stop backend
echo "1️⃣ Stopping backend..."
pm2 stop anocab-website-backend
pm2 delete anocab-website-backend
echo ""

# Start fresh
echo "2️⃣ Starting backend..."
pm2 start ecosystem.config.js --only anocab-website-backend
pm2 save
echo ""

# Wait
echo "3️⃣ Waiting 10 seconds..."
sleep 10

# Check status
echo "4️⃣ Status:"
pm2 status anocab-website-backend
echo ""

# Check MongoDB
echo "5️⃣ MongoDB connection:"
pm2 logs anocab-website-backend --lines 20 --nostream 2>/dev/null | grep -i "mongodb" | tail -3
echo ""

# Test login with fresh cookies
echo "6️⃣ Testing with fresh login..."
rm -f /tmp/fresh-cookies.txt

LOGIN=$(curl -s -c /tmp/fresh-cookies.txt -X POST "https://anocab.com/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"anocab07@gmail.com","password":"Anocab@6262"}')

echo "Login: $LOGIN"

if echo "$LOGIN" | grep -q "success"; then
    echo "✅ Login successful"
    
    sleep 2
    
    # Check what cookie was set
    echo ""
    echo "Cookie set:"
    cat /tmp/fresh-cookies.txt | grep -v "^#"
    echo ""
    
    # Test protected route
    echo "Testing /api/admin/blogs..."
    BLOGS=$(curl -s -b /tmp/fresh-cookies.txt "https://anocab.com/api/admin/blogs")
    
    if echo "$BLOGS" | grep -q "Unauthorized"; then
        echo "❌ Still 401"
        echo "Response: $BLOGS"
        
        # Show auth logs
        echo ""
        echo "Auth logs:"
        pm2 logs anocab-website-backend --lines 10 --nostream 2>/dev/null | grep -A 5 "Auth check" | tail -10
    else
        echo "✅ SUCCESS! Protected route accessible"
        echo "Response preview: ${BLOGS:0:100}..."
    fi
else
    echo "❌ Login failed"
fi

rm -f /tmp/fresh-cookies.txt

echo ""
echo "=============================================="
echo "Done!"
