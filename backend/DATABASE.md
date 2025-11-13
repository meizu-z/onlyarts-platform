# OnlyArts Database Schema

## Overview

This document describes the database schema for the OnlyArts platform. The database uses **MySQL 8.0** and consists of 15 tables supporting user management, artworks, social features, e-commerce, and messaging.

---

## Quick Commands

```bash
# Run migrations (create all tables)
npm run migrate

# Seed database with test data
npm run seed

# Start development server
npm run dev
```

---

## Database Tables

### 1. **users**
Stores user account information for artists, collectors, and admins.

**Key Fields:**
- `id`: Primary key
- `username`, `email`: Unique identifiers
- `password_hash`: Bcrypt hashed password
- `role`: user, artist, admin
- `subscription_tier`: free, basic, premium, professional
- `wallet_balance`, `total_earnings`: Financial tracking
- `follower_count`, `following_count`, `artwork_count`: Cached counters

**Indexes:** username, email, role, subscription_tier, created_at

---

### 2. **refresh_tokens**
Stores JWT refresh tokens for authentication.

**Key Fields:**
- `user_id`: Foreign key to users
- `token`: Unique refresh token
- `expires_at`: Token expiration timestamp
- `revoked_at`: Nullable, set when token is revoked

**Indexes:** user_id, token, expires_at

---

### 3. **artworks**
Stores artwork listings created by artists.

**Key Fields:**
- `artist_id`: Foreign key to users
- `title`, `description`: Artwork details
- `price`: Decimal (10,2)
- `category`: painting, sculpture, photography, digital, mixed_media, other
- `status`: draft, published, sold, archived
- `stock_quantity`: Available inventory
- `view_count`, `like_count`, `comment_count`: Engagement metrics
- `tags`: JSON array of tags

**Indexes:** artist_id, category, status, price, created_at, is_for_sale
**Full-text:** title, description

---

### 4. **artwork_media**
Stores media files (images, videos) associated with artworks.

**Key Fields:**
- `artwork_id`: Foreign key to artworks
- `media_url`: Full URL to media file
- `media_type`: image, video
- `display_order`: Sort order
- `is_primary`: Boolean for main image
- `cloudinary_public_id`: For cloud storage

**Indexes:** artwork_id, display_order

---

### 5. **follows**
Tracks follower/following relationships between users.

**Key Fields:**
- `follower_id`: User who follows
- `following_id`: User being followed

**Constraints:** Unique pair (follower_id, following_id)
**Indexes:** follower_id, following_id

---

### 6. **likes**
Tracks user likes on artworks.

**Key Fields:**
- `user_id`: User who liked
- `artwork_id`: Artwork being liked

**Constraints:** Unique pair (user_id, artwork_id)
**Indexes:** user_id, artwork_id

---

### 7. **comments**
Stores comments on artworks with support for replies.

**Key Fields:**
- `artwork_id`: Foreign key to artworks
- `user_id`: Comment author
- `parent_id`: Nullable, for nested replies
- `content`: Comment text
- `is_edited`: Boolean flag

**Indexes:** artwork_id, user_id, parent_id, created_at

---

### 8. **cart_items**
Stores items in user shopping carts.

**Key Fields:**
- `user_id`: Cart owner
- `artwork_id`: Item in cart
- `quantity`: Number of items
- `price_at_add`: Price when added (for price changes)

**Constraints:** Unique pair (user_id, artwork_id)
**Indexes:** user_id, artwork_id

---

### 9. **orders**
Stores customer orders.

**Key Fields:**
- `buyer_id`: Foreign key to users
- `order_number`: Unique order identifier
- `status`: pending, processing, shipped, delivered, cancelled, refunded
- `payment_status`: pending, completed, failed, refunded
- `total_amount`: Decimal (10,2)
- `payment_method`: card, wallet, bank_transfer
- `shipping_address`: JSON object
- `tracking_number`: Shipping tracking

**Indexes:** buyer_id, order_number, status, created_at

---

### 10. **order_items**
Stores individual items within orders.

**Key Fields:**
- `order_id`: Foreign key to orders
- `artwork_id`: Purchased artwork
- `seller_id`: Artist receiving payment
- `quantity`, `price`, `subtotal`: Order details
- `commission_rate`, `commission_amount`: Platform fees
- `seller_earnings`: Net amount to seller

**Indexes:** order_id, artwork_id, seller_id

---

### 11. **subscription_tiers**
Stores available subscription plans.

**Key Fields:**
- `name`: Unique tier name (free, basic, premium, professional)
- `price`: Monthly price
- `duration_days`: Subscription length
- `features`: JSON array of features
- `max_artworks`, `max_uploads_per_month`: Limits
- `commission_rate`: Platform fee percentage

**Indexes:** name, price

---

### 12. **subscriptions**
Stores user subscription history.

**Key Fields:**
- `user_id`: Subscriber
- `tier_id`: Foreign key to subscription_tiers
- `status`: active, expired, cancelled
- `starts_at`, `expires_at`: Subscription period
- `auto_renew`: Boolean
- `amount_paid`: Decimal (10,2)

**Indexes:** user_id, tier_id, status, expires_at

---

### 13. **conversations**
Stores chat conversations between two users.

**Key Fields:**
- `participant_one_id`, `participant_two_id`: Users in conversation
- `last_message_at`: Timestamp of last message

**Constraints:** Unique pair (participant_one_id, participant_two_id)
**Indexes:** participant_one_id, participant_two_id, last_message_at

---

### 14. **messages**
Stores individual messages within conversations.

**Key Fields:**
- `conversation_id`: Foreign key to conversations
- `sender_id`: Message sender
- `content`: Message text
- `is_read`: Boolean flag
- `read_at`: Nullable timestamp

**Indexes:** conversation_id, sender_id, created_at, is_read

---

### 15. **livestreams**
Stores livestream sessions.

**Key Fields:**
- `artist_id`: Stream host
- `title`, `description`: Stream details
- `stream_key`: Unique key for streaming
- `status`: scheduled, live, ended, cancelled
- `viewer_count`, `peak_viewer_count`: Engagement metrics
- `scheduled_start_at`, `started_at`, `ended_at`: Timing

**Indexes:** artist_id, status, scheduled_start_at, created_at

---

## Test Data

After running `npm run seed`, you'll have:

### **Users:**
- **artmaster** (artist@onlyarts.com) - Premium artist, password: `password123`
- **photogeek** (photo@onlyarts.com) - Basic artist, password: `password123`
- **sculptor_pro** (sculptor@onlyarts.com) - Professional artist, password: `password123`
- **collector123** (buyer@onlyarts.com) - Free user, password: `password123`
- **artlover** (lover@onlyarts.com) - Basic user, password: `password123`

### **Artworks:**
- 7 published artworks across painting, photography, and sculpture categories
- Prices ranging from $380 to $3,500

### **Social Data:**
- Multiple follow relationships between users
- Likes on various artworks
- Comments with discussions

---

## Entity Relationships

```
users (1) -> (*) artworks
users (1) -> (*) refresh_tokens
users (1) -> (*) follows (as follower)
users (1) -> (*) follows (as following)
users (1) -> (*) likes
users (1) -> (*) comments
users (1) -> (*) cart_items
users (1) -> (*) orders (as buyer)
users (1) -> (*) order_items (as seller)
users (1) -> (*) subscriptions
users (1) -> (*) conversations (as participant)
users (1) -> (*) messages (as sender)
users (1) -> (*) livestreams (as artist)

artworks (1) -> (*) artwork_media
artworks (1) -> (*) likes
artworks (1) -> (*) comments
artworks (1) -> (*) cart_items
artworks (1) -> (*) order_items

orders (1) -> (*) order_items
subscription_tiers (1) -> (*) subscriptions
conversations (1) -> (*) messages
comments (1) -> (*) comments (nested replies)
```

---

## Migration Files

All migrations are located in `src/migrations/`:

1. `001_create_users_table.sql`
2. `002_create_refresh_tokens_table.sql`
3. `003_create_artworks_table.sql`
4. `004_create_artwork_media_table.sql`
5. `005_create_follows_table.sql`
6. `006_create_likes_table.sql`
7. `007_create_comments_table.sql`
8. `008_create_cart_items_table.sql`
9. `009_create_orders_table.sql`
10. `010_create_order_items_table.sql`
11. `011_create_subscription_tiers_table.sql`
12. `012_create_subscriptions_table.sql`
13. `013_create_conversations_table.sql`
14. `014_create_messages_table.sql`
15. `015_create_livestreams_table.sql`

---

## Next Steps

✅ **Day 1 Complete:** Backend setup with Express + MySQL
✅ **Day 2 Complete:** Database schema with 15 tables + seed data

**Day 3:** JWT Authentication (register, login, refresh tokens)
**Day 4:** User management endpoints
**Day 5:** Artwork CRUD endpoints
**Day 6:** Cloudinary integration + Cart endpoints
**Day 7:** Testing & Frontend integration

---

## Database Connection

Connection configured in `src/config/database.js`:
- Host: localhost
- Port: 3306
- Database: onlyarts
- User: root
- Password: Set in `.env` file

The app uses **connection pooling** for better performance.
