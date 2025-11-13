# OnlyArts - Configuration Guide

## Quick Setup for High Priority Services

### 1. Email Service Configuration (Gmail)

#### Step 1: Generate Gmail App Password
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Select **Mail** and **Windows Computer** (or other)
5. Click **Generate**
6. Copy the **16-character password** (e.g., `abcd efgh ijkl mnop`)

#### Step 2: Configure Backend
Edit `backend/.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM_NAME=OnlyArts
```

#### Step 3: Restart Backend
The server will automatically verify the email configuration on startup.

#### Test Email:
```bash
cd backend
node -e "const {sendWelcomeEmail} = require('./src/config/email'); sendWelcomeEmail('test@test.com', 'Test').then(console.log)"
```

---

### 2. Stripe Webhook Configuration

#### Step 1: Install Stripe CLI
**Windows:**
```bash
# Download from: https://github.com/stripe/stripe-cli/releases
# Or use Scoop:
scoop install stripe
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

#### Step 2: Login to Stripe
```bash
stripe login
```

#### Step 3: Forward Webhooks to Local Server
```bash
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

This will output:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

#### Step 4: Configure Backend
Copy the webhook secret and edit `backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

#### Step 5: Test Webhooks
In a new terminal:
```bash
# Test payment success
stripe trigger payment_intent.succeeded

# Test subscription created
stripe trigger customer.subscription.created
```

Check backend console for webhook event logs.

---

### 3. Cloudinary Configuration (Image Uploads)

#### Step 1: Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Go to **Dashboard**

#### Step 2: Get API Credentials
Copy these from your dashboard:
- **Cloud Name**
- **API Key**
- **API Secret**

#### Step 3: Configure Backend
Edit `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Step 4: Test Upload
The upload endpoint is already configured at:
- `POST /api/upload/image`
- `POST /api/upload/video`

---

### 4. Database Verification

#### Check Connection:
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPassword123! -e "USE onlyarts; SELECT 'Connected' as status;"
```

#### Verify All Tables:
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPassword123! -e "USE onlyarts; SHOW TABLES;"
```

#### Create Admin User (if needed):
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPassword123! -e "USE onlyarts; UPDATE users SET role = 'admin' WHERE username = 'your_username';"
```

---

### 5. Environment Variables Checklist

#### Backend `.env` File:
```env
# ✅ Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# ✅ Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=onlyarts
DB_USER=root
DB_PASSWORD=Password123!

# ✅ JWT
JWT_ACCESS_SECRET=your-super-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ⚠️ Cloudinary (OPTIONAL - configure for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ⚠️ Stripe (OPTIONAL - configure for payments)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# ⚠️ Email (OPTIONAL - configure for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=OnlyArts
```

---

### 6. Quick Service Status Check

#### Backend Health Check:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "database": "MySQL",
  "environment": "development"
}
```

#### WebSocket Check:
Open browser console on `http://localhost:5173` and run:
```javascript
console.log('Checking WebSocket...');
// Should see "💬 WebSocket: Enabled" in backend console logs
```

#### Email Check:
Backend should show on startup:
```
✅ Email service is ready
```
OR
```
⚠️  Email not configured. Emails will not be sent.
```

---

### 7. Service Priority

**Must Have (Platform won't work without these):**
- [x] Database (MySQL)
- [x] JWT Secrets
- [x] Backend server
- [x] Frontend server

**Should Have (Core features):**
- [ ] Email service (for notifications)
- [ ] Cloudinary (for image uploads)

**Nice to Have (Premium features):**
- [ ] Stripe (for payments)
- [ ] Stripe Webhooks (for automated payment processing)

---

### 8. Troubleshooting

#### Email Service:
**Problem:** "Authentication failed"
**Solution:** Make sure you're using an App Password, not your regular Gmail password

**Problem:** "535-5.7.8 Username and Password not accepted"
**Solution:** Enable 2FA and generate a new App Password

#### Stripe Webhooks:
**Problem:** Webhook events not received
**Solution:** Make sure `stripe listen` is running and forwarding to correct port

**Problem:** "No signatures found matching the expected signature"
**Solution:** Update STRIPE_WEBHOOK_SECRET in .env with the secret from `stripe listen`

#### Database:
**Problem:** "Access denied for user 'root'"
**Solution:** Check DB_PASSWORD in .env matches your MySQL password

**Problem:** "Unknown database 'onlyarts'"
**Solution:** Create database: `CREATE DATABASE onlyarts;`

---

### 9. Next Steps After Configuration

1. **Test Each Service:**
   - Send a test email
   - Upload a test image (if Cloudinary configured)
   - Process a test payment (if Stripe configured)

2. **Enable Real-Time Chat:**
   - Set `USE_DEMO_MODE = false` in `src/pages/ChatPage.jsx`
   - Test with two browser windows

3. **Configure Production:**
   - Update all secrets
   - Set NODE_ENV=production
   - Use production database
   - Set up SSL/HTTPS

---

## Quick Start Commands

### Start Everything:
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3 (Optional): Stripe Webhooks
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

### Stop Everything:
- Press `Ctrl+C` in each terminal
- OR close all terminal windows

---

## Configuration Status

Check your configuration status:

```bash
# Backend
✅ Server running on http://localhost:5000
✅ MySQL database connected
✅ WebSocket enabled
⚠️  Email: [Not configured / Ready]
⚠️  Stripe: [Not configured / Ready]
⚠️  Cloudinary: [Not configured / Ready]

# Frontend
✅ Running on http://localhost:5173
✅ Socket.io-client installed
✅ Chat with WebSocket integration ready
```

---

**All done!** Your platform is now configured and ready for testing. 🎉
