# OnlyArts Platform - Testing Checklist

## <¯ Pre-Launch Testing Guide

Test these features before going live to ensure everything works correctly.

---

## 1.  Image Upload (Cloudinary)

### Test: Upload Profile Picture
1. Log into your app (http://localhost:5173)
2. Go to **Settings** ’ **Profile**
3. Click **Change Profile Picture**
4. Upload a test image
5. **Expected Result:**
   - Image uploads successfully
   - Preview shows the image
   - Page refreshes and shows new profile picture

### Test: Upload Artwork
1. Go to **Create Artwork**
2. Fill in artwork details
3. Upload an image
4. Click **Publish**
5. **Expected Result:**
   - Artwork created successfully
   - Image displays on artwork page
   - Image URL in console starts with `https://res.cloudinary.com/`

###  Verification:
- [ ] Profile picture uploads work
- [ ] Artwork images upload to Cloudinary
- [ ] Images display properly after upload
- [ ] Check Cloudinary dashboard - images should appear there

---

## 2. =¬ Chat (Real-time Messaging)

### Test: Send/Receive Messages
1. Open app in **two different browsers** (or incognito + normal)
2. Log in as **User A** in first browser
3. Log in as **User B** in second browser
4. **User A:** Go to Chat ’ Start conversation with User B
5. **User A:** Send message: "Hello from User A"
6. **User B:** Check chat - message should appear **instantly**
7. **User B:** Reply: "Hello from User B"
8. **User A:** Should see reply **immediately without refresh**

###  Verification:
- [ ] Messages appear instantly (no refresh needed)
- [ ] Messages persist after refresh
- [ ] Check browser console - Should see: `=¬ Connected to chat socket`

---

## 3. =° Wallet & Transactions

### Test: View Transaction History
1. Go to **Wallet** page
2. Check **Transaction History** section
3. **Expected Result:**
   - NO 500 error!
   - Transactions load successfully
   - Proper pagination if many transactions

### Test: Add Funds (Mock Payment)
1. Click **Add Funds**
2. Enter amount: **±500**
3. Enter any card details (mock accepts anything)
4. Submit
5. **Expected Result:**
   - Balance increases
   - Transaction appears in history

###  Verification:
- [ ] Transaction history loads without errors
- [ ] Can add funds to wallet
- [ ] Balance updates correctly

---

## 4. <¨ Exhibition Features

### Test: Exhibition Display
1. Go to any exhibition page
2. **Check:**
   - [ ] All artwork cards are same height (leveled)
   - [ ] Buy Now buttons are small (not oversized)
   - [ ] Comment icons are appropriate size
   - [ ] No "Follow" button (should be removed)

### Test: Exhibition Badges on Artwork Page
1. View an artwork that's in an exhibition
2. **Expected:**
   - Card shows which exhibition(s) it belongs to
   - Badges are clickable
   - Clicking navigates to exhibition

### Test: Exhibition Badges in Dashboard
1. Go to Dashboard/Feed
2. Find artworks in exhibitions
3. **Expected:**
   - Small badges below artwork
   - Shows up to 2 exhibitions
   - "EX" label for exclusive

###  Verification:
- [ ] Exhibition cards properly leveled
- [ ] Buy Now buttons appropriately sized
- [ ] Exhibition badges work on artwork pages
- [ ] Exhibition badges appear in feed
- [ ] Favorites filter works

---

## =€ Quick Test Script

Open your app and try this complete flow:

1.  **Upload** artwork image ’ Check Cloudinary dashboard
2.  **Create** exhibition with cover image
3.  **View** wallet transactions ’ Should load without error
4.  **Open** chat in two browsers ’ Send messages real-time
5.  **Check** exhibition badges on artwork page

**If all pass ’ You're ready for production!** <‰

---

## = Known Fixed Issues

-  Wallet transaction error (LIMIT/OFFSET)
-  Exhibition database error (FormData boolean)
-  Comment icons too large
-  Buy Now buttons too large
-  Exhibition cards not leveled

---

## =Ý Before Going Live

- [ ] Remove debug console.logs from ArtworkPage.jsx
- [ ] Test on mobile device
- [ ] Verify all features work
- [ ] Check for console errors
