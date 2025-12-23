# Deployment Guide - Hono + Remix

**Updated:** 2025-12-07

---

## 📋 Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured
- [ ] Database migrations are applied
- [ ] Production build completes successfully
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] CORS policies are set correctly
- [ ] Secrets are not committed to git
- [ ] SSL/TLS certificates are configured
- [ ] Health checks are working
- [ ] Logging is configured

---

## 🚀 Deployment Options

### Option 1: Docker Deployment (Recommended)

**Best for:** VPS, cloud instances, self-hosted

#### 1. Build Production Images

```bash
# Build backend
cd backend-hono
docker build -t hono-backend:latest .

# Build frontend
cd frontend-remix
docker build -t remix-frontend:latest .
```

#### 2. Run with Docker Compose

```bash
# Production docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  backend:
    image: hono-backend:latest
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=${DATABASE_URL}
    ports:
      - "3001:3001"
    restart: always

  frontend:
    image: remix-frontend:latest
    environment:
      - NODE_ENV=production
      - API_URL=http://backend:3001
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: always
```

---

### Option 2: Platform-as-a-Service

#### Vercel (Frontend Only)

**Best for:** Remix frontend with serverless API routes

```bash
cd frontend-remix
npm install -g vercel
vercel
```

**Configuration:**
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

**Environment Variables:**
```env
NODE_ENV=production
DATABASE_URL=your-production-db-url
SESSION_SECRET=your-production-secret
```

#### Railway (Full Stack)

**Best for:** Both backend and frontend

1. Connect GitHub repository
2. Add two services:
   - Backend (backend-hono)
   - Frontend (frontend-remix)
3. Configure environment variables
4. Deploy automatically on git push

**Backend Settings:**
- Start Command: `npm start`
- Build Command: `npm run build`
- Port: `3001`

**Frontend Settings:**
- Start Command: `npm start`
- Build Command: `npm run build`
- Port: `3000`

#### Fly.io (Full Stack)

**Best for:** Edge deployment, global distribution

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Deploy backend
cd backend-hono
flyctl launch
flyctl deploy

# Deploy frontend
cd frontend-remix
flyctl launch
flyctl deploy
```

---

### Option 3: VPS Deployment (Ubuntu/Debian)

**Best for:** Complete control, custom configuration

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Deploy Application

```bash
# Clone repository
git clone <your-repo-url> /var/www/app
cd /var/www/app

# Install dependencies
cd backend-hono && npm install --production
cd ../frontend-remix && npm install --production
cd ..

# Build applications
cd backend-hono && npm run build
cd ../frontend-remix && npm run build
cd ..

# Setup Prisma
npx prisma generate
npx prisma migrate deploy
```

#### 3. PM2 Configuration

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [
    {
      name: 'backend-hono',
      cwd: './backend-hono',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'frontend-remix',
      cwd: './frontend-remix',
      script: 'npm',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
```

```bash
# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Nginx Configuration

**/etc/nginx/sites-available/app:**
```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

---

## 🔒 Security Hardening

### 1. Environment Variables

**Never commit secrets!** Use environment-specific files:

```bash
# Production .env (not in git)
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/db
SESSION_SECRET=<generate-strong-random-string>
ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. Firewall Configuration

```bash
# UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 3. Security Headers

Ensure these headers are set (already configured in Hono):
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

### 4. Rate Limiting

Configure appropriate limits:
```typescript
// Production rate limits
rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100, // Adjust based on your needs
})
```

---

## 🗄️ Database Migration

### Development → Production

**Using PostgreSQL:**

1. **Update Prisma schema:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Create production database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE myapp;
CREATE USER myapp_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE myapp TO myapp_user;
```

3. **Run migrations:**
```bash
DATABASE_URL="postgresql://myapp_user:secure_password@localhost:5432/myapp" \
npx prisma migrate deploy
```

4. **Verify migration:**
```bash
npx prisma studio
```

---

## 📊 Monitoring & Logging

### PM2 Monitoring

```bash
# View logs
pm2 logs

# Monitor processes
pm2 monit

# View specific app logs
pm2 logs backend-hono
pm2 logs frontend-remix
```

### Health Checks

Both services expose health endpoints:

```bash
# Backend health
curl http://localhost:3001/health

# Frontend health (if configured)
curl http://localhost:3000/api/health
```

### Log Rotation

**PM2 log rotation:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd backend-hono && npm ci
          cd ../frontend-remix && npm ci

      - name: Run tests
        run: |
          cd backend-hono && npm test
          cd ../frontend-remix && npm test

      - name: Build
        run: |
          cd backend-hono && npm run build
          cd ../frontend-remix && npm run build

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/app
            git pull
            npm install --production
            npm run build
            pm2 restart all
```

---

## 🚨 Troubleshooting

### Common Issues

**1. Port already in use:**
```bash
# Find process using port
sudo lsof -i :3001
# Kill process
sudo kill -9 <PID>
```

**2. Database connection failed:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql
# Check connection string
echo $DATABASE_URL
```

**3. PM2 app not starting:**
```bash
# Check logs
pm2 logs <app-name> --lines 100
# Restart app
pm2 restart <app-name>
```

**4. Nginx 502 Bad Gateway:**
```bash
# Check backend is running
curl http://localhost:3001/health
# Check Nginx error log
sudo tail -f /var/log/nginx/error.log
```

---

## 📈 Performance Optimization

### Backend (Hono)

1. Enable compression
2. Use connection pooling for database
3. Implement caching (Redis)
4. Use CDN for static assets

### Frontend (Remix)

1. Enable code splitting
2. Optimize images
3. Use CDN for static assets
4. Implement service workers
5. Enable prefetching

### Database (PostgreSQL)

1. Add indexes on frequently queried columns
2. Use connection pooling
3. Regular VACUUM and ANALYZE
4. Monitor slow queries

---

## 🔐 Backup Strategy

### Database Backups

```bash
# PostgreSQL backup script
#!/bin/bash
BACKUP_DIR="/var/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U myapp_user myapp > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -type f -mtime +7 -delete  # Keep 7 days
```

### Application Backups

```bash
# Backup application files
tar -czf app_backup_$(date +%Y%m%d).tar.gz /var/www/app
```

---

## 📞 Support Resources

- [Hono Documentation](https://hono.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Last Updated:** 2025-12-07
**Status:** ✅ Production-Ready
