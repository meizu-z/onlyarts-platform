# OnlyArts Platform - QA & Testing Guide

## Table of Contents
1. [Testing Environment Setup](#testing-environment-setup)
2. [Manual Testing Checklist](#manual-testing-checklist)
3. [Feature Testing](#feature-testing)
4. [User Flow Testing](#user-flow-testing)
5. [Cross-Browser Testing](#cross-browser-testing)
6. [Responsive Design Testing](#responsive-design-testing)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)
9. [Bug Reporting Template](#bug-reporting-template)
10. [Test Results Tracking](#test-results-tracking)

---

## Testing Environment Setup

### Prerequisites
1. **Backend Server Running**: `cd backend && npm run dev` (Port 5000)
2. **Frontend Server Running**: `npm run dev` (Port 5173)
3. **Database Running**: MySQL on port 3306
4. **Test Accounts Created**:
   - Admin account (role: 'admin')
   - Artist account (role: 'artist')
   - Fan account (role: 'fan')

### Create Test Accounts

Run this SQL to create test accounts:

```sql
-- Admin User
INSERT INTO users (username, email, password, role, is_active)
VALUES ('testadmin', 'admin@test.com', '$2b$10$YourHashedPasswordHere', 'admin', true);

-- Artist User
INSERT INTO users (username, email, password, role, is_active)
VALUES ('testartist', 'artist@test.com', '$2b$10$YourHashedPasswordHere', 'artist', true);

-- Fan User
INSERT INTO users (username, email, password, role, is_active)
VALUES ('testfan', 'fan@test.com', '$2b$10$YourHashedPasswordHere', 'fan', true);
```

---

## Manual Testing Checklist

### Phase 1: Authentication & Authorization (HIGH PRIORITY)

#### 1.1 Registration
- [ ] Navigate to `/register`
- [ ] Test with valid data
  - [ ] Enter username (alphanumeric, 3-20 chars)
  - [ ] Enter valid email
  - [ ] Enter password (min 8 chars)
  - [ ] Select role (fan/artist)
  - [ ] Click "Sign Up"
  - [ ] ✅ **Expected**: Success message, redirect to login
  - [ ] ❌ **Bug**: Record any errors
- [ ] Test with invalid data
  - [ ] Empty fields → Should show validation errors
  - [ ] Weak password → Should show error
  - [ ] Invalid email format → Should show error
  - [ ] Duplicate email → Should show "Email already exists"
  - [ ] Duplicate username → Should show "Username taken"

#### 1.2 Login
- [ ] Navigate to `/login`
- [ ] Test with valid credentials
  - [ ] Enter registered email
  - [ ] Enter correct password
  - [ ] Click "Sign In"
  - [ ] ✅ **Expected**: Success message, redirect to dashboard
  - [ ] ✅ **Expected**: User data stored in localStorage
- [ ] Test with invalid credentials
  - [ ] Wrong password → Should show "Invalid credentials"
  - [ ] Non-existent email → Should show "Invalid credentials"
  - [ ] Empty fields → Should show validation errors

#### 1.3 Protected Routes
- [ ] Try accessing `/dashboard` without login
  - [ ] ✅ **Expected**: Redirect to `/login`
- [ ] Try accessing `/admin` as non-admin
  - [ ] ✅ **Expected**: Redirect or "Access Denied"
- [ ] Try accessing artist features as fan
  - [ ] ✅ **Expected**: Appropriate access control

#### 1.4 Logout
- [ ] Click profile menu → Logout
- [ ] ✅ **Expected**: Redirect to home, localStorage cleared
- [ ] Try accessing protected route after logout
  - [ ] ✅ **Expected**: Redirect to login

---

### Phase 2: User Interface & Theme Testing (HIGH PRIORITY)

#### 2.1 Dark Mode (Default)
- [ ] Check all pages render correctly in dark mode
  - [ ] Home page
  - [ ] Dashboard
  - [ ] Explore page
  - [ ] Admin pages
  - [ ] Profile pages
  - [ ] Cart/Checkout
- [ ] Verify colors:
  - [ ] Background: Dark (#1a1a1a, #121212)
  - [ ] Text: Light beige (#f2e9dd)
  - [ ] Cards: Dark with subtle borders
  - [ ] Buttons: Gradient (purple to pink)

#### 2.2 Light Mode
- [ ] Toggle theme to light mode
- [ ] Check all pages render correctly
  - [ ] Home page
  - [ ] Dashboard
  - [ ] Explore page
  - [ ] Admin pages
  - [ ] Profile pages
  - [ ] Cart/Checkout
- [ ] Verify colors:
  - [ ] Background: Warm beige (#fdf8f3, #f9f4ed)
  - [ ] Text: Dark and readable
  - [ ] Cards: White/light backgrounds
  - [ ] Tables: Warm beige backgrounds
  - [ ] Buttons: Dark text, good contrast
  - [ ] Icons: Visible and properly colored

#### 2.3 Admin Pages Light Mode (CRITICAL)
- [ ] Admin Dashboard
  - [ ] Background: Warm beige
  - [ ] Stat cards: White with colored icons
  - [ ] Quick action buttons: Dark text, good contrast
  - [ ] Icons: Purple, pink, blue, green visible
- [ ] Admin Users
  - [ ] Table header: Warm beige (#f9f4ed)
  - [ ] Table rows: White (#ffffff)
  - [ ] Action buttons: Visible colors
- [ ] Admin Artworks
  - [ ] Delete buttons: Red, visible
  - [ ] Feature/Unfeature buttons: Visible
- [ ] Admin Orders
  - [ ] Status badges: Proper colors
  - [ ] View order buttons: Visible
- [ ] Admin Analytics
  - [ ] Charts: Readable
  - [ ] Stat cards: Good contrast
- [ ] Admin History
  - [ ] Table: Proper colors
  - [ ] Pagination: Visible buttons

#### 2.4 Responsive Design
- [ ] Test on Desktop (1920x1080)
  - [ ] All elements properly sized
  - [ ] No horizontal scroll
  - [ ] Sidebar visible
- [ ] Test on Tablet (768x1024)
  - [ ] Sidebar toggles to hamburger menu
  - [ ] Cards stack properly
  - [ ] Touch targets adequate
- [ ] Test on Mobile (375x667)
  - [ ] Mobile menu works
  - [ ] Text readable (not too small)
  - [ ] Buttons tappable
  - [ ] Images responsive

---

### Phase 3: Feature Testing (CRITICAL)

#### 3.1 Dashboard
- [ ] Login as fan
  - [ ] Dashboard shows personalized feed
  - [ ] Recommendations appear
  - [ ] Trending artworks visible
- [ ] Login as artist
  - [ ] Dashboard shows artist analytics
  - [ ] Recent artworks visible
  - [ ] Upload button available

#### 3.2 Artwork Management (Artist)
- [ ] Navigate to "My Artworks" or Upload section
- [ ] Upload new artwork
  - [ ] Select image file (JPG, PNG)
  - [ ] Enter title
  - [ ] Enter description
  - [ ] Select category
  - [ ] Set price
  - [ ] Click "Upload"
  - [ ] ✅ **Expected**: Success message, artwork appears in list
  - [ ] ✅ **Expected**: Image uploaded to Cloudinary
- [ ] Edit artwork
  - [ ] Click edit on existing artwork
  - [ ] Change title/description/price
  - [ ] Click "Save"
  - [ ] ✅ **Expected**: Changes reflected
- [ ] Delete artwork
  - [ ] Click delete button
  - [ ] Confirm deletion
  - [ ] ✅ **Expected**: Artwork removed

#### 3.3 Explore & Browse
- [ ] Navigate to `/explore`
- [ ] Browse artworks
  - [ ] Artworks load from backend
  - [ ] Images display correctly
  - [ ] Price and artist info visible
- [ ] Filter artworks
  - [ ] By category (painting, digital, etc.)
  - [ ] By price range
  - [ ] By artist
- [ ] Search artworks
  - [ ] Enter search term
  - [ ] Results filter correctly
- [ ] Click artwork
  - [ ] Navigate to artwork detail page
  - [ ] All info displayed
  - [ ] Like button works
  - [ ] Add to cart button works

#### 3.4 Cart & Checkout
- [ ] Add artwork to cart
  - [ ] Click "Add to Cart"
  - [ ] ✅ **Expected**: Cart count increases
  - [ ] ✅ **Expected**: Toast notification appears
- [ ] View cart
  - [ ] Navigate to `/cart`
  - [ ] Items displayed correctly
  - [ ] Prices calculated correctly
  - [ ] Update quantity (if applicable)
  - [ ] Remove item works
- [ ] Proceed to checkout
  - [ ] Click "Proceed to Checkout"
  - [ ] ✅ **Expected**: Navigate to `/checkout`
  - [ ] Shipping address form visible
  - [ ] Payment method selection visible
- [ ] Complete order
  - [ ] Fill in address details
  - [ ] Select payment method
  - [ ] Click "Place Order"
  - [ ] ✅ **Expected**: Order created in database
  - [ ] ✅ **Expected**: Success message
  - [ ] ✅ **Expected**: Cart cleared
  - [ ] ✅ **Expected**: Redirect to order confirmation

#### 3.5 Subscriptions
- [ ] Navigate to `/subscriptions`
- [ ] Plans load from backend
  - [ ] Free plan visible
  - [ ] Plus plan visible (marked "Popular")
  - [ ] Premium plan visible
  - [ ] Prices in ₱ (Philippine Peso)
- [ ] Select plan
  - [ ] Click "Select Plan" on Plus or Premium
  - [ ] Payment modal opens
  - [ ] Plan details displayed
  - [ ] Payment method options visible
- [ ] Upgrade subscription
  - [ ] Fill in payment details (test mode)
  - [ ] Click "Start 7-Day Free Trial"
  - [ ] ✅ **Expected**: Subscription updated
  - [ ] ✅ **Expected**: User subscription tier changes
  - [ ] ✅ **Expected**: Success message
- [ ] Downgrade to free
  - [ ] Click "Select Plan" on Free
  - [ ] ✅ **Expected**: Immediate downgrade
  - [ ] ✅ **Expected**: No payment required

#### 3.6 Commission Requests
- [ ] Navigate to artist profile
- [ ] Click "Request Commission"
- [ ] Fill commission form
  - [ ] Select artwork type
  - [ ] Select delivery format
  - [ ] Select size
  - [ ] Enter budget (min/max)
  - [ ] Enter description
  - [ ] Upload reference images (optional)
  - [ ] Set deadline (optional)
- [ ] Submit commission
  - [ ] Click "Submit Request"
  - [ ] ✅ **Expected**: Commission created in database
  - [ ] ✅ **Expected**: Reference images uploaded to Cloudinary
  - [ ] ✅ **Expected**: Success message
  - [ ] ✅ **Expected**: Navigate back to artist profile
- [ ] View commission (as artist)
  - [ ] Navigate to commissions section
  - [ ] See pending commission requests
  - [ ] Accept/Decline options available

#### 3.7 Exhibitions
- [ ] Navigate to `/exhibitions`
- [ ] Browse exhibitions
  - [ ] Exhibitions load from backend
  - [ ] Upcoming, live, past tabs work
  - [ ] Exhibition cards display correctly
- [ ] View exhibition details
  - [ ] Click on exhibition
  - [ ] Exhibition info displayed
  - [ ] Featured artworks visible
  - [ ] Follow/Unfollow button works
- [ ] Create exhibition (as artist)
  - [ ] Navigate to create exhibition
  - [ ] Fill in exhibition details
  - [ ] Select artworks to feature
  - [ ] Set start/end date
  - [ ] Submit
  - [ ] ✅ **Expected**: Exhibition created

#### 3.8 Livestreams
- [ ] Navigate to `/livestreams`
- [ ] View live streams
  - [ ] Live streams load from backend
  - [ ] Stream status displayed (live/upcoming)
  - [ ] Join button visible for live streams
- [ ] Join livestream
  - [ ] Click "Join Stream"
  - [ ] Stream viewer opens
  - [ ] Chat visible
  - [ ] Bidding interface visible (if auction)
- [ ] Start livestream (as artist)
  - [ ] Navigate to start stream
  - [ ] Enter stream details
  - [ ] Start streaming
  - [ ] ✅ **Expected**: Stream goes live

#### 3.9 Notifications
- [ ] Check notification bell icon
  - [ ] Unread count badge visible
  - [ ] Click bell icon
  - [ ] Dropdown opens
  - [ ] Recent notifications displayed
- [ ] Notification types
  - [ ] Like notification (heart icon)
  - [ ] Comment notification (message icon)
  - [ ] Follow notification (user icon)
  - [ ] Order notification (shopping bag icon)
  - [ ] Commission notification (briefcase icon)
- [ ] Mark as read
  - [ ] Click notification
  - [ ] ✅ **Expected**: Navigate to related content
  - [ ] ✅ **Expected**: Notification marked as read
  - [ ] ✅ **Expected**: Unread count decreases
- [ ] Mark all as read
  - [ ] Click "Mark all as read"
  - [ ] ✅ **Expected**: All notifications marked read
  - [ ] ✅ **Expected**: Badge disappears

#### 3.10 Chat/Messaging
- [ ] Click chat icon in navbar
- [ ] Conversation list displays
  - [ ] Recent conversations visible
  - [ ] User avatars displayed
  - [ ] Last message preview visible
  - [ ] Unread count badges visible
- [ ] Start new conversation
  - [ ] Search for user
  - [ ] Send first message
  - [ ] ✅ **Expected**: Conversation created
- [ ] Send message
  - [ ] Type message
  - [ ] Click send
  - [ ] ✅ **Expected**: Message appears instantly
  - [ ] ✅ **Expected**: Other user receives in real-time
- [ ] Real-time updates
  - [ ] Open conversation in two browsers
  - [ ] Send message from one
  - [ ] ✅ **Expected**: Appears in other without refresh

---

### Phase 4: Admin Panel Testing (CRITICAL)

#### 4.1 Admin Dashboard
- [ ] Login as admin user
- [ ] Navigate to `/admin`
- [ ] Verify dashboard loads
  - [ ] Total Users stat card
  - [ ] Total Artworks stat card
  - [ ] Total Orders stat card
  - [ ] Total Revenue stat card
  - [ ] All numbers accurate
- [ ] Quick Actions
  - [ ] "Manage Users" → Navigate to users page
  - [ ] "Manage Artworks" → Navigate to artworks page
  - [ ] "View Orders" → Navigate to orders page
  - [ ] "View Analytics" → Navigate to analytics page

#### 4.2 Admin Users Management
- [ ] Navigate to `/admin/users`
- [ ] User list displays
  - [ ] All users from database
  - [ ] Username, email, role visible
  - [ ] Status (active/inactive) visible
  - [ ] Subscription tier visible
- [ ] Search users
  - [ ] Enter search term
  - [ ] Results filter correctly
- [ ] Filter by role
  - [ ] Filter by "admin"
  - [ ] Filter by "artist"
  - [ ] Filter by "fan"
- [ ] Edit user
  - [ ] Click edit button
  - [ ] Modal opens
  - [ ] Change role
  - [ ] Change subscription
  - [ ] Toggle active status
  - [ ] Click "Save"
  - [ ] ✅ **Expected**: User updated in database
- [ ] Delete user
  - [ ] Click delete button
  - [ ] Confirm deletion
  - [ ] ✅ **Expected**: User removed (or soft deleted)

#### 4.3 Admin Artworks Management
- [ ] Navigate to `/admin/artworks`
- [ ] Artwork list displays
  - [ ] All artworks from database
  - [ ] Thumbnail images visible
  - [ ] Title, artist, price visible
  - [ ] Status visible
- [ ] Feature/Unfeature artwork
  - [ ] Click "Feature" button
  - [ ] ✅ **Expected**: Artwork marked as featured
  - [ ] Appears in featured section
  - [ ] Click "Unfeature"
  - [ ] ✅ **Expected**: Removed from featured
- [ ] Delete artwork
  - [ ] Click delete button
  - [ ] Confirm deletion
  - [ ] ✅ **Expected**: Artwork removed

#### 4.4 Admin Orders Management
- [ ] Navigate to `/admin/orders`
- [ ] Order list displays
  - [ ] All orders from database
  - [ ] Order ID, customer, total visible
  - [ ] Status visible (pending/processing/completed/cancelled)
  - [ ] Date visible
- [ ] View order details
  - [ ] Click "View" button
  - [ ] Modal opens
  - [ ] All order items listed
  - [ ] Customer details visible
  - [ ] Shipping address visible
- [ ] Update order status
  - [ ] Change status dropdown
  - [ ] Select new status
  - [ ] Click "Update"
  - [ ] ✅ **Expected**: Status updated in database
  - [ ] ✅ **Expected**: Customer notified (if implemented)

#### 4.5 Admin Analytics
- [ ] Navigate to `/admin/analytics`
- [ ] Overview stats display
  - [ ] Revenue metrics
  - [ ] User growth metrics
  - [ ] Popular artworks
  - [ ] Top artists
- [ ] Charts render correctly
  - [ ] Revenue chart
  - [ ] User growth chart
  - [ ] Sales by category chart
- [ ] Date range filter
  - [ ] Select custom date range
  - [ ] Data updates accordingly

#### 4.6 Admin Activity History
- [ ] Navigate to `/admin/history`
- [ ] Activity log displays
  - [ ] Recent activities listed
  - [ ] User actions logged
  - [ ] Timestamps visible
  - [ ] Action types visible (create, update, delete)
- [ ] Filter by action type
  - [ ] Filter by "User Created"
  - [ ] Filter by "Artwork Uploaded"
  - [ ] Filter by "Order Placed"
- [ ] Pagination works
  - [ ] Click "Next"
  - [ ] Click "Previous"
  - [ ] Page numbers work

---

### Phase 5: Integration & Data Flow Testing

#### 5.1 Frontend-Backend Communication
- [ ] Check Network tab in browser DevTools
- [ ] Verify API calls
  - [ ] Correct endpoints called
  - [ ] Proper HTTP methods (GET, POST, PUT, DELETE)
  - [ ] Authorization headers included
  - [ ] Request payloads correct
- [ ] Verify responses
  - [ ] Status codes correct (200, 201, 400, 401, 404, 500)
  - [ ] Response data structure matches expected
  - [ ] Error messages meaningful

#### 5.2 Database Persistence
- [ ] Create new artwork
  - [ ] Check database: `SELECT * FROM artworks ORDER BY id DESC LIMIT 1;`
  - [ ] ✅ **Expected**: New row exists
- [ ] Update user profile
  - [ ] Check database: `SELECT * FROM users WHERE id = ?;`
  - [ ] ✅ **Expected**: Changes persisted
- [ ] Place order
  - [ ] Check database: `SELECT * FROM orders WHERE user_id = ?;`
  - [ ] ✅ **Expected**: Order row created
  - [ ] Check order_items table
  - [ ] ✅ **Expected**: Order items created

#### 5.3 Image Uploads (Cloudinary)
- [ ] Upload artwork image
  - [ ] Check network request
  - [ ] ✅ **Expected**: File sent to backend
  - [ ] Check database: Image URL saved
  - [ ] ✅ **Expected**: URL format: `https://res.cloudinary.com/...`
  - [ ] Open URL in browser
  - [ ] ✅ **Expected**: Image displays
- [ ] Upload profile avatar
  - [ ] Follow same checks as artwork
- [ ] Upload commission reference images
  - [ ] Multiple files uploaded
  - [ ] All URLs saved to database

#### 5.4 Real-time Features (WebSocket)
- [ ] Check WebSocket connection
  - [ ] Open browser DevTools → Network → WS
  - [ ] ✅ **Expected**: WebSocket connection established
  - [ ] URL: `ws://localhost:5000` or `wss://`
- [ ] Test real-time chat
  - [ ] Send message
  - [ ] ✅ **Expected**: Instant delivery via WebSocket
  - [ ] No page refresh needed
- [ ] Test real-time notifications
  - [ ] Trigger notification (like, comment, follow)
  - [ ] ✅ **Expected**: Bell icon updates instantly
  - [ ] ✅ **Expected**: Count badge updates
- [ ] Test livestream real-time features
  - [ ] Join stream
  - [ ] Send chat message
  - [ ] Place bid
  - [ ] ✅ **Expected**: All updates in real-time

---

### Phase 6: Error Handling & Edge Cases

#### 6.1 Network Errors
- [ ] Disconnect internet
- [ ] Try to load page
  - [ ] ✅ **Expected**: Error message displayed
  - [ ] ✅ **Expected**: Friendly error UI (not blank page)
- [ ] Try to submit form
  - [ ] ✅ **Expected**: Error message
  - [ ] ✅ **Expected**: Form data not lost

#### 6.2 Invalid Data
- [ ] Submit form with missing required fields
  - [ ] ✅ **Expected**: Validation errors displayed
  - [ ] ✅ **Expected**: Fields highlighted
- [ ] Submit form with invalid format
  - [ ] Invalid email
  - [ ] Negative price
  - [ ] Date in past (if not allowed)
  - [ ] ✅ **Expected**: Specific error messages

#### 6.3 Unauthorized Access
- [ ] Logout
- [ ] Try to access `/api/artworks` directly
  - [ ] ✅ **Expected**: 401 Unauthorized
- [ ] Try to access admin endpoint as fan
  - [ ] ✅ **Expected**: 403 Forbidden
- [ ] Try to edit another user's artwork
  - [ ] ✅ **Expected**: 403 Forbidden

#### 6.4 Large File Uploads
- [ ] Upload very large image (>10MB)
  - [ ] ✅ **Expected**: Error message about file size
  - [ ] ✅ **Expected**: Upload rejected
- [ ] Upload invalid file type (.exe, .txt)
  - [ ] ✅ **Expected**: Error message about file type

#### 6.5 Concurrent Actions
- [ ] Open same artwork in two tabs
- [ ] Like in one tab
- [ ] ✅ **Expected**: Like count updates in both tabs
- [ ] Add to cart in both tabs
- [ ] ✅ **Expected**: Cart count accurate

---

### Phase 7: Performance Testing

#### 7.1 Page Load Times
- [ ] Open browser DevTools → Network tab
- [ ] Measure page load times
  - [ ] Home page: Target < 2 seconds
  - [ ] Dashboard: Target < 3 seconds
  - [ ] Explore page: Target < 3 seconds
  - [ ] Admin pages: Target < 3 seconds
- [ ] Check total page size
  - [ ] Target < 2MB per page
  - [ ] Check for oversized images

#### 7.2 API Response Times
- [ ] Check Network tab for API calls
- [ ] Measure response times
  - [ ] Simple GET requests: Target < 500ms
  - [ ] Complex queries: Target < 1 second
  - [ ] File uploads: Depends on file size
- [ ] Identify slow endpoints
  - [ ] Check backend logs for slow queries

#### 7.3 Database Performance
- [ ] Run queries directly in MySQL
- [ ] Check for slow queries
  - [ ] `SHOW PROCESSLIST;`
  - [ ] Look for queries taking > 1 second
- [ ] Verify indexes exist
  - [ ] `SHOW INDEX FROM artworks;`
  - [ ] Key columns should be indexed

#### 7.4 Memory Leaks
- [ ] Open DevTools → Memory tab
- [ ] Take heap snapshot
- [ ] Navigate through pages
- [ ] Take another snapshot
- [ ] Compare
  - [ ] ✅ **Expected**: Memory doesn't grow excessively
  - [ ] ❌ **Issue**: Memory keeps growing → Memory leak

---

### Phase 8: Security Testing

#### 8.1 Authentication Security
- [ ] Check password storage
  - [ ] Query database: `SELECT password FROM users LIMIT 1;`
  - [ ] ✅ **Expected**: Hashed password (bcrypt)
  - [ ] ❌ **CRITICAL**: Plain text password
- [ ] Check JWT tokens
  - [ ] Copy token from localStorage
  - [ ] Paste into jwt.io
  - [ ] ✅ **Expected**: Contains user ID, role, expiry
  - [ ] ✅ **Expected**: Expiry set (not permanent)
- [ ] Test token expiry
  - [ ] Wait for token to expire
  - [ ] Try to access protected route
  - [ ] ✅ **Expected**: Redirect to login

#### 8.2 Input Validation
- [ ] Test SQL Injection
  - [ ] Enter in search: `' OR '1'='1`
  - [ ] ✅ **Expected**: Treated as literal string
  - [ ] ❌ **CRITICAL**: Query executed
- [ ] Test XSS
  - [ ] Enter in comment: `<script>alert('XSS')</script>`
  - [ ] ✅ **Expected**: Displayed as text, not executed
  - [ ] ❌ **CRITICAL**: Script executes

#### 8.3 File Upload Security
- [ ] Try uploading PHP/JS file
  - [ ] ✅ **Expected**: Rejected
- [ ] Try uploading file with malicious name
  - [ ] Example: `../../etc/passwd`
  - [ ] ✅ **Expected**: Sanitized filename

#### 8.4 CORS & API Security
- [ ] Check Network tab → Headers
- [ ] Verify CORS headers
  - [ ] `Access-Control-Allow-Origin`: Should be specific, not `*`
- [ ] Verify security headers
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `Strict-Transport-Security` (HTTPS only)

---

## Bug Reporting Template

When you find a bug, document it like this:

```markdown
### Bug #001: [Short Description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**:
What should happen

**Actual Behavior**:
What actually happens

**Environment**:
- Browser: Chrome 120
- OS: Windows 11
- Screen size: 1920x1080
- User role: Artist

**Screenshots**:
[Attach screenshot if applicable]

**Console Errors**:
```
[Copy any console errors here]
```

**Network Errors**:
- Request: POST /api/artworks
- Status: 500
- Response: { error: "..." }

**Additional Notes**:
Any other relevant information
```

---

## Test Results Tracking

Create a spreadsheet or document to track test results:

| Test ID | Feature | Test Case | Status | Severity | Notes |
|---------|---------|-----------|--------|----------|-------|
| T001 | Auth | Login with valid credentials | ✅ Pass | - | - |
| T002 | Auth | Login with invalid credentials | ✅ Pass | - | - |
| T003 | Cart | Add artwork to cart | ❌ Fail | High | Cart count not updating |
| T004 | Admin | Delete user | ⚠️ Warning | Low | No confirmation dialog |
| T005 | Upload | Upload large image | ✅ Pass | - | - |

**Status Codes**:
- ✅ Pass: Working as expected
- ❌ Fail: Not working, bug found
- ⚠️ Warning: Works but has issues
- ⏭️ Skipped: Not tested yet
- 🚫 Blocked: Cannot test due to other issues

---

## Quick Start Testing Checklist

For a fast initial QA pass, focus on these critical items:

### Critical Path (Must Pass)
1. [ ] User can register
2. [ ] User can login
3. [ ] User can browse artworks
4. [ ] User can add to cart
5. [ ] User can checkout
6. [ ] Artist can upload artwork
7. [ ] Admin can access admin panel
8. [ ] Admin can manage users
9. [ ] Light mode works on all pages
10. [ ] Dark mode works on all pages

### High Priority
11. [ ] Subscriptions work
12. [ ] Commission requests work
13. [ ] Notifications work
14. [ ] Real-time chat works
15. [ ] Image uploads work
16. [ ] Search works
17. [ ] Filters work
18. [ ] Responsive on mobile
19. [ ] No console errors
20. [ ] No broken images

---

## Next Steps After Testing

1. **Document all bugs** using the bug report template
2. **Prioritize bugs** by severity (Critical → High → Medium → Low)
3. **Fix critical bugs first** - these block basic functionality
4. **Re-test after fixes** - verify bugs are resolved
5. **Regression test** - ensure fixes didn't break other features
6. **Sign off** - once all critical and high bugs are fixed

---

## Need Help?

If you encounter issues during testing:
1. Check browser console for errors (F12 → Console)
2. Check Network tab for failed API calls (F12 → Network)
3. Check backend logs: `pm2 logs onlyarts-backend`
4. Check database: Run SQL queries to verify data
5. Document the issue with screenshots and steps to reproduce

---

**Happy Testing! 🧪✨**
