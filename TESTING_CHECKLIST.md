# OnlyArts Platform - Testing Checklist

## Overview
This checklist covers all recent stability and performance improvements made to the platform.

---

## 🔧 Pre-Testing Setup

### Backend
- [ ] Stop any running backend instances
- [ ] Restart backend: `cd backend && node server.js`
- [ ] Verify in console: "✅ Connected to MySQL database"
- [ ] Verify in console: "📊 Pool configured with 50 max connections"
- [ ] (Dev mode only) Check pool monitoring logs appear every 30 seconds

### Frontend
- [ ] Stop any running frontend instances
- [ ] Start frontend: `npm run dev`
- [ ] Open browser to http://localhost:5173
- [ ] Open browser DevTools (F12) → Console tab

---

## 🐛 Bug Fixes Testing

### ✅ Test 1: Artwork Comments (Fixed Database Error)
**What was fixed**: MySQL parameter mismatch in LIMIT/OFFSET query

**Steps:**
1. [ ] Login to the platform
2. [ ] Navigate to any artwork page (e.g., `/artwork/23`)
3. [ ] Scroll to comments section
4. [ ] **Expected**: Comments load without errors
5. [ ] Open browser console → Network tab
6. [ ] Look for `/api/artworks/*/comments` request
7. [ ] **Expected**: Status 200 (success), no database errors
8. [ ] Try paginating through comments if available
9. [ ] **Expected**: No "Incorrect arguments to mysqld_stmt_execute" errors

**✅ PASS** | **❌ FAIL** (note error):

---

### ✅ Test 2: Livestream Start/End Workflow (Fixed Status Bug)
**What was fixed**: Frontend now calls API to transition livestream from "scheduled" to "live"

**Steps:**
1. [ ] Login as a user (not admin)
2. [ ] Navigate to `/start-live`
3. [ ] Fill in livestream details:
   - Title: "Test Livestream"
   - Description: "Testing the fixed workflow"
   - Type: Normal Live Stream
4. [ ] Click "Go Live Now"
5. [ ] **Expected**: Camera permission prompt appears
6. [ ] Allow camera access
7. [ ] **Expected**: Success message "Your live stream is now live! 🎉"
8. [ ] **Expected**: Video preview appears with "LIVE" badge
9. [ ] **CRITICAL**: Click "End Stream" button
10. [ ] **Expected**: Success message "Livestream ended successfully"
11. [ ] **Expected**: Redirects to `/livestreams` page
12. [ ] Check backend console logs for:
    - `POST /api/livestreams [201]` (create)
    - `PUT /api/livestreams/*/start [200]` (go live) ← **THIS IS NEW**
    - `PUT /api/livestreams/*/end [200]` (end)

**✅ PASS** | **❌ FAIL** (note error):

---

## ⚡ Performance Testing

### ✅ Test 3: Database Connection Pool (Increased Capacity)
**What was improved**: Connection limit 10 → 50, plus timeouts and monitoring

**Steps:**
1. [ ] Check backend console shows: "📊 Pool configured with 50 max connections"
2. [ ] (Dev mode) Wait 30 seconds, verify pool monitoring logs appear
3. [ ] Navigate through multiple pages quickly (Dashboard → Explore → Profile → Wallet)
4. [ ] **Expected**: No "Connection pool exhausted" errors
5. [ ] Check backend console for pool stats
6. [ ] **Expected**: Free connections should be > 0

**✅ PASS** | **❌ FAIL** (note error):

---

### ✅ Test 4: React Error Boundaries (Crash Protection)
**What was added**: App-wide error boundary to catch component crashes

**Steps:**
1. [ ] Open browser DevTools → Console
2. [ ] Type: `throw new Error("Test error boundary");`
3. [ ] Press Enter
4. [ ] **Expected**: Beautiful error screen with recovery buttons
5. [ ] Click "Try Again" → **Expected**: Returns to app
6. [ ] Click "Go Home" → **Expected**: Navigates to home

**✅ PASS** | **❌ FAIL** (note error):

---

### ✅ Test 5: Vite Build Optimization (Code Splitting)
**What was improved**: Manual chunk splitting for faster loads

**Steps:**
1. [ ] Run: `npm run build`
2. [ ] Check `dist/js/` for multiple chunks:
   - `vendor-react-*.js`
   - `vendor-ui-*.js`
   - `vendor-realtime-*.js`
   - `admin-*.js`
   - `pages-main-*.js`
3. [ ] Check `dist/assets/` for organized folders
4. [ ] Run: `npm run preview`
5. [ ] Navigate app → chunks load on-demand

**✅ PASS** | **❌ FAIL** (note error):

---

## 🔄 General Functionality Testing

### ✅ Test 6: Core User Flows
- [ ] Login/Logout
- [ ] View artwork + comments
- [ ] Wallet operations
- [ ] Subscriptions
- [ ] Exhibitions
- [ ] Admin features

**✅ ALL PASS** | **❌ SOME FAIL** (note which):

---

## 📊 Console Checks
- [ ] No red errors
- [ ] No failed requests (Network tab)
- [ ] No React warnings
- [ ] No database errors

---

## ✅ Final Status
- [ ] All tests passed
- [ ] Issues documented below
- [ ] Ready for production

---

## 🐛 Issues Found

### Issue 1:
- Test:
- Error:
- Browser:

---

**Tested by**: ________________  
**Date**: ________________  
**Status**: ✅ PASS | ⚠️ ISSUES | ❌ FAIL
