# 🍪 Clear Browser Cookies - IMPORTANT!

## Why?

Your browser has OLD cookies from previous login attempts:
- Old cookie: `connect.sid` (MemoryStore - doesn't work)
- New cookie: `connect.sid` (MongoStore - will work)

Browser is sending the OLD cookie, that's why you get 401!

## How to Clear Cookies

### Method 1: Chrome/Edge DevTools

1. Open https://anocab.com
2. Press `F12` (or right-click → Inspect)
3. Go to **Application** tab
4. In left sidebar: **Cookies** → `https://anocab.com`
5. Right-click on cookies → **Clear**
6. Close DevTools
7. **Refresh page** (Ctrl+F5)
8. **Login again**

### Method 2: Chrome Settings

1. Click the 🔒 lock icon in address bar
2. Click **Cookies**
3. Find `anocab.com`
4. Click **Remove**
5. Refresh page
6. Login again

### Method 3: Incognito/Private Window

1. Open **Incognito/Private window** (Ctrl+Shift+N)
2. Go to https://anocab.com/login_panel/login.html
3. Login
4. Test if it works

### Method 4: Clear All Site Data

1. Go to: chrome://settings/content/all
2. Search for: `anocab.com`
3. Click **trash icon** to delete all data
4. Go back to site and login

## After Clearing Cookies

1. ✅ Go to: https://anocab.com/login_panel/login.html
2. ✅ Login with: anocab07@gmail.com / Anocab@6262
3. ✅ Navigate to Blog Management
4. ✅ Should work without 401 error!

## Verify It's Working

Open DevTools (F12) → Network tab:
1. Login
2. Check response headers for `Set-Cookie: connect.sid=...`
3. Go to Blog Management
4. Check request headers have `Cookie: connect.sid=...`
5. Response should be 200 OK (not 401)

---

**TL;DR:** Clear cookies, login again, it will work! 🎉
