const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool with optimized settings for production
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Connection pool settings
  waitForConnections: true,           // Wait for available connection instead of erroring
  connectionLimit: 50,                 // Max 50 concurrent connections (up from 10)
  queueLimit: 0,                       // No limit on queued connection requests

  // Connection lifecycle settings
  idleTimeout: 60000,                  // Close idle connections after 60 seconds
  connectTimeout: 10000,               // Timeout after 10s when establishing connection
  maxIdle: 10,                          // Max number of idle connections to maintain

  // Keep-alive settings (prevents connection drops)
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,        // Send first keep-alive after 10 seconds

  // Character encoding
  charset: 'utf8mb4',                  // Full Unicode support (emojis, special chars)
});

// Test connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL database');
    console.log(`📊 Pool configured with ${pool.pool.config.connectionLimit} max connections`);
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1); // Exit if database connection fails
  });

// Monitor pool health every 30 seconds (only in development)
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    const connections = pool.pool._allConnections.length;
    const free = pool.pool._freeConnections.length;
    const queued = pool.pool._connectionQueue.length;
    console.log(`[DB Pool] Total: ${connections} | Free: ${free} | In Use: ${connections - free} | Queued: ${queued}`);
  }, 30000);
}

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('\n🔄 Closing database connection pool...');
  await pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});

// Query helper function
const query = async (sql, params) => {
  const [rows] = await pool.execute(sql, params);
  return { rows };
};

module.exports = {
  pool,
  query,
};
