# Anocab Website

Production-ready website with automated CI/CD deployment.

## 🚀 Quick Deploy

1. **Add GitHub Secrets:**
   - `SERVER_IP`: Your VPS IP address
   - `SERVER_PASSWORD`: Root password

2. **Run Initial Setup:**
   - Go to Actions > Initial VPS Setup > Run workflow
   - Fill in MongoDB URI and email credentials

3. **Auto Deploy:**
   - Push to `main` branch
   - Automatic deployment with zero downtime

## 📊 Services

- **Backend API** (Port 1111) - Main API server
- **Admin Panel** (Port 1112) - Admin interface
- **Careers** (Port 1113) - Job applications
- **NGINX** (Port 80/443) - Web server & reverse proxy

## 🔧 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all
```

## 🌐 Access

- Website: http://YOUR_SERVER_IP
- API: http://YOUR_SERVER_IP/api/prices
- Admin: http://YOUR_SERVER_IP/admin_panel/
