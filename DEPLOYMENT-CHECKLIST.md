# 🚀 Deployment Checklist - Session Fix

## Pre-Deployment

- [ ] Backup current configuration
  ```bash
  cp backend/server.js backend/server.js.backup
  cp nginx.conf nginx.conf.backup
  ```

- [ ] Verify MongoDB connection string in `.env`
  ```bash
  cat backend/.env | grep MONGODB_URI
  ```

- [ ] Check current PM2 status
  ```bash
  pm2 status
  pm2 logs anocab-website-backend --lines 20 --nostream
  ```

## Deployment Steps

### 1. Update Files ✅ (Already Done)

- [x] `backend/server.js` - Session store configuration
- [x] `nginx.conf` - Proxy cookie handling
- [x] `deploy-fix.sh` - Deployment script
- [x] `test-session.sh` - Testing script

### 2. Deploy to Server

```bash
# Option A: Automated (Recommended)
chmod +x deploy-fix.sh
./deploy-fix.sh

# Option B: Manual
sudo nginx -t
sudo systemctl reload nginx
pm2 restart anocab-website-backend
pm2 logs anocab-website-backend --lines 50
```

### 3. Verify Deployment

- [ ] Check nginx is running
  ```bash
  sudo systemctl status nginx
  ```

- [ ] Check PM2 processes
  ```bash
  pm2 status
  # Should show: anocab-website-backend (2 instances) - online
  ```

- [ ] Check MongoDB connection
  ```bash
  pm2 logs anocab-website-backend --lines 20 | grep "MongoDB"
  # Should see: "✅ MongoDB Atlas connected successfully"
  ```

- [ ] Check session store
  ```bash
  pm2 logs anocab-website-backend --lines 20 | grep -i session
  # Should NOT see: "MemoryStore is not designed for production"
  ```

## Testing

### Automated Test

```bash
chmod +x test-session.sh
./test-session.sh
```

Expected output:
```
🧪 Testing Session Management Fix
==================================

1️⃣ Testing login...
✅ Login successful

2️⃣ Testing check-auth...
✅ Authentication check passed

3️⃣ Testing protected route (/api/admin/blogs)...
✅ Protected route accessible

4️⃣ Testing multiple requests (cluster mode)...
  Request 1: ✅ Success
  Request 2: ✅ Success
  Request 3: ✅ Success
  Request 4: ✅ Success
  Request 5: ✅ Success

🎉 All tests passed!
```

### Manual Browser Test

1. [ ] Open https://anocab.com/login_panel/login.html
2. [ ] Login with credentials
3. [ ] Check browser console - no errors
4. [ ] Navigate to blog management
5. [ ] Verify blogs load successfully
6. [ ] Refresh page - should stay logged in
7. [ ] Try creating/editing a blog

### API Test with curl

```bash
# 1. Login
curl -c cookies.txt -X POST https://anocab.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"anocab07@gmail.com","password":"Anocab@6262"}'

# Expected: {"status":"success","message":"Login successful","role":"admin"}

# 2. Check auth
curl -b cookies.txt https://anocab.com/check-auth

# Expected: {"authenticated":true,"role":"admin","email":"anocab07@gmail.com"}

# 3. Get blogs
curl -b cookies.txt https://anocab.com/api/admin/blogs

# Expected: [{"_id":"...","title":"..."}] (array of blogs)

# 4. Test 10 times (cluster mode)
for i in {1..10}; do
  echo "Request $i:"
  curl -b cookies.txt https://anocab.com/check-auth
  echo ""
done

# Expected: All should return authenticated:true
```

## Post-Deployment Monitoring

### First 5 Minutes

```bash
# Watch logs in real-time
pm2 logs anocab-website-backend

# Look for:
# ✅ "MongoDB Atlas connected successfully"
# ✅ "Session saved successfully"
# ✅ "Authentication successful for: anocab07@gmail.com"
# ❌ NO "Session store error"
# ❌ NO "buffering timed out"
# ❌ NO "Unauthorized"
```

### First Hour

- [ ] Check error logs
  ```bash
  pm2 logs anocab-website-backend --err --lines 50
  ```

- [ ] Monitor nginx errors
  ```bash
  sudo tail -f /var/log/nginx/anocab-error.log
  ```

- [ ] Check MongoDB sessions
  ```bash
  # Connect to MongoDB and run:
  use monzo
  db.sessions.count()
  # Should see sessions being created
  ```

### First Day

- [ ] Check PM2 metrics
  ```bash
  pm2 monit
  ```

- [ ] Verify no memory leaks
  ```bash
  pm2 status
  # Check memory usage - should be stable
  ```

- [ ] Check session cleanup
  ```bash
  # Old sessions should be auto-removed after 24 hours
  ```

## Rollback Plan (If Needed)

If something goes wrong:

```bash
# 1. Restore backups
cp backend/server.js.backup backend/server.js
cp nginx.conf.backup nginx.conf

# 2. Reload services
sudo nginx -t
sudo systemctl reload nginx
pm2 restart anocab-website-backend

# 3. Verify rollback
pm2 logs anocab-website-backend --lines 20
```

## Success Criteria

- [x] No "MemoryStore" warnings in logs
- [ ] Login works consistently
- [ ] Protected routes accessible after login
- [ ] Session persists across multiple requests
- [ ] No 401 errors on authenticated requests
- [ ] MongoDB connection stable
- [ ] Both PM2 instances handling requests correctly

## Common Issues & Quick Fixes

### Issue: 401 Unauthorized still appearing

```bash
# Clear all sessions and restart
pm2 restart anocab-website-backend
# Clear browser cookies
# Try login again
```

### Issue: MongoDB connection error

```bash
# Check .env file
cat backend/.env | grep MONGODB_URI

# Test connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('OK')).catch(e => console.log(e))"
```

### Issue: Nginx not passing cookies

```bash
# Check nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check logs
sudo tail -f /var/log/nginx/anocab-error.log
```

## Support Commands

```bash
# View all PM2 logs
pm2 logs

# View specific app logs
pm2 logs anocab-website-backend

# Restart specific app
pm2 restart anocab-website-backend

# Reload nginx
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx

# Test nginx config
sudo nginx -t

# View nginx error logs
sudo tail -f /var/log/nginx/anocab-error.log

# View nginx access logs
sudo tail -f /var/log/nginx/anocab-access.log
```

## Contact

If issues persist after deployment:
1. Check logs: `pm2 logs anocab-website-backend`
2. Review this checklist
3. Check SESSION-FIX-README.md for troubleshooting

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Status:** [ ] Success [ ] Rollback Required  
**Notes:** _____________________________________________
