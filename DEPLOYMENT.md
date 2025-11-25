# FinPilot Deployment Guide

This guide provides instructions for deploying FinPilot to production.

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security audit completed
- [ ] Performance optimization done
- [ ] Documentation updated

## Environment Setup

### 1. Production Environment Variables

Create `.env.production`:

```
# Database
DATABASE_URL=postgresql://user:password@prod-db-host:5432/finpilot_prod

# JWT
JWT_SECRET=your_production_jwt_secret_key_change_this
JWT_EXPIRATION=24h
REFRESH_TOKEN_SECRET=your_production_refresh_token_secret
REFRESH_TOKEN_EXPIRATION=7d

# API
API_URL=https://api.finpilot.com
FRONTEND_URL=https://finpilot.com

# Logging
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Redis (for caching and sessions)
REDIS_URL=redis://prod-redis-host:6379

# AWS (for file storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=finpilot-prod
AWS_REGION=us-east-1
```

## Deployment Options

### Option 1: Deploy to Vercel

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add all production environment variables

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy to AWS EC2

1. **Launch EC2 Instance**
   ```bash
   # Use Ubuntu 22.04 LTS
   # Instance type: t3.medium or larger
   # Storage: 30GB SSD
   ```

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm postgresql nginx
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/UnknownDeveloper2k24/FinCoach-AI-V3.git
   cd FinCoach-AI-V3
   ```

4. **Install Node Dependencies**
   ```bash
   npm ci
   ```

5. **Setup Database**
   ```bash
   # Create PostgreSQL database
   sudo -u postgres createdb finpilot_prod
   
   # Run migrations
   npx prisma migrate deploy
   ```

6. **Build Application**
   ```bash
   npm run build
   ```

7. **Configure Nginx**
   ```nginx
   server {
     listen 80;
     server_name api.finpilot.com;
     
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

8. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot certonly --nginx -d api.finpilot.com
   ```

9. **Start Application with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "finpilot" -- start
   pm2 startup
   pm2 save
   ```

### Option 3: Deploy to Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci
   
   COPY . .
   
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         DATABASE_URL: postgresql://postgres:password@db:5432/finpilot
       depends_on:
         - db
     
     db:
       image: postgres:15
       environment:
         POSTGRES_PASSWORD: password
         POSTGRES_DB: finpilot
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

3. **Build and Run**
   ```bash
   docker-compose up -d
   ```

### Option 4: Deploy to Railway

1. **Connect Repository**
   - Go to railway.app
   - Create new project
   - Connect GitHub repository

2. **Configure Environment Variables**
   - Add all production environment variables in Railway dashboard

3. **Deploy**
   - Railway automatically deploys on push to main branch

## Database Migration

### 1. Backup Production Database
```bash
pg_dump finpilot_prod > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Run Migrations
```bash
npx prisma migrate deploy
```

### 3. Verify Migration
```bash
npx prisma db push --skip-generate
```

## Monitoring and Logging

### 1. Setup Sentry for Error Tracking
```bash
npm install @sentry/nextjs
```

### 2. Configure Sentry
```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 3. Setup CloudWatch Logs (AWS)
```bash
npm install aws-sdk
```

### 4. Monitor Performance
- Use New Relic or DataDog
- Monitor API response times
- Track database query performance
- Monitor error rates

## Security Hardening

### 1. Enable HTTPS
- Use SSL/TLS certificates
- Redirect HTTP to HTTPS
- Set HSTS headers

### 2. Configure CORS
```typescript
// middleware.ts
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

### 3. Rate Limiting
```bash
npm install express-rate-limit
```

### 4. Security Headers
```typescript
// middleware.ts
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

## Performance Optimization

### 1. Enable Caching
```typescript
// Use Redis for caching
npm install redis
```

### 2. Database Optimization
- Add indexes to frequently queried columns
- Use connection pooling
- Optimize slow queries

### 3. API Response Compression
```typescript
import compression from 'compression';
app.use(compression());
```

### 4. CDN Setup
- Use CloudFront (AWS) or Cloudflare
- Cache static assets
- Compress responses

## Rollback Plan

### 1. Database Rollback
```bash
# Rollback to previous migration
npx prisma migrate resolve --rolled-back <migration_name>
```

### 2. Application Rollback
```bash
# Revert to previous commit
git revert <commit_hash>
npm run build
npm start
```

## Post-Deployment

### 1. Verify Deployment
- Test all API endpoints
- Verify database connectivity
- Check error logging
- Monitor performance metrics

### 2. Update DNS
- Point domain to new server
- Update API endpoint in frontend

### 3. Notify Users
- Send deployment notification
- Update status page
- Document changes

## Continuous Deployment

### 1. GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

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
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Troubleshooting

### Issue: Database Connection Failed
```bash
# Check database credentials
# Verify network connectivity
# Check firewall rules
psql -h <host> -U <user> -d <database>
```

### Issue: High Memory Usage
```bash
# Check for memory leaks
# Optimize database queries
# Increase server resources
```

### Issue: Slow API Response
```bash
# Enable query logging
# Check database indexes
# Use caching
# Optimize code
```

## Support

For deployment issues, contact:
- Email: support@finpilot.com
- Documentation: https://docs.finpilot.com
- GitHub Issues: https://github.com/UnknownDeveloper2k24/FinCoach-AI-V3/issues
