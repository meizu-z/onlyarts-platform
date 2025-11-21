const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const socketIo = require('socket.io');
require('dotenv').config();

const { pool, query } = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const notFound = require('./src/middleware/notFound');
const { verifyEmailConfig } = require('./src/config/email');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests from any localhost port or from the configured FRONTEND_URL
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

// Security headers with CORS-friendly configuration for images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from any localhost port or from the configured FRONTEND_URL
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies
  })
);

// Webhook routes (MUST come before body parser for raw body)
app.use('/api/webhooks', require('./src/routes/webhookRoutes'));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files (uploaded images)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// HEALTH CHECK ROUTE
// ==========================================

app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const result = await query('SELECT NOW() as now');
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: result.rows[0].now,
      environment: process.env.NODE_ENV,
      database: 'MySQL',
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

// Auth routes
app.use('/api/auth', require('./src/routes/authRoutes'));

// User routes
app.use('/api/users', require('./src/routes/userRoutes'));

// Artwork routes
app.use('/api/artworks', require('./src/routes/artworkRoutes'));

// Upload routes
app.use('/api/upload', require('./src/routes/uploadRoutes'));

// Cart routes
app.use('/api/cart', require('./src/routes/cartRoutes'));

// Order routes
app.use('/api/orders', require('./src/routes/orderRoutes'));

// Payment routes
app.use('/api/payments', require('./src/routes/paymentRoutes'));

// Notification routes
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

// Admin routes
app.use('/api/admin', require('./src/routes/adminRoutes'));

// Commission routes
app.use('/api/commissions', require('./src/routes/commissionRoutes'));

// Subscription routes
app.use('/api/subscriptions', require('./src/routes/subscriptionRoutes'));

// Exhibition routes
app.use('/api/exhibitions', require('./src/routes/exhibitionRoutes'));

// Livestream routes
app.use('/api/livestreams', require('./src/routes/livestreamRoutes'));

// Chat routes
app.use('/api/chat', require('./src/routes/chatRoutes'));

// Consultation routes
app.use('/api/consultations', require('./src/routes/consultationRoutes'));

// Settings routes
app.use('/api/settings', require('./src/routes/settingsRoutes'));

// Wallet routes
app.use('/api/wallet', require('./src/routes/walletRoutes'));

// Favorites routes
app.use('/api/favorites', require('./src/routes/favoriteRoutes'));

// ==========================================
// SOCKET.IO SETUP
// ==========================================

// Make io accessible to routes
app.set('io', io);

// Socket.io connection handler
require('./src/sockets/chatSocket')(io);
require('./src/sockets/livestreamSocket')(io);

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
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connection established');
    connection.release();

    // Verify email configuration (non-blocking)
    await verifyEmailConfig();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`💾 Database: MySQL`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`💬 WebSocket: Enabled`);
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
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
