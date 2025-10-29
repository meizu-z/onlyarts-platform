# Day 3: Authentication System

**Goal:** Complete JWT-based authentication with register, login, refresh tokens, and logout

**Time Estimate:** 4-5 hours

---

## Overview

Today you'll build a secure authentication system matching your frontend's [auth.service.js](src/services/auth.service.js) expectations.

**Features to Implement:**
- User registration with password hashing
- Login with access + refresh tokens
- Token refresh mechanism
- Logout functionality
- Auth middleware for protected routes
- Input validation

---

## Step 1: Create Authentication Utilities (30 min)

Create `backend/src/utils/token.js`:

```javascript
const jwt = require('jsonwebtoken');

/**
 * Generate JWT access token (short-lived: 15min)
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
};

/**
 * Generate JWT refresh token (long-lived: 7 days)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

/**
 * Generate token pair (access + refresh)
 */
const generateTokenPair = (userId) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
};
```

Create `backend/src/utils/password.js`:

```javascript
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
};
```

---

## Step 2: Create User Model (30 min)

Create `backend/src/models/user.model.js`:

```javascript
const { query } = require('../config/database');
const { hashPassword } = require('../utils/password');

/**
 * Create new user
 */
const createUser = async ({ username, email, password, fullName, role = 'user' }) => {
  const passwordHash = await hashPassword(password);

  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, username, email, full_name, role, subscription_tier, is_premium,
               profile_picture, bio, created_at`,
    [username, email, passwordHash, fullName, role]
  );

  return result.rows[0];
};

/**
 * Find user by email
 */
const findByEmail = async (email) => {
  const result = await query(
    `SELECT id, username, email, password_hash, full_name, role, subscription_tier,
            is_premium, profile_picture, cover_image, bio, balance, total_earnings,
            followers_count, following_count, artworks_count, hourly_rate,
            is_verified, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0];
};

/**
 * Find user by username
 */
const findByUsername = async (username) => {
  const result = await query(
    `SELECT id, username, email, password_hash, full_name, role, subscription_tier,
            is_premium, profile_picture, cover_image, bio, balance, total_earnings,
            followers_count, following_count, artworks_count, hourly_rate,
            is_verified, created_at
     FROM users
     WHERE username = $1`,
    [username]
  );

  return result.rows[0];
};

/**
 * Find user by ID (without password hash)
 */
const findById = async (userId) => {
  const result = await query(
    `SELECT id, username, email, full_name, role, subscription_tier,
            is_premium, profile_picture, cover_image, bio, balance, total_earnings,
            followers_count, following_count, artworks_count, hourly_rate,
            is_verified, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [userId]
  );

  return result.rows[0];
};

/**
 * Update last login timestamp
 */
const updateLastLogin = async (userId) => {
  await query(
    `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [userId]
  );
};

/**
 * Check if email exists
 */
const emailExists = async (email) => {
  const result = await query(
    `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`,
    [email]
  );
  return result.rows[0].exists;
};

/**
 * Check if username exists
 */
const usernameExists = async (username) => {
  const result = await query(
    `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)`,
    [username]
  );
  return result.rows[0].exists;
};

module.exports = {
  createUser,
  findByEmail,
  findByUsername,
  findById,
  updateLastLogin,
  emailExists,
  usernameExists,
};
```

---

## Step 3: Create Auth Controller (45 min)

Create `backend/src/controllers/auth.controller.js`:

```javascript
const { body, validationResult } = require('express-validator');
const UserModel = require('../models/user.model');
const { comparePassword } = require('../utils/password');
const { generateTokenPair, verifyRefreshToken } = require('../utils/token');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Register new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }

  const { username, email, password, fullName, role } = req.body;

  // Check if user already exists
  const emailExists = await UserModel.emailExists(email);
  if (emailExists) {
    return errorResponse(res, 'Email already registered', 409);
  }

  const usernameExists = await UserModel.usernameExists(username);
  if (usernameExists) {
    return errorResponse(res, 'Username already taken', 409);
  }

  // Create user
  const user = await UserModel.createUser({
    username,
    email,
    password,
    fullName,
    role: role || 'user',
  });

  // Generate tokens
  const tokens = generateTokenPair(user.id);

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Remove password hash from response
  delete user.password_hash;

  successResponse(
    res,
    {
      user,
      accessToken: tokens.accessToken,
    },
    'Registration successful',
    201
  );
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await UserModel.findByEmail(email);
  if (!user) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  // Update last login
  await UserModel.updateLastLogin(user.id);

  // Generate tokens
  const tokens = generateTokenPair(user.id);

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Remove password hash from response
  delete user.password_hash;

  successResponse(res, {
    user,
    accessToken: tokens.accessToken,
  }, 'Login successful');
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return errorResponse(res, 'Refresh token not found', 401);
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    res.clearCookie('refreshToken');
    return errorResponse(res, 'Invalid or expired refresh token', 401);
  }

  // Get user
  const user = await UserModel.findById(decoded.userId);
  if (!user) {
    res.clearCookie('refreshToken');
    return errorResponse(res, 'User not found', 404);
  }

  // Generate new token pair
  const tokens = generateTokenPair(user.id);

  // Update refresh token cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  successResponse(res, {
    user,
    accessToken: tokens.accessToken,
  }, 'Token refreshed successfully');
});

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  successResponse(res, null, 'Logout successful');
});

/**
 * Get current user
 * GET /api/auth/me
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  // User is already attached by auth middleware
  const user = await UserModel.findById(req.user.userId);

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  successResponse(res, { user }, 'User retrieved successfully');
});

// Validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('fullName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Full name must be max 100 characters'),
  body('role')
    .optional()
    .isIn(['user', 'artist', 'admin'])
    .withMessage('Invalid role'),
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
  registerValidation,
  loginValidation,
};
```

---

## Step 4: Create Auth Middleware (30 min)

Create `backend/src/middleware/auth.js`:

```javascript
const { verifyAccessToken } = require('../utils/token');
const { errorResponse } = require('../utils/response');

/**
 * Middleware to verify JWT access token
 * Attaches user data to req.user
 */
const authenticate = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Access token required', 401);
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user data to request
    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Access token expired', 401);
    }
    return errorResponse(res, 'Invalid access token', 401);
  }
};

/**
 * Middleware to check if user has specific role
 * Must be used after authenticate middleware
 */
const authorize = (...roles) => {
  return async (req, res, next) => {
    const UserModel = require('../models/user.model');

    try {
      const user = await UserModel.findById(req.user.userId);

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      if (!roles.includes(user.role)) {
        return errorResponse(
          res,
          'You do not have permission to perform this action',
          403
        );
      }

      // Attach full user to request
      req.user.role = user.role;
      req.user.userData = user;

      next();
    } catch (error) {
      return errorResponse(res, 'Authorization failed', 500);
    }
  };
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work differently for logged in users
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // No token, continue without user
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      userId: decoded.userId,
    };
  } catch (error) {
    // Invalid token, but don't fail - just continue without user
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
};
```

---

## Step 5: Create Auth Routes (20 min)

Create `backend/src/routes/auth.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  authController.registerValidation,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authController.loginValidation,
  authController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear refresh token)
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
```

---

## Step 6: Connect Routes to Server (10 min)

Update `backend/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { pool } = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const notFound = require('./src/middleware/notFound');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ==========================================
// HEALTH CHECK ROUTE
// ==========================================

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: result.rows[0].now,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// ==========================================
// API ROUTES
// ==========================================

app.use('/api/auth', require('./src/routes/auth.routes'));

// TODO: Add more routes
// app.use('/api/users', require('./src/routes/user.routes'));
// app.use('/api/artworks', require('./src/routes/artwork.routes'));
// app.use('/api/cart', require('./src/routes/cart.routes'));

// ==========================================
// ERROR HANDLING
// ==========================================

app.use(notFound);
app.use(errorHandler);

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});
```

---

## Step 7: Test Authentication Endpoints (30 min)

Start the server:

```bash
cd backend
npm run dev
```

### Test 1: Register New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "role": "artist"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "username": "testuser",
      "email": "test@example.com",
      "full_name": "Test User",
      "role": "artist",
      "subscription_tier": "free",
      "is_premium": false,
      ...
    },
    "accessToken": "jwt-token-here"
  }
}
```

### Test 2: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected: Same response structure as register, with `refreshToken` in cookie.

### Test 3: Get Current User (Protected Route)

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

Replace `YOUR_ACCESS_TOKEN_HERE` with the token from login response.

Expected: User data returned.

### Test 4: Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

Expected: New access token returned.

### Test 5: Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

Expected:
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

## Step 8: Create Postman/Thunder Client Collection (20 min)

Create `backend/auth-tests.http` (for REST Client extension):

```http
### Variables
@baseUrl = http://localhost:5000/api
@accessToken = your-token-here

### Register new user
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "user"
}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

### Get current user (protected)
GET {{baseUrl}}/auth/me
Authorization: Bearer {{accessToken}}

### Refresh token
POST {{baseUrl}}/auth/refresh

### Logout
POST {{baseUrl}}/auth/logout

### Test validation - Missing email
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}

### Test validation - Weak password
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123"
}

### Test validation - Invalid email
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "not-an-email",
  "password": "password123"
}
```

---

## Step 9: Update Frontend Connection (30 min)

Update [src/services/api.client.js](src/services/api.client.js):

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Changed from mock to real backend
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Add request interceptor to attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        // Save new access token
        localStorage.setItem('accessToken', data.data.accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

Update [src/services/auth.service.js](src/services/auth.service.js):

Change `USE_DEMO_MODE` to `false`:

```javascript
const USE_DEMO_MODE = false; // Changed from true to false
```

The service will now use real API calls instead of mock data.

---

## ✅ Day 3 Completion Checklist

- [ ] Token utility functions created
- [ ] Password hashing utility created
- [ ] User model with CRUD operations created
- [ ] Auth controller with register, login, refresh, logout created
- [ ] Input validation rules added
- [ ] Auth middleware created (authenticate, authorize, optionalAuth)
- [ ] Auth routes defined
- [ ] Routes connected to server.js
- [ ] Server starts successfully
- [ ] Registration endpoint tested
- [ ] Login endpoint tested
- [ ] Protected route tested (GET /api/auth/me)
- [ ] Token refresh tested
- [ ] Logout tested
- [ ] Validation errors tested
- [ ] Postman/HTTP collection created
- [ ] Frontend api.client.js updated
- [ ] Frontend auth.service.js connected to backend
- [ ] Token interceptors working

---

## 🎯 Expected Outcome

By end of Day 3, you should have:

1. ✅ Complete authentication system with JWT
2. ✅ Secure password hashing with bcrypt
3. ✅ Access + refresh token mechanism
4. ✅ Protected route middleware
5. ✅ Input validation on all auth endpoints
6. ✅ Frontend connected to backend auth
7. ✅ Users can register, login, and access protected routes

---

## 🐛 Troubleshooting

### "jwt malformed" error
- Check token format in Authorization header: `Bearer TOKEN`
- Verify token is being sent correctly from frontend

### "Invalid credentials" always returns
- Check password is being hashed correctly
- Verify bcrypt.compare() is working
- Check database has password_hash field populated

### Refresh token not working
- Verify cookies are enabled in CORS config (`credentials: true`)
- Check frontend axios has `withCredentials: true`
- Ensure cookie is httpOnly and sameSite configured

### CORS errors when calling from frontend
- Check FRONTEND_URL in `.env` matches your React dev server
- Verify CORS middleware configured correctly
- Check browser console for specific CORS error

---

## 📝 Git Commit

```bash
git add backend/src/utils/token.js backend/src/utils/password.js backend/src/models/user.model.js backend/src/controllers/auth.controller.js backend/src/middleware/auth.js backend/src/routes/auth.routes.js backend/server.js backend/auth-tests.http src/services/api.client.js src/services/auth.service.js
git commit -m "feat: Day 3 - Complete authentication system with JWT

- Implement user registration with password hashing
- Add login with access + refresh tokens
- Create token refresh mechanism
- Add logout functionality
- Implement auth middleware for protected routes
- Add input validation with express-validator
- Update frontend to connect to real backend API
- Add automatic token refresh interceptor

Endpoints:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/me

🤖 Generated with Claude Code"
```

---

## 🚀 Next: Day 4

Tomorrow you'll implement user management endpoints:
- Get user profile by username
- Update user profile
- Follow/unfollow users
- Get followers/following lists
- User search functionality
