#!/bin/bash

echo "🔍 Deep Session Diagnosis"
echo "========================"
echo ""

# Check recent logs for session save
echo "1️⃣ Looking for 'Session saved successfully' in logs:"
pm2 logs anocab-website-backend --lines 100 --nostream 2>/dev/null | grep -i "session saved"
if [ $? -ne 0 ]; then
    echo "❌ NO 'Session saved successfully' messages found!"
    echo "   This means session.save() callback is NOT executing"
else
    echo "✅ Found session save messages"
fi
echo ""

# Check for session store errors
echo "2️⃣ Looking for session store errors:"
pm2 logs anocab-website-backend --err --lines 100 --nostream 2>/dev/null | grep -i "session"
echo ""

# Check MongoDB connection in detail
echo "3️⃣ MongoDB connection details:"
pm2 logs anocab-website-backend --lines 50 --nostream 2>/dev/null | grep -E "(MongoDB|MongoStore|connect-mongo)" | tail -10
echo ""

# Test login with verbose output
echo "4️⃣ Testing login with detailed logging:"
echo ""

# Login
LOGIN_RESPONSE=$(curl -v -c /tmp/diag-cookies.txt -X POST "https://anocab.com/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"anocab07@gmail.com","password":"Anocab@6262"}' 2>&1)

echo "Full curl output:"
echo "$LOGIN_RESPONSE" | grep -E "(Set-Cookie|HTTP/)"
echo ""

echo "Login response body:"
echo "$LOGIN_RESPONSE" | tail -1
echo ""

# Wait and check logs
sleep 3

echo "5️⃣ Logs immediately after login:"
pm2 logs anocab-website-backend --lines 20 --nostream 2>/dev/null | tail -20
echo ""

# Check cookie file
echo "6️⃣ Cookie file contents:"
cat /tmp/diag-cookies.txt
echo ""

# Test API call
echo "7️⃣ Testing API call with cookie:"
API_RESPONSE=$(curl -v -b /tmp/diag-cookies.txt "https://anocab.com/api/admin/blogs" 2>&1)

echo "API response headers:"
echo "$API_RESPONSE" | grep -E "(HTTP/|Cookie:)"
echo ""

echo "API response body:"
echo "$API_RESPONSE" | tail -1
echo ""

# Check auth logs
echo "8️⃣ Auth check logs after API call:"
pm2 logs anocab-website-backend --lines 10 --nostream 2>/dev/null | grep -A 6 "Auth check" | tail -10
echo ""

# Cleanup
rm -f /tmp/diag-cookies.txt

echo "========================"
echo "Diagnosis complete!"
