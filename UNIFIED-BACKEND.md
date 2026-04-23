# Anocab Unified Backend Architecture

## Overview
All backend services have been consolidated into a single unified backend running on port 1111.

## Previous Architecture (DEPRECATED)
- ❌ Backend Server (Port 1111) - Main API
- ❌ Admin Panel Server (Port 1112) - Price updates only
- ❌ Careers Server (Port 1113) - Job applications

## New Architecture (CURRENT)
- ✅ **Unified Backend (Port 1111)** - ALL functionality in one place
  - Authentication (JWT-based)
  - Price management
  - Blog management
  - Client logo management
  - Job applications
  - Newsletter subscriptions
  - Enquiry forms
  - All API endpoints

## Benefits
1. **Simplified Deployment** - Only one server to manage
2. **Consistent Authentication** - Single JWT implementation across all features
3. **Easier Maintenance** - One codebase, one set of dependencies
4. **Better Performance** - No inter-service communication overhead
5. **Reduced Resource Usage** - One Node.js process instead of three

## Deployment

### Manual Deployment
```bash
# On the server
cd /var/www/anocab
chmod +x deploy-unified.sh
./deploy-unified.sh
```

### Automatic Deployment
Push to `main` branch triggers GitHub Actions workflow that:
1. Pulls latest code
2. Installs dependencies
3. Updates nginx configuration
4. Restarts PM2 with unified backend only

## Environment Variables
All configuration is in `backend/.env`:
```env
PORT=1111
NODE_ENV=production
API_BASE_URL=https://anocab.com
CORS_ORIGIN=*
ADMIN_EMAIL=anocab07@gmail.com
ADMIN_PASSWORD=Anocab@6262
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
MONGODB_URI=your-mongodb-uri
MAIL_USER=your-email
MAIL_PASS=your-app-password
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
```

## API Endpoints
All endpoints now route to port 1111:

### Authentication
- `POST /login` - Login with email/password, returns JWT token
- `POST /logout` - Logout (client-side token removal)
- `GET /check-auth` - Verify JWT token validity

### Prices
- `GET /api/prices` - Get current material prices (public)
- `POST /update-prices` - Update prices (protected)

### Blog
- `GET /api/blogs` - Get published blogs (public)
- `GET /api/blogs/:slug` - Get single blog (public)
- `GET /api/admin/blogs` - Get all blogs (protected)
- `POST /api/admin/blogs` - Create blog (protected)
- `PUT /api/admin/blogs/:id` - Update blog (protected)
- `DELETE /api/admin/blogs/:id` - Delete blog (protected)

### Clients
- `GET /api/clients` - Get active client logos (public)
- `GET /api/admin/clients` - Get all clients (protected)
- `POST /api/admin/clients` - Add client (protected)
- `PUT /api/admin/clients/:id` - Update client (protected)
- `DELETE /api/admin/clients/:id` - Delete client (protected)

### Job Applications
- `POST /submit-form` - Submit job application (public)
- `GET /fetch-forms` - Get all applications (protected)
- `GET /download-resume/:id` - Download resume (protected)

### Newsletter
- `POST /api/newsletter` - Subscribe to newsletter (public)
- `GET /api/newsletter` - Get subscribers (protected)
- `POST /api/newsletter/send-bulk` - Send bulk email (protected)

### Enquiry
- `POST /api/enquiry` - Submit enquiry (public)
- `GET /api/enquiry` - Get all enquiries (protected)

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Frontend stores token in localStorage after successful login.

## Monitoring
```bash
# Check PM2 status
pm2 list

# View logs
pm2 logs anocab-unified-backend

# Restart if needed
pm2 restart anocab-unified-backend
```

## Troubleshooting

### Token not received in browser
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check nginx cache: `sudo systemctl reload nginx`
4. Check backend logs: `pm2 logs anocab-unified-backend`

### 401 Unauthorized errors
1. Verify token is stored in localStorage
2. Check token expiry (24h default)
3. Re-login to get fresh token

### Server not responding
1. Check if backend is running: `pm2 list`
2. Check nginx status: `sudo systemctl status nginx`
3. Check logs: `pm2 logs` and `/var/log/nginx/anocab-error.log`

## Migration Notes
- Old admin_panel and apply_now servers are NO LONGER NEEDED
- All functionality has been moved to unified backend
- Nginx now routes ALL API calls to port 1111 only
- PM2 ecosystem.config.js updated to run only unified backend
