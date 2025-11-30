# Auction Priority Bidding System - Documentation

## Overview

This system implements a live auction bidding platform with **Premium Last-Call Advantage**, where Premium subscribers get an exclusive 10-second window to place final bids after an auction officially ends.

---

## 🎯 Key Features

### 1. **Soft Closing Mechanism**
- If a bid is placed in the last 5 minutes, the auction extends by another 5 minutes
- Prevents "sniping" and ensures fair bidding opportunity

### 2. **Premium Last-Call Advantage**
- When timer reaches 0:00, a 10-second "Last Call" period begins
- **Only Premium users can bid during this window**
- Non-Premium users see disabled bid button
- Creates premium membership value proposition

### 3. **Real-Time Updates**
- WebSocket-powered live bidding
- Instant price updates
- Time extension notifications
- Winner announcements

### 4. **Visual Feedback**
- Pulsing red/pink background during Last Call
- Countdown timer shows remaining seconds
- Premium badge indicator
- Animated alerts and transitions

---

## 📦 Backend Architecture

### Files Created:

#### 1. `backend/src/services/auctionService.js`
**Purpose**: Core auction logic and state management

**Key Functions**:
- `initializeAuction()` - Creates new auction
- `processBid()` - Validates and processes bids
- `startLastCall()` - Initiates 10-second Premium window
- `closeAuction()` - Finalizes auction and declares winner

**Logic Flow**:
```
1. User places bid
2. Check if auction is in Last Call → Reject if not Premium
3. Check soft-close window (5 min) → Extend if needed
4. Process bid and update state
5. Emit WebSocket update to all connected clients
6. If in Last Call, close auction immediately
```

#### 2. `backend/src/controllers/auctionController.js`
**Purpose**: HTTP endpoints for auction operations

**Endpoints**:
- `POST /api/auctions` - Create auction
- `GET /api/auctions` - List active auctions
- `GET /api/auctions/:id` - Get auction details
- `POST /api/auctions/:id/bid` - Place bid
- `GET /api/auctions/:id/bids` - Get bid history

#### 3. `backend/src/routes/auctionRoutes.js`
**Purpose**: Route definitions with validation

**Validation Rules**:
- Bid amount must be positive number
- Starting price must be >= 0
- Duration minimum 1 minute
- User must be authenticated

#### 4. `backend/src/sockets/auctionSocket.js`
**Purpose**: WebSocket connection management

**Events**:
- `join-auction` - User joins auction room
- `leave-auction` - User leaves auction room
- `auction-update` - Broadcast auction changes
- `auction-state` - Send current state
- `auction-error` - Error notifications

---

## 🎨 Frontend Architecture

### File Created:

#### `src/components/auction/AuctionBiddingPanel.jsx`
**Purpose**: Complete bidding interface with real-time updates

**Key Features**:

1. **WebSocket Integration**
   - Connects to `/auction` namespace
   - Auto-reconnection on disconnect
   - Room-based updates

2. **Timer Management**
   - Dual timers (main + Last Call)
   - Real-time countdown
   - Visual state changes

3. **User Experience**
   - Disabled state for non-Premium during Last Call
   - Pulsing animations for urgency
   - Premium upgrade CTA
   - Bid history display

4. **State Management**
   ```javascript
   - auctionState: Current auction data
   - bidAmount: User's bid input
   - timeRemaining: Main countdown
   - lastCallTimeRemaining: Last Call countdown
   - isConnected: WebSocket status
   ```

5. **Visual States**:
   - **Normal**: Purple gradient, standard buttons
   - **Last Call (Premium)**: Red/pink pulse, "LAST CALL" button
   - **Last Call (Non-Premium)**: Disabled button, upgrade prompt
   - **Ended**: Summary display with winner

---

## 💾 Database Schema

### Required Tables:

```sql
-- Auctions table
CREATE TABLE auctions (
  id VARCHAR(255) PRIMARY KEY,
  artwork_id INT,
  starting_price DECIMAL(10, 2) NOT NULL,
  current_price DECIMAL(10, 2) NOT NULL,
  highest_bidder_id INT,
  end_time DATETIME NOT NULL,
  status ENUM('active', 'closed') DEFAULT 'active',
  winner_id INT,
  final_price DECIMAL(10, 2),
  closed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY (highest_bidder_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_end_time (end_time)
);

-- Auction bids table
CREATE TABLE auction_bids (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auction_id VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  bid_amount DECIMAL(10, 2) NOT NULL,
  user_tier VARCHAR(50) DEFAULT 'free',
  placed_at DATETIME NOT NULL,
  during_last_call BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_auction (auction_id),
  INDEX idx_user (user_id),
  INDEX idx_placed_at (placed_at)
);
```

---

## 🚀 Usage Example

### Backend: Create Auction

```javascript
// POST /api/auctions
{
  "artworkId": 123,
  "startingPrice": 5000,
  "duration": 900000  // 15 minutes
}
```

### Frontend: Use Component

```jsx
import AuctionBiddingPanel from './components/auction/AuctionBiddingPanel';

function AuctionPage() {
  return (
    <div>
      <AuctionBiddingPanel
        auctionId="AUC-1234567890-abc123"
        artwork={artworkData}
      />
    </div>
  );
}
```

---

## ⚙️ Configuration

### Environment Variables

```env
# No additional env vars needed
# Uses existing:
- PORT=5000
- FRONTEND_URL=http://localhost:5173
- Database credentials
```

### Dependencies

**Backend**:
- `socket.io` - Already installed
- `express` - Already installed
- `mysql2` - Already installed

**Frontend**:
- `socket.io-client` - **INSTALL REQUIRED**
  ```bash
  npm install socket.io-client
  ```
- `lucide-react` - Already installed
- `axios` - Already installed

---

## 🔒 Security Considerations

1. **Authentication**: All bid endpoints require valid JWT token
2. **Authorization**: User tier verified on server-side (never trust client)
3. **Rate Limiting**: Consider adding rate limits to prevent spam bidding
4. **Validation**: All inputs validated on backend
5. **SQL Injection**: Parameterized queries used throughout

---

## 📊 User Tier Logic

```javascript
// Subscription Tiers (from subscription system)
- free: No Last Call access
- basic: No Last Call access
- premium: ✅ Last Call access (10 seconds)

// Validation in processBid():
if (auction.isLastCallActive && userTier !== 'premium') {
  throw new Error('Only Premium users can bid during Last Call');
}
```

---

## 🎯 Premium Value Proposition

**For Free/Basic Users**:
- See "Premium Last-Call Advantage" banner
- Witness Premium users winning in final seconds
- Clear upgrade CTA with benefits

**For Premium Users**:
- Exclusive 10-second bidding window
- Yellow crown badge
- Special "LAST CALL" button styling
- Competitive advantage in auctions

---

## 📈 Metrics & Analytics

Track these for business insights:
1. Number of Last Call bids (Premium feature usage)
2. Conversion rate (Free → Premium after losing auctions)
3. Average bid count per auction
4. Time extension frequency
5. Premium vs Non-Premium winning ratio

---

## 🐛 Troubleshooting

### WebSocket Not Connecting
```javascript
// Check CORS settings in server.js
// Verify frontend URL matches allowed origins
// Check firewall/network settings
```

### Bids Not Processing
```javascript
// Verify user authentication
// Check subscription_tier field in users table
// Review browser console for errors
// Check backend logs for rejection reasons
```

### Timer Desynchronization
```javascript
// WebSocket updates override local countdown
// Server is source of truth
// Local timer is visual only
```

---

## 🔄 Future Enhancements

1. **Auto-Bid System**: Set maximum bid, system bids automatically
2. **Bid Increments**: Enforce minimum bid increases (e.g., ₱100)
3. **Email Notifications**: Alert users when outbid
4. **Auction History**: View past auctions and prices
5. **Watch List**: Save auctions for later
6. **Mobile Push Notifications**: Alert mobile users during Last Call

---

## 📝 Testing Checklist

- [ ] Create auction as artist
- [ ] Place bid as Free user (normal time)
- [ ] Place bid as Premium user (normal time)
- [ ] Wait for Last Call period
- [ ] Verify Free users blocked during Last Call
- [ ] Verify Premium users can bid during Last Call
- [ ] Test soft-close extension (bid in last 5 min)
- [ ] Verify winner notification
- [ ] Check bid history display
- [ ] Test multiple concurrent bidders
- [ ] Test WebSocket reconnection
- [ ] Verify database records

---

## 📞 Support

For questions or issues:
1. Check browser console for errors
2. Review backend logs
3. Verify database tables exist
4. Confirm WebSocket connection
5. Test with different user tiers

---

## 📄 License

Part of OnlyArts Platform - All Rights Reserved
