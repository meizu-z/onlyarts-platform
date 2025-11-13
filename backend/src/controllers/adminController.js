const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get platform statistics for admin dashboard
 * @access  Private (Admin only)
 */
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  // Get total users
  const usersResult = await query('SELECT COUNT(*) as total FROM users WHERE is_active = TRUE');
  const totalUsers = usersResult.rows[0].total;

  // Get total artists
  const artistsResult = await query('SELECT COUNT(*) as total FROM users WHERE role = ? AND is_active = TRUE', ['artist']);
  const totalArtists = artistsResult.rows[0].total;

  // Get total artworks
  const artworksResult = await query('SELECT COUNT(*) as total FROM artworks WHERE status = ?', ['published']);
  const totalArtworks = artworksResult.rows[0].total;

  // Get total orders
  const ordersResult = await query('SELECT COUNT(*) as total FROM orders');
  const totalOrders = ordersResult.rows[0].total;

  // Get total revenue
  const revenueResult = await query('SELECT SUM(total_amount) as revenue FROM orders WHERE payment_status = ?', ['paid']);
  const totalRevenue = parseFloat(revenueResult.rows[0].revenue) || 0;

  // Get pending orders
  const pendingResult = await query('SELECT COUNT(*) as total FROM orders WHERE status = ?', ['pending']);
  const pendingOrders = pendingResult.rows[0].total;

  // Get new users this month
  const monthResult = await query(
    `SELECT COUNT(*) as total FROM users
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND is_active = TRUE`
  );
  const newUsersThisMonth = monthResult.rows[0].total;

  // Get subscription breakdown
  const subsResult = await query(
    `SELECT subscription_tier, COUNT(*) as count
     FROM users
     WHERE is_active = TRUE
     GROUP BY subscription_tier`
  );

  const subscriptions = {
    free: 0,
    plus: 0,
    premium: 0,
  };
  subsResult.rows.forEach(row => {
    subscriptions[row.subscription_tier] = row.count;
  });

  successResponse(res, {
    totalUsers,
    totalArtists,
    totalArtworks,
    totalOrders,
    totalRevenue,
    pendingOrders,
    newUsersThisMonth,
    subscriptions,
  }, 'Dashboard stats retrieved');
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with admin filters
 * @access  Private (Admin only)
 */
exports.getAllUsersAdmin = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const role = req.query.role;
  const subscription = req.query.subscription;
  const status = req.query.status; // 'active' or 'inactive'

  let whereClause = '1=1';
  const params = [];

  if (role) {
    whereClause += ' AND role = ?';
    params.push(role);
  }

  if (subscription) {
    whereClause += ' AND subscription_tier = ?';
    params.push(subscription);
  }

  if (status === 'active') {
    whereClause += ' AND is_active = TRUE';
  } else if (status === 'inactive') {
    whereClause += ' AND is_active = FALSE';
  }

  const usersResult = await query(
    `SELECT id, username, email, full_name, role, subscription_tier,
            is_active, follower_count, following_count, artwork_count,
            created_at, profile_image
     FROM users
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`,
    params
  );

  const total = countResult.rows[0].total;
  const totalPages = Math.ceil(total / limit);

  successResponse(res, {
    users: usersResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }, 'Users retrieved');
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin only)
 */
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'artist', 'admin'].includes(role)) {
    return next(new AppError('Invalid role', 400));
  }

  // Can't change own role
  if (req.user.id === parseInt(id)) {
    return next(new AppError('You cannot change your own role', 400));
  }

  await query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

  successResponse(res, { role }, 'User role updated');
});

/**
 * @route   PUT /api/admin/users/:id/ban
 * @desc    Ban/suspend user
 * @access  Private (Admin only)
 */
exports.banUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Can't ban yourself
  if (req.user.id === parseInt(id)) {
    return next(new AppError('You cannot ban yourself', 400));
  }

  await query('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);

  successResponse(res, null, 'User banned successfully');
});

/**
 * @route   PUT /api/admin/users/:id/unban
 * @desc    Unban user
 * @access  Private (Admin only)
 */
exports.unbanUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await query('UPDATE users SET is_active = TRUE WHERE id = ?', [id]);

  successResponse(res, null, 'User unbanned successfully');
});

/**
 * @route   GET /api/admin/artworks
 * @desc    Get all artworks with admin filters
 * @access  Private (Admin only)
 */
exports.getAllArtworksAdmin = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const status = req.query.status;
  const category = req.query.category;

  let whereClause = '1=1';
  const params = [];

  if (status) {
    whereClause += ' AND a.status = ?';
    params.push(status);
  }

  if (category) {
    whereClause += ' AND a.category = ?';
    params.push(category);
  }

  const artworksResult = await query(
    `SELECT
      a.id, a.title, a.price, a.category, a.status, a.is_for_sale,
      a.stock_quantity, a.like_count, a.view_count, a.created_at,
      u.id as artist_id, u.username as artist_username, u.full_name as artist_name,
      (SELECT media_url FROM artwork_media WHERE artwork_id = a.id AND is_primary = TRUE LIMIT 1) as primary_image
     FROM artworks a
     JOIN users u ON a.artist_id = u.id
     WHERE ${whereClause}
     ORDER BY a.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) as total FROM artworks a WHERE ${whereClause}`,
    params
  );

  const total = countResult.rows[0].total;
  const totalPages = Math.ceil(total / limit);

  successResponse(res, {
    artworks: artworksResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }, 'Artworks retrieved');
});

/**
 * @route   PUT /api/admin/artworks/:id/feature
 * @desc    Feature/unfeature artwork
 * @access  Private (Admin only)
 */
exports.featureArtwork = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { featured } = req.body;

  await query('UPDATE artworks SET is_featured = ? WHERE id = ?', [featured, id]);

  successResponse(res, { featured }, featured ? 'Artwork featured' : 'Artwork unfeatured');
});

/**
 * @route   DELETE /api/admin/artworks/:id
 * @desc    Delete artwork (admin override)
 * @access  Private (Admin only)
 */
exports.deleteArtworkAdmin = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if artwork exists
  const result = await query('SELECT id FROM artworks WHERE id = ?', [id]);
  if (result.rows.length === 0) {
    return next(new AppError('Artwork not found', 404));
  }

  await query('DELETE FROM artworks WHERE id = ?', [id]);

  successResponse(res, null, 'Artwork deleted');
});

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders
 * @access  Private (Admin only)
 */
exports.getAllOrdersAdmin = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const status = req.query.status;
  const paymentStatus = req.query.paymentStatus;

  let whereClause = '1=1';
  const params = [];

  if (status) {
    whereClause += ' AND o.status = ?';
    params.push(status);
  }

  if (paymentStatus) {
    whereClause += ' AND o.payment_status = ?';
    params.push(paymentStatus);
  }

  const ordersResult = await query(
    `SELECT
      o.id, o.order_number, o.user_id, o.total_amount, o.status,
      o.payment_status, o.payment_method, o.created_at,
      u.username as buyer_username, u.full_name as buyer_name, u.email as buyer_email
     FROM orders o
     JOIN users u ON o.user_id = u.id
     WHERE ${whereClause}
     ORDER BY o.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) as total FROM orders o WHERE ${whereClause}`,
    params
  );

  const total = countResult.rows[0].total;
  const totalPages = Math.ceil(total / limit);

  successResponse(res, {
    orders: ordersResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }, 'Orders retrieved');
});

/**
 * @route   GET /api/admin/analytics/revenue
 * @desc    Get revenue analytics
 * @access  Private (Admin only)
 */
exports.getRevenueAnalytics = asyncHandler(async (req, res, next) => {
  const period = req.query.period || '30'; // days

  // Revenue over time
  const revenueResult = await query(
    `SELECT
      DATE(created_at) as date,
      SUM(total_amount) as revenue,
      COUNT(*) as order_count
     FROM orders
     WHERE payment_status = 'paid'
       AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [period]
  );

  // Total revenue
  const totalResult = await query(
    `SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid'`
  );
  const totalRevenue = parseFloat(totalResult.rows[0].total) || 0;

  // Revenue by category
  const categoryResult = await query(
    `SELECT
      a.category,
      SUM(oi.price * oi.quantity) as revenue,
      COUNT(DISTINCT oi.order_id) as order_count
     FROM order_items oi
     JOIN artworks a ON oi.artwork_id = a.id
     JOIN orders o ON oi.order_id = o.id
     WHERE o.payment_status = 'paid'
     GROUP BY a.category
     ORDER BY revenue DESC`
  );

  successResponse(res, {
    revenueOverTime: revenueResult.rows,
    totalRevenue,
    revenueByCategory: categoryResult.rows,
  }, 'Revenue analytics retrieved');
});

/**
 * @route   GET /api/admin/audit-log
 * @desc    Get activity history / audit log
 * @access  Private (Admin only)
 */
exports.getAuditLog = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  const actionType = req.query.action_type;
  const adminId = req.query.admin_id;
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;

  let whereClause = '1=1';
  const params = [];

  if (actionType) {
    whereClause += ' AND al.action_type = ?';
    params.push(actionType);
  }

  if (adminId) {
    whereClause += ' AND al.admin_id = ?';
    params.push(adminId);
  }

  if (startDate) {
    whereClause += ' AND al.created_at >= ?';
    params.push(startDate);
  }

  if (endDate) {
    whereClause += ' AND al.created_at <= ?';
    params.push(endDate);
  }

  const logsResult = await query(
    `SELECT
      al.id, al.admin_id, al.action_type, al.target_type, al.target_id,
      al.description, al.metadata, al.ip_address, al.created_at,
      u.username as admin_username, u.full_name as admin_name, u.profile_image as admin_image
     FROM admin_audit_log al
     JOIN users u ON al.admin_id = u.id
     WHERE ${whereClause}
     ORDER BY al.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) as total FROM admin_audit_log al WHERE ${whereClause}`,
    params
  );

  const total = countResult.rows[0].total;
  const totalPages = Math.ceil(total / limit);

  successResponse(res, {
    logs: logsResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }, 'Audit log retrieved');
});

/**
 * Helper function to log admin actions
 * @param {number} adminId - ID of the admin performing the action
 * @param {string} actionType - Type of action (from ENUM)
 * @param {string} targetType - Type of target (from ENUM)
 * @param {number|null} targetId - ID of the target entity
 * @param {string} description - Human-readable description
 * @param {object|null} metadata - Additional JSON metadata
 * @param {string|null} ipAddress - IP address of the admin
 */
exports.logAuditAction = async (adminId, actionType, targetType, targetId, description, metadata = null, ipAddress = null) => {
  try {
    await query(
      `INSERT INTO admin_audit_log
        (admin_id, action_type, target_type, target_id, description, metadata, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        adminId,
        actionType,
        targetType,
        targetId,
        description,
        metadata ? JSON.stringify(metadata) : null,
        ipAddress
      ]
    );
  } catch (error) {
    console.error('Failed to log audit action:', error);
    // Don't throw - audit logging should not break the main functionality
  }
};

module.exports = exports;
