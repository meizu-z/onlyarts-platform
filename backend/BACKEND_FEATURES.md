# OnlyArts Backend - Features Documentation

## Overview
The OnlyArts backend is a Node.js/Express API with MySQL database, providing comprehensive functionality for an art marketplace platform.

## Critical Features Implemented

### 1. Real-Time Chat (WebSocket)
**Location:** `src/sockets/chatSocket.js`

**Features:**
- Real-time direct messaging between users
- Typing indicators
- Read receipts
- Message notifications
- Conversation rooms

**Socket Events:**
- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room
- `send_message` - Send a message
- `typing` - Show typing indicator
- `stop_typing` - Hide typing indicator
- `mark_as_read` - Mark messages as read

**Client Usage:**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000/chat', {
  auth: { token: yourJWTToken }
});

socket.emit('join_conversation', conversationId);
socket.emit('send_message', { conversationId, content: 'Hello!' });
socket.on('new_message', (message) => console.log(message));
```

### 2. Real-Time Livestreaming (WebSocket)
**Location:** `src/sockets/livestreamSocket.js`

**Features:**
- Live viewer count tracking
- Real-time chat during livestreams
- Stream start/end management
- Automatic viewer cleanup on disconnect

**Socket Events:**
- `join_stream` - Join a livestream
- `leave_stream` - Leave a livestream
- `stream_chat_message` - Send chat message in stream
- `start_stream` - (Artist only) Start livestream
- `end_stream` - (Artist only) End livestream
- `viewer_count_update` - Receive viewer count updates

**Client Usage:**
```javascript
const socket = io('http://localhost:5000/livestream', {
  auth: { token: yourJWTToken }
});

socket.emit('join_stream', livestreamId);
socket.emit('stream_chat_message', { livestreamId, message: 'Great art!' });
socket.on('viewer_count_update', (data) => console.log(data.viewerCount));
```

### 3. Email Service (Nodemailer)
**Location:** `src/config/email.js`

**Email Templates:**
- Welcome email (new user registration)
- Password reset email
- Order confirmation email
- Commission request notification
- New follower notification
- Subscription confirmation email

**Configuration:**
Supports two modes:
1. **Gmail** (Development/Testing)
2. **Custom SMTP** (Production)

**Usage Example:**
```javascript
const { sendWelcomeEmail } = require('./src/config/email');

await sendWelcomeEmail('user@example.com', 'Username');
```

**Setup:**
1. For Gmail: Enable 2FA and generate App Password
2. Add to `.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM_NAME=OnlyArts
```

### 4. Stripe Webhook Handlers
**Location:** `src/routes/webhookRoutes.js`

**Supported Events:**
- `payment_intent.succeeded` - Mark order as paid, send confirmation email
- `payment_intent.payment_failed` - Mark order as failed
- `charge.refunded` - Handle refunds, cancel order
- `customer.subscription.created` - Create subscription record
- `customer.subscription.updated` - Update subscription status
- `customer.subscription.deleted` - Cancel subscription
- `invoice.payment_succeeded` - Recurring payment success
- `invoice.payment_failed` - Mark subscription as past_due

**Webhook Endpoint:**
```
POST http://localhost:5000/api/webhooks/stripe
```

**Setup:**
1. Install Stripe CLI: `stripe listen --forward-to localhost:5000/api/webhooks/stripe`
2. Add webhook secret to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Complete API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user

### Artworks
- `GET /api/artworks` - List artworks (with filters)
- `GET /api/artworks/:id` - Get artwork details
- `POST /api/artworks` - Create artwork
- `PUT /api/artworks/:id` - Update artwork
- `DELETE /api/artworks/:id` - Delete artwork
- `POST /api/artworks/:id/like` - Like artwork
- `POST /api/artworks/:id/comment` - Comment on artwork

### Cart & Orders
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/:id` - Remove item from cart
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - List all users (with filters)
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/users/:id/ban` - Ban user
- `GET /api/admin/artworks` - List all artworks
- `PUT /api/admin/artworks/:id/feature` - Feature artwork
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/analytics/revenue` - Revenue analytics
- `GET /api/admin/audit-log` - Activity history

### Commissions
- `GET /api/commissions` - List commissions
- `POST /api/commissions` - Request commission
- `PUT /api/commissions/:id/status` - Update commission status

### Subscriptions
- `GET /api/subscriptions/tiers` - List subscription tiers
- `POST /api/subscriptions/subscribe` - Subscribe to tier
- `DELETE /api/subscriptions` - Cancel subscription

### Exhibitions
- `GET /api/exhibitions` - List exhibitions
- `POST /api/exhibitions` - Create exhibition
- `GET /api/exhibitions/:id` - Get exhibition details
- `POST /api/exhibitions/:id/like` - Like exhibition

### Livestreams
- `GET /api/livestreams` - List livestreams
- `POST /api/livestreams` - Create livestream
- `GET /api/livestreams/:id` - Get livestream details
- `PUT /api/livestreams/:id/start` - Start livestream
- `PUT /api/livestreams/:id/end` - End livestream

### Chat
- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/conversations` - Create conversation
- `POST /api/chat/messages` - Send message (legacy HTTP, use WebSocket instead)

## Database Tables

- `users` - User accounts and profiles
- `artworks` - Artwork listings
- `artwork_media` - Artwork images/videos
- `cart_items` - Shopping cart items
- `orders` - Purchase orders
- `order_items` - Order line items
- `payments` - Payment records
- `subscriptions` - User subscriptions
- `subscription_tiers` - Subscription plans
- `commissions` - Commission requests
- `commission_messages` - Commission chat
- `exhibitions` - Virtual exhibitions
- `exhibition_artworks` - Exhibition artwork links
- `livestreams` - Livestream sessions
- `conversations` - Chat conversations
- `messages` - Chat messages
- `notifications` - User notifications
- `follows` - User follows
- `likes` - Artwork/exhibition likes
- `comments` - Artwork comments
- `admin_audit_log` - Admin activity tracking
- `refresh_tokens` - JWT refresh tokens

## Environment Variables Required

```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=onlyarts
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM_NAME=OnlyArts
```

## Running the Backend

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npm run migrate

# Start development server
npm run dev

# Start production server
npm start
```

## Testing WebSocket Connections

### Test Chat:
```javascript
const socket = io('http://localhost:5000/chat', {
  auth: { token: 'your_jwt_token' }
});

socket.on('connect', () => console.log('Connected to chat'));
socket.emit('join_conversation', 1);
```

### Test Livestream:
```javascript
const socket = io('http://localhost:5000/livestream', {
  auth: { token: 'your_jwt_token' }
});

socket.on('connect', () => console.log('Connected to livestream'));
socket.emit('join_stream', 1);
```

## Security Features

- JWT authentication with access/refresh tokens
- Password hashing with bcrypt
- CORS protection
- Helmet security headers
- SQL injection prevention (parameterized queries)
- Rate limiting (recommended to add)
- Webhook signature verification (Stripe)

## Next Steps / Recommendations

1. **Add Rate Limiting** - Use `express-rate-limit` to prevent abuse
2. **Add Redis** - For session management and caching
3. **Add Logging** - Use Winston or Morgan for better logging
4. **Add API Documentation** - Use Swagger/OpenAPI
5. **Add Testing** - Jest/Mocha for unit and integration tests
6. **Add Monitoring** - Sentry or similar for error tracking
7. **Optimize Database** - Add indexes for frequently queried fields
8. **Add CDN** - For serving static assets
9. **Add Queue System** - Bull/RabbitMQ for background jobs
10. **Add Search** - ElasticSearch for advanced artwork search
