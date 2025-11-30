# 🚀 Auction System - Quick Start Guide

## Prerequisites

✅ Node.js and npm installed
✅ MySQL database running
✅ OnlyArts platform backend running
✅ User subscription system active (free/basic/premium tiers)

---

## Step 1: Install Dependencies

```bash
# Navigate to frontend
cd /path/to/onlyarts-platform

# Install socket.io-client
npm install socket.io-client
```

---

## Step 2: Run Database Migration

```bash
# Connect to MySQL
mysql -u your_username -p your_database

# Run the migration
source backend/migrations/auction_tables.sql

# Verify tables were created
SHOW TABLES LIKE 'auction%';
```

---

## Step 3: Restart Backend Server

```bash
# Navigate to backend
cd backend

# Restart server (it will auto-load new routes)
npm start
```

You should see:
```
✅ MySQL database connection established
🚀 Server running on http://localhost:5000
💬 WebSocket: Enabled
```

---

## Step 4: Test the System

### Option A: Using Postman/Thunder Client

**1. Create an Auction**
```http
POST http://localhost:5000/api/auctions
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "artworkId": 1,
  "startingPrice": 5000,
  "duration": 900000
}
```

**2. Get Auction Details**
```http
GET http://localhost:5000/api/auctions/AUC-123456789-abc
```

**3. Place a Bid**
```http
POST http://localhost:5000/api/auctions/AUC-123456789-abc/bid
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "bidAmount": 6000
}
```

### Option B: Using the React Component

**1. Create an Auction Page**

```jsx
// src/pages/AuctionPage.jsx
import React from 'react';
import AuctionBiddingPanel from '../components/auction/AuctionBiddingPanel';

const AuctionPage = () => {
  const auctionId = "AUC-123456789-abc"; // From URL params
  const artwork = {
    title: "Beautiful Artwork",
    artist: "Artist Name"
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Live Auction</h1>
      <AuctionBiddingPanel
        auctionId={auctionId}
        artwork={artwork}
      />
    </div>
  );
};

export default AuctionPage;
```

**2. Add Route**

```jsx
// src/App.jsx
import AuctionPage from './pages/AuctionPage';

// Add to your routes:
<Route path="/auction/:id" element={<AuctionPage />} />
```

---

## Step 5: Test Premium Last-Call Feature

### Test Scenario:

1. **Create auction with 2-minute duration**
```json
{
  "artworkId": 1,
  "startingPrice": 1000,
  "duration": 120000
}
```

2. **Place bids with Free user** (should work normally)

3. **Wait for timer to reach 0:00**

4. **Try to bid with Free user** → Should be rejected with:
   ```
   "Only Premium users can bid during Last Call period"
   ```

5. **Place bid with Premium user** → Should succeed!

6. **Auction closes immediately** after Premium bid

---

## Step 6: Verify WebSocket Connection

Open browser console (F12) and look for:

```
✅ Connected to auction server
👤 Socket xyz123 joined auction: AUC-123456789-abc
📢 Auction update: { type: 'NEW_BID', currentPrice: 6000 }
```

---

## Common Issues & Solutions

### Issue: WebSocket not connecting

**Solution:**
```javascript
// Check CORS in backend/server.js
// Verify origin includes your frontend URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
];
```

### Issue: "Table doesn't exist" error

**Solution:**
```sql
-- Run migration again
source backend/migrations/auction_tables.sql

-- Verify
DESCRIBE auctions;
DESCRIBE auction_bids;
```

### Issue: Bids rejected even for Premium users

**Solution:**
```javascript
// Check user.subscription_tier field
// Must be exactly: 'premium' or 'Premium'

// Verify in MySQL:
SELECT id, username, subscription_tier FROM users WHERE subscription_tier = 'premium';
```

### Issue: Timer not counting down

**Solution:**
- Check browser console for WebSocket errors
- Verify `auction-state` event is being received
- Ensure `timeRemaining` is being updated

---

## Quick Test Script

Run this in browser console to test the system:

```javascript
// Test WebSocket connection
const socket = io('http://localhost:5000/auction', {
  withCredentials: true
});

socket.on('connect', () => {
  console.log('✅ Connected!');
  socket.emit('join-auction', 'AUC-TEST-123');
});

socket.on('auction-state', (state) => {
  console.log('📊 Auction State:', state);
});

socket.on('auction-update', (update) => {
  console.log('📢 Update:', update);
});
```

---

## Production Checklist

Before deploying to production:

- [ ] Set up proper error logging (Sentry, LogRocket)
- [ ] Add rate limiting to bid endpoint
- [ ] Configure Redis for auction state (optional)
- [ ] Set up monitoring for WebSocket connections
- [ ] Add email notifications for auction events
- [ ] Implement bid increment rules
- [ ] Add auction analytics dashboard
- [ ] Test with 100+ concurrent users
- [ ] Set up CDN for static assets
- [ ] Configure auto-scaling for WebSocket server

---

## Monitoring Commands

```bash
# Check active auctions
mysql> SELECT * FROM auctions WHERE status = 'active';

# Count bids per auction
mysql> SELECT auction_id, COUNT(*) as bid_count
       FROM auction_bids
       GROUP BY auction_id;

# Premium user bid statistics
mysql> SELECT
         COUNT(*) as total_bids,
         COUNT(CASE WHEN during_last_call = TRUE THEN 1 END) as last_call_bids
       FROM auction_bids
       WHERE user_tier = 'premium';

# Average auction price
mysql> SELECT AVG(final_price) as avg_price
       FROM auctions
       WHERE status = 'closed' AND final_price IS NOT NULL;
```

---

## Next Steps

1. ✅ Test basic bidding
2. ✅ Test soft-close extension
3. ✅ Test Last-Call feature
4. ✅ Verify Premium restrictions
5. ✅ Test multiple concurrent users
6. ⏭️ Add email notifications
7. ⏭️ Implement auto-bid feature
8. ⏭️ Add auction analytics

---

## Support & Documentation

- Full Documentation: [AUCTION_SYSTEM_DOCUMENTATION.md](./AUCTION_SYSTEM_DOCUMENTATION.md)
- Backend Code: `backend/src/services/auctionService.js`
- Frontend Component: `src/components/auction/AuctionBiddingPanel.jsx`
- Database Schema: `backend/migrations/auction_tables.sql`

---

## 🎉 You're All Set!

The auction system is now ready to use. Start creating auctions and let Premium users enjoy their Last-Call advantage!

**Questions?** Check the full documentation or review the code comments.
