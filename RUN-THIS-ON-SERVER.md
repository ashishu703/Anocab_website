# 🚨 URGENT FIX - Run This On Server

## Problem
- Login successful ✅
- But API calls getting 401 Unauthorized ❌
- Logs show: `isAuthenticated: undefined`

## Root Cause
PM2 using old code or session not being saved to MongoDB properly.

## Solution - Run These Commands

### Step 1: Upload Files to Server

Upload these files to `/var/www/anocab/`:
- `backend/server.js` (updated)
- `backend/.env` (updated)
- `nginx.conf` (updated)
- `complete-fix.sh` (new)

### Step 2: SSH to Server

```bash
ssh root@srv802965.hstgr.cloud
cd /var/www/anocab
```

### Step 3: Make Script Executable

```bash
chmod +x complete-fix.sh
```

### Step 4: Run Fix Script

```bash
./complete-fix.sh
```

This script will:
1. ✅ Verify files are updated
2. ✅ Install connect-mongo if needed
3. ✅ Test and reload nginx
4. ✅ Delete old PM2 process
5. ✅ Start fresh from ecosystem.config.js
6. ✅ Wait for MongoDB connection
7. ✅ Test login and session
8. ✅ Test protected routes
9. ✅ Test cluster mode

### Step 5: Verify Fix

The script will automatically test everything. Look for:

```
✅ MongoDB connected successfully
✅ No MemoryStore warning
✅ Login successful
✅ Session saved to MongoDB
✅ Authentication check passed
✅ Protected route accessible!
✅ All cluster mode tests passed!
```

### Step 6: Test in Browser

1. Open: https://anocab.com/login_panel/login.html
2. Login with: `anocab07@gmail.com` / `Anocab@6262`
3. Go to Blog Management
4. Verify blogs load ✅

## If Still Not Working

### Debug Option 1: Check Logs

```bash
pm2 logs anocab-website-backend --lines 50
```

Look for:
- ✅ "MongoDB Atlas connected successfully"
- ✅ "Session saved successfully"
- ❌ NO "MemoryStore" warning
- ❌ NO "Session not authenticated"

### Debug Option 2: Manual Test

```bash
# Login
curl -c cookies.txt -X POST https://anocab.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"anocab07@gmail.com","password":"Anocab@6262"}'

# Should return: {"status":"success",...}

# Check auth
curl -b cookies.txt https://anocab.com/check-auth

# Should return: {"authenticated":true,...}

# Test API
curl -b cookies.txt https://anocab.com/api/admin/blogs

# Should return: [{"_id":"...","title":"..."}]
```

### Debug Option 3: Check MongoDB Connection

```bash
pm2 logs anocab-website-backend | grep -i mongodb
```

Should see:
```
✅ MongoDB Atlas connected successfully
```

### Debug Option 4: Verify Session Store

```bash
pm2 logs anocab-website-backend | grep -i session
```

Should see:
```
✅ Session saved successfully
```

Should NOT see:
```
❌ Warning: connect.session() MemoryStore is not designed for production
```

## Manual Restart (If Needed)

```bash
# Stop everything
pm2 stop anocab-website-backend
pm2 delete anocab-website-backend

# Start fresh
pm2 start ecosystem.config.js --only anocab-website-backend

# Save config
pm2 save

# Check status
pm2 status

# Monitor logs
pm2 logs anocab-website-backend
```

## Rollback (If Something Breaks)

```bash
# Restore from backup
cp backend/server.js.backup backend/server.js
cp nginx.conf.backup nginx.conf

# Restart
sudo nginx -t
sudo systemctl reload nginx
pm2 restart anocab-website-backend
```

## Expected Behavior After Fix

1. ✅ Login creates session in MongoDB
2. ✅ Session cookie sent to browser
3. ✅ All requests (any PM2 process) can read session
4. ✅ Protected routes accessible
5. ✅ No 401 errors
6. ✅ No "isAuthenticated: undefined"

## Contact

If still having issues after running `complete-fix.sh`:

1. Share output of: `pm2 logs anocab-website-backend --lines 100`
2. Share output of: `curl -v https://anocab.com/check-auth`
3. Share screenshot of browser console errors

---

**Quick Command:**
```bash
cd /var/www/anocab && chmod +x complete-fix.sh && ./complete-fix.sh
```
