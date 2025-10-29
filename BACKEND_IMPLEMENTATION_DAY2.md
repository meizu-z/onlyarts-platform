# Day 2: Database Schema & Migrations

**Goal:** Complete PostgreSQL schema for all OnlyArts features

**Time Estimate:** 4-5 hours

---

## Overview

Today you'll create the complete database schema with all tables, relationships, indexes, and constraints needed for the OnlyArts platform.

**Tables to Create:**
1. users
2. artworks
3. cart_items
4. follows
5. favorites
6. orders
7. order_items
8. commissions
9. messages
10. conversations
11. livestreams
12. livestream_bids
13. consultations
14. comments
15. notifications

---

## Step 1: Install Migration Tool (10 min)

Install `node-pg-migrate`:

```bash
cd backend
npm install node-pg-migrate
```

Update `backend/package.json` scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "migrate": "node-pg-migrate",
    "migrate:up": "node-pg-migrate up",
    "migrate:down": "node-pg-migrate down",
    "migrate:create": "node-pg-migrate create"
  }
}
```

Create migration config file `backend/database.json`:

```json
{
  "dev": {
    "driver": "pg",
    "host": {"ENV": "DB_HOST"},
    "port": {"ENV": "DB_PORT"},
    "database": {"ENV": "DB_NAME"},
    "user": {"ENV": "DB_USER"},
    "password": {"ENV": "DB_PASSWORD"}
  },
  "production": {
    "driver": "pg",
    "connectionString": {"ENV": "DATABASE_URL"},
    "ssl": {
      "rejectUnauthorized": false
    }
  }
}
```

Create migrations folder:

```bash
mkdir migrations
```

---

## Step 2: Create Users Table Migration (20 min)

Create migration:

```bash
npm run migrate:create create-users-table
```

Edit the generated file in `migrations/`:

```javascript
/* eslint-disable camelcase */

exports.up = (pgm) => {
  // Create enum for user roles
  pgm.createType('user_role', ['user', 'artist', 'admin']);

  // Create enum for subscription tiers
  pgm.createType('subscription_tier', ['free', 'premium', 'pro']);

  // Create users table
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    username: {
      type: 'varchar(50)',
      notNull: true,
      unique: true,
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: 'varchar(255)',
      notNull: true,
    },
    full_name: {
      type: 'varchar(100)',
    },
    bio: {
      type: 'text',
    },
    profile_picture: {
      type: 'text',
    },
    cover_image: {
      type: 'text',
    },
    role: {
      type: 'user_role',
      notNull: true,
      default: 'user',
    },
    subscription_tier: {
      type: 'subscription_tier',
      notNull: true,
      default: 'free',
    },
    is_verified: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    is_premium: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    balance: {
      type: 'decimal(10, 2)',
      notNull: true,
      default: 0,
    },
    total_earnings: {
      type: 'decimal(10, 2)',
      notNull: true,
      default: 0,
    },
    followers_count: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    following_count: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    artworks_count: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    hourly_rate: {
      type: 'decimal(10, 2)',
      comment: 'Hourly consultation rate for artists',
    },
    last_login_at: {
      type: 'timestamp',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create indexes for performance
  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'username');
  pgm.createIndex('users', 'role');
  pgm.createIndex('users', 'subscription_tier');
  pgm.createIndex('users', 'created_at');
};

exports.down = (pgm) => {
  pgm.dropTable('users');
  pgm.dropType('subscription_tier');
  pgm.dropType('user_role');
};
```

---

## Step 3: Create Artworks Table Migration (20 min)

Create migration:

```bash
npm run migrate:create create-artworks-table
```

Edit the generated file:

```javascript
/* eslint-disable camelcase */

exports.up = (pgm) => {
  // Create enum for artwork status
  pgm.createType('artwork_status', ['draft', 'published', 'sold', 'archived']);

  // Create enum for artwork category
  pgm.createType('artwork_category', [
    'digital',
    'painting',
    'photography',
    'sculpture',
    'illustration',
    'animation',
    '3d',
    'traditional',
    'mixed_media',
    'other'
  ]);

  // Create artworks table
  pgm.createTable('artworks', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    image_url: {
      type: 'text',
      notNull: true,
    },
    thumbnail_url: {
      type: 'text',
    },
    price: {
      type: 'decimal(10, 2)',
      notNull: true,
    },
    original_price: {
      type: 'decimal(10, 2)',
      comment: 'For showing discounts',
    },
    category: {
      type: 'artwork_category',
      notNull: true,
    },
    tags: {
      type: 'text[]',
      default: '{}',
    },
    dimensions: {
      type: 'varchar(100)',
      comment: 'e.g., 1920x1080, 30x40cm',
    },
    file_size: {
      type: 'integer',
      comment: 'File size in bytes',
    },
    status: {
      type: 'artwork_status',
      notNull: true,
      default: 'draft',
    },
    is_featured: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    is_for_sale: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
    views_count: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    favorites_count: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    comments_count: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create indexes
  pgm.createIndex('artworks', 'user_id');
  pgm.createIndex('artworks', 'category');
  pgm.createIndex('artworks', 'status');
  pgm.createIndex('artworks', 'is_featured');
  pgm.createIndex('artworks', 'created_at');
  pgm.createIndex('artworks', 'price');
  pgm.createIndex('artworks', 'tags', { method: 'gin' }); // GIN index for array search
};

exports.down = (pgm) => {
  pgm.dropTable('artworks');
  pgm.dropType('artwork_category');
  pgm.dropType('artwork_status');
};
```

---

## Step 4: Create Shopping Tables Migration (25 min)

Create migration:

```bash
npm run migrate:create create-shopping-tables
```

Edit the generated file:

```javascript
/* eslint-disable camelcase */

exports.up = (pgm) => {
  // ======================================
  // CART ITEMS TABLE
  // ======================================
  pgm.createTable('cart_items', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    artwork_id: {
      type: 'uuid',
      notNull: true,
      references: 'artworks',
      onDelete: 'CASCADE',
    },
    quantity: {
      type: 'integer',
      notNull: true,
      default: 1,
    },
    added_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Unique constraint: user can only have one cart item per artwork
  pgm.addConstraint('cart_items', 'unique_user_artwork', {
    unique: ['user_id', 'artwork_id'],
  });

  pgm.createIndex('cart_items', 'user_id');

  // ======================================
  // ORDERS TABLE
  // ======================================
  pgm.createType('order_status', [
    'pending',
    'processing',
    'completed',
    'cancelled',
    'refunded'
  ]);

  pgm.createTable('orders', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    order_number: {
      type: 'varchar(50)',
      notNull: true,
      unique: true,
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    subtotal: {
      type: 'decimal(10, 2)',
      notNull: true,
    },
    tax: {
      type: 'decimal(10, 2)',
      notNull: true,
      default: 0,
    },
    shipping: {
      type: 'decimal(10, 2)',
      notNull: true,
      default: 0,
    },
    discount: {
      type: 'decimal(10, 2)',
      notNull: true,
      default: 0,
    },
    total: {
      type: 'decimal(10, 2)',
      notNull: true,
    },
    status: {
      type: 'order_status',
      notNull: true,
      default: 'pending',
    },
    stripe_payment_id: {
      type: 'varchar(255)',
    },
    stripe_payment_intent: {
      type: 'varchar(255)',
    },
    shipping_address: {
      type: 'jsonb',
      comment: 'Stored as JSON object',
    },
    notes: {
      type: 'text',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('orders', 'user_id');
  pgm.createIndex('orders', 'order_number');
  pgm.createIndex('orders', 'status');
  pgm.createIndex('orders', 'created_at');

  // ======================================
  // ORDER ITEMS TABLE
  // ======================================
  pgm.createTable('order_items', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    order_id: {
      type: 'uuid',
      notNull: true,
      references: 'orders',
      onDelete: 'CASCADE',
    },
    artwork_id: {
      type: 'uuid',
      notNull: true,
      references: 'artworks',
      onDelete: 'RESTRICT', // Don't allow deleting artwork that's in an order
    },
    seller_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'RESTRICT',
    },
    price: {
      type: 'decimal(10, 2)',
      notNull: true,
      comment: 'Price at time of purchase',
    },
    quantity: {
      type: 'integer',
      notNull: true,
      default: 1,
    },
    commission_rate: {
      type: 'decimal(5, 2)',
      notNull: true,
      default: 10,
      comment: 'Platform commission percentage',
    },
    seller_earnings: {
      type: 'decimal(10, 2)',
      notNull: true,
      comment: 'Amount paid to seller after commission',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('order_items', 'order_id');
  pgm.createIndex('order_items', 'artwork_id');
  pgm.createIndex('order_items', 'seller_id');
};

exports.down = (pgm) => {
  pgm.dropTable('order_items');
  pgm.dropTable('orders');
  pgm.dropType('order_status');
  pgm.dropTable('cart_items');
};
```

---

## Step 5: Create Social Tables Migration (25 min)

Create migration:

```bash
npm run migrate:create create-social-tables
```

Edit the generated file:

```javascript
/* eslint-disable camelcase */

exports.up = (pgm) => {
  // ======================================
  // FOLLOWS TABLE
  // ======================================
  pgm.createTable('follows', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    follower_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    following_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Unique constraint: can't follow same user twice
  pgm.addConstraint('follows', 'unique_follower_following', {
    unique: ['follower_id', 'following_id'],
  });

  // Can't follow yourself
  pgm.addConstraint('follows', 'no_self_follow', {
    check: 'follower_id != following_id',
  });

  pgm.createIndex('follows', 'follower_id');
  pgm.createIndex('follows', 'following_id');

  // ======================================
  // FAVORITES TABLE
  // ======================================
  pgm.createTable('favorites', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    artwork_id: {
      type: 'uuid',
      notNull: true,
      references: 'artworks',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Unique constraint: can't favorite same artwork twice
  pgm.addConstraint('favorites', 'unique_user_artwork_favorite', {
    unique: ['user_id', 'artwork_id'],
  });

  pgm.createIndex('favorites', 'user_id');
  pgm.createIndex('favorites', 'artwork_id');

  // ======================================
  // COMMENTS TABLE
  // ======================================
  pgm.createTable('comments', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    artwork_id: {
      type: 'uuid',
      notNull: true,
      references: 'artworks',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    parent_id: {
      type: 'uuid',
      references: 'comments',
      onDelete: 'CASCADE',
      comment: 'For nested replies',
    },
    content: {
      type: 'text',
      notNull: true,
    },
    likes_count: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('comments', 'artwork_id');
  pgm.createIndex('comments', 'user_id');
  pgm.createIndex('comments', 'parent_id');
  pgm.createIndex('comments', 'created_at');
};

exports.down = (pgm) => {
  pgm.dropTable('comments');
  pgm.dropTable('favorites');
  pgm.dropTable('follows');
};
```

---

## Step 6: Create Messaging Tables Migration (20 min)

Create migration:

```bash
npm run migrate:create create-messaging-tables
```

Edit the generated file:

```javascript
/* eslint-disable camelcase */

exports.up = (pgm) => {
  // ======================================
  // CONVERSATIONS TABLE
  // ======================================
  pgm.createTable('conversations', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    participant_one_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    participant_two_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    last_message_at: {
      type: 'timestamp',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Unique constraint: only one conversation between two users
  pgm.addConstraint('conversations', 'unique_participants', {
    unique: ['participant_one_id', 'participant_two_id'],
  });

  // Can't have conversation with yourself
  pgm.addConstraint('conversations', 'no_self_conversation', {
    check: 'participant_one_id != participant_two_id',
  });

  pgm.createIndex('conversations', 'participant_one_id');
  pgm.createIndex('conversations', 'participant_two_id');
  pgm.createIndex('conversations', 'last_message_at');

  // ======================================
  // MESSAGES TABLE
  // ======================================
  pgm.createTable('messages', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    conversation_id: {
      type: 'uuid',
      notNull: true,
      references: 'conversations',
      onDelete: 'CASCADE',
    },
    sender_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    content: {
      type: 'text',
      notNull: true,
    },
    is_read: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    read_at: {
      type: 'timestamp',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('messages', 'conversation_id');
  pgm.createIndex('messages', 'sender_id');
  pgm.createIndex('messages', 'created_at');
  pgm.createIndex('messages', 'is_read');
};

exports.down = (pgm) => {
  pgm.dropTable('messages');
  pgm.dropTable('conversations');
};
```

---

## Step 7: Create Commission & Consultation Tables Migration (25 min)

Create migration:

```bash
npm run migrate:create create-commission-consultation-tables
```

Edit the generated file:

```javascript
/* eslint-disable camelcase */

exports.up = (pgm) => {
  // ======================================
  // COMMISSIONS TABLE
  // ======================================
  pgm.createType('commission_status', [
    'pending',
    'in_progress',
    'completed',
    'cancelled',
    'disputed'
  ]);

  pgm.createTable('commissions', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    client_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    artist_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: true,
    },
    reference_images: {
      type: 'text[]',
      default: '{}',
    },
    budget: {
      type: 'decimal(10, 2)',
      notNull: true,
    },
    deadline: {
      type: 'date',
    },
    status: {
      type: 'commission_status',
      notNull: true,
      default: 'pending',
    },
    final_artwork_url: {
      type: 'text',
    },
    artist_notes: {
      type: 'text',
    },
    client_notes: {
      type: 'text',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    completed_at: {
      type: 'timestamp',
    },
  });

  pgm.createIndex('commissions', 'client_id');
  pgm.createIndex('commissions', 'artist_id');
  pgm.createIndex('commissions', 'status');
  pgm.createIndex('commissions', 'created_at');

  // ======================================
  // CONSULTATIONS TABLE
  // ======================================
  pgm.createType('consultation_status', [
    'scheduled',
    'completed',
    'cancelled',
    'no_show'
  ]);

  pgm.createTable('consultations', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    client_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    artist_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    scheduled_at: {
      type: 'timestamp',
      notNull: true,
    },
    duration_minutes: {
      type: 'integer',
      notNull: true,
      default: 60,
    },
    price: {
      type: 'decimal(10, 2)',
      notNull: true,
      comment: '0 for premium users',
    },
    is_free: {
      type: 'boolean',
      notNull: true,
      default: false,
      comment: 'True if client has premium subscription',
    },
    status: {
      type: 'consultation_status',
      notNull: true,
      default: 'scheduled',
    },
    meeting_link: {
      type: 'text',
    },
    notes: {
      type: 'text',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('consultations', 'client_id');
  pgm.createIndex('consultations', 'artist_id');
  pgm.createIndex('consultations', 'scheduled_at');
  pgm.createIndex('consultations', 'status');
};

exports.down = (pgm) => {
  pgm.dropTable('consultations');
  pgm.dropType('consultation_status');
  pgm.dropTable('commissions');
  pgm.dropType('commission_status');
};
```

---

## Step 8: Create Livestream Tables Migration (20 min)

Create migration:

```bash
npm run migrate:create create-livestream-tables
```

Edit the generated file:

```javascript
/* eslint-disable camelcase */

exports.up = (pgm) => {
  // ======================================
  // LIVESTREAMS TABLE
  // ======================================
  pgm.createType('livestream_status', ['scheduled', 'live', 'ended']);

  pgm.createTable('livestreams', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    artist_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    thumbnail_url: {
      type: 'text',
    },
    stream_url: {
      type: 'text',
    },
    stream_key: {
      type: 'varchar(255)',
    },
    status: {
      type: 'livestream_status',
      notNull: true,
      default: 'scheduled',
    },
    is_auction: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    starting_bid: {
      type: 'decimal(10, 2)',
      comment: 'Starting bid for auction streams',
    },
    current_bid: {
      type: 'decimal(10, 2)',
    },
    viewers_count: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    scheduled_at: {
      type: 'timestamp',
    },
    started_at: {
      type: 'timestamp',
    },
    ended_at: {
      type: 'timestamp',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('livestreams', 'artist_id');
  pgm.createIndex('livestreams', 'status');
  pgm.createIndex('livestreams', 'is_auction');
  pgm.createIndex('livestreams', 'created_at');

  // ======================================
  // LIVESTREAM BIDS TABLE
  // ======================================
  pgm.createTable('livestream_bids', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    livestream_id: {
      type: 'uuid',
      notNull: true,
      references: 'livestreams',
      onDelete: 'CASCADE',
    },
    bidder_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    amount: {
      type: 'decimal(10, 2)',
      notNull: true,
    },
    is_winning: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('livestream_bids', 'livestream_id');
  pgm.createIndex('livestream_bids', 'bidder_id');
  pgm.createIndex('livestream_bids', 'amount');
  pgm.createIndex('livestream_bids', 'created_at');
};

exports.down = (pgm) => {
  pgm.dropTable('livestream_bids');
  pgm.dropTable('livestreams');
  pgm.dropType('livestream_status');
};
```

---

## Step 9: Create Notifications Table Migration (15 min)

Create migration:

```bash
npm run migrate:create create-notifications-table
```

Edit the generated file:

```javascript
/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createType('notification_type', [
    'like',
    'comment',
    'follow',
    'purchase',
    'commission',
    'consultation',
    'message',
    'livestream',
    'bid',
    'system'
  ]);

  pgm.createTable('notifications', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    type: {
      type: 'notification_type',
      notNull: true,
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
    message: {
      type: 'text',
      notNull: true,
    },
    link: {
      type: 'text',
      comment: 'URL to navigate when notification clicked',
    },
    is_read: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    read_at: {
      type: 'timestamp',
    },
    metadata: {
      type: 'jsonb',
      comment: 'Additional data as JSON',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('notifications', 'user_id');
  pgm.createIndex('notifications', 'type');
  pgm.createIndex('notifications', 'is_read');
  pgm.createIndex('notifications', 'created_at');
};

exports.down = (pgm) => {
  pgm.dropTable('notifications');
  pgm.dropType('notification_type');
};
```

---

## Step 10: Run All Migrations (10 min)

Now run all migrations to create the complete schema:

```bash
npm run migrate:up
```

You should see output like:
```
> onlyarts-backend@1.0.0 migrate:up
> node-pg-migrate up

> Running migration 1234567890123-create-users-table
> Running migration 1234567890124-create-artworks-table
> Running migration 1234567890125-create-shopping-tables
> Running migration 1234567890126-create-social-tables
> Running migration 1234567890127-create-messaging-tables
> Running migration 1234567890128-create-commission-consultation-tables
> Running migration 1234567890129-create-livestream-tables
> Running migration 1234567890130-create-notifications-table
```

---

## Step 11: Verify Database Schema (15 min)

Connect to your database and verify:

```bash
psql -U your_username -d onlyarts
```

In psql, run:

```sql
-- List all tables
\dt

-- View users table structure
\d users

-- View artworks table structure
\d artworks

-- View all enums
\dT

-- Exit psql
\q
```

You should see 15 tables:
1. users
2. artworks
3. cart_items
4. orders
5. order_items
6. follows
7. favorites
8. comments
9. conversations
10. messages
11. commissions
12. consultations
13. livestreams
14. livestream_bids
15. notifications

---

## Step 12: Create Database Diagram Documentation (20 min)

Create `backend/DATABASE_SCHEMA.md`:

```markdown
# OnlyArts Database Schema

## Tables Overview

### Core Tables
- **users** - User accounts and profiles
- **artworks** - Art pieces uploaded by artists

### Shopping
- **cart_items** - Shopping cart items
- **orders** - Purchase orders
- **order_items** - Individual items in orders

### Social
- **follows** - User follow relationships
- **favorites** - Favorite artworks
- **comments** - Artwork comments

### Messaging
- **conversations** - 1-on-1 chat conversations
- **messages** - Individual messages

### Services
- **commissions** - Custom artwork requests
- **consultations** - 1-on-1 artist consultations

### Livestreaming
- **livestreams** - Live art sessions
- **livestream_bids** - Auction bids during streams

### System
- **notifications** - User notifications

## Relationships

### Users (Central Hub)
- users → artworks (1:many) - Artists create artworks
- users ↔ users (many:many via follows) - Follow system
- users ↔ artworks (many:many via favorites) - Favorite system
- users → cart_items (1:many) - Shopping cart
- users → orders (1:many) - Purchase history
- users → comments (1:many) - Comments on artworks
- users → messages (1:many) - Sent messages
- users → commissions (as client or artist)
- users → consultations (as client or artist)
- users → livestreams (1:many) - Hosted streams
- users → livestream_bids (1:many) - Placed bids

### Artworks
- artworks → order_items (1:many) - Purchased in orders
- artworks → cart_items (1:many) - Added to carts
- artworks → favorites (1:many) - Favorited by users
- artworks → comments (1:many) - Comments

### Orders
- orders → order_items (1:many) - Items in order

### Livestreams
- livestreams → livestream_bids (1:many) - Bids placed

## Indexes

All foreign keys are indexed for performance.
Additional indexes on:
- Text search fields (username, email, tags)
- Status fields
- Timestamp fields (created_at for sorting)
- Boolean flags (is_featured, is_premium, etc.)

## Enums

- **user_role**: user, artist, admin
- **subscription_tier**: free, premium, pro
- **artwork_status**: draft, published, sold, archived
- **artwork_category**: digital, painting, photography, etc.
- **order_status**: pending, processing, completed, cancelled, refunded
- **commission_status**: pending, in_progress, completed, cancelled, disputed
- **consultation_status**: scheduled, completed, cancelled, no_show
- **livestream_status**: scheduled, live, ended
- **notification_type**: like, comment, follow, purchase, etc.
```

---

## Step 13: Test Database with Sample Data (30 min)

Create `backend/seeds/test-data.sql`:

```sql
-- Insert test users
INSERT INTO users (username, email, password_hash, full_name, bio, role, subscription_tier, is_premium, hourly_rate)
VALUES
  ('meizzuuuuuuu', 'meizu@onlyarts.com', '$2b$10$test', 'Mei Zu', 'Digital artist specializing in anime art', 'artist', 'pro', true, 150.00),
  ('sarah_chen', 'sarah@example.com', '$2b$10$test', 'Sarah Chen', 'Abstract painter', 'artist', 'premium', true, 100.00),
  ('john_collector', 'john@example.com', '$2b$10$test', 'John Doe', 'Art collector and enthusiast', 'user', 'free', false, NULL);

-- Get user IDs (you'll need to adjust these based on actual UUIDs generated)
-- In a real scenario, you'd query the UUIDs after insert

-- Insert test artworks (replace user_id with actual UUID)
INSERT INTO artworks (user_id, title, description, image_url, price, category, tags, status, is_for_sale)
VALUES
  ((SELECT id FROM users WHERE username = 'meizzuuuuuuu'),
   'Digital Sunset',
   'A beautiful digital painting of sunset over mountains',
   'https://example.com/sunset.jpg',
   5000.00,
   'digital',
   ARRAY['landscape', 'digital', 'sunset'],
   'published',
   true);

-- More test data can be added as needed
```

Run the seed file:

```bash
psql -U your_username -d onlyarts < backend/seeds/test-data.sql
```

---

## ✅ Day 2 Completion Checklist

- [ ] `node-pg-migrate` installed
- [ ] Migration config (`database.json`) created
- [ ] Users table migration created and run
- [ ] Artworks table migration created and run
- [ ] Shopping tables (cart, orders, order_items) created
- [ ] Social tables (follows, favorites, comments) created
- [ ] Messaging tables (conversations, messages) created
- [ ] Commission & consultation tables created
- [ ] Livestream tables created
- [ ] Notifications table created
- [ ] All migrations run successfully
- [ ] Database schema verified in psql
- [ ] All 15 tables exist
- [ ] All enums created
- [ ] Indexes verified
- [ ] Foreign key constraints working
- [ ] DATABASE_SCHEMA.md documentation created
- [ ] Test data inserted successfully

---

## 🎯 Expected Outcome

By end of Day 2, you should have:

1. ✅ Complete PostgreSQL schema with 15 tables
2. ✅ All relationships and constraints defined
3. ✅ Proper indexes for performance
4. ✅ Enums for status fields
5. ✅ Migration system setup for version control
6. ✅ Test data seeded
7. ✅ Schema documentation

---

## 🐛 Troubleshooting

### Migration fails with "relation already exists"
```bash
# Rollback and try again
npm run migrate:down
npm run migrate:up
```

### UUID generation not working
```sql
-- Enable uuid extension in PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Or use built-in (PostgreSQL 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Can't connect to database during migration
- Check DATABASE_URL in `.env`
- Verify PostgreSQL is running
- Check database exists: `psql -U postgres -l`

---

## 📝 Git Commit

```bash
git add backend/migrations backend/seeds backend/DATABASE_SCHEMA.md backend/database.json backend/package.json
git commit -m "feat: Day 2 - Complete database schema with migrations

- Create 15 database tables with relationships
- Add enums for status fields
- Setup migration system with node-pg-migrate
- Create indexes for performance
- Add foreign key constraints
- Seed test data
- Document schema relationships

Tables: users, artworks, cart_items, orders, order_items, follows,
favorites, comments, conversations, messages, commissions, consultations,
livestreams, livestream_bids, notifications

🤖 Generated with Claude Code"
```

---

## 🚀 Next: Day 3

Tomorrow you'll implement the complete authentication system with:
- User registration with password hashing
- Login with JWT tokens
- Token refresh mechanism
- Logout functionality
- Protected route middleware
