# OnlyArts Platform - Gap Analysis & Fixes

## Critical Issues Found

### 1. DATABASE SCHEMA MISMATCHES

#### Conversations Table
**Database columns:** `participant_one_id`, `participant_two_id`
**Backend code uses:** `user1_id`, `user2_id`
**Status:** ❌ CRITICAL - Chat will fail
**Impact:** Chat conversations endpoint returns errors

#### Livestreams Table
**Database column:** `scheduled_start_at`
**Backend code used:** `scheduled_for`
**Status:** ✅ FIXED
**Impact:** Livestreams endpoint was failing

#### Messages Table
**Database column:** `content`
**Backend code used:** `message`
**Status:** ✅ FIXED
**Impact:** Chat messages query was failing

---

### 2. SQL PARAMETER BINDING ISSUES

#### Issue: LIMIT/OFFSET as parameters
**Problem:** MySQL doesn't support LIMIT/OFFSET as prepared statement parameters
**Affected:** favorites, artworks, users queries
**Status:** ✅ PARTIALLY FIXED (favorites done)
**Impact:** "Incorrect arguments to mysqld_stmt_execute" errors

---

### 3. API RESPONSE INCONSISTENCIES

#### Issue: Double-wrapped data
**Backend sends:**
```json
{
  "success": true,
  "message": "...",
  "data": { "balance": 0 }
}
```

**Frontend expects:**
```javascript
response.data.balance  // ❌ undefined
// Should be:
response.data.data.balance  // ✅ or unwrap in interceptor
```

**Affected:** wallet, settings, profile, favorites
**Status:** ⚠️ PARTIALLY FIXED (wallet done)
**Impact:** TypeError: Cannot read properties of undefined

---

### 4. MISSING ROUTES

**Status:** ✅ ALL FIXED
- `/api/settings` ✅
- `/api/wallet/*` ✅
- `/api/favorites` ✅

---

### 5. IMAGE UPLOAD CONFIGURATION

**Issue:** Cloudinary not configured
**Status:** ✅ FIXED (using local storage)
**Impact:** Image uploads were failing with 500 errors

---

## Fixes Required (Priority Order)

### HIGH PRIORITY

1. **Fix Conversations Table Column Names** - Chat completely broken
2. **Create API Response Interceptor** - Eliminate all undefined errors
3. **Fix All SQL Parameter Bindings** - Multiple query failures

### MEDIUM PRIORITY

4. **Audit All Backend Controllers** - Check for more schema mismatches
5. **Standardize Error Responses** - Consistent error handling
6. **Add Request Validation** - Prevent bad data from reaching database

### LOW PRIORITY

7. **Add TypeScript** - Prevent type errors
8. **Database Migrations** - Track schema changes
9. **API Documentation** - OpenAPI/Swagger spec
10. **Integration Tests** - Automated endpoint testing

---

## Implementation Plan

1. ✅ Fix livestreams schema mismatch
2. ✅ Fix messages schema mismatch
3. ✅ Fix favorites SQL parameters
4. ⏳ Fix conversations schema mismatch (IN PROGRESS)
5. ⏳ Create API response interceptor
6. ⏳ Audit and fix all remaining SQL queries
7. ⏳ Test all endpoints systematically
8. ⏳ Document everything

---

## Testing Checklist

After fixes:
- [ ] Chat conversations load
- [ ] Livestreams load
- [ ] Favorites load
- [ ] Wallet displays balance
- [ ] Settings page loads
- [ ] Profile page loads
- [ ] Admin dashboard accessible
- [ ] Image uploads work
- [ ] All routes respond (no 404s)
- [ ] No JavaScript errors in console
