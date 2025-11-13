# OnlyArts Platform - Testing Guide

## Quick Start Testing

### ✅ Current Status
- **Backend**: Running on `http://localhost:5000`
- **Frontend**: Running on `http://localhost:5173`
- **Database**: MySQL connected
- **WebSocket**: Enabled

---

## 1. Test Real-Time Chat

### Step 1: Disable Demo Mode
Edit `src/pages/ChatPage.jsx`:
```javascript
const USE_DEMO_MODE = false; // Change from true to false
```

### Step 2: Login as Two Different Users
1. Open browser window 1: `http://localhost:5173`
2. Open browser window 2 (incognito): `http://localhost:5173`
3. Login as different users in each window

### Step 3: Test Chat Features
- [ ] Navigate to Messages page in both windows
- [ ] Create or select a conversation
- [ ] Send a message from User 1
- [ ] Verify User 2 receives it instantly (no page refresh)
- [ ] Type in User 1's message box
- [ ] Verify "typing..." appears for User 2
- [ ] Check browser console for WebSocket connection logs

### Expected Console Logs:
```
💬 Connected to chat socket
User joined conversation X
New message received: {...}
```

---

## 2. Test Admin Dashboard Light Mode

### Step 1: Toggle Theme
1. Go to Settings page
2. Click "Light" theme button
3. Navigate to Admin Dashboard

### Step 2: Verify Colors
- [ ] Page background should be white
- [ ] Cards should be warm beige (`#fdf8f3`)
- [ ] Text should be dark and readable
- [ ] Icons should have beige background (not blue)

### Check These Pages:
- [ ] `/admin` - Dashboard
- [ ] `/admin/users` - User Management
- [ ] `/admin/artworks` - Artwork Management
- [ ] `/admin/orders` - Orders
- [ ] `/admin/analytics` - Analytics
- [ ] `/admin/history` - Activity History

---

## 3. Test Email Service

### Setup Gmail (Development):
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password:
   - Go to Security → App passwords
   - Select "Mail" and your device
   - Copy the 16-character password

### Configure Backend:
Edit `backend/.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM_NAME=OnlyArts
```

### Test Email Sending:
```bash
cd backend
node -e "
const { sendWelcomeEmail } = require('./src/config/email');
sendWelcomeEmail('test@example.com', 'TestUser')
  .then(result => console.log('✅ Email sent:', result))
  .catch(error => console.error('❌ Error:', error));
"
```

### Email Templates Available:
- [x] Welcome email (new user registration)
- [x] Password reset
- [x] Order confirmation
- [x] Commission request
- [x] New follower
- [x] Subscription confirmation

---

## 4. Test Stripe Webhooks

### Setup Stripe CLI:
1. Install: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks:
```bash
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

### Copy Webhook Secret:
The CLI will output: `whsec_xxxxx...`

### Configure Backend:
Edit `backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_xxxxx_from_cli
```

### Test Webhook Events:
```bash
# Test successful payment
stripe trigger payment_intent.succeeded

# Test failed payment
stripe trigger payment_intent.payment_failed

# Test subscription created
stripe trigger customer.subscription.created
```

### Verify in Backend Console:
```
🔔 Stripe webhook received: payment_intent.succeeded
💳 PaymentIntent succeeded: pi_xxxxx
✅ Order #123 marked as paid
```

---

## 5. Test Database Operations

### Check Tables:
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPassword123! -e "USE onlyarts; SHOW TABLES;"
```

### Verify Data:
```sql
-- Check users
SELECT id, username, email, role FROM users LIMIT 5;

-- Check conversations
SELECT * FROM conversations LIMIT 5;

-- Check messages
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;

-- Check admin audit log
SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 10;
```

---

## 6. Test API Endpoints

### Health Check:
```bash
curl http://localhost:5000/api/health
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Get Conversations (requires token):
```bash
curl http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Admin Stats (requires admin role):
```bash
curl http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

---

## 7. Test WebSocket Connections

### Chat Socket Test:
Open browser console and run:
```javascript
import { io } from 'socket.io-client';

const token = localStorage.getItem('accessToken');
const socket = io('http://localhost:5000/chat', {
  auth: { token }
});

socket.on('connect', () => console.log('✅ Connected to chat'));
socket.on('disconnect', () => console.log('❌ Disconnected'));

// Join conversation
socket.emit('join_conversation', 1);

// Send message
socket.emit('send_message', {
  conversationId: 1,
  content: 'Hello from WebSocket!'
});

// Listen for new messages
socket.on('new_message', (msg) => {
  console.log('📨 New message:', msg);
});
```

### Livestream Socket Test:
```javascript
const livestreamSocket = io('http://localhost:5000/livestream', {
  auth: { token: localStorage.getItem('accessToken') }
});

livestreamSocket.on('connect', () => console.log('✅ Connected to livestream'));

// Join stream
livestreamSocket.emit('join_stream', 1);

// Listen for viewer count
livestreamSocket.on('viewer_count_update', (data) => {
  console.log('👥 Viewers:', data.viewerCount);
});
```

---

## 8. Performance Testing

### Check Backend Response Times:
```bash
# Install if needed: npm install -g autocannon
autocannon -c 10 -d 10 http://localhost:5000/api/health
```

### Monitor WebSocket Connections:
- Open Chrome DevTools → Network → WS
- Filter by "socket.io"
- Watch for connection upgrades and messages

---

## 9. Error Testing

### Test Error Handling:
- [ ] Try accessing admin routes without admin role
- [ ] Send invalid data to API endpoints
- [ ] Test with expired JWT tokens
- [ ] Test WebSocket with invalid token
- [ ] Test file upload with large files

### Expected Behaviors:
- Proper error messages returned
- No server crashes
- Frontend shows user-friendly errors
- Backend logs errors

---

## 10. Mobile Responsiveness

### Test on Mobile Devices:
1. Open `http://YOUR_LOCAL_IP:5173` on phone
2. Test these features:
   - [ ] Navigation sidebar
   - [ ] Chat interface
   - [ ] Admin dashboard (if applicable)
   - [ ] Theme toggle
   - [ ] Touch interactions

### Use Chrome DevTools:
- Toggle device toolbar (Ctrl+Shift+M)
- Test various screen sizes:
  - Mobile (320px - 480px)
  - Tablet (768px - 1024px)
  - Desktop (1280px+)

---

## Common Issues & Solutions

### Issue: WebSocket not connecting
**Solution**: Check if backend is running and CORS is configured correctly

### Issue: "dark:" styles showing in light mode
**Solution**: Clear localStorage and set theme to "light" in Settings

### Issue: Emails not sending
**Solution**: Verify Gmail App Password is correct (16 chars, no spaces)

### Issue: Database connection failed
**Solution**: Check MySQL is running and credentials in `.env` are correct

### Issue: 401 Unauthorized
**Solution**: Check JWT token in localStorage, may need to login again

---

## Next Steps After Testing

1. **Deploy to Production**
   - Set up production database
   - Configure environment variables
   - Set up SSL/HTTPS
   - Configure production email service
   - Set up Stripe production keys

2. **Add Monitoring**
   - Set up Sentry for error tracking
   - Add logging with Winston
   - Set up performance monitoring

3. **Optimize**
   - Add Redis for caching
   - Optimize database queries
   - Add CDN for static assets
   - Implement rate limiting

4. **Security Audit**
   - Review authentication flows
   - Check for SQL injection vulnerabilities
   - Verify input validation
   - Test CORS configuration
   - Review file upload security
