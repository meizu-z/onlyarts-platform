 # OnlyArts Platform - Simple Testing Checklist

**Date:** 11/8/25
**Tester:** meizu

Just check off items as you test them! ✅ = Pass, ❌ = Fail, ⚠️ = Warning

---

## 🔐 SETUP

- [ ] Cleaned database (removed all demo data) - See [CLEAN_DATABASE_FOR_TESTING.md](CLEAN_DATABASE_FOR_TESTING.md)
- [ ] Verified database is empty (0 users, 0 artworks, 0 orders)
- [ ] Created 4 accounts (testadmin, userfree, userplus, userpremium)
- [ ] Updated database with subscription tiers and admin role
- [ ] Verified all accounts can login
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MySQL database connected
- [ ] Cleared browser storage/cache

---

## 🎯 CRITICAL PATH TESTS (Must Pass!)

### Login & Authentication
- [ ] Login as userfree works
- [ ] Login as userplus works
- [ ] Login as userpremium works
- [ ] Login as testadmin works
- [ ] Logout works
- [ ] No console errors on login

### Browse & View
- [ ] Explore page loads artworks
- [ ] Artwork detail page works
- [ ] Images display correctly
- [ ] Prices show in ₱ (pesos)
- [ ] Artist names visible

### Upload Artwork (Free Tier)
- [ ] Can upload artwork as userfree
- [ ] Image uploads to Cloudinary
- [ ] Artwork appears in list
- [ ] Can upload up to 10 artworks
- [ ] 11th upload is BLOCKED ⚠️ CRITICAL
- [ ] Shows upgrade message when limit reached

### Upload Artwork (Plus Tier)
- [ ] Can upload as userplus
- [ ] Shows 50 artwork limit
- [ ] Counter shows "X/50"

### Upload Artwork (Premium Tier)
- [ ] Can upload as userpremium
- [ ] Shows unlimited or very high limit
- [ ] No restrictions

### Cart & Checkout
- [ ] Add to cart works
- [ ] Cart icon shows count
- [ ] Cart page displays items
- [ ] Checkout form works
- [ ] Order completes successfully
- [ ] Cart clears after order
- [ ] Order saved in database

### Subscriptions
- [ ] Subscription page loads 3 plans
- [ ] Free plan shows ₱0
- [ ] Plus plan shows ₱4.99/month
- [ ] Premium plan shows ₱9.99/month
- [ ] Can click "Select Plan" on Plus
- [ ] Payment modal opens
- [ ] Can upgrade subscription
- [ ] Subscription updates in database
- [ ] Badge updates after upgrade

### Admin Panel
- [ ] Admin dashboard accessible
- [ ] Shows correct total users (4)
- [ ] Shows total artworks count
- [ ] Shows total orders count
- [ ] Manage Users page works
- [ ] Can filter by subscription
- [ ] Manage Artworks page works
- [ ] Manage Orders page works

### Theme Testing
- [ ] Dark mode works (default)
- [ ] Light mode works
- [ ] Admin pages look good in light mode
- [ ] Admin pages look good in dark mode
- [ ] No broken styling
- [ ] Colors look correct

---

## 🧪 TIER-SPECIFIC FEATURES

### Free Tier Tests (userfree)
- [ ] Limited to 10 artworks
- [ ] Cannot upload 11th artwork
- [ ] No commission request button
- [ ] No livestream creation
- [ ] No special badge

### Plus Tier Tests (userplus)
- [ ] Limited to 50 artworks
- [ ] Commission request button visible
- [ ] "Plus" badge visible
- [ ] Cannot create livestreams

### Premium Tier Tests (userpremium)
- [ ] Unlimited artworks
- [ ] Commission request button visible
- [ ] Livestream creation available
- [ ] "Premium" badge visible

---

## 🔧 ADMIN FEATURES

- [ ] View all users
- [ ] Search for users
- [ ] Filter by role (admin/artist/fan)
- [ ] Filter by subscription (free/plus/premium)
- [ ] Edit user details
- [ ] Change user subscription
- [ ] View all artworks
- [ ] Feature/Unfeature artwork
- [ ] Delete artwork
- [ ] View all orders
- [ ] Update order status
- [ ] View analytics

---

## 📱 RESPONSIVE DESIGN

- [ ] Desktop (1920x1080) looks good
- [ ] Tablet (768x1024) works
- [ ] Mobile (375x667) works
- [ ] Mobile menu toggles correctly
- [ ] Touch targets are big enough

---

## 🐛 BUGS FOUND

Write bugs here as you find them:

### Bug #1 - No Admin Dashboard for testadmin
**Title:** Admin dashboard not accessible for testadmin account
**Severity:** Critical
**Steps to Reproduce:**
1. Login as testadmin (admin@test.com / Admin123!)
2. Try to access admin dashboard
3. No admin menu/dashboard visible

**Expected:** Should see Admin menu option in sidebar and be able to access /admin
**Actual:** Admin dashboard not showing for admin role user
**Status:** 🔴 Not Fixed

---

### Bug #2 - Livestream fetch error (400)
**Title:** Livestream page fails to fetch data - 400 Bad Request
**Severity:** High
**Steps to Reproduce:**
1. Navigate to /livestreams page
2. Check browser console
3. See error: "Invalid field" with 400 status

**Expected:** Livestreams should load from backend API
**Actual:** API returns 400 error - "Invalid field"
**Console Error:** `Failed to load resource: 400 (Bad Request)` at `:5000/api/livestreams:1`
**Status:** 🔴 Not Fixed - Backend API issue

---

### Bug #3 - Demo data in Saved for Later
**Title:** Demo/fake data showing in Saved for Later pages
**Severity:** Medium
**Steps to Reproduce:**
1. Navigate to Saved for Later page
2. Check all subpages
3. See demo artworks/items

**Expected:** Should show empty state or only real user data
**Actual:** Demo/fake data is still visible
**Status:** 🔴 Not Fixed - Remove USE_DEMO_MODE or demo data arrays

---

### Bug #4 - Demo data in Favorites
**Title:** Demo/fake data showing in Favorites pages
**Severity:** Medium
**Steps to Reproduce:**
1. Navigate to Favorites page
2. Check all subpages
3. See demo artworks

**Expected:** Should show empty state or only real favorited items
**Actual:** Demo/fake data is still visible
**Status:** 🔴 Not Fixed - Remove USE_DEMO_MODE or demo data arrays

---

### Bug #5 - Demo data in Explore
**Title:** Demo/fake data showing in Explore page and subpages
**Severity:** Medium
**Steps to Reproduce:**
1. Navigate to Explore page
2. Check all category subpages
3. See demo artworks mixed with real data

**Expected:** Should show only real artworks from database
**Actual:** Demo/fake data is still visible
**Status:** 🔴 Not Fixed - Remove USE_DEMO_MODE or demo data arrays

---

### Bug #6 - Demo data in Notifications
**Title:** Demo/fake data showing in Notifications pages
**Severity:** Medium
**Steps to Reproduce:**
1. Navigate to Notifications page
2. Check all subpages
3. See demo notifications

**Expected:** Should show only real notifications from backend
**Actual:** Demo/fake data is still visible
**Status:** 🔴 Not Fixed - Remove USE_DEMO_MODE or demo data arrays

---

### Bug #7 - Demo data in Chat
**Title:** Demo/fake data showing in Chat/Messages pages
**Severity:** Medium
**Steps to Reproduce:**
1. Navigate to Chat page
2. Check all subpages
3. See demo conversations/messages

**Expected:** Should show only real conversations from backend
**Actual:** Demo/fake data is still visible
**Status:** 🔴 Not Fixed - Remove USE_DEMO_MODE or demo data arrays

---

### Bug #8 - Incorrect subscription pricing
**Title:** Subscription prices showing wrong amounts
**Severity:** High
**Steps to Reproduce:**
1. Navigate to /subscriptions page
2. Check pricing for each tier

**Expected:**
- Free: ₱0
- Plus: ₱149/month
- Premium: ₱249/month
**Actual:** Showing incorrect prices (₱4.99, ₱9.99)
**Status:** 🔴 Not Fixed - Update pricing in subscription plans

---

### Bug #9 - Demo data in Cart
**Title:** Demo/fake data showing in Cart pages
**Severity:** Medium
**Steps to Reproduce:**
1. Navigate to Cart page
2. Check all subpages
3. See demo cart items

**Expected:** Should show only real cart items from backend
**Actual:** Demo/fake data is still visible
**Status:** 🔴 Not Fixed - Remove USE_DEMO_MODE or demo data arrays

---

### Bug #10 - Demo data in Followers/Following
**Title:** Demo/fake data showing in Followers/Following pages
**Severity:** Medium
**Steps to Reproduce:**
1. Navigate to Followers page
2. Navigate to Following page
3. Check all subpages
4. See demo users

**Expected:** Should show only real followers/following from backend
**Actual:** Demo/fake data is still visible
**Status:** 🔴 Not Fixed - Remove USE_DEMO_MODE or demo data arrays

---

### Bug #11 - Create Artist page image upload broken
**Title:** Cannot upload images when creating artist profile
**Severity:** High
**Steps to Reproduce:**
1. Navigate to Create Artist page
2. Try to upload profile/banner images
3. Upload fails or doesn't work

**Expected:** Should be able to upload and preview images
**Actual:** Image upload functionality not working
**Status:** 🔴 Not Fixed - Fix image upload on artist creation

---

### Bug #12 - Posting artwork does not work
**Title:** Cannot upload/post new artwork
**Severity:** Critical
**Steps to Reproduce:**
1. Try to post/upload new artwork
2. Fill in all fields
3. Click submit/upload
4. Nothing happens or error occurs

**Expected:** Artwork should upload successfully to database and Cloudinary
**Actual:** Upload fails
**Status:** 🔴 Not Fixed - Critical feature broken

---

### Bug #13 - Wallet balance showing incorrect data
**Title:** Wallet balance should be zero, transactions showing demo data
**Severity:** Medium
**Steps to Reproduce:**
1. Navigate to Wallet page
2. Check balance
3. Check transactions list

**Expected:** Balance should be ₱0, transactions should be empty or only real transactions
**Actual:** Showing non-zero balance or demo transactions
**Status:** 🔴 Not Fixed - Reset wallet data or remove demo

---

### Bug #14 - Profile/Cover image upload not working
**Title:** Cannot upload profile image and cover image
**Severity:** High
**Steps to Reproduce:**
1. Go to profile settings or edit profile
2. Try to upload profile image
3. Try to upload cover image
4. Upload fails or doesn't work

**Expected:** Should be able to upload and set profile/cover images
**Actual:** Image upload not working
**Status:** 🔴 Not Fixed - Feature not implemented

---

### Bug #15 - Artist profile creation broken (userfree)
**Title:** Artist profile won't work for userfree account
**Severity:** Critical
**Steps to Reproduce:**
1. Login as userfree
2. Try to create/edit artist profile
3. Profile creation fails

**Expected:** Should be able to create artist profile
**Actual:** Artist profile functionality broken
**Status:** 🔴 Not Fixed - Critical for artist accounts

---

### Bug #16 - Artwork upload broken (userfree)
**Title:** Artist artwork upload doesn't work for userfree
**Severity:** Critical
**Steps to Reproduce:**
1. Login as userfree
2. Try to upload artwork
3. Upload fails

**Expected:** Should be able to upload artwork (up to 10 for free tier)
**Actual:** Artwork upload completely broken
**Status:** 🔴 Not Fixed - Critical feature

---

### Bug #17 - Same bugs in userplus account
**Title:** All bugs from testadmin also present in userplus (except admin dashboard)
**Severity:** Critical
**Steps to Reproduce:**
1. Login as userplus
2. All the same issues as testadmin appear

**Expected:** userplus should work normally (no admin features, but all other features work)
**Actual:** Same bugs as testadmin account
**Status:** 🔴 Not Fixed - Widespread issue across accounts

---

### Bug #18
**Title:**
**Severity:**
**Steps to Reproduce:**
1.
2.
3.

**Expected:**
**Actual:**
**Status:**

---

## 📊 QUICK SUMMARY

Total Tests Completed: _____ / 75+
Tests Passed: _____
Tests Failed: _____

**Bug Breakdown:**
- Critical Bugs: **3** (#1 Admin dashboard, #2 Livestream API, #12 Artwork upload)
- High Priority Bugs: **2** (#8 Subscription pricing, #11 Artist image upload)
- Medium Priority Bugs: **7** (Demo data in: Saved, Favorites, Explore, Notifications, Chat, Cart, Followers/Following)
- **Total Bugs Found: 12**

**Ready for Launch?** NO - Critical bugs must be fixed first

**Notes:**
- Backend is running ✅
- Frontend is running ✅
- Database cleaned ✅
- 4 test accounts created ✅
- **CRITICAL**: Artwork upload broken - core feature not working
- **CRITICAL**: Admin panel not accessible
- **CRITICAL**: Livestream API error
- **HIGH**: Wrong subscription pricing (should be ₱149/₱249)
- Demo data still showing in 7+ different pages - needs cleanup



---

## 🎉 SIGN-OFF

Once all critical tests pass and no critical bugs remain:

- [ ] All critical path tests pass
- [ ] Subscription limits work correctly
- [ ] Admin panel functional
- [ ] No console errors
- [ ] Theme works in both modes
- [ ] Mobile responsive

**Tested By:** ___________
**Date:** ___________
**Approved:** ___________

