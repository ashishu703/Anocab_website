# 🚀 Deployment Guide

## Step 1: Add GitHub Secrets

Go to: **GitHub Repo > Settings > Secrets and variables > Actions**

Add these secrets:
- `SERVER_IP`: Your VPS IP address
- `SERVER_PASSWORD`: Root password

## Step 2: Run Initial Setup

1. Go to **Actions** tab
2. Click **Initial VPS Setup**
3. Click **Run workflow**
4. Wait for completion (~5 minutes)

## Step 3: Verify Deployment

Visit: `http://YOUR_SERVER_IP`

Check services:
```bash
ssh root@YOUR_SERVER_IP
pm2 status
```

## Step 4: Auto Deploy

Every push to `main` branch will automatically deploy!

```bash
git add .
git commit -m "Update"
git push origin main
```

## 🎯 Services Running

- **Backend API**: Port 1111
- **Admin Panel**: Port 1112  
- **Careers**: Port 1113
- **NGINX**: Port 80

## 📊 Useful Commands

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Check status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all
```

## ✅ Done!

Your website is live with automatic deployments!
