# Quick Start - Testing OnlyArts Platform

This is your step-by-step guide to start testing the OnlyArts platform **RIGHT NOW**.

---

## ✅ Current Status

Based on your terminal output:
- ✅ Frontend: Running on http://localhost:5173
- ✅ Backend: Should be running on http://localhost:5000
- ✅ Database: MySQL should be running

---

## 🚀 Step 1: Create Test Accounts

First, we need to create test user accounts in the database.

### Option A: Using MySQL Workbench or Command Line

Open MySQL and run these commands:

```sql
-- Make sure you're using the onlyarts database
USE onlyarts;

-- Check if users table exists
DESCRIBE users;

-- Create test admin account
INSERT INTO users (username, email, password, role, is_active, subscription, created_at)
VALUES (
  'testadmin',
  'admin@test.com',
  '$2b$10$YourHashedPasswordHere',  -- We'll register this through the UI instead
  'admin',
  true,
  'free',
  NOW()
);

-- Note: It's easier to just register through the website!
```

### Option B: Register Through the Website (RECOMMENDED)

1. Open your browser and go to: **http://localhost:5173**
2. Click "Sign Up" or navigate to `/register`
3. Create these FOUR accounts to test subscription tiers:

**Account 1 - Admin (Free Tier)**
- Username: `testadmin`
- Email: `admin@test.com`
- Password: `Admin123!`
- Role: Choose "Fan" or "Artist" (we'll change to admin in database)
- Subscription: Free (default)

**Account 2 - Free Tier User**
- Username: `userfree`
- Email: `free@test.com`
- Password: `Free123!`
- Role: Choose "Artist" (to test artwork upload limits)
- Subscription: Free (default)

**Account 3 - Plus Tier User**
- Username: `userplus`
- Email: `plus@test.com`
- Password: `Plus123!`
- Role: Choose "Artist"
- Subscription: Plus (upgrade after registration)

**Account 4 - Premium Tier User**
- Username: `userpremium`
- Email: `premium@test.com`
- Password: `Premium123!`
- Role: Choose "Artist"
- Subscription: Premium (upgrade after registration)

### Option C: Configure Test Accounts in Database

After registering all 4 accounts, run these commands in MySQL:

```sql
USE onlyarts;

-- Make testadmin an actual admin
UPDATE users
SET role = 'admin'
WHERE username = 'testadmin';

-- Set subscription tiers for testing (or you can upgrade through the UI)
UPDATE users
SET subscription = 'free'
WHERE username = 'userfree';

UPDATE users
SET subscription = 'plus'
WHERE username = 'userplus';

UPDATE users
SET subscription = 'premium'
WHERE username = 'userpremium';

-- Verify all accounts
SELECT id, username, email, role, subscription, is_active
FROM users
WHERE username IN ('testadmin', 'userfree', 'userplus', 'userpremium')
ORDER BY
  CASE subscription
    WHEN 'free' THEN 1
    WHEN 'plus' THEN 2
    WHEN 'premium' THEN 3
  END;
```

**Why 4 accounts with subscription tiers?**
- Test Free tier limits (10 artworks max)
- Test Plus tier features (50 artworks, commission requests)
- Test Premium tier features (unlimited artworks, livestreaming)
- Test subscription upgrade/downgrade flows
- Test tier-specific UI elements and permissions

---

## 🎯 Step 2: Start Testing - Critical Path (15 minutes)

Now let's test the most critical features first. Open your browser to **http://localhost:5173**

### Test 1: Login as Free User (2 minutes)

1. Go to **http://localhost:5173/login**
2. Enter:
   - Email: `free@test.com`
   - Password: `Free123!`
3. Click "Sign In"

**✅ Expected Result:**
- Success message appears
- You're redirected to `/dashboard`
- You can see your username in the navbar
- Subscription badge shows "FREE" (if visible)
- No console errors (press F12 → Console tab)

**❌ If it fails:**
- Check browser console for errors
- Check backend is running
- Check MySQL is running
- Check credentials are correct

---

### Test 2: Browse Artworks (3 minutes)

1. Click "Explore" in the navbar (or go to `/explore`)
2. Check if artworks are loading

**✅ Expected Result:**
- Artworks display (or empty state if no artworks)
- Search bar visible
- Filter options visible
- No console errors

**🔍 If no artworks exist yet:** That's okay! We'll create some in the next test.

---

### Test 3: Upload Artwork as Free User (5 minutes)

1. While logged in as `free@test.com` (Free tier artist)
2. Find the "Upload" or "Create Artwork" button in the dashboard/navbar
3. Fill in the form:
   - **Title:** "Test Artwork 1 - Free Tier"
   - **Description:** "This is a test artwork from a free tier user"
   - **Category:** Select any category (e.g., "Digital Art")
   - **Price:** 500
   - **Image:** Upload any JPG/PNG file from your computer
4. Click "Upload" or "Create"

**✅ Expected Result:**
- Success message appears
- Artwork appears in your artworks list
- Image is uploaded to Cloudinary (check the URL starts with cloudinary.com)
- Artwork has a unique ID
- Artwork count shows (1/10 for free tier limit)

**❌ If upload fails:**
- Check if Cloudinary credentials are configured in backend `.env`
- Check console for errors (F12 → Console)
- Check backend logs in terminal

---

### Test 4: Upload Limit Test (3 minutes)

**Test Free Tier Limit (10 artworks max)**

1. Still logged in as `free@test.com`
2. Try uploading 2-3 more artworks quickly (use different titles)
3. Check artwork counter

**✅ Expected Result:**
- Free tier should allow up to 10 artworks total
- Counter shows current count (e.g., "3/10")
- If you reach 10, further uploads should be blocked with a message about upgrading

---

### Test 5: Login as Plus User & Test Features (3 minutes)

1. Logout
2. Login with:
   - Email: `plus@test.com`
   - Password: `Plus123!`
3. Check subscription badge shows "PLUS"
4. Upload an artwork

**✅ Expected Result:**
- Plus badge/indicator visible
- Can upload artwork (up to 50 artworks limit)
- Counter shows "X/50"
- Access to commission features

---

### Test 6: View Artwork Details (2 minutes)

1. Go to "Explore" page
2. Find any artwork you uploaded
3. Click on it to view details

**✅ Expected Result:**
- Artwork details page opens
- Image displays correctly
- Price shows correctly (₱500)
- Artist name shows
- "Add to Cart" button visible
- Like button visible

---

### Test 7: Add to Cart & Checkout (3 minutes)

1. Still viewing artwork details, click "Add to Cart"
2. Check cart icon in navbar - count should increase to "1"
3. Click cart icon to view cart
4. Verify artwork is in cart with correct price
5. Click "Proceed to Checkout"
6. Fill in shipping address (use any test data):
   - Full Name: Test User
   - Address: 123 Test Street
   - City: Test City
   - Postal Code: 12345
7. Select payment method (any option)
8. Click "Place Order"

**✅ Expected Result:**
- Success message appears
- Order created in database
- Cart is cleared (cart icon shows 0)
- Redirected to order confirmation page
- Order details displayed

**🔍 To verify in database:**
```sql
USE onlyarts;
SELECT * FROM orders ORDER BY id DESC LIMIT 1;
SELECT * FROM order_items WHERE order_id = [the order ID from above];
```

---

### Test 8: Test Subscription Upgrade (5 minutes)

1. Login as `userfree` (if not already logged in)
2. Navigate to `/subscriptions` page
3. View all three plans (Free, Plus, Premium)
4. Click "Select Plan" on Plus tier

**✅ Expected Result:**
- Payment modal opens
- Plan details shown (₱4.99/month for Plus)
- Payment method options visible (Card, PayPal, Crypto)
- Can fill payment details
- Click "Start 7-Day Free Trial"
- Subscription updated to "Plus"
- Badge/indicator updates throughout the site

5. Check features unlocked:
   - Artwork upload limit now 50 instead of 10
   - Commission request button available on artist profiles
   - "Plus" badge visible on profile

**🔍 To verify in database:**
```sql
USE onlyarts;
SELECT username, subscription, subscription_start_date
FROM users
WHERE username = 'userfree';
-- Should now show 'plus'
```

---

### Test 9: Test Premium Features (3 minutes)

1. Logout and login as `userpremium`
2. Check premium-specific features:
   - Unlimited artwork uploads (no counter or very high limit)
   - Livestream capability available
   - Premium badge visible
   - Priority placement in explore page

**✅ Expected Result:**
- Premium badge/indicator throughout the site
- Access to livestream creation
- Unlimited upload capability

---

### Test 10: Admin Panel (2 minutes)

1. Logout
2. Login as admin (`admin@test.com` / `Admin123!`)
3. Navigate to `/admin` or click "Admin" in the sidebar

**✅ Expected Result:**
- Admin dashboard loads
- Stat cards show accurate numbers:
  - Total Users: 4 (testadmin, userfree, userplus, userpremium)
  - Total Artworks: (however many you uploaded)
  - Total Orders: (however many you placed)
  - Total Revenue: (sum of all orders)
- Quick action buttons visible and working

4. Test Admin Users page:
   - Click "Manage Users"
   - See all 4 users
   - Filter by subscription: "plus,premium"
   - Should see only userplus and userpremium

---

### Test 11: Theme Testing (2 minutes)

1. Click the theme toggle button (sun/moon icon in navbar)
2. Switch to Light Mode

**✅ Expected Result in Light Mode:**
- Background: Warm beige (#fdf8f3)
- Text: Dark and readable
- Buttons: Good contrast
- Icons: Visible

3. Go to Admin Dashboard in light mode

**✅ Expected Result:**
- Admin page background: Warm beige
- Tables: Proper warm beige colors
- Stat cards: White with colored icons
- All buttons visible and readable

4. Switch back to Dark Mode

**✅ Expected Result:**
- Background: Dark (#1a1a1a)
- Text: Light beige (#f2e9dd)
- Stat cards: Dark with gradient icons

---

## 📋 Quick Checklist

After the above tests, mark what passed:

### Authentication
- [ ] Registration works (4 accounts created)
- [ ] Login works (all 4 accounts)
- [ ] Logout works

### Artwork Features
- [ ] Browse artworks works
- [ ] Upload artwork works (Free tier user)
- [ ] Upload limit enforced (10 for free tier)
- [ ] View artwork details works
- [ ] Images load from Cloudinary

### E-Commerce
- [ ] Add to cart works
- [ ] Cart displays correctly
- [ ] Checkout works
- [ ] Order created in database
- [ ] Cart clears after order

### Subscription System
- [ ] View subscription plans
- [ ] Upgrade Free → Plus works
- [ ] Upgrade Free → Premium works
- [ ] Subscription updated in database
- [ ] Feature limits change based on tier
- [ ] Subscription badges display correctly

### Admin Panel
- [ ] Admin dashboard accessible
- [ ] Stats display accurately
- [ ] Manage users works
- [ ] Filter by subscription works
- [ ] Manage artworks works
- [ ] View orders works

### UI/Theme
- [ ] Light mode displays correctly
- [ ] Dark mode displays correctly
- [ ] Admin pages styled correctly in both modes
- [ ] Responsive on mobile (tested in DevTools)

### Tier-Specific Features
- [ ] Free tier: 10 artwork limit enforced
- [ ] Plus tier: 50 artwork limit
- [ ] Plus tier: Commission requests available
- [ ] Premium tier: Unlimited artworks
- [ ] Premium tier: Livestream access

---

## 🐛 Found a Bug?

If something doesn't work, document it:

**Bug Template:**
```
TITLE: [Short description]

STEPS TO REPRODUCE:
1. Step 1
2. Step 2
3. Step 3

EXPECTED: [What should happen]

ACTUAL: [What actually happened]

CONSOLE ERRORS: [Copy any errors from F12 → Console]

SCREENSHOT: [If applicable]
```

Save bugs to a file or document so we can fix them later.

---

## 📊 What to Test Next (After Critical Path)

Once the critical path works, test these features:

### Medium Priority (30 minutes)

1. **Subscriptions** (`/subscriptions`)
   - View plans
   - Upgrade to Plus
   - Upgrade to Premium
   - Downgrade to Free

2. **Commission Requests**
   - Go to artist profile
   - Click "Request Commission"
   - Fill form and submit
   - Check database: `SELECT * FROM commissions;`

3. **Exhibitions** (`/exhibitions`)
   - Browse exhibitions
   - View exhibition details
   - Follow/Unfollow

4. **Livestreams** (`/livestreams`)
   - View live streams list
   - Join a stream (if any are live)

5. **Notifications**
   - Click bell icon
   - Check if notifications load
   - Click a notification
   - Mark as read

6. **Chat**
   - Click chat icon
   - View conversation list
   - Send a message
   - Check real-time updates

### Low Priority (20 minutes)

7. **Admin - Users Management**
   - Navigate to Admin → Users
   - Search for user
   - Edit user (change role/subscription)
   - View user details

8. **Admin - Artworks Management**
   - Navigate to Admin → Artworks
   - Feature/Unfeature artwork
   - View artwork stats

9. **Admin - Orders Management**
   - Navigate to Admin → Orders
   - View order details
   - Update order status

10. **Responsive Design**
    - Open DevTools (F12)
    - Click "Toggle Device Toolbar" (Ctrl+Shift+M)
    - Test on:
      - iPhone SE (375x667)
      - iPad (768x1024)
      - Desktop (1920x1080)

---

## 🔍 Performance Check (5 minutes)

1. Open DevTools (F12) → Network tab
2. Reload the page (Ctrl+R)
3. Check:
   - **Page load time**: Should be < 3 seconds
   - **Total page size**: Should be < 2MB
   - **Failed requests**: Should be 0 (all green status codes)

4. Go to Console tab
5. Check for errors: **Should be 0 errors**

---

## 🎉 Next Steps

After completing these tests:

1. **Document results** in [TEST_RESULTS.md](TEST_RESULTS.md)
2. **List all bugs** you found
3. **Update the checklist** with Pass/Fail status
4. **Share results** so we can prioritize fixes

---

## 💡 Tips

- **Keep browser DevTools open** (F12) while testing
- **Check Console tab** for JavaScript errors
- **Check Network tab** for failed API calls
- **Take screenshots** of bugs
- **Test in different browsers** (Chrome, Firefox, Edge)
- **Clear cache** if things look weird (Ctrl+Shift+Delete)

---

## 🆘 Need Help?

If you get stuck:

1. **Check backend is running**: Go to http://localhost:5000/health
   - Should see: `{"status":"ok"}`

2. **Check frontend is running**: Go to http://localhost:5173
   - Should see the OnlyArts home page

3. **Check database**: Run `SHOW TABLES;` in MySQL
   - Should see 23+ tables

4. **Check for errors**:
   - Frontend: F12 → Console
   - Backend: Check terminal where backend is running
   - Database: Check MySQL logs

---

**Happy Testing! 🚀**

Start with the Critical Path tests above, and work your way through the checklist. Good luck!
