# OnlyArts Platform - Testing Summary

## 🎯 Test Account Strategy: Subscription-Based Testing

We're using **4 test accounts** to comprehensively test the subscription tier system:

### Test Accounts Overview

| Username | Email | Password | Role | Subscription | Purpose |
|----------|-------|----------|------|--------------|---------|
| `testadmin` | admin@test.com | Admin123! | admin | free | Admin panel testing |
| `userfree` | free@test.com | Free123! | artist | free | Free tier limits (10 artworks) |
| `userplus` | plus@test.com | Plus123! | artist | plus | Plus tier features (50 artworks) |
| `userpremium` | premium@test.com | Premium123! | artist | premium | Premium features (unlimited) |

---

## 📊 Subscription Tier Features Matrix

| Feature | Free | Plus | Premium |
|---------|------|------|---------|
| **Artwork Uploads** | 10 max | 50 max | Unlimited |
| **Browse Artworks** | ✅ | ✅ | ✅ |
| **Purchase Artworks** | ✅ | ✅ | ✅ |
| **Like & Comment** | Basic | ✅ | ✅ |
| **Commission Requests** | ❌ | ✅ | ✅ |
| **Livestream Access** | View only | View only | Create & host |
| **Analytics** | Basic | Advanced | Premium |
| **Profile Badge** | None | "Plus" | "Premium" |
| **Priority Support** | ❌ | ✅ | ✅ |
| **Exhibitions** | View | Create | Premium placement |
| **Price** | Free | ₱4.99/mo | ₱9.99/mo |

---

## ✅ Critical Test Scenarios

### 1. Subscription Limits Enforcement

**Free Tier (10 artwork limit)**
- [ ] Upload 10 artworks successfully
- [ ] 11th upload blocked with upgrade prompt
- [ ] Artwork counter shows "10/10"
- [ ] Upload button disabled or shows upgrade CTA

**Plus Tier (50 artwork limit)**
- [ ] Can upload up to 50 artworks
- [ ] Artwork counter shows "X/50"
- [ ] Commission request button visible on artist profiles

**Premium Tier (Unlimited)**
- [ ] No artwork counter (or shows "Unlimited")
- [ ] Can upload many artworks without limit
- [ ] Livestream creation available
- [ ] Premium badge visible throughout site

---

### 2. Subscription Upgrade Flow

**Test: Free → Plus Upgrade**
1. Login as `userfree`
2. Go to `/subscriptions`
3. Click "Select Plan" on Plus tier
4. Fill payment details (test mode)
5. Submit upgrade
6. ✅ Subscription updated to "plus" in database
7. ✅ Artwork limit increases to 50
8. ✅ Plus badge appears
9. ✅ Commission features unlocked

**Test: Free → Premium Upgrade**
1. Login as `userfree`
2. Select Premium plan
3. Complete payment flow
4. ✅ All premium features unlocked

**Test: Plus → Premium Upgrade**
1. Login as `userplus`
2. Upgrade to Premium
3. ✅ Additional features unlocked

**Test: Downgrade to Free**
1. Login as upgraded user
2. Select Free plan
3. ✅ Immediate downgrade (no payment)
4. ⚠️ Artworks beyond limit should be hidden or archived (not deleted)

---

### 3. Feature Access Control

**Commission Requests**
- [ ] Free user: Cannot request commissions (button hidden)
- [ ] Plus user: Can request commissions
- [ ] Premium user: Can request commissions
- [ ] Commission form validation works
- [ ] Reference images upload to Cloudinary

**Livestream Access**
- [ ] Free user: Can view livestreams only
- [ ] Plus user: Can view livestreams only
- [ ] Premium user: Can CREATE livestreams
- [ ] Livestream creation button visible for premium only

**Analytics Dashboard**
- [ ] Free user: Basic stats only
- [ ] Plus user: Advanced analytics
- [ ] Premium user: Premium analytics with detailed insights

---

### 4. UI/UX Subscription Indicators

**Profile Badges**
- [ ] Free user: No badge
- [ ] Plus user: Purple/gradient "Plus" badge
- [ ] Premium user: Gold/premium "Premium" badge
- [ ] Badges visible on:
  - User profile page
  - Navbar/header
  - User listings
  - Comments/activity

**Subscription Page**
- [ ] Current plan highlighted
- [ ] "Current Plan" button on active tier
- [ ] Upgrade buttons on higher tiers
- [ ] Downgrade available for paid tiers
- [ ] Feature comparison clear and accurate
- [ ] Pricing in Philippine Pesos (₱)

---

### 5. Database Verification

After each subscription change, verify in MySQL:

```sql
USE onlyarts;

-- Check subscription status
SELECT
  username,
  email,
  role,
  subscription,
  subscription_start_date,
  subscription_end_date
FROM users
WHERE username IN ('userfree', 'userplus', 'userpremium')
ORDER BY
  CASE subscription
    WHEN 'free' THEN 1
    WHEN 'plus' THEN 2
    WHEN 'premium' THEN 3
  END;

-- Check artwork counts per user
SELECT
  u.username,
  u.subscription,
  COUNT(a.id) as artwork_count,
  CASE u.subscription
    WHEN 'free' THEN '10'
    WHEN 'plus' THEN '50'
    WHEN 'premium' THEN 'Unlimited'
  END as max_allowed
FROM users u
LEFT JOIN artworks a ON u.id = a.artist_id
WHERE u.username IN ('userfree', 'userplus', 'userpremium')
GROUP BY u.id, u.username, u.subscription;

-- Check subscription payment history (if applicable)
SELECT * FROM subscription_payments
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🧪 Test Execution Order

### Phase 1: Setup (5 minutes)
1. Create 4 test accounts via registration
2. Update database to set subscriptions and admin role
3. Verify all accounts can login

### Phase 2: Free Tier Testing (10 minutes)
1. Login as `userfree`
2. Upload 10 artworks
3. Try to upload 11th (should fail)
4. Verify upload limit message
5. Browse explore page
6. Add artwork to cart & checkout

### Phase 3: Subscription Upgrade (10 minutes)
1. Still as `userfree`, navigate to subscriptions
2. View all three plans
3. Upgrade to Plus
4. Verify Plus features unlocked
5. Upload artwork #11 (should now work)
6. Test commission request feature

### Phase 4: Premium Features (10 minutes)
1. Login as `userpremium`
2. Upload multiple artworks (no limit)
3. Access livestream creation
4. Verify premium badge
5. Check premium analytics

### Phase 5: Admin Panel (10 minutes)
1. Login as `testadmin`
2. View dashboard stats
3. Manage users - filter by subscription
4. View artwork stats by tier
5. Check revenue by subscription

### Phase 6: UI/Theme Testing (10 minutes)
1. Test all pages in light mode
2. Test all pages in dark mode
3. Verify admin pages styling
4. Test responsive design (mobile/tablet)
5. Check subscription badges in all contexts

### Phase 7: Edge Cases (10 minutes)
1. Try to upload beyond limit without paying
2. Downgrade from Plus to Free (with 30 artworks)
3. Try to access premium features as free user
4. Test expired subscription handling
5. Test payment failures

---

## 📋 Quick Test Checklist

Copy this to track your testing progress:

```
SETUP
[ ] 4 accounts created and configured
[ ] All accounts can login
[ ] Database verified

FREE TIER
[ ] Can upload 10 artworks
[ ] 11th upload blocked
[ ] Upload limit message shown
[ ] Artwork counter accurate

PLUS TIER
[ ] Upgrade flow works
[ ] 50 artwork limit
[ ] Commission requests available
[ ] Plus badge visible

PREMIUM TIER
[ ] Unlimited artwork uploads
[ ] Livestream creation available
[ ] Premium badge visible
[ ] Premium analytics accessible

ADMIN PANEL
[ ] Dashboard stats accurate
[ ] User management works
[ ] Filter by subscription works
[ ] Revenue tracking works

UI/UX
[ ] Subscription badges display
[ ] Light mode styled correctly
[ ] Dark mode styled correctly
[ ] Responsive on mobile

EDGE CASES
[ ] Limit enforcement works
[ ] Downgrade handles excess artworks
[ ] Feature access control works
[ ] Payment errors handled gracefully
```

---

## 🐛 Expected Issues to Watch For

### High Priority
1. **Artwork limit not enforced** - Free user can upload > 10
2. **Subscription not updating after payment** - Database not syncing
3. **Features not unlocking after upgrade** - UI not reflecting new tier
4. **Badge not displaying** - Subscription indicator missing

### Medium Priority
5. **Artwork counter inaccurate** - Shows wrong count
6. **Downgrade doesn't hide excess artworks** - All artworks still visible
7. **Payment modal errors** - Form validation issues
8. **Commission button visible for free users** - Access control bug

### Low Priority
9. **Badge styling inconsistent** - Colors/placement varies
10. **Billing cycle toggle doesn't work** - Monthly/yearly switcher broken

---

## 📊 Success Criteria

### Must Pass (Critical)
- ✅ Free tier limited to 10 artworks
- ✅ Plus tier limited to 50 artworks
- ✅ Premium tier has no limit
- ✅ Subscription upgrades work
- ✅ Subscription updates in database
- ✅ Features unlock based on tier
- ✅ Admin can view users by subscription

### Should Pass (High Priority)
- ✅ Subscription badges display correctly
- ✅ Commission requests only for Plus/Premium
- ✅ Livestream creation only for Premium
- ✅ Downgrade preserves user data
- ✅ Payment modal works smoothly

### Nice to Have (Medium Priority)
- ✅ Analytics differ by tier
- ✅ Premium users get priority placement
- ✅ 7-day free trial works
- ✅ Billing cycle toggle works
- ✅ Subscription renewal reminders

---

## 🎉 Final Verification

Before considering testing complete:

1. **All 4 accounts work** - Can login and perform tier-specific actions
2. **Database is accurate** - Subscriptions match what's shown in UI
3. **No critical bugs** - All "Must Pass" criteria met
4. **Theme works** - Both light and dark mode styled correctly
5. **Admin panel functional** - Can manage users and view stats
6. **No console errors** - Check browser DevTools console
7. **API calls succeed** - Check Network tab, all 200/201 status codes
8. **Mobile responsive** - Test in DevTools responsive mode

---

## 📞 Need Help?

If you encounter issues:

1. **Check browser console** (F12 → Console) for JavaScript errors
2. **Check Network tab** (F12 → Network) for failed API calls
3. **Check backend logs** in the terminal running `npm run dev`
4. **Check database** directly with SQL queries
5. **Document bugs** using the bug template in QA_TESTING_GUIDE.md

---

**Happy Testing! 🚀**

Focus on the subscription tier differences - that's the core monetization feature!
