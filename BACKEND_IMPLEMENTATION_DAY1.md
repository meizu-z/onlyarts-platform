# Day 1: Project Setup & Architecture

**Goal:** Initialize backend project with proper structure and working Express server

**Time Estimate:** 3-4 hours

---

## Step 1: Create Backend Folder Structure (15 min)

Open terminal in your project root and run:

```bash
mkdir backend
cd backend
```

Create the complete folder structure:

```bash
mkdir -p src/config src/controllers src/middleware src/models src/routes src/services src/utils
```

Your structure should look like:
```
onlyarts-platform/
├── src/                  (React frontend - existing)
├── backend/             (NEW)
│   └── src/
│       ├── config/      (Database, environment config)
│       ├── controllers/ (Request handlers)
│       ├── middleware/  (Auth, validation, error handling)
│       ├── models/      (Database models)
│       ├── routes/      (API route definitions)
│       ├── services/    (Business logic)
│       └── utils/       (Helper functions)
└── package.json         (Frontend package.json - existing)
```

---

## Step 2: Initialize Node.js Project (10 min)

In the `backend/` folder, run:

```bash
npm init -y
```

This creates `backend/package.json`.

---

## Step 3: Install Core Dependencies (10 min)

Install all required packages:

```bash
npm install express pg cors helmet dotenv morgan express-validator bcrypt jsonwebtoken cookie-parser
```

Install dev dependencies:

```bash
npm install --save-dev nodemon
```

**Package Explanations:**
- `express` - Web framework
- `pg` - PostgreSQL client
- `cors` - Enable Cross-Origin Resource Sharing
- `helmet` - Security headers
- `dotenv` - Environment variables
- `morgan` - Request logging
- `express-validator` - Input validation
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens
- `cookie-parser` - Parse cookies
- `nodemon` - Auto-restart server on file changes

---

## Step 4: Create Environment Configuration (10 min)

Create `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/onlyarts
DB_HOST=localhost
DB_PORT=5432
DB_NAME=onlyarts
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Cloudinary (for later)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Stripe (for later)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email (for later)
RESEND_API_KEY=
```

Create `backend/.env.example` (same as above but with placeholder values):

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/onlyarts
DB_HOST=localhost
DB_PORT=5432
DB_NAME=onlyarts
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_ACCESS_SECRET=change-me-to-random-string
JWT_REFRESH_SECRET=change-me-to-random-string
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Email
RESEND_API_KEY=your-resend-key
```

**IMPORTANT:** Add to `backend/.gitignore`:

```
node_modules/
.env
.DS_Store
*.log
```

---

## Step 5: Database Configuration (15 min)

Create `backend/src/config/database.js`:

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Query helper
const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query,
};
```

---

## Step 6: Basic Middleware Setup (20 min)

Create `backend/src/middleware/errorHandler.js`:

```javascript
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        statusCode = 409;
        message = 'Resource already exists';
        break;
      case '23503': // Foreign key violation
        statusCode = 400;
        message = 'Referenced resource does not exist';
        break;
      case '22P02': // Invalid text representation
        statusCode = 400;
        message = 'Invalid data format';
        break;
      default:
        statusCode = 500;
        message = 'Database error';
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
```

Create `backend/src/middleware/notFound.js`:

```javascript
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

module.exports = notFound;
```

---

## Step 7: Create Main Server File (30 min)

Create `backend/server.js`:

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

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // Allow cookies
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ==========================================
// HEALTH CHECK ROUTE
// ==========================================

app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
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
// API ROUTES (will be added in coming days)
// ==========================================

// TODO: Add routes here
// app.use('/api/auth', require('./src/routes/auth.routes'));
// app.use('/api/users', require('./src/routes/user.routes'));
// app.use('/api/artworks', require('./src/routes/artwork.routes'));
// app.use('/api/cart', require('./src/routes/cart.routes'));

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler (must be after all routes)
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    // Test database connection
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

// Graceful shutdown
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

## Step 8: Update package.json Scripts (5 min)

Edit `backend/package.json` and add these scripts:

```json
{
  "name": "onlyarts-backend",
  "version": "1.0.0",
  "description": "OnlyArts platform backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["art", "marketplace", "api"],
  "author": "",
  "license": "ISC"
}
```

---

## Step 9: Setup PostgreSQL Database (20 min)

### Option A: Local PostgreSQL Installation

1. **Install PostgreSQL:**
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Start PostgreSQL service:**
   - Windows: Should auto-start, or use Services app
   - Mac: `brew services start postgresql`
   - Linux: `sudo service postgresql start`

3. **Create database:**

```bash
# Access PostgreSQL
psql -U postgres

# In psql shell, run:
CREATE DATABASE onlyarts;
\q
```

4. **Update `.env` with your PostgreSQL credentials**

### Option B: Railway PostgreSQL (Recommended for quick setup)

1. Go to https://railway.app/
2. Sign up/login
3. Create new project → Add PostgreSQL
4. Copy the connection string from Railway
5. Update your `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:password@host:port/railway
```

---

## Step 10: Test the Server (15 min)

1. **Start the server:**

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connection established
🚀 Server running on http://localhost:5000
📝 Environment: development
🔗 Health check: http://localhost:5000/api/health
```

2. **Test health check endpoint:**

Open browser or use curl:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-29T...",
  "environment": "development"
}
```

3. **Test 404 handler:**

```bash
curl http://localhost:5000/api/nonexistent
```

Expected response:
```json
{
  "success": false,
  "message": "Route /api/nonexistent not found"
}
```

---

## Step 11: Create Utility Functions (20 min)

Create `backend/src/utils/asyncHandler.js`:

```javascript
/**
 * Wraps async route handlers to catch errors
 * Usage: asyncHandler(async (req, res) => { ... })
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
```

Create `backend/src/utils/AppError.js`:

```javascript
/**
 * Custom error class for application errors
 * Usage: throw new AppError('User not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
```

Create `backend/src/utils/response.js`:

```javascript
/**
 * Standardized API response formats
 */

const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};
```

---

## Step 12: Create README for Backend (10 min)

Create `backend/README.md`:

```markdown
# OnlyArts Backend API

Node.js + Express backend for OnlyArts art marketplace platform.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT
- **File Storage:** Cloudinary
- **Payments:** Stripe
- **Email:** Resend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

3. Setup PostgreSQL database and update `.env` with credentials

4. Run migrations (coming in Day 2):
   ```bash
   npm run migrate
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Server health and database status

### Authentication (Coming Day 3)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Users (Coming Day 4)
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:userId/follow` - Follow user
- `DELETE /api/users/:userId/follow` - Unfollow user

### Artworks (Coming Day 5)
- `GET /api/artworks` - List artworks
- `GET /api/artworks/:id` - Get artwork
- `POST /api/artworks` - Create artwork
- `PUT /api/artworks/:id` - Update artwork
- `DELETE /api/artworks/:id` - Delete artwork

### Cart (Coming Day 6)
- `GET /api/cart` - Get cart
- `POST /api/cart/items` - Add to cart
- `PUT /api/cart/items/:id` - Update quantity
- `DELETE /api/cart/items/:id` - Remove item

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── utils/          # Helper functions
├── .env                # Environment variables
├── .env.example        # Example env file
├── server.js           # Entry point
└── package.json        # Dependencies
```

## Development

- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

## Environment Variables

See `.env.example` for all required variables.
```

---

## ✅ Day 1 Completion Checklist

- [ ] Backend folder structure created
- [ ] Node.js project initialized
- [ ] All dependencies installed
- [ ] `.env` and `.env.example` created
- [ ] `.gitignore` configured
- [ ] Database configuration file created
- [ ] Error handling middleware created
- [ ] Main server file (`server.js`) created
- [ ] Utility functions created
- [ ] `package.json` scripts configured
- [ ] PostgreSQL database created
- [ ] Server starts successfully
- [ ] Health check endpoint returns success
- [ ] 404 handler works correctly
- [ ] Backend README created

---

## 🎯 Expected Outcome

By end of Day 1, you should have:

1. ✅ Complete backend folder structure
2. ✅ Express server running on port 5000
3. ✅ PostgreSQL database connection working
4. ✅ Health check endpoint: `http://localhost:5000/api/health`
5. ✅ Error handling middleware setup
6. ✅ Development environment ready for Day 2

---

## 🐛 Troubleshooting

### Server won't start
- Check if port 5000 is already in use: `netstat -ano | findstr :5000` (Windows)
- Try different port in `.env`: `PORT=5001`

### Database connection failed
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Test connection: `psql -U your_username -d onlyarts`

### Module not found errors
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

---

## 📝 Git Commit

```bash
git add backend/
git commit -m "feat: Day 1 - Initialize backend with Express and PostgreSQL

- Setup backend folder structure
- Configure Express server with middleware
- Setup PostgreSQL connection
- Add error handling and health check endpoint
- Create utility functions for async handlers and responses

🤖 Generated with Claude Code"
```

---

## 🚀 Next: Day 2

Tomorrow you'll create the complete database schema with migrations for:
- Users
- Artworks
- Cart items
- Follows
- Favorites
- And more tables for orders, commissions, etc.
