# Production Deployment Guide

> **⚠️ WARNING: The project is NOT production-ready.** A comprehensive [project audit](FULL-PROJECT-AUDIT.md) (Feb 24, 2026) identified 140+ issues including 22 runtime crash bugs, 15 security vulnerabilities, and 60+ endpoints with missing input validation. **All critical issues in [KNOWN-ISSUES.md](KNOWN-ISSUES.md) must be resolved before production deployment.**
>
> This guide documents the deployment process for when the project reaches a deployable state.

**Last Updated**: March 1, 2026  
**Build Status**: ✅ Compiles with zero errors  
**Production Readiness**: ❌ See [FULL-PROJECT-AUDIT.md](FULL-PROJECT-AUDIT.md)

---

## 🚀 Quick Start - Production Deployment

### Prerequisites
- Node.js v18+ installed
- PostgreSQL 14+ running
- Environment variables configured
- Domain/server ready

### Step 1: Environment Configuration

Create `.env` file in project root:

```env
# Application
NODE_ENV=production
PORT=3001

# Database (use exact variable names below)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password_here
DB_DATABASE=ecommerce

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URLS=https://yourdomain.com,https://www.yourdomain.com,https://admin.yourdomain.com

# Rate Limiting
RATE_LIMIT=300
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# Supabase (file storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_BUCKET_NAME=uploads

# Email (if using email features)
NOTIFICATION_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
MAIL_FROM=Labverse <noreply@labverse.com>
FRONTEND_URL=https://yourdomain.com
```

### Step 2: Install Dependencies

```bash
# Install production dependencies
npm ci --only=production

# Or with all dependencies for build
npm ci
```

### Step 3: Database Setup

```bash
# Run migrations
npm run migration:run

# Verify migrations
npm run migration:show

# Seed initial data (roles, permissions, super admin)
npm run seed:all
```

### Step 4: Build Application

```bash
# Build TypeScript to JavaScript
npm run build

# Verify build
ls dist/
```

### Step 5: Start Production Server

```bash
# Using npm
npm run start:prod

# Or using PM2 (recommended)
pm2 start dist/main.js --name "ecommerce-api"
pm2 save
pm2 startup
```

---

## 📋 Pre-Production Checklist

### Security
- [x] Environment variables secured (not in repository)
- [x] JWT secret is strong (min 32 characters)
- [x] Database passwords are secure
- [x] Helmet middleware enabled
- [x] CORS properly configured
- [x] Rate limiting enabled
- [ ] SSL/TLS certificates configured
- [ ] API keys rotated

### Database
- [x] All migrations executed
- [x] Database backups configured
- [x] Connection pooling configured
- [x] Indexes optimized
- [ ] Database monitoring setup

### Application
- [x] Build successful
- [x] All TypeScript errors resolved
- [x] Auth endpoints working
- [x] Role-based permissions working
- [x] Error handling implemented
- [ ] Logging configured (Sentry/CloudWatch)
- [ ] Health check endpoint added

### Testing
- [x] Database schema verified
- [x] Auth flow tested
- [x] Role assignment tested
- [ ] Load testing completed
- [ ] Security audit completed
- [ ] API documentation updated

### Monitoring
- [ ] APM tool configured (New Relic/DataDog)
- [ ] Error tracking (Sentry)
- [ ] Log aggregation (ELK/CloudWatch)
- [ ] Uptime monitoring
- [ ] Performance monitoring

---

## 🔧 Production Configuration

### PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'ecommerce-api',
    script: './dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 monit
```

### Nginx Configuration

Create `/etc/nginx/sites-available/ecommerce-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API documentation
    location /api/docs {
        proxy_pass http://localhost:3001/api/docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/ecommerce-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🧪 Testing the Deployment

### 1. Health Check
```bash
curl https://api.yourdomain.com/
```

### 2. Register User
```bash
curl -X POST https://api.yourdomain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@12345",
    "name": "Test User"
  }'
```

### 3. Login
```bash
curl -X POST https://api.yourdomain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@12345"
  }'
```

### 4. Get Profile
```bash
curl https://api.yourdomain.com/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Get Roles
```bash
curl https://api.yourdomain.com/roles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Available API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout user
- `POST /auth/password-forgot` - Request password reset
- `POST /auth/reset-password` - Reset password

### Users
- `GET /users/me` - Get current user profile ✨ NEW
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/:id/permissions` - Get user permissions
- `GET /users/available-features` - Get all modules

### User Roles ✨ NEW
- `POST /users/:userId/roles` - Assign role to user
- `GET /users/:userId/roles` - Get user's roles
- `DELETE /users/:userId/roles/:roleId` - Remove role from user

### Roles
- `GET /roles` - List all roles
- `GET /roles/:id` - Get role details
- `POST /roles` - Create role
- `PATCH /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role

### Permissions
- `GET /permissions` - List all permissions
- `GET /permissions/:id` - Get permission details
- `GET /permissions/role/:roleId` - Get permissions by role
- `GET /permissions/module/:module` - Get permissions by module
- `POST /permissions` - Create permission
- `PATCH /permissions/:id` - Update permission
- `DELETE /permissions/:id` - Delete permission

### Role-Permissions
- `GET /role-permissions/:roleId` - Get role's permissions
- `POST /role-permissions/:roleId` - Validate permissions for role
- `DELETE /role-permissions/:roleId/:permissionId` - Remove permission

### API Documentation
- `GET /api/docs` - Swagger documentation

---

## 🔐 Initial Data Seeding

Create initial roles and permissions:

```sql
-- Insert roles
INSERT INTO roles (id, name, display_name, description, is_system) VALUES
('11111111-1111-1111-1111-111111111111', 'super_admin', 'Super Admin', 'Full system access', true),
('22222222-2222-2222-2222-222222222222', 'admin', 'Admin', 'Administrative access', true),
('33333333-3333-3333-3333-333333333333', 'seller', 'Seller', 'Seller access', true),
('44444444-4444-4444-4444-444444444444', 'customer', 'Customer', 'Customer access', true);

-- Insert admin permissions
INSERT INTO permissions (role_id, module, action) VALUES
('22222222-2222-2222-2222-222222222222', 'users', 'create'),
('22222222-2222-2222-2222-222222222222', 'users', 'read'),
('22222222-2222-2222-2222-222222222222', 'users', 'update'),
('22222222-2222-2222-2222-222222222222', 'users', 'delete'),
('22222222-2222-2222-2222-222222222222', 'roles', 'create'),
('22222222-2222-2222-2222-222222222222', 'roles', 'read'),
('22222222-2222-2222-2222-222222222222', 'roles', 'update'),
('22222222-2222-2222-2222-222222222222', 'roles', 'delete'),
('22222222-2222-2222-2222-222222222222', 'permissions', 'create'),
('22222222-2222-2222-2222-222222222222', 'permissions', 'read'),
('22222222-2222-2222-2222-222222222222', 'permissions', 'update'),
('22222222-2222-2222-2222-222222222222', 'permissions', 'delete');
```

---

## 📈 Monitoring & Maintenance

### PM2 Monitoring
```bash
# View logs
pm2 logs ecommerce-api

# Monitor resources
pm2 monit

# Restart app
pm2 restart ecommerce-api

# Reload without downtime
pm2 reload ecommerce-api
```

### Database Backups
```bash
# Backup script (create backup.sh)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgresql"
DB_NAME="ecommerce"

mkdir -p $BACKUP_DIR
pg_dump -U postgres $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

Schedule with cron:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### Log Rotation
```bash
# Install logrotate
sudo apt install logrotate

# Create /etc/logrotate.d/ecommerce-api
/var/www/ecommerce-api/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reload ecommerce-api > /dev/null
    endscript
}
```

---

## 🚨 Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs ecommerce-api --lines 100

# Check environment variables
pm2 env 0

# Check port availability
sudo netstat -tulpn | grep 3001
```

### Database connection issues
```bash
# Test connection
psql -U postgres -d ecommerce -c "SELECT 1;"

# Check if migrations ran
npm run typeorm migration:show

# Re-run migrations if needed
npm run typeorm migration:run
```

### High memory usage
```bash
# Check memory
pm2 list
free -h

# Restart with limited memory
pm2 restart ecommerce-api --max-memory-restart 1G
```

### Slow API responses
```bash
# Enable query logging in TypeORM
# Add to data-source.ts:
logging: true,
logger: 'advanced-console',

# Check database indexes
node show-structures.js

# Analyze slow queries
# In PostgreSQL:
# log_min_duration_statement = 1000
```

---

## 📝 Rollback Procedure

If deployment fails:

```bash
# Stop current version
pm2 stop ecommerce-api

# Restore database backup
gunzip < /backups/postgresql/backup_YYYYMMDD_HHMMSS.sql.gz | psql -U postgres ecommerce

# Checkout previous version
git checkout previous-tag

# Reinstall and rebuild
npm ci
npm run build

# Restart
pm2 restart ecommerce-api
```

---

## ✅ Production Readiness Verification

Run these commands to verify everything is ready:

```bash
# 1. Check database schema
node check-auth-tables.js

# 2. Run alignment tests
node test-auth-alignment.js

# 3. Build application
npm run build

# 4. Start in production mode
NODE_ENV=production npm run start:prod
```

All checks should pass before deploying to production.

---

## 🎯 Performance Optimization

### Enable Compression
In `main.ts`, add:
```typescript
import compression from 'compression';
app.use(compression());
```

### Database Connection Pooling
In `database.config.ts`:
```typescript
extra: {
  max: 20, // Maximum pool size
  min: 5,  // Minimum pool size
  idleTimeoutMillis: 30000,
},
```

### Caching (Redis)
```bash
npm install @nestjs/cache-manager cache-manager
```

---

## 📞 Support & Maintenance

### Documentation
- API Docs: `https://api.yourdomain.com/api/docs`
- This Guide: `PRODUCTION-DEPLOYMENT-GUIDE.md`
- Fix Report: `AUTH-MODULES-FIX-REPORT.md`
- Verification: `FINAL-VERIFICATION-REPORT.md`

### Contacts
- Development Team: dev@yourdomain.com
- DevOps Team: devops@yourdomain.com
- Emergency: +1-XXX-XXX-XXXX

---

## ✅ Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables configured
- [ ] Database migrations executed
- [ ] Initial data seeded (roles, permissions)
- [ ] SSL certificates installed
- [ ] Nginx/reverse proxy configured
- [ ] PM2 or process manager setup
- [ ] Monitoring tools configured
- [ ] Backup strategy implemented
- [ ] Log rotation configured
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] API documentation accessible
- [ ] Health checks working
- [ ] Load testing completed
- [ ] Rollback procedure tested

---

**Status**: ⚠️ **NOT READY FOR PRODUCTION** — See [FULL-PROJECT-AUDIT.md](FULL-PROJECT-AUDIT.md) and [KNOWN-ISSUES.md](KNOWN-ISSUES.md) for required fixes.

Once all critical issues are resolved, your system will be ready for deployment to testing and production environments!
