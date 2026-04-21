# Domain Setup Guide

## Access Your Website

**Current Access:** http://YOUR_SERVER_IP

## Add Domain (anocab.com)

### Step 1: Update DNS Records
Go to your domain registrar (GoDaddy, Namecheap, etc.) and add:

```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 3600

Type: A  
Name: www
Value: YOUR_SERVER_IP
TTL: 3600
```

### Step 2: Wait for DNS Propagation (5-30 minutes)
Check: https://dnschecker.org

### Step 3: Install SSL Certificate
```bash
ssh root@YOUR_SERVER_IP

# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d anocab.com -d www.anocab.com

# Test auto-renewal
certbot renew --dry-run
```

### Step 4: Update Backend .env
```bash
nano /var/www/anocab/backend/.env
# Change: API_BASE_URL=https://anocab.com

pm2 restart all
```

Done! Your site will be live at https://anocab.com
