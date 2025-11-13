# OnlyArts Platform - Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Configuration ✅

#### Backend Environment Variables
- [ ] `NODE_ENV` set to `production`
- [ ] `PORT` configured (default: 5000)
- [ ] `DATABASE_URL` or individual DB credentials set
- [ ] `JWT_ACCESS_SECRET` - **MUST be random and secure (min 32 characters)**
- [ ] `JWT_REFRESH_SECRET` - **MUST be random and secure (min 32 characters)**
- [ ] `FRONTEND_URL` set to production frontend URL
- [ ] `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` configured
- [ ] `STRIPE_SECRET_KEY` set to production key (starts with `sk_live_`)
- [ ] `STRIPE_WEBHOOK_SECRET` configured for production webhooks
- [ ] Email service configured (Gmail or SMTP)

#### Frontend Environment Variables
- [ ] `VITE_API_BASE_URL` set to production API URL
- [ ] `VITE_WS_URL` set to production WebSocket URL
- [ ] `VITE_STRIPE_PUBLIC_KEY` set to production key (starts with `pk_live_`)

---

### 2. Database Setup ✅

- [ ] MySQL database created with proper name
- [ ] Database user created with appropriate permissions
- [ ] All migrations run successfully
- [ ] Database backed up (baseline backup)
- [ ] Database connection pooling configured
- [ ] Database timezone set to UTC
- [ ] Indexes created for performance:
  - [ ] Users table: `email`, `username`
  - [ ] Artworks table: `artist_id`, `status`, `created_at`
  - [ ] Orders table: `user_id`, `status`, `created_at`
  - [ ] Notifications table: `user_id`, `is_read`, `created_at`

---

### 3. Security Configuration ✅

- [ ] JWT secrets are strong and random (use `openssl rand -base64 32`)
- [ ] CORS configured to only allow production frontend URL
- [ ] Rate limiting enabled on all endpoints
- [ ] SQL injection prevention verified (parameterized queries)
- [ ] XSS protection headers configured
- [ ] HTTPS enforced in production
- [ ] Sensitive data (passwords, tokens) never logged
- [ ] File upload size limits configured
- [ ] File type restrictions enforced for uploads
- [ ] API authentication on all protected routes tested

---

### 4. Third-Party Service Integration ✅

#### Cloudinary (Image Storage)
- [ ] Account created and verified
- [ ] Upload preset configured (if needed)
- [ ] Folder structure defined
- [ ] Backup strategy in place
- [ ] Bandwidth limits reviewed

#### Stripe (Payments)
- [ ] Account fully verified and activated
- [ ] Production API keys obtained
- [ ] Webhook endpoint registered in Stripe dashboard
- [ ] Test payments completed successfully
- [ ] Subscription plans created in Stripe
- [ ] Tax rates configured (if applicable)
- [ ] Refund policy documented

#### Email Service
- [ ] Gmail app password generated OR SMTP credentials obtained
- [ ] Test emails sent successfully
- [ ] Email templates reviewed
- [ ] Unsubscribe mechanism implemented
- [ ] SPF/DKIM records configured (for custom domain)

---

### 5. Performance Optimization ✅

- [ ] Frontend assets minified and bundled
- [ ] Images optimized and lazy-loaded
- [ ] CDN configured for static assets (optional)
- [ ] Gzip compression enabled
- [ ] Database query performance tested
- [ ] API response caching implemented (where appropriate)
- [ ] WebSocket connection limits configured

---

### 6. Testing ✅

#### Backend Testing
- [ ] All API endpoints tested
- [ ] Authentication flow tested (register, login, logout, refresh)
- [ ] File uploads tested
- [ ] Payment flow tested (subscriptions, orders)
- [ ] Email notifications tested
- [ ] WebSocket connections tested
- [ ] Error handling tested
- [ ] Load testing completed (recommended: Artillery, Apache Bench)

#### Frontend Testing
- [ ] All pages load correctly
- [ ] User flows tested (signup, browse, purchase, etc.)
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Form validations working
- [ ] Error messages displayed correctly
- [ ] Loading states working
- [ ] Toast notifications working

#### Integration Testing
- [ ] End-to-end purchase flow
- [ ] Subscription upgrade/downgrade
- [ ] Commission request submission
- [ ] Exhibition browsing and participation
- [ ] Livestream viewing and bidding
- [ ] Chat messaging
- [ ] Notification delivery

---

### 7. Monitoring & Logging ✅

- [ ] Error tracking service configured (e.g., Sentry)
- [ ] Application logging configured
- [ ] Database slow query logging enabled
- [ ] Server monitoring set up (CPU, memory, disk)
- [ ] Uptime monitoring configured (e.g., UptimeRobot)
- [ ] Webhook delivery monitoring
- [ ] Payment success/failure tracking

---

### 8. Backup & Recovery ✅

- [ ] Database backup schedule configured (daily recommended)
- [ ] File storage backup configured
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented
- [ ] Database migration rollback strategy defined

---

### 9. Documentation ✅

- [ ] API documentation complete
- [ ] Environment setup guide reviewed
- [ ] Deployment procedures documented
- [ ] Troubleshooting guide created
- [ ] Admin user guide created
- [ ] User privacy policy created
- [ ] Terms of service created

---

### 10. Legal & Compliance ✅

- [ ] Privacy policy reviewed by legal
- [ ] Terms of service reviewed by legal
- [ ] Cookie consent implemented (if in EU)
- [ ] GDPR compliance verified (if applicable)
- [ ] Payment card industry (PCI) compliance (handled by Stripe)
- [ ] User data deletion process implemented
- [ ] Age verification implemented (18+ if needed)

---

## Deployment Steps

### Backend Deployment

1. **Build Backend**
   ```bash
   cd backend
   npm install --production
   npm run build  # If using TypeScript
   ```

2. **Set up Environment**
   - Copy `.env.example` to `.env`
   - Fill in all production values
   - Verify all secrets are secure

3. **Run Database Migrations**
   ```bash
   npm run migrate
   # OR manually run SQL files in proper order
   ```

4. **Start Server**
   ```bash
   npm start
   # OR use PM2 for process management
   pm2 start npm --name "onlyarts-backend" -- start
   pm2 save
   pm2 startup
   ```

5. **Verify Backend Health**
   ```bash
   curl https://api.yourdomain.com/health
   ```

---

### Frontend Deployment

1. **Build Frontend**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Hosting**
   - Upload `dist/` folder to hosting service
   - Configure domain and SSL certificate
   - Set up redirects for SPA routing

3. **Verify Frontend**
   - Open production URL in browser
   - Test critical user flows
   - Check browser console for errors

---

## Post-Deployment Checklist ✅

- [ ] SSL certificate active and auto-renewal configured
- [ ] Domain DNS properly configured
- [ ] All critical user flows tested in production
- [ ] Admin account created and tested
- [ ] Test transactions completed and verified
- [ ] Monitoring dashboards checked
- [ ] Team notified of deployment
- [ ] Rollback plan prepared
- [ ] First 24-hour monitoring scheduled

---

## Common Production Issues & Solutions

### Issue: Database Connection Fails
- **Check**: DB credentials in `.env`
- **Check**: Database server allows remote connections
- **Check**: Firewall rules allow connection on DB port

### Issue: Images Not Uploading
- **Check**: Cloudinary credentials correct
- **Check**: API key permissions
- **Check**: File size limits
- **Check**: CORS settings

### Issue: Payments Not Working
- **Check**: Using live Stripe keys (not test keys)
- **Check**: Webhook endpoint accessible from internet
- **Check**: Webhook secret matches Stripe dashboard
- **Check**: SSL certificate valid

### Issue: Emails Not Sending
- **Check**: Email credentials correct
- **Check**: App password used (for Gmail)
- **Check**: SMTP ports not blocked by firewall
- **Check**: Email templates rendering correctly

### Issue: High Server Load
- **Check**: Database query performance
- **Check**: Enable caching
- **Check**: Optimize image serving
- **Check**: Review API rate limiting

---

## Emergency Contacts

- **Backend Developer**: [Your Email]
- **Frontend Developer**: [Your Email]
- **DevOps**: [Your Email]
- **Database Admin**: [Your Email]

## Rollback Procedure

1. Stop current deployment
2. Restore previous database backup
3. Deploy previous stable version
4. Verify system health
5. Notify users of temporary issues (if needed)

---

## Success Criteria

- [ ] All features accessible
- [ ] No critical errors in logs
- [ ] Response times < 2 seconds for API calls
- [ ] Payment processing working
- [ ] Email notifications sending
- [ ] Zero downtime during deployment
- [ ] Mobile experience smooth
- [ ] Admin dashboard functional

---

**Deployment Date**: ___________
**Deployed By**: ___________
**Version**: ___________
**Sign-off**: ___________
