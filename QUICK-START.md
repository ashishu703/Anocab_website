# 🚀 Quick Start - Session Fix Deployment

## TL;DR

Tumhara session PM2 cluster mode mein fail ho raha tha. Ab MongoDB session store use kar rahe hain. Deploy karo aur test karo.

## 3-Step Deployment

### Step 1: Deploy (30 seconds)

```bash
chmod +x deploy-fix.sh
./deploy-fix.sh
```

### Step 2: Test (30 seconds)

```bash
chmod +x test-session.sh
./test-session.sh
```

### Step 3: Verify (Browser)

1. Open: https://anocab.com/login_panel/login.html
2. Login with your credentials
3. Go to blog management
4. Verify it works ✅

## What Was Fixed?

| Problem | Solution |
|---------|----------|
| MemoryStore in cluster mode | MongoDB session store |
| Session not syncing across processes | Shared MongoDB storage |
| MongoDB connection timing | Connect before session middleware |
| Cookie not persisting | Fixed domain and sameSite settings |
| Nginx modifying cookies | Let Express handle cookies |

## Files Changed

1. ✅ `backend/server.js` - Session configuration
2. ✅ `nginx.conf` - Proxy settings
3. ✅ `deploy-fix.sh` - Deployment script
4. ✅ `test-session.sh` - Testing script

## Quick Commands

```bash
# Deploy
./deploy-fix.sh

# Test
./test-session.sh

# Monitor logs
pm2 logs anocab-website-backend

# Check status
pm2 status

# Restart if needed
pm2 restart anocab-website-backend
```

## Expected Results

### Before Fix ❌
```
Login → ✅ Success
Check Auth → ✅ Success  
API Call → ❌ 401 Unauthorized (different process)
```

### After Fix ✅
```
Login → ✅ Success
Check Auth → ✅ Success
API Call → ✅ Success (any process)
```

## Troubleshooting

### Still getting 401?

```bash
# Restart everything
pm2 restart anocab-website-backend
sudo systemctl reload nginx

# Clear browser cookies
# Try again
```

### MongoDB connection error?

```bash
# Check .env
cat backend/.env | grep MONGODB_URI

# Check logs
pm2 logs anocab-website-backend | grep MongoDB
```

## Need More Details?

- **Full explanation**: Read `SESSION-FIX-README.md`
- **Step-by-step checklist**: Read `DEPLOYMENT-CHECKLIST.md`
- **Troubleshooting**: Check logs with `pm2 logs anocab-website-backend`

## Support

```bash
# Real-time logs
pm2 logs anocab-website-backend

# Last 100 lines
pm2 logs anocab-website-backend --lines 100 --nostream

# Nginx logs
sudo tail -f /var/log/nginx/anocab-error.log
```

---

**Ready to deploy?** Run: `./deploy-fix.sh` 🚀
