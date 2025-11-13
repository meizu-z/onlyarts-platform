# OnlyArts - Production Setup Guide

## Table of Contents
1. [Server Requirements](#server-requirements)
2. [Database Setup](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [SSL Configuration](#ssl-configuration)
6. [Production Environment Variables](#production-environment-variables)
7. [Process Management](#process-management)
8. [Monitoring](#monitoring)

---

## Server Requirements

### Recommended Specifications

#### Backend Server
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB SSD minimum
- **OS**: Ubuntu 20.04/22.04 LTS or similar
- **Node.js**: v18.x or v20.x LTS
- **MySQL**: 8.0+

#### Frontend Hosting
- Static file hosting (Vercel, Netlify, AWS S3 + CloudFront, etc.)
- CDN enabled
- HTTPS supported

---

## Database Setup

### 1. Install MySQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation
```

### 2. Create Database and User

```sql
-- Login to MySQL
sudo mysql -u root -p

-- Create database
CREATE DATABASE onlyarts CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with strong password
CREATE USER 'onlyarts_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';

-- Grant privileges
GRANT ALL PRIVILEGES ON onlyarts.* TO 'onlyarts_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

### 3. Configure MySQL for Production

Edit `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
[mysqld]
# Connection settings
max_connections = 200
wait_timeout = 600
interactive_timeout = 600

# Performance
innodb_buffer_pool_size = 2G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2

# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Timezone
default-time-zone = '+00:00'
```

Restart MySQL:
```bash
sudo systemctl restart mysql
```

### 4. Run Database Migrations

```bash
cd backend
mysql -u onlyarts_user -p onlyarts < migrations/001_initial_schema.sql
# Run other migration files in order
```

---

## Backend Deployment

### 1. Install Node.js

```bash
# Install Node.js v20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/yourusername/onlyarts-platform.git
cd onlyarts-platform/backend
```

### 3. Install Dependencies

```bash
npm install --production
```

### 4. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit with your production values
nano .env
```

**Production `.env` configuration:**

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=onlyarts
DB_USER=onlyarts_user
DB_PASSWORD=STRONG_DB_PASSWORD

# JWT - Generate with: openssl rand -base64 32
JWT_ACCESS_SECRET=your-random-32-char-secret-here
JWT_REFRESH_SECRET=your-different-random-32-char-secret-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
FRONTEND_URL=https://yourdomain.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-prod-cloud-name
CLOUDINARY_API_KEY=your-prod-api-key
CLOUDINARY_API_SECRET=your-prod-api-secret

# Stripe (LIVE keys)
STRIPE_SECRET_KEY=sk_live_your_live_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM_NAME=OnlyArts
```

### 5. Set Up PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application with PM2
pm2 start npm --name "onlyarts-backend" -- start

# Configure PM2 startup script
pm2 startup
# Run the command it outputs

# Save PM2 process list
pm2 save

# Monitor application
pm2 monit
```

### 6. Configure PM2 Logs

```bash
# View logs
pm2 logs onlyarts-backend

# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure Project**
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add:
     ```
     VITE_API_BASE_URL=https://api.yourdomain.com/api
     VITE_WS_URL=wss://api.yourdomain.com
     VITE_STRIPE_PUBLIC_KEY=pk_live_your_public_key
     ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Build Project**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Configure Environment Variables**
   - Netlify Dashboard → Site Settings → Environment Variables

### Option 3: Traditional Server (Nginx)

1. **Build Frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Install Nginx**
   ```bash
   sudo apt install nginx
   ```

3. **Configure Nginx**

Create `/etc/nginx/sites-available/onlyarts`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/onlyarts-platform/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/onlyarts /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## SSL Configuration

### Using Certbot (Let's Encrypt)

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain SSL Certificate**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Auto-Renewal**
   ```bash
   # Test renewal
   sudo certbot renew --dry-run

   # Certbot automatically sets up a cron job for renewal
   ```

4. **Configure Backend for HTTPS**

Update backend Nginx config (if using reverse proxy):

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Production Environment Variables

### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_NAME` | Database name | `onlyarts` |
| `DB_USER` | Database user | `onlyarts_user` |
| `DB_PASSWORD` | Database password | `SecurePassword123!` |
| `JWT_ACCESS_SECRET` | Access token secret | Random 32+ chars |
| `JWT_REFRESH_SECRET` | Refresh token secret | Random 32+ chars |
| `FRONTEND_URL` | Frontend URL | `https://yourdomain.com` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `AbCdEfGhIjKlMnOp` |
| `STRIPE_SECRET_KEY` | Stripe secret key (LIVE) | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `EMAIL_SERVICE` | Email service type | `smtp` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Email username | `noreply@yourdomain.com` |
| `EMAIL_PASSWORD` | Email password | `app-password` |

### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | API base URL | `https://api.yourdomain.com/api` |
| `VITE_WS_URL` | WebSocket URL | `wss://api.yourdomain.com` |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe public key (LIVE) | `pk_live_...` |
| `VITE_APP_ENV` | App environment | `production` |

---

## Process Management

### PM2 Commands

```bash
# Start application
pm2 start npm --name "onlyarts-backend" -- start

# Stop application
pm2 stop onlyarts-backend

# Restart application
pm2 restart onlyarts-backend

# Delete from PM2
pm2 delete onlyarts-backend

# View logs
pm2 logs onlyarts-backend

# Monitor resources
pm2 monit

# List all processes
pm2 list

# Save process list
pm2 save

# Resurrect saved processes
pm2 resurrect
```

### Zero-Downtime Deployment

```bash
# Pull latest code
cd /var/www/onlyarts-platform/backend
git pull origin main

# Install dependencies
npm install --production

# Restart with zero downtime
pm2 reload onlyarts-backend
```

---

## Monitoring

### 1. Application Monitoring

**Install PM2 monitoring (optional)**
```bash
pm2 install pm2-server-monit
```

### 2. Error Tracking (Sentry)

1. Create account at [sentry.io](https://sentry.io)
2. Get DSN
3. Install in backend:
   ```bash
   npm install @sentry/node
   ```
4. Configure in `backend/src/app.js`:
   ```javascript
   const Sentry = require('@sentry/node');

   Sentry.init({
     dsn: 'your-sentry-dsn',
     environment: process.env.NODE_ENV
   });
   ```

### 3. Uptime Monitoring

Use services like:
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

Configure to monitor:
- Frontend URL
- Backend API health endpoint (`/health`)
- Database connectivity

---

## Performance Optimization

### 1. Database Indexing

```sql
-- Add indexes for common queries
CREATE INDEX idx_artworks_artist ON artworks(artist_id);
CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
```

### 2. Enable Query Caching (optional)

Install Redis for caching:
```bash
sudo apt install redis-server
sudo systemctl enable redis-server
```

### 3. CDN Configuration

Use a CDN like Cloudflare to:
- Cache static assets
- DDoS protection
- SSL management
- Performance optimization

---

## Security Best Practices

1. **Keep software updated**
   ```bash
   sudo apt update && sudo apt upgrade
   npm update
   ```

2. **Configure Firewall**
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

3. **Disable root SSH login**
   Edit `/etc/ssh/sshd_config`:
   ```
   PermitRootLogin no
   ```

4. **Use strong passwords**
5. **Enable 2FA where possible**
6. **Regular security audits**
   ```bash
   npm audit
   ```

---

## Backup Strategy

### Database Backups

Create backup script `/usr/local/bin/backup-onlyarts.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/onlyarts"
DB_NAME="onlyarts"
DB_USER="onlyarts_user"
DB_PASS="your_password"

mkdir -p $BACKUP_DIR
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup-onlyarts.sh
```

Add to crontab (daily at 2 AM):
```bash
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-onlyarts.sh
```

---

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs onlyarts-backend

# Check for port conflicts
sudo lsof -i :5000

# Verify environment variables
cd /var/www/onlyarts-platform/backend
cat .env
```

### Database Connection Issues
```bash
# Test MySQL connection
mysql -u onlyarts_user -p onlyarts

# Check MySQL is running
sudo systemctl status mysql
```

### High Memory Usage
```bash
# Check processes
pm2 monit
top

# Restart application
pm2 restart onlyarts-backend
```

---

## Support & Maintenance

- Review logs daily
- Monitor error rates
- Check disk space weekly
- Update dependencies monthly
- Test backups monthly
- Security updates immediately

For issues, check logs first:
```bash
pm2 logs onlyarts-backend
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u mysql -f
```

---

**Last Updated**: [Date]
**Maintained By**: [Your Name]
