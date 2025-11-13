# OnlyArts API Documentation

Base URL: `http://localhost:5000/api`

---

## 🔐 Authentication Endpoints

All authentication endpoints return both an **access token** (15 min expiry) and a **refresh token** (7 day expiry).

### Register New User

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "newartist",
  "email": "newartist@example.com",
  "password": "Password123",
  "fullName": "John Doe",
  "role": "artist"  // Optional: "user" or "artist" (default: "user")
}
```

**Validation Rules:**
- `username`: 3-50 characters, alphanumeric + underscores only
- `email`: Valid email format
- `password`: Min 8 characters, must contain uppercase, lowercase, and number
- `fullName`: Optional, max 100 characters
- `role`: Optional, either "user" or "artist"

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 6,
      "username": "newartist",
      "email": "newartist@example.com",
      "full_name": "John Doe",
      "role": "artist",
      "subscription_tier": "free",
      "created_at": "2025-11-05T01:33:58.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `409`: User with email or username already exists

---

### Login

**POST** `/auth/login`

Authenticate existing user.

**Request Body:**
```json
{
  "email": "artist@onlyarts.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "artmaster",
      "email": "artist@onlyarts.com",
      "full_name": "Sarah Martinez",
      "profile_image": null,
      "role": "artist",
      "subscription_tier": "premium",
      "wallet_balance": "0.00",
      "follower_count": 4,
      "following_count": 2,
      "artwork_count": 3
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Invalid email or password
- `403`: Account has been deactivated

---

### Refresh Token

**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400`: Refresh token is required
- `401`: Invalid or expired refresh token

---

### Get Current User

**GET** `/auth/me`

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "id": 1,
    "username": "artmaster",
    "email": "artist@onlyarts.com",
    "full_name": "Sarah Martinez",
    "bio": "Contemporary artist specializing in abstract paintings",
    "profile_image": null,
    "cover_image": null,
    "role": "artist",
    "subscription_tier": "premium",
    "wallet_balance": "0.00",
    "total_earnings": "0.00",
    "follower_count": 4,
    "following_count": 2,
    "artwork_count": 3,
    "created_at": "2025-11-05T01:28:15.000Z"
  }
}
```

**Error Responses:**
- `401`: Access token is required / Invalid token / Token expired
- `404`: User not found

---

### Logout

**POST** `/auth/logout`

Revoke refresh token (logout user).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

**Error Responses:**
- `400`: Refresh token is required
- `401`: Authentication required

---

## 🔒 Authentication Middleware

### Protected Routes

To access protected routes, include the access token in the Authorization header:

```
Authorization: Bearer <accessToken>
```

### Middleware Functions

**1. `authenticate`** - Require valid access token
```javascript
// Usage in routes
router.get('/protected', authenticate, controller.method);
```

**2. `requireRole(...roles)`** - Require specific role(s)
```javascript
// Admin only
router.delete('/users/:id', authenticate, requireRole('admin'), controller.deleteUser);

// Artists only
router.post('/artworks', authenticate, requireRole('artist'), controller.createArtwork);

// Multiple roles
router.get('/dashboard', authenticate, requireRole('admin', 'artist'), controller.dashboard);
```

**3. `optionalAuth`** - Optional authentication (doesn't fail if no token)
```javascript
// Works for both authenticated and anonymous users
router.get('/artworks', optionalAuth, controller.listArtworks);
```

---

## 📊 Common Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Development Error (includes stack trace)
```json
{
  "success": false,
  "message": "Error description",
  "stack": "Error stack trace..."
}
```

---

## 🧪 Testing with cURL

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123",
    "fullName": "Test User",
    "role": "artist"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artist@onlyarts.com",
    "password": "password123"
  }'
```

### Get current user (replace TOKEN with actual access token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Refresh token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "REFRESH_TOKEN_HERE"
  }'
```

### Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "REFRESH_TOKEN_HERE"
  }'
```

---

## 🔑 JWT Token Details

### Access Token
- **Expiry**: 15 minutes
- **Usage**: Include in Authorization header for all protected endpoints
- **Storage**: Store in memory (not localStorage for security)
- **Refresh**: Use refresh token to get new access token before expiry

### Refresh Token
- **Expiry**: 7 days
- **Usage**: Send to `/auth/refresh` to get new access token
- **Storage**: Store securely (httpOnly cookie recommended in production)
- **Revocation**: Revoked on logout, stored in database

---

## 🔐 Security Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Token Storage**:
   - Access tokens: Memory/state (not localStorage)
   - Refresh tokens: httpOnly cookies or secure storage
3. **Password Requirements**:
   - Minimum 8 characters
   - Must contain uppercase, lowercase, and number
4. **Rate Limiting**: Implement rate limiting on login/register endpoints (TODO)
5. **CORS**: Configured to only allow requests from frontend URL

---

## 📝 Environment Variables

Required in `.env` file:

```env
# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server
PORT=5000
FRONTEND_URL=http://localhost:5173
```

---

## 🧪 Test Accounts (from seed data)

All test accounts use password: `password123`

| Email | Username | Role | Subscription |
|-------|----------|------|--------------|
| artist@onlyarts.com | artmaster | artist | premium |
| photo@onlyarts.com | photogeek | artist | basic |
| sculptor@onlyarts.com | sculptor_pro | artist | professional |
| buyer@onlyarts.com | collector123 | user | free |
| lover@onlyarts.com | artlover | user | basic |

---

## 🚀 Next Steps

**Coming in Day 4-7:**
- User management endpoints (GET, UPDATE, DELETE users)
- Artwork CRUD endpoints
- Follow/Unfollow endpoints
- Like/Unlike endpoints
- Comment endpoints
- Cart management endpoints
- Order management endpoints
- Search and filtering
- File upload with Cloudinary
- Real-time features

---

## 📞 Support

For issues or questions, refer to:
- [DATABASE.md](./DATABASE.md) - Database schema documentation
- [README.md](./README.md) - General setup and overview
