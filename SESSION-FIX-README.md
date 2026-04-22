# Session Management Fix - Anocab Backend

## 🐛 Problem Summary

Tumhara backend PM2 cluster mode (2 instances) mein chal raha tha aur session management fail ho raha tha:

1. **Login successful** ✅ - Process A par session create ho gaya
2. **check-auth successful** ✅ - Same process ne verify kiya
3. **API call failed** ❌ - Request Process B par gayi, usne session nahi mila → 401 Unauthorized

### Root Causes:

1. **MemoryStore in Cluster Mode**: Default MemoryStore process-specific hai, cluster mode mein sync nahi hota
2. **MongoDB Connection Timing**: Session middleware MongoDB connect hone se pehle initialize ho raha tha
3. **Cookie Configuration**: `sameSite: 'none'` production mein tha but domain sharing nahi thi
4. **Nginx Proxy**: Cookie headers ko modify kar raha tha

## ✅ Solutions Applied

### 1. MongoDB Session Store (backend/server.js)

```javascript
// BEFORE: Session middleware before MongoDB connection
app.use(session({ ... }));
mongoose.connect(...);

// AFTER: MongoDB connection first, then session with proper store
mongoose.connect(...);
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  ttl: 24 * 60 * 60,
  autoRemove: 'native',
  mongoOptions: { ... }
});
app.use(session({ store: sessionStore, ... }));
```

**Benefits:**
- Sessions ab MongoDB mein store hote hain
- Cluster ke saare processes same session access kar sakte hain
- Session persistence across restarts

### 2. Improved Cookie Configuration

```javascript
cookie: { 
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  domain: process.env.NODE_ENV === 'production' ? '.anocab.com' : undefined
}
```

**Changes:**
- `domain: '.anocab.com'` - Subdomain sharing enabled
- `sameSite` conditional - Production mein 'none', dev mein 'lax'
- Custom session name: `anocab.sid`

### 3. Enhanced Authentication Middleware

```javascript
function isAuthenticated(req, res, next) {
  // Better logging
  console.log('🔐 Auth check:', {
    hasSession: !!req.session,
    isAuthenticated: req.session?.isAuthenticated,
    sessionID: req.sessionID,
    userEmail: req.session?.userEmail
  });
  
  // Explicit checks with clear error messages
  if (!req.session) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Session not found. Please login again.' 
    });
  }
  
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Unauthorized. Please login.' 
    });
  }
  
  return next();
}
```

### 4. Nginx Proxy Configuration (nginx.conf)

```nginx
# BEFORE: Cookie path modification
proxy_cookie_path / "/; Secure; HttpOnly; SameSite=None";

# AFTER: Let Express handle cookies
proxy_cookie_flags ~ nosecure samesite=none;
proxy_set_header X-Forwarded-Host $host;
```

**Changes:**
- Removed `proxy_cookie_path` (was overriding Express settings)
- Added `X-Forwarded-Host` header
- Added timeouts for long requests

### 5. MongoDB Connection Improvements

```javascript
const mongoOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
};

mongoose.connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => {
    console.log("✅ MongoDB Atlas connected successfully");
    mongooseConnection = mongoose.connection;
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit if DB fails
  });
```

**Benefits:**
- Connection pooling for better performance
- Proper error handling
- Exit on connection failure (prevents running without DB)

## 🚀 Deployment Steps

### Option 1: Automated Deployment

```bash
# Make script executable
chmod +x deploy-fix.sh

# Run deployment
./deploy-fix.sh
```

### Option 2: Manual Deployment

```bash
# 1. Test nginx config
sudo nginx -t

# 2. Reload nginx
sudo systemctl reload nginx

# 3. Restart backend
pm2 restart anocab-website-backend

# 4. Check status
pm2 status
pm2 logs anocab-website-backend --lines 50
```

## 🧪 Testing

### Automated Test

```bash
chmod +x test-session.sh
./test-session.sh
```

### Manual Test

```bash
# 1. Login
curl -c cookies.txt -X POST https://anocab.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"anocab07@gmail.com","password":"Anocab@6262"}'

# 2. Check auth
curl -b cookies.txt https://anocab.com/check-auth

# 3. Access protected route
curl -b cookies.txt https://anocab.com/api/admin/blogs

# 4. Test multiple times (cluster test)
for i in {1..10}; do
  curl -b cookies.txt https://anocab.com/check-auth
  echo ""
done
```

## 📊 Monitoring

### Check PM2 Logs

```bash
# Real-time logs
pm2 logs anocab-website-backend

# Last 100 lines
pm2 logs anocab-website-backend --lines 100 --nostream

# Error logs only
pm2 logs anocab-website-backend --err
```

### Check MongoDB Sessions

```javascript
// Connect to MongoDB
use monzo

// Check sessions collection
db.sessions.find().pretty()

// Count active sessions
db.sessions.count()

// Find specific session
db.sessions.find({ "session.userEmail": "anocab07@gmail.com" }).pretty()
```

### Check Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/anocab-access.log

# Error logs
sudo tail -f /var/log/nginx/anocab-error.log

# Filter for API calls
sudo grep "/api/" /var/log/nginx/anocab-access.log | tail -20
```

## 🔍 Troubleshooting

### Issue: Still getting 401 Unauthorized

**Check:**
1. MongoDB connection: `pm2 logs anocab-website-backend | grep MongoDB`
2. Session store errors: `pm2 logs anocab-website-backend | grep "Session store"`
3. Cookie in request: Check browser DevTools → Network → Request Headers

**Fix:**
```bash
# Restart everything
pm2 restart anocab-website-backend
sudo systemctl reload nginx

# Clear browser cookies and try again
```

### Issue: "isAuthenticated: undefined"

**Check:**
1. Login response: Should have `status: 'success'`
2. Session save: Look for "Session saved successfully" in logs
3. Cookie set: Check response headers for `Set-Cookie`

**Fix:**
```bash
# Check if session is being saved
pm2 logs anocab-website-backend | grep "Session saved"

# If not, check MongoDB connection
pm2 logs anocab-website-backend | grep "MongoDB"
```

### Issue: MongoDB buffering timeout

**Check:**
```bash
# Check MongoDB connection
pm2 logs anocab-website-backend | grep "MongoDB"

# Check network connectivity
ping cluster0.rlc2rg5.mongodb.net
```

**Fix:**
1. Verify MongoDB Atlas credentials in `.env`
2. Check IP whitelist in MongoDB Atlas
3. Restart backend: `pm2 restart anocab-website-backend`

## 📝 Key Changes Summary

| Component | Before | After |
|-----------|--------|-------|
| Session Store | MemoryStore (process-specific) | MongoStore (shared across cluster) |
| MongoDB Connection | After session middleware | Before session middleware |
| Cookie Domain | Not set | `.anocab.com` (subdomain sharing) |
| Session Name | `connect.sid` | `anocab.sid` |
| Nginx Cookie Handling | Modified by proxy | Passed through unchanged |
| Error Handling | Generic 401 | Specific error messages |
| Logging | Minimal | Detailed auth checks |

## 🎯 Expected Behavior After Fix

1. ✅ Login creates session in MongoDB
2. ✅ Session cookie sent to browser with correct flags
3. ✅ All subsequent requests (any cluster process) can read session
4. ✅ Protected routes accessible after login
5. ✅ Session persists across PM2 restarts
6. ✅ No more "isAuthenticated: undefined" errors
7. ✅ No more MongoDB buffering timeouts

## 🔐 Security Notes

- Sessions stored encrypted in MongoDB
- Cookies are `httpOnly` (XSS protection)
- Cookies are `secure` in production (HTTPS only)
- `sameSite: 'none'` for cross-origin (required for your setup)
- Session TTL: 24 hours (auto-cleanup)

## 📚 References

- [connect-mongo Documentation](https://www.npmjs.com/package/connect-mongo)
- [Express Session Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PM2 Cluster Mode](https://pm2.keymetrics.io/docs/usage/cluster-mode/)
- [Nginx Proxy Configuration](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
