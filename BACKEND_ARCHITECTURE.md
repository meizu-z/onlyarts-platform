# OnlyArts Platform - Complete Backend Architecture

## Table of Contents
1. [ERD (Entity Relationship Diagram)](#1-erd-entity-relationship-diagram)
2. [Database Schema Definitions](#2-database-schema-definitions)
3. [API Design](#3-api-design)
4. [Services Architecture](#4-services-architecture)
5. [Competitors Analysis](#5-competitors-analysis)

---

# 1. ERD (Entity Relationship Diagram)

## Visual Representation

```
┌─────────────────┐
│     USERS       │
│─────────────────│
│ id (PK)         │
│ username        │
│ email           │
│ password_hash   │
│ full_name       │
│ bio             │
│ profile_picture │
│ cover_image     │
│ role            │
│ subscription    │
│ is_premium      │
│ hourly_rate     │
│ balance         │
│ total_earnings  │
└─────────────────┘
        │
        │ 1:N (creates)
        ├──────────────────────┐
        │                      │
        ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│   ARTWORKS      │    │  LIVESTREAMS    │
│─────────────────│    │─────────────────│
│ id (PK)         │    │ id (PK)         │
│ user_id (FK)    │    │ artist_id (FK)  │
│ title           │    │ title           │
│ description     │    │ status          │
│ image_url       │    │ is_auction      │
│ price           │    │ starting_bid    │
│ category        │    │ current_bid     │
│ status          │    │ viewers_count   │
│ is_featured     │    └─────────────────┘
│ views_count     │            │
│ favorites_count │            │ 1:N
└─────────────────┘            ▼
        │            ┌─────────────────┐
        │            │ LIVESTREAM_BIDS │
        │ 1:N        │─────────────────│
        ├────────┐   │ id (PK)         │
        │        │   │ livestream_id   │
        │        │   │ bidder_id (FK)  │
        ▼        │   │ amount          │
┌─────────────────┐  │ is_winning      │
│   FAVORITES     │  └─────────────────┘
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │
│ artwork_id (FK) │
└─────────────────┘

┌─────────────────┐          ┌─────────────────┐
│   CART_ITEMS    │          │    COMMENTS     │
│─────────────────│          │─────────────────│
│ id (PK)         │          │ id (PK)         │
│ user_id (FK)    │          │ artwork_id (FK) │
│ artwork_id (FK) │          │ user_id (FK)    │
│ quantity        │          │ parent_id (FK)  │
└─────────────────┘          │ content         │
                             └─────────────────┘

┌─────────────────┐          ┌─────────────────┐
│     ORDERS      │          │   COMMISSIONS   │
│─────────────────│          │─────────────────│
│ id (PK)         │          │ id (PK)         │
│ order_number    │          │ client_id (FK)  │
│ user_id (FK)    │          │ artist_id (FK)  │
│ subtotal        │          │ title           │
│ total           │          │ description     │
│ status          │          │ budget          │
│ stripe_payment  │          │ status          │
└─────────────────┘          │ deadline        │
        │                    └─────────────────┘
        │ 1:N
        ▼
┌─────────────────┐          ┌─────────────────┐
│  ORDER_ITEMS    │          │ CONSULTATIONS   │
│─────────────────│          │─────────────────│
│ id (PK)         │          │ id (PK)         │
│ order_id (FK)   │          │ client_id (FK)  │
│ artwork_id (FK) │          │ artist_id (FK)  │
│ seller_id (FK)  │          │ scheduled_at    │
│ price           │          │ duration        │
│ quantity        │          │ price           │
│ seller_earnings │          │ is_free         │
└─────────────────┘          │ status          │
                             └─────────────────┘

┌─────────────────┐          ┌─────────────────┐
│     FOLLOWS     │          │ CONVERSATIONS   │
│─────────────────│          │─────────────────│
│ id (PK)         │          │ id (PK)         │
│ follower_id(FK) │          │ participant_1   │
│ following_id(FK)│          │ participant_2   │
└─────────────────┘          │ last_message_at │
                             └─────────────────┘
                                     │
                                     │ 1:N
                                     ▼
                             ┌─────────────────┐
                             │    MESSAGES     │
                             │─────────────────│
                             │ id (PK)         │
                             │ conversation_id │
                             │ sender_id (FK)  │
                             │ content         │
                             │ is_read         │
                             └─────────────────┘

┌─────────────────┐
│ NOTIFICATIONS   │
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │
│ type            │
│ title           │
│ message         │
│ is_read         │
│ metadata (JSON) │
└─────────────────┘
```

## Relationship Summary

### One-to-Many (1:N)
- Users → Artworks (artist creates multiple artworks)
- Users → Livestreams (artist hosts multiple streams)
- Artworks → Comments (artwork has multiple comments)
- Livestreams → Livestream_Bids (stream has multiple bids)
- Orders → Order_Items (order contains multiple items)
- Conversations → Messages (conversation has multiple messages)
- Users → Notifications (user receives multiple notifications)

### Many-to-Many (M:N)
- Users ↔ Users (via Follows) - follower/following relationships
- Users ↔ Artworks (via Favorites) - users favorite artworks
- Users ↔ Artworks (via Cart_Items) - users add artworks to cart
- Users ↔ Users (via Commissions) - client-artist relationships
- Users ↔ Users (via Consultations) - client-artist bookings
- Users ↔ Users (via Conversations) - peer-to-peer messaging

---

# 2. Database Schema Definitions

## 2.1 Core Tables

### **users**
```sql
CREATE TYPE user_role AS ENUM ('user', 'artist', 'admin');
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'pro');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    bio TEXT,
    profile_picture TEXT,
    cover_image TEXT,
    role user_role NOT NULL DEFAULT 'user',
    subscription_tier subscription_tier NOT NULL DEFAULT 'free',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_earnings DECIMAL(10, 2) NOT NULL DEFAULT 0,
    followers_count INTEGER NOT NULL DEFAULT 0,
    following_count INTEGER NOT NULL DEFAULT 0,
    artworks_count INTEGER NOT NULL DEFAULT 0,
    hourly_rate DECIMAL(10, 2), -- For consultations
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
```

### **artworks**
```sql
CREATE TYPE artwork_status AS ENUM ('draft', 'published', 'sold', 'archived');
CREATE TYPE artwork_category AS ENUM (
    'digital', 'painting', 'photography', 'sculpture',
    'illustration', 'animation', '3d', 'traditional',
    'mixed_media', 'other'
);

CREATE TABLE artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2), -- For showing discounts
    category artwork_category NOT NULL,
    tags TEXT[] DEFAULT '{}',
    dimensions VARCHAR(100), -- e.g., "1920x1080", "30x40cm"
    file_size INTEGER, -- in bytes
    status artwork_status NOT NULL DEFAULT 'draft',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_for_sale BOOLEAN NOT NULL DEFAULT true,
    views_count INTEGER NOT NULL DEFAULT 0,
    favorites_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_artworks_user_id ON artworks(user_id);
CREATE INDEX idx_artworks_category ON artworks(category);
CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_artworks_is_featured ON artworks(is_featured);
CREATE INDEX idx_artworks_created_at ON artworks(created_at);
CREATE INDEX idx_artworks_price ON artworks(price);
CREATE INDEX idx_artworks_tags ON artworks USING GIN(tags);
```

## 2.2 Shopping Tables

### **cart_items**
```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, artwork_id)
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
```

### **orders**
```sql
CREATE TYPE order_status AS ENUM (
    'pending', 'processing', 'completed', 'cancelled', 'refunded'
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    shipping DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    stripe_payment_id VARCHAR(255),
    stripe_payment_intent VARCHAR(255),
    shipping_address JSONB,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### **order_items**
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 10,
    seller_earnings DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_artwork_id ON order_items(artwork_id);
CREATE INDEX idx_order_items_seller_id ON order_items(seller_id);
```

## 2.3 Social Tables

### **follows**
```sql
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
```

### **favorites**
```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, artwork_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_artwork_id ON favorites(artwork_id);
```

### **comments**
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_artwork_id ON comments(artwork_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
```

## 2.4 Messaging Tables

### **conversations**
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_one_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_two_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(participant_one_id, participant_two_id),
    CHECK (participant_one_id != participant_two_id)
);

CREATE INDEX idx_conversations_participant_one ON conversations(participant_one_id);
CREATE INDEX idx_conversations_participant_two ON conversations(participant_two_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);
```

### **messages**
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);
```

## 2.5 Services Tables

### **commissions**
```sql
CREATE TYPE commission_status AS ENUM (
    'pending', 'in_progress', 'completed', 'cancelled', 'disputed'
);

CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reference_images TEXT[] DEFAULT '{}',
    budget DECIMAL(10, 2) NOT NULL,
    deadline DATE,
    status commission_status NOT NULL DEFAULT 'pending',
    final_artwork_url TEXT,
    artist_notes TEXT,
    client_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_commissions_client_id ON commissions(client_id);
CREATE INDEX idx_commissions_artist_id ON commissions(artist_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_created_at ON commissions(created_at);
```

### **consultations**
```sql
CREATE TYPE consultation_status AS ENUM (
    'scheduled', 'completed', 'cancelled', 'no_show'
);

CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10, 2) NOT NULL,
    is_free BOOLEAN NOT NULL DEFAULT false,
    status consultation_status NOT NULL DEFAULT 'scheduled',
    meeting_link TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consultations_client_id ON consultations(client_id);
CREATE INDEX idx_consultations_artist_id ON consultations(artist_id);
CREATE INDEX idx_consultations_scheduled_at ON consultations(scheduled_at);
CREATE INDEX idx_consultations_status ON consultations(status);
```

## 2.6 Livestream Tables

### **livestreams**
```sql
CREATE TYPE livestream_status AS ENUM ('scheduled', 'live', 'ended');

CREATE TABLE livestreams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    stream_url TEXT,
    stream_key VARCHAR(255),
    status livestream_status NOT NULL DEFAULT 'scheduled',
    is_auction BOOLEAN NOT NULL DEFAULT false,
    starting_bid DECIMAL(10, 2),
    current_bid DECIMAL(10, 2),
    viewers_count INTEGER NOT NULL DEFAULT 0,
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_livestreams_artist_id ON livestreams(artist_id);
CREATE INDEX idx_livestreams_status ON livestreams(status);
CREATE INDEX idx_livestreams_is_auction ON livestreams(is_auction);
CREATE INDEX idx_livestreams_created_at ON livestreams(created_at);
```

### **livestream_bids**
```sql
CREATE TABLE livestream_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    livestream_id UUID NOT NULL REFERENCES livestreams(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    is_winning BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_livestream_bids_livestream_id ON livestream_bids(livestream_id);
CREATE INDEX idx_livestream_bids_bidder_id ON livestream_bids(bidder_id);
CREATE INDEX idx_livestream_bids_amount ON livestream_bids(amount);
CREATE INDEX idx_livestream_bids_created_at ON livestream_bids(created_at);
```

## 2.7 System Tables

### **notifications**
```sql
CREATE TYPE notification_type AS ENUM (
    'like', 'comment', 'follow', 'purchase', 'commission',
    'consultation', 'message', 'livestream', 'bid', 'system'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

---

# 3. API Design

## 3.1 API Conventions

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.onlyarts.com/api
```

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Pagination Format
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 3.2 Authentication Endpoints

### **POST /api/auth/register**
Register a new user

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "fullName": "John Doe",
  "role": "artist" // Optional: "user" | "artist" | "admin"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "artist",
      "subscriptionTier": "free",
      "isPremium": false
    },
    "accessToken": "jwt-token"
  }
}
```

### **POST /api/auth/login**
Login user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "accessToken": "jwt-token"
  }
}
```

### **POST /api/auth/refresh**
Refresh access token

**Request:** Refresh token in httpOnly cookie

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "user": { /* user object */ },
    "accessToken": "new-jwt-token"
  }
}
```

### **POST /api/auth/logout**
Logout user

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

### **GET /api/auth/me**
Get current authenticated user

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved",
  "data": {
    "user": { /* full user object */ }
  }
}
```

## 3.3 User Endpoints

### **GET /api/users/:username**
Get user profile by username

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "fullName": "John Doe",
      "bio": "Digital artist",
      "profilePicture": "url",
      "coverImage": "url",
      "role": "artist",
      "subscriptionTier": "premium",
      "isPremium": true,
      "followersCount": 1250,
      "followingCount": 340,
      "artworksCount": 45,
      "hourlyRate": 150.00,
      "isFollowing": false, // Only if authenticated
      "createdAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

### **PUT /api/users/profile**
Update current user profile

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "fullName": "John Doe Jr",
  "bio": "Updated bio",
  "profilePicture": "cloudinary-url",
  "coverImage": "cloudinary-url",
  "hourlyRate": 175.00
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "user": { /* updated user object */ }
  }
}
```

### **POST /api/users/:userId/follow**
Follow a user

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "User followed successfully",
  "data": {
    "isFollowing": true,
    "followersCount": 1251
  }
}
```

### **DELETE /api/users/:userId/follow**
Unfollow a user

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "User unfollowed successfully",
  "data": {
    "isFollowing": false,
    "followersCount": 1250
  }
}
```

### **GET /api/users/:userId/followers**
Get user's followers list

**Query Params:** `?page=1&limit=20`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "followers": [
      {
        "id": "uuid",
        "username": "follower1",
        "fullName": "Follower One",
        "profilePicture": "url",
        "isFollowing": false
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

### **GET /api/users/:userId/following**
Get users that this user follows

**Query Params:** `?page=1&limit=20`

**Response (200):** Similar to followers

### **GET /api/users/search**
Search for users

**Query Params:** `?q=john&page=1&limit=20`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "username": "johndoe",
        "fullName": "John Doe",
        "profilePicture": "url",
        "role": "artist",
        "followersCount": 1250
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

## 3.4 Artwork Endpoints

### **GET /api/artworks**
List artworks with filters

**Query Params:**
```
?page=1
&limit=20
&category=digital
&minPrice=0
&maxPrice=1000
&tags=landscape,sunset
&sort=createdAt
&order=desc
&featured=true
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "artworks": [
      {
        "id": "uuid",
        "title": "Digital Sunset",
        "description": "Beautiful artwork",
        "imageUrl": "url",
        "thumbnailUrl": "url",
        "price": 500.00,
        "originalPrice": 750.00,
        "category": "digital",
        "tags": ["landscape", "sunset"],
        "isFeatured": true,
        "viewsCount": 1234,
        "favoritesCount": 56,
        "commentsCount": 12,
        "artist": {
          "id": "uuid",
          "username": "johndoe",
          "fullName": "John Doe",
          "profilePicture": "url"
        },
        "isFavorited": false, // Only if authenticated
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

### **GET /api/artworks/:id**
Get single artwork details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "artwork": {
      "id": "uuid",
      "title": "Digital Sunset",
      "description": "Detailed description...",
      "imageUrl": "url",
      "price": 500.00,
      "category": "digital",
      "tags": ["landscape", "sunset"],
      "dimensions": "1920x1080",
      "fileSize": 2048576,
      "status": "published",
      "viewsCount": 1235,
      "favoritesCount": 56,
      "commentsCount": 12,
      "artist": {
        "id": "uuid",
        "username": "johndoe",
        "fullName": "John Doe",
        "profilePicture": "url",
        "followersCount": 1250
      },
      "isFavorited": false,
      "isInCart": false,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

### **POST /api/artworks**
Create new artwork

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "My New Artwork",
  "description": "Description here",
  "imageUrl": "cloudinary-url",
  "thumbnailUrl": "cloudinary-url-thumb",
  "price": 599.99,
  "category": "digital",
  "tags": ["abstract", "modern"],
  "dimensions": "1920x1080",
  "fileSize": 2048576,
  "isForSale": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Artwork created successfully",
  "data": {
    "artwork": { /* created artwork object */ }
  }
}
```

### **PUT /api/artworks/:id**
Update artwork

**Headers:** `Authorization: Bearer {token}`

**Request Body:** Similar to POST

**Response (200):**
```json
{
  "success": true,
  "message": "Artwork updated successfully",
  "data": {
    "artwork": { /* updated artwork object */ }
  }
}
```

### **DELETE /api/artworks/:id**
Delete artwork

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Artwork deleted successfully",
  "data": null
}
```

### **POST /api/artworks/:id/favorite**
Add artwork to favorites

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Artwork added to favorites",
  "data": {
    "isFavorited": true,
    "favoritesCount": 57
  }
}
```

### **DELETE /api/artworks/:id/favorite**
Remove from favorites

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Artwork removed from favorites",
  "data": {
    "isFavorited": false,
    "favoritesCount": 56
  }
}
```

## 3.5 Cart Endpoints

### **GET /api/cart**
Get user's cart

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cart": {
      "items": [
        {
          "id": "uuid",
          "artwork": {
            "id": "uuid",
            "title": "Digital Sunset",
            "imageUrl": "url",
            "price": 500.00,
            "artist": {
              "username": "johndoe",
              "fullName": "John Doe"
            }
          },
          "quantity": 1,
          "subtotal": 500.00,
          "addedAt": "2024-01-15T10:00:00Z"
        }
      ],
      "summary": {
        "itemsCount": 1,
        "subtotal": 500.00,
        "tax": 50.00,
        "shipping": 0.00,
        "total": 550.00
      }
    }
  }
}
```

### **POST /api/cart/items**
Add item to cart

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "artworkId": "uuid",
  "quantity": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cartItem": { /* cart item object */ },
    "cart": { /* updated cart summary */ }
  }
}
```

### **PUT /api/cart/items/:id**
Update cart item quantity

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "quantity": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart item updated",
  "data": {
    "cartItem": { /* updated cart item */ },
    "cart": { /* updated cart summary */ }
  }
}
```

### **DELETE /api/cart/items/:id**
Remove item from cart

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": {
    "cart": { /* updated cart summary */ }
  }
}
```

### **DELETE /api/cart**
Clear entire cart

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": null
}
```

## 3.6 Order Endpoints

### **POST /api/orders**
Create order from cart (checkout)

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "shippingAddress": {
    "fullName": "John Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethodId": "stripe-payment-method-id",
  "notes": "Please handle with care"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "OA-20240115-001",
      "subtotal": 500.00,
      "tax": 50.00,
      "shipping": 0.00,
      "total": 550.00,
      "status": "pending",
      "items": [ /* order items */ ],
      "createdAt": "2024-01-15T10:00:00Z"
    },
    "paymentIntent": {
      "clientSecret": "stripe-client-secret"
    }
  }
}
```

### **GET /api/orders**
Get user's orders

**Headers:** `Authorization: Bearer {token}`

**Query Params:** `?page=1&limit=20&status=completed`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "orderNumber": "OA-20240115-001",
        "total": 550.00,
        "status": "completed",
        "itemsCount": 1,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

### **GET /api/orders/:id**
Get order details

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "OA-20240115-001",
      "subtotal": 500.00,
      "tax": 50.00,
      "total": 550.00,
      "status": "completed",
      "shippingAddress": { /* address object */ },
      "items": [
        {
          "id": "uuid",
          "artwork": { /* artwork details */ },
          "price": 500.00,
          "quantity": 1,
          "seller": { /* seller details */ }
        }
      ],
      "createdAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

### **GET /api/orders/sales**
Get artist's sales (items they sold)

**Headers:** `Authorization: Bearer {token}`

**Query Params:** `?page=1&limit=20`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sales": [
      {
        "id": "uuid",
        "orderNumber": "OA-20240115-001",
        "artwork": { /* artwork details */ },
        "buyer": { /* buyer details */ },
        "price": 500.00,
        "sellerEarnings": 450.00,
        "commissionRate": 10,
        "status": "completed",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": { /* pagination object */ },
    "summary": {
      "totalSales": 4500.00,
      "totalEarnings": 4050.00,
      "pendingEarnings": 450.00
    }
  }
}
```

## 3.7 Comment Endpoints

### **GET /api/artworks/:artworkId/comments**
Get artwork comments

**Query Params:** `?page=1&limit=20`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "uuid",
        "content": "Amazing work!",
        "likesCount": 5,
        "user": {
          "id": "uuid",
          "username": "commenter",
          "fullName": "Commenter Name",
          "profilePicture": "url"
        },
        "replies": [
          {
            "id": "uuid",
            "content": "Thank you!",
            "user": { /* artist user */ },
            "createdAt": "2024-01-15T11:00:00Z"
          }
        ],
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

### **POST /api/artworks/:artworkId/comments**
Add comment

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "content": "Great artwork!",
  "parentId": "uuid" // Optional, for replies
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Comment added",
  "data": {
    "comment": { /* created comment */ }
  }
}
```

### **PUT /api/comments/:id**
Update comment

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Comment updated",
  "data": {
    "comment": { /* updated comment */ }
  }
}
```

### **DELETE /api/comments/:id**
Delete comment

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Comment deleted",
  "data": null
}
```

## 3.8 Commission Endpoints

### **GET /api/commissions**
Get user's commissions (as client or artist)

**Headers:** `Authorization: Bearer {token}`

**Query Params:** `?role=client&status=pending&page=1&limit=20`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "commissions": [
      {
        "id": "uuid",
        "title": "Custom Portrait",
        "budget": 500.00,
        "status": "in_progress",
        "deadline": "2024-02-15",
        "client": { /* client user details */ },
        "artist": { /* artist user details */ },
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

### **POST /api/commissions**
Request commission

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "artistId": "uuid",
  "title": "Custom Portrait",
  "description": "I need a portrait of...",
  "referenceImages": ["url1", "url2"],
  "budget": 500.00,
  "deadline": "2024-02-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Commission request sent",
  "data": {
    "commission": { /* created commission */ }
  }
}
```

### **PUT /api/commissions/:id**
Update commission status

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "status": "in_progress",
  "artistNotes": "Started working on this"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Commission updated",
  "data": {
    "commission": { /* updated commission */ }
  }
}
```

### **POST /api/commissions/:id/complete**
Mark commission as complete

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "finalArtworkUrl": "cloudinary-url",
  "artistNotes": "Final work delivered"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Commission marked as complete",
  "data": {
    "commission": { /* completed commission */ }
  }
}
```

## 3.9 Consultation Endpoints

### **GET /api/consultations**
Get user's consultations

**Headers:** `Authorization: Bearer {token}`

**Query Params:** `?role=client&status=scheduled&page=1&limit=20`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "consultations": [
      {
        "id": "uuid",
        "scheduledAt": "2024-01-20T15:00:00Z",
        "duration": 60,
        "price": 150.00,
        "isFree": false,
        "status": "scheduled",
        "meetingLink": "zoom-link",
        "client": { /* client details */ },
        "artist": { /* artist details */ },
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

### **POST /api/consultations**
Book consultation

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "artistId": "uuid",
  "scheduledAt": "2024-01-20T15:00:00Z",
  "duration": 60,
  "notes": "Want to discuss commission ideas"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Consultation booked",
  "data": {
    "consultation": { /* created consultation */ }
  }
}
```

### **PUT /api/consultations/:id**
Update consultation

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Great discussion"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Consultation updated",
  "data": {
    "consultation": { /* updated consultation */ }
  }
}
```

### **DELETE /api/consultations/:id**
Cancel consultation

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Consultation cancelled",
  "data": null
}
```

## 3.10 Livestream Endpoints

### **GET /api/livestreams**
Get livestreams

**Query Params:** `?status=live&page=1&limit=20`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "livestreams": [
      {
        "id": "uuid",
        "title": "Live Digital Painting",
        "description": "Painting a landscape",
        "thumbnailUrl": "url",
        "status": "live",
        "isAuction": true,
        "currentBid": 250.00,
        "viewersCount": 145,
        "artist": { /* artist details */ },
        "scheduledAt": "2024-01-15T18:00:00Z",
        "startedAt": "2024-01-15T18:02:00Z"
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

### **GET /api/livestreams/:id**
Get livestream details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "livestream": {
      "id": "uuid",
      "title": "Live Digital Painting",
      "description": "Painting a landscape",
      "streamUrl": "streaming-url",
      "status": "live",
      "isAuction": true,
      "startingBid": 100.00,
      "currentBid": 250.00,
      "viewersCount": 145,
      "artist": { /* artist details */ },
      "bids": [ /* recent bids */ ],
      "createdAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

### **POST /api/livestreams**
Create livestream

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "Live Digital Painting",
  "description": "Painting a landscape",
  "thumbnailUrl": "url",
  "scheduledAt": "2024-01-20T18:00:00Z",
  "isAuction": true,
  "startingBid": 100.00
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Livestream created",
  "data": {
    "livestream": {
      /* livestream details */
      "streamKey": "secret-stream-key"
    }
  }
}
```

### **POST /api/livestreams/:id/bids**
Place bid on auction stream

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "amount": 275.00
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Bid placed successfully",
  "data": {
    "bid": {
      "id": "uuid",
      "amount": 275.00,
      "isWinning": true,
      "createdAt": "2024-01-15T18:30:00Z"
    },
    "currentBid": 275.00
  }
}
```

### **PUT /api/livestreams/:id/status**
Update livestream status

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "status": "live" // "scheduled" | "live" | "ended"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Livestream status updated",
  "data": {
    "livestream": { /* updated livestream */ }
  }
}
```

## 3.11 Message Endpoints

### **GET /api/conversations**
Get user's conversations

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "participant": {
          "id": "uuid",
          "username": "johndoe",
          "fullName": "John Doe",
          "profilePicture": "url"
        },
        "lastMessage": {
          "content": "Thanks for your message",
          "senderId": "uuid",
          "createdAt": "2024-01-15T10:30:00Z"
        },
        "unreadCount": 2,
        "lastMessageAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### **GET /api/conversations/:id/messages**
Get conversation messages

**Headers:** `Authorization: Bearer {token}`

**Query Params:** `?page=1&limit=50`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "content": "Hello!",
        "senderId": "uuid",
        "isRead": true,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

### **POST /api/conversations**
Start new conversation

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "recipientId": "uuid",
  "message": "Hi, I love your artwork!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Conversation started",
  "data": {
    "conversation": { /* conversation details */ },
    "message": { /* first message */ }
  }
}
```

### **POST /api/conversations/:id/messages**
Send message

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "content": "Thanks for your interest!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "message": { /* created message */ }
  }
}
```

### **PUT /api/messages/mark-read**
Mark messages as read

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "conversationId": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": null
}
```

## 3.12 Notification Endpoints

### **GET /api/notifications**
Get user's notifications

**Headers:** `Authorization: Bearer {token}`

**Query Params:** `?page=1&limit=20&unread=true`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "comment",
        "title": "New Comment",
        "message": "johndoe commented on your artwork",
        "link": "/artworks/uuid",
        "isRead": false,
        "metadata": {
          "artworkId": "uuid",
          "commentId": "uuid"
        },
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": { /* pagination object */ },
    "unreadCount": 5
  }
}
```

### **PUT /api/notifications/:id/read**
Mark notification as read

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": null
}
```

### **PUT /api/notifications/mark-all-read**
Mark all notifications as read

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": null
}
```

## 3.13 Upload Endpoints

### **POST /api/upload/image**
Upload image to Cloudinary

**Headers:** `Authorization: Bearer {token}`

**Request Body (multipart/form-data):**
```
image: [file]
folder: "artworks" // or "profiles", "commissions"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "cloudinary-url",
    "thumbnailUrl": "cloudinary-thumbnail-url",
    "publicId": "cloudinary-public-id",
    "width": 1920,
    "height": 1080,
    "fileSize": 2048576
  }
}
```

## 3.14 Admin Endpoints

### **GET /api/admin/dashboard**
Get admin dashboard stats

**Headers:** `Authorization: Bearer {token}` (Admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 1250,
      "totalArtists": 340,
      "totalArtworks": 4500,
      "totalOrders": 890,
      "totalRevenue": 125000.00,
      "platformCommission": 12500.00
    },
    "recentActivity": [ /* recent activities */ ]
  }
}
```

### **PUT /api/admin/users/:id/verify**
Verify user account

**Headers:** `Authorization: Bearer {token}` (Admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "User verified successfully",
  "data": null
}
```

### **PUT /api/admin/artworks/:id/feature**
Feature/unfeature artwork

**Headers:** `Authorization: Bearer {token}` (Admin only)

**Request Body:**
```json
{
  "isFeatured": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Artwork featured successfully",
  "data": null
}
```

---

# 4. Services Architecture

## 4.1 Service Layer Structure

```
backend/src/services/
├── auth.service.js         # Authentication logic
├── user.service.js         # User management
├── artwork.service.js      # Artwork operations
├── cart.service.js         # Shopping cart
├── order.service.js        # Order processing
├── payment.service.js      # Stripe integration
├── commission.service.js   # Commission management
├── consultation.service.js # Consultation booking
├── livestream.service.js   # Livestream operations
├── message.service.js      # Messaging system
├── notification.service.js # Notifications
├── upload.service.js       # File uploads (Cloudinary)
├── email.service.js        # Email notifications (Resend)
└── analytics.service.js    # Analytics and stats
```

## 4.2 Service Descriptions

### **auth.service.js**
Handles authentication logic
- Password validation and hashing
- Token generation and validation
- Session management
- Password reset functionality

**Key Methods:**
```javascript
- registerUser(userData)
- loginUser(credentials)
- refreshToken(refreshToken)
- validateToken(token)
- resetPassword(email)
- changePassword(userId, oldPassword, newPassword)
```

### **user.service.js**
Manages user profiles and relationships
- User CRUD operations
- Profile updates
- Follow/unfollow logic
- User search

**Key Methods:**
```javascript
- getUserByUsername(username)
- updateUserProfile(userId, data)
- followUser(followerId, followingId)
- unfollowUser(followerId, followingId)
- getFollowers(userId, pagination)
- getFollowing(userId, pagination)
- searchUsers(query, filters)
- updateUserStats(userId, stats)
```

### **artwork.service.js**
Manages artwork operations
- Artwork CRUD
- Favorites management
- View tracking
- Search and filtering

**Key Methods:**
```javascript
- createArtwork(userId, artworkData)
- updateArtwork(artworkId, data)
- deleteArtwork(artworkId)
- getArtworks(filters, pagination)
- getArtworkById(artworkId, userId?)
- favoriteArtwork(userId, artworkId)
- unfavoriteArtwork(userId, artworkId)
- incrementViews(artworkId)
- searchArtworks(query, filters)
```

### **cart.service.js**
Shopping cart management
- Add/remove items
- Update quantities
- Calculate totals
- Cart validation

**Key Methods:**
```javascript
- getCart(userId)
- addToCart(userId, artworkId, quantity)
- updateCartItem(cartItemId, quantity)
- removeFromCart(cartItemId)
- clearCart(userId)
- validateCart(userId)
- calculateCartTotals(userId)
```

### **order.service.js**
Order processing and management
- Order creation
- Order tracking
- Sales analytics
- Earnings calculation

**Key Methods:**
```javascript
- createOrder(userId, orderData)
- getOrders(userId, filters, pagination)
- getOrderById(orderId)
- updateOrderStatus(orderId, status)
- getSales(sellerId, pagination)
- calculateEarnings(sellerId)
- processOrderCompletion(orderId)
```

### **payment.service.js**
Stripe payment integration
- Payment intent creation
- Payment processing
- Refunds
- Webhook handling

**Key Methods:**
```javascript
- createPaymentIntent(amount, metadata)
- confirmPayment(paymentIntentId)
- processRefund(paymentId, amount)
- handleWebhook(event)
- createCustomer(userId, email)
- attachPaymentMethod(customerId, paymentMethodId)
```

### **commission.service.js**
Commission request management
- Commission creation
- Status updates
- Artist-client communication
- Completion handling

**Key Methods:**
```javascript
- createCommission(clientId, artistId, data)
- getCommissions(userId, role, filters)
- updateCommissionStatus(commissionId, status, notes)
- completeCommission(commissionId, finalArtwork)
- cancelCommission(commissionId, reason)
```

### **consultation.service.js**
Consultation booking system
- Availability checking
- Booking creation
- Meeting link generation
- Reminder notifications

**Key Methods:**
```javascript
- bookConsultation(clientId, artistId, data)
- getConsultations(userId, role, filters)
- updateConsultation(consultationId, data)
- cancelConsultation(consultationId)
- checkAvailability(artistId, dateTime)
- generateMeetingLink(consultationId)
- sendReminder(consultationId)
```

### **livestream.service.js**
Livestream management
- Stream creation
- Stream key generation
- Bid management
- Viewer tracking

**Key Methods:**
```javascript
- createLivestream(artistId, data)
- updateStreamStatus(streamId, status)
- placeBid(streamId, bidderId, amount)
- getActiveBids(streamId)
- incrementViewers(streamId)
- decrementViewers(streamId)
- endStream(streamId)
- processAuctionWinner(streamId)
```

### **message.service.js**
Messaging system
- Conversation management
- Message sending
- Read receipts
- Unread count

**Key Methods:**
```javascript
- getConversations(userId)
- getMessages(conversationId, pagination)
- sendMessage(senderId, conversationId, content)
- createConversation(user1Id, user2Id)
- markAsRead(conversationId, userId)
- getUnreadCount(userId)
```

### **notification.service.js**
Notification system
- Notification creation
- Push notifications
- Email notifications
- Read status tracking

**Key Methods:**
```javascript
- createNotification(userId, type, data)
- getNotifications(userId, filters, pagination)
- markAsRead(notificationId)
- markAllAsRead(userId)
- getUnreadCount(userId)
- sendPushNotification(userId, notification)
- deleteNotification(notificationId)
```

### **upload.service.js**
File upload handling (Cloudinary)
- Image upload
- Image optimization
- Thumbnail generation
- File validation

**Key Methods:**
```javascript
- uploadImage(file, folder)
- uploadMultiple(files, folder)
- deleteImage(publicId)
- generateThumbnail(imageUrl)
- validateImage(file)
- optimizeImage(imageUrl, options)
```

### **email.service.js**
Email notifications (Resend)
- Welcome email
- Order confirmation
- Commission updates
- Newsletter

**Key Methods:**
```javascript
- sendWelcomeEmail(user)
- sendOrderConfirmation(order)
- sendCommissionUpdate(commission)
- sendConsultationReminder(consultation)
- sendPasswordReset(user, token)
- sendNewsletter(users, content)
```

### **analytics.service.js**
Analytics and statistics
- User stats
- Sales analytics
- Platform metrics
- Artist insights

**Key Methods:**
```javascript
- getUserStats(userId)
- getArtworkStats(artworkId)
- getSalesAnalytics(sellerId, dateRange)
- getPlatformMetrics(dateRange)
- getTopArtworks(limit)
- getTopArtists(limit)
- getRevenueReport(dateRange)
```

## 4.3 External Services Integration

### **Cloudinary**
- Image/video hosting
- Image transformations
- CDN delivery
- Automatic optimization

**Configuration:**
```javascript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

### **Stripe**
- Payment processing
- Subscription management
- Payouts to artists
- Webhook handling

**Configuration:**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

### **Resend**
- Transactional emails
- Marketing campaigns
- Email templates
- Delivery tracking

**Configuration:**
```javascript
const resend = new Resend(process.env.RESEND_API_KEY);
```

### **PostgreSQL**
- Primary database
- Connection pooling
- Query optimization
- Migrations

### **Redis (Optional)**
- Session storage
- Caching
- Rate limiting
- Real-time features

---

# 5. Competitors Analysis

## 5.1 Direct Competitors

### **1. DeviantArt**

**Overview:**
- Largest online art community
- Founded: 2000
- Monthly visitors: 45M+

**Strengths:**
- Huge established community
- Free to use
- Comprehensive portfolio features
- Active forums and groups
- Print-on-demand integration

**Weaknesses:**
- Outdated UI/UX
- High commission fees (20-30%)
- Limited monetization for artists
- No built-in livestreaming
- No consultation features

**Features OnlyArts Can Beat Them On:**
- Modern, intuitive interface
- Lower commission rates (10%)
- Integrated livestream auctions
- Direct artist consultations
- Better artist-client communication
- Premium subscription benefits

---

### **2. ArtStation**

**Overview:**
- Professional portfolio platform
- Target: Game, film, media artists
- Monthly visitors: 10M+

**Strengths:**
- Professional-grade portfolios
- Industry-standard platform
- Job board integration
- High-quality artwork showcase
- Learning resources

**Weaknesses:**
- Limited social features
- No direct sales marketplace
- Pro subscription required for key features
- No livestreaming
- No commission management system

**Features OnlyArts Can Beat Them On:**
- Built-in marketplace (not just portfolio)
- Commission request system
- Livestream capabilities
- Free tier with more features
- Social networking features
- Direct messaging

---

### **3. Etsy (Art Category)**

**Overview:**
- E-commerce marketplace
- Art is one category among many
- Monthly visitors: 400M+

**Strengths:**
- Massive user base
- Established trust
- Payment processing
- International shipping
- SEO optimization

**Weaknesses:**
- Not art-focused
- Generic platform
- High fees (6.5% + payment processing)
- Limited artist profiles
- No social features
- No livestreaming or consultations

**Features OnlyArts Can Beat Them On:**
- Art-specific features
- Artist community
- Livestream auctions
- Consultation booking
- Lower fees
- Better artist discovery
- Commission system

---

### **4. Behance (Adobe)**

**Overview:**
- Creative portfolio platform
- Owned by Adobe
- Monthly visitors: 15M+

**Strengths:**
- Adobe Creative Cloud integration
- Professional networking
- Job opportunities
- High-quality showcase
- Free to use

**Weaknesses:**
- Portfolio-only (no sales)
- No monetization features
- Limited social interaction
- No marketplace
- No commission system

**Features OnlyArts Can Beat Them On:**
- Direct sales capability
- Commission marketplace
- Consultation booking
- Livestream features
- Artist earnings
- Client-artist workflow

---

### **5. Patreon (Art Creators)**

**Overview:**
- Membership/subscription platform
- For artists with recurring supporters
- Active creators: 250K+

**Strengths:**
- Recurring revenue model
- Community building
- Flexible tier structure
- Creator-focused

**Weaknesses:**
- Not a marketplace
- Requires existing audience
- 5-12% fees
- No one-time purchases
- No commission system
- No livestream auctions

**Features OnlyArts Can Beat Them On:**
- One-time artwork sales
- Commission marketplace
- Discovery for new artists
- Livestream auctions
- Lower fees
- Multiple revenue streams

---

### **6. Saatchi Art**

**Overview:**
- Online art gallery
- Curated marketplace
- Monthly visitors: 2M+

**Strengths:**
- High-end art focus
- Curated selection
- Global shipping
- Art advisory services
- 14-day return policy

**Weaknesses:**
- 35% commission (very high)
- Selective artist approval
- High-price focus only
- No social features
- No livestreaming
- Limited artist-buyer interaction

**Features OnlyArts Can Beat Them On:**
- Lower commission (10% vs 35%)
- Open to all artists
- Social features
- Direct communication
- Livestream capabilities
- Consultation features
- All price ranges

---

## 5.2 Indirect Competitors

### **Instagram**
- **Use Case:** Artists showcase work, build following
- **OnlyArts Advantage:** Built-in sales, commissions, no algorithm suppression

### **TikTok**
- **Use Case:** Art videos, process videos
- **OnlyArts Advantage:** Livestream auctions, actual sales platform

### **YouTube**
- **Use Case:** Art tutorials, process videos
- **OnlyArts Advantage:** Consultation booking, direct monetization

### **Ko-fi**
- **Use Case:** Tips/donations for artists
- **OnlyArts Advantage:** Full marketplace, commissions, consultations

---

## 5.3 OnlyArts Unique Value Propositions

### **1. All-in-One Platform**
Unlike competitors, OnlyArts combines:
- Portfolio showcase
- Marketplace for sales
- Commission system
- Consultation booking
- Livestream auctions
- Social networking
- Direct messaging

### **2. Lower Fees**
- **OnlyArts:** 10% commission
- **Saatchi Art:** 35%
- **Etsy:** 6.5% + payment fees
- **Patreon:** 5-12%
- **DeviantArt:** 20-30%

### **3. Multiple Revenue Streams for Artists**
1. One-time artwork sales
2. Commission work
3. Hourly consultations
4. Livestream auctions
5. Premium subscriptions (future)
6. Print sales (future)

### **4. Artist-Client Workflow**
- Direct messaging
- Commission request system
- Consultation booking
- Project milestones
- Escrow payment (future)

### **5. Livestream Auctions**
- Watch artists create in real-time
- Bid on artwork during creation
- Interactive engagement
- No other platform offers this

### **6. Premium Features for Free**
Many features competitors charge for:
- Unlimited uploads
- Custom portfolio
- Analytics dashboard
- Direct messaging
- Commission system

---

## 5.4 Market Positioning

### **Target Market Segments**

**1. Emerging Artists**
- Age: 18-35
- Looking for exposure
- Need multiple income streams
- Want community support

**2. Established Artists**
- Have following elsewhere
- Looking for better fees
- Want professional tools
- Need client management

**3. Art Collectors**
- Want to discover new artists
- Looking for unique pieces
- Interested in commissions
- Value artist interaction

**4. Art Enthusiasts**
- Follow favorite artists
- Purchase affordable art
- Enjoy livestreams
- Support artists directly

---

## 5.5 Competitive Advantages Summary

| Feature | OnlyArts | DeviantArt | ArtStation | Etsy | Behance | Patreon | Saatchi |
|---------|----------|------------|------------|------|---------|---------|---------|
| **Marketplace** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Portfolio** | ✅ | ✅ | ✅ | Limited | ✅ | Limited | ✅ |
| **Commission System** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Consultations** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Livestream** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Livestream Auctions** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Social Features** | ✅ | ✅ | Limited | ❌ | Limited | ✅ | ❌ |
| **Direct Messaging** | ✅ | ✅ | ❌ | Limited | ❌ | ✅ | ❌ |
| **Commission Rate** | **10%** | 20-30% | N/A | 6.5% | N/A | 5-12% | 35% |
| **Free Tier** | ✅ | ✅ | Limited | ❌ | ✅ | ✅ | ✅ |
| **Modern UI** | ✅ | ❌ | ✅ | Limited | ✅ | ✅ | ✅ |

---

## 5.6 Go-to-Market Strategy

### **Phase 1: Launch (Months 1-3)**
- Invite beta artists (100-500)
- Build initial artwork inventory
- Focus on quality over quantity
- Gather feedback and iterate

### **Phase 2: Growth (Months 4-12)**
- Open to public
- Social media marketing
- Influencer partnerships
- SEO optimization
- Content marketing

### **Phase 3: Scale (Year 2+)**
- International expansion
- Mobile apps
- Advanced features
- Partnership with galleries
- Corporate accounts

---

## Conclusion

OnlyArts has a strong competitive position by offering features no single competitor provides:
- **All-in-one platform** combining portfolio, marketplace, and services
- **Lower fees** than premium competitors
- **Unique features** like livestream auctions and consultations
- **Multiple revenue streams** for artists
- **Modern technology** and user experience

The key to success will be:
1. Building a strong artist community early
2. Delivering exceptional user experience
3. Marketing the unique features effectively
4. Maintaining competitive fees
5. Continuous innovation

---

**End of Backend Architecture Document**
