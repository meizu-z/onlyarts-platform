# Migration Example: LoginPage & RegisterPage

This document shows exactly what was changed to migrate the LoginPage and RegisterPage from mock/demo authentication to the new API infrastructure.

## 🎯 Summary of Changes

1. **AuthContext** - Updated to support both demo mode and real API calls
2. **LoginPage** - Changed synchronous login to async with proper error handling
3. **RegisterPage** - Changed synchronous register to async with proper error handling

---

## 📝 AuthContext Migration

### File: `src/context/AuthContext.jsx`

#### ✅ What Was Added:

1. **Import API services**
```javascript
import { authService } from '../services';
import { API_CONFIG } from '../config/api.config';
```

2. **Demo mode flag** - Easy to switch between demo and real API
```javascript
const USE_DEMO_MODE = true; // Set to false when backend is ready
```

3. **Token management** in initialization
```javascript
const token = localStorage.getItem(API_CONFIG.tokenKey);
// Check both user data AND token
if (storedUser && token) {
  // ... authenticate
}
```

#### ✅ What Was Changed:

**BEFORE (Mock Login):**
```javascript
const login = (username, password) => {
  // Check demo credentials
  if (username === DEMO_USERS.premium.username && password === DEMO_USERS.premium.password) {
    const userData = { ...DEMO_USERS.premium };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('onlyarts_user', JSON.stringify(userData));
    return { success: true, user: userData };
  }

  return { success: false, error: 'Invalid credentials. Try mz123 / 12345' };
};
```

**AFTER (API-Ready with Demo Fallback):**
```javascript
const login = async (username, password) => {
  try {
    // DEMO MODE: Check demo credentials
    if (USE_DEMO_MODE) {
      if (username === DEMO_USERS.premium.username && password === DEMO_USERS.premium.password) {
        const userData = { ...DEMO_USERS.premium };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('onlyarts_user', JSON.stringify(userData));
        // Store demo token
        localStorage.setItem(API_CONFIG.tokenKey, 'demo-token');
        return { success: true, user: userData };
      }
      return { success: false, error: 'Invalid credentials. Try mz123 / 12345' };
    }

    // REAL API MODE: Call backend
    const response = await authService.login(username, password);
    const { user: userData, token, refreshToken } = response;

    // Store user data and tokens
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('onlyarts_user', JSON.stringify(userData));
    localStorage.setItem(API_CONFIG.tokenKey, token);
    if (refreshToken) {
      localStorage.setItem(API_CONFIG.refreshTokenKey, refreshToken);
    }

    return { success: true, user: userData };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'Login failed. Please try again.'
    };
  }
};
```

**Key Changes:**
1. ✅ Function is now `async`
2. ✅ Wrapped in try-catch for error handling
3. ✅ Stores JWT tokens in localStorage
4. ✅ Calls `authService.login()` when not in demo mode
5. ✅ Returns consistent error format

**Same pattern applied to `register()` and `logout()`**

---

## 📝 LoginPage Migration

### File: `src/pages/LoginPage.jsx`

#### ✅ What Was Changed:

**BEFORE:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateAll()) {
    toast.error('Please fill in all fields');
    return;
  }

  setIsLoading(true);

  const result = login(values.username, values.password);

  setTimeout(() => {
    if (result.success) {
      toast.success('Login successful! Welcome back 🎨');
      setTimeout(() => navigate('/dashboard'), 500);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, 500);
};
```

**AFTER:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateAll()) {
    toast.error('Please fill in all fields');
    return;
  }

  setIsLoading(true);

  try {
    const result = await login(values.username, values.password);

    if (result.success) {
      toast.success('Login successful! Welcome back 🎨');
      setTimeout(() => navigate('/dashboard'), 500);
    } else {
      toast.error(result.error);
    }
  } catch (error) {
    toast.error('An unexpected error occurred. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

**Key Changes:**
1. ✅ Added `await` before `login()` call
2. ✅ Wrapped in try-catch block
3. ✅ Removed artificial `setTimeout` delay
4. ✅ Proper error handling with catch block
5. ✅ Used `finally` to ensure loading state is cleared

---

## 📝 RegisterPage Migration

### File: `src/pages/RegisterPage.jsx`

#### ✅ What Was Changed:

**BEFORE:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = validateForm();

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setIsLoading(true);

  setTimeout(() => {
    const result = register({
      email: formData.email,
      username: formData.username,
      displayName: formData.username,
    });

    if (result.success) {
      navigate('/dashboard');
    }
    setIsLoading(false);
  }, 500);
};
```

**AFTER:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = validateForm();

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setIsLoading(true);

  try {
    const result = await register({
      email: formData.email,
      username: formData.username,
      password: formData.password,
      displayName: formData.username,
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ general: result.error });
    }
  } catch (error) {
    setErrors({ general: 'Registration failed. Please try again.' });
  } finally {
    setIsLoading(false);
  }
};
```

**Key Changes:**
1. ✅ Added `await` before `register()` call
2. ✅ Added `password` to registration data
3. ✅ Wrapped in try-catch block
4. ✅ Removed artificial `setTimeout` delay
5. ✅ Added error state management
6. ✅ Used `finally` to ensure loading state is cleared

---

## 🔄 How to Switch from Demo to Real API

When your backend is ready, make this **ONE CHANGE** in `AuthContext.jsx`:

```javascript
// Change this line from:
const USE_DEMO_MODE = true;

// To:
const USE_DEMO_MODE = false;
```

That's it! The entire app will now use real API calls.

---

## 🎓 Pattern to Follow for Other Pages

Use this same pattern for migrating any page that makes API calls:

### Step 1: Add try-catch-finally

```javascript
// BEFORE
const handleAction = () => {
  const result = someFunction();
  if (result.success) {
    // success handling
  }
};

// AFTER
const handleAction = async () => {
  setLoading(true);
  try {
    const result = await someApiCall();
    if (result.success) {
      // success handling
    } else {
      // error handling
    }
  } catch (error) {
    // unexpected error handling
    toast.error('An error occurred');
  } finally {
    setLoading(false);
  }
};
```

### Step 2: Use API services

```javascript
import { artworkService } from '../services';

// Instead of mock data:
const artworks = mockArtworks;

// Use:
const artworks = await artworkService.getArtworks();
```

### Step 3: Or use the useApi hook

```javascript
import { useApi } from '../hooks/useApi';
import { artworkService } from '../services';

const { data: artworks, loading, error, execute } = useApi(
  artworkService.getArtworks,
  {
    showSuccessToast: false,
    showErrorToast: true,
  }
);

// Call when needed
await execute({ page: 1, limit: 10 });
```

---

## 📊 Migration Checklist

When migrating a page, check off these items:

- [ ] Import required services from `'../services'`
- [ ] Change function to `async` if calling API
- [ ] Add `await` before API calls
- [ ] Wrap API calls in try-catch-finally
- [ ] Handle loading state properly
- [ ] Handle error state properly
- [ ] Remove artificial delays (`setTimeout`)
- [ ] Remove mock data
- [ ] Test both success and error scenarios

---

## 🚀 Next Pages to Migrate

**High Priority:**
1. ✅ LoginPage - DONE
2. ✅ RegisterPage - DONE
3. Dashboard - Use `artworkService.getArtworks()`
4. ProfilePage - Use `userService.getProfile()`
5. SettingsPage - Use `userService.updateProfile()`, `userService.changePassword()`

**Medium Priority:**
6. ExplorePage - Use `exhibitionService.getExhibitions()`
7. ArtworkPage - Use `artworkService.getArtwork()`, `artworkService.addComment()`
8. FavoritesPage - Use favorites API
9. ChatPage - Use chat API
10. CartPage - Use cart API

---

## 💡 Tips

1. **Start with read-only pages** (Dashboard, Explore) before forms
2. **Test in demo mode first** to ensure logic works
3. **Use browser DevTools Network tab** to see API calls when demo mode is off
4. **Check console for errors** during development
5. **Use the useApi hook** for simpler components

---

## 🎉 Benefits After Migration

✅ Ready for backend integration (just flip the demo mode flag)
✅ Proper error handling throughout the app
✅ Loading states work correctly
✅ Token-based authentication
✅ Automatic token refresh
✅ Consistent patterns across all pages

---

## 📞 Need Help?

Refer to:
- `API_IMPLEMENTATION_GUIDE.md` - Full API documentation
- `src/services/` - Available API services
- `src/hooks/useApi.js` - React hook usage

Happy migrating! 🎨
