const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const { createPaymentIntent, cancelPaymentIntent } = require('../config/stripe');
const { notifyNewOrder, notifyNewSale } = require('../utils/notifications');

/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

/**
 * @route   POST /api/orders
 * @desc    Create order from cart
 * @access  Private
 */
exports.createOrder = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { paymentMethod, shippingAddress, notes } = req.body;

  if (!paymentMethod) {
    return next(new AppError('Payment method is required', 400));
  }

  if (!['card', 'wallet', 'bank_transfer'].includes(paymentMethod)) {
    return next(new AppError('Invalid payment method', 400));
  }

  // Get cart items
  const cartResult = await query(
    `SELECT c.*, a.price, a.stock_quantity, a.status, a.is_for_sale, a.artist_id, a.title
     FROM cart_items c
     JOIN artworks a ON c.artwork_id = a.id
     WHERE c.user_id = ?`,
    [userId]
  );

  if (cartResult.rows.length === 0) {
    return next(new AppError('Cart is empty', 400));
  }

  const cartItems = cartResult.rows;

  // Validate all items are still available
  for (const item of cartItems) {
    if (item.status !== 'published' || !item.is_for_sale) {
      return next(new AppError(`Artwork "${item.title}" is no longer available`, 400));
    }

    if (item.stock_quantity < item.quantity) {
      return next(new AppError(`Not enough stock for "${item.title}". Only ${item.stock_quantity} available`, 400));
    }
  }

  // Calculate total
  let totalAmount = 0;
  cartItems.forEach(item => {
    totalAmount += parseFloat(item.price) * item.quantity;
  });

  // Create order
  const orderNumber = generateOrderNumber();
  const orderResult = await query(
    `INSERT INTO orders
     (buyer_id, order_number, status, total_amount, payment_method, payment_status, shipping_address, notes)
     VALUES (?, ?, 'pending', ?, ?, 'pending', ?, ?)`,
    [
      userId,
      orderNumber,
      totalAmount.toFixed(2),
      paymentMethod,
      shippingAddress ? JSON.stringify(shippingAddress) : null,
      notes || null
    ]
  );

  const orderId = orderResult.rows.insertId;

  // Create order items and update stock
  const sellerNotifications = {}; // Track sales per seller for notifications

  for (const item of cartItems) {
    const subtotal = parseFloat(item.price) * item.quantity;
    const commissionRate = 10.00; // Platform fee percentage
    const commissionAmount = subtotal * (commissionRate / 100);
    const sellerEarnings = subtotal - commissionAmount;

    await query(
      `INSERT INTO order_items
       (order_id, artwork_id, seller_id, quantity, price, subtotal, commission_rate, commission_amount, seller_earnings)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        item.artwork_id,
        item.artist_id,
        item.quantity,
        item.price,
        subtotal.toFixed(2),
        commissionRate,
        commissionAmount.toFixed(2),
        sellerEarnings.toFixed(2)
      ]
    );

    // Update stock
    await query(
      'UPDATE artworks SET stock_quantity = stock_quantity - ? WHERE id = ?',
      [item.quantity, item.artwork_id]
    );

    // Mark as sold if out of stock
    await query(
      `UPDATE artworks SET status = 'sold'
       WHERE id = ? AND stock_quantity = 0`,
      [item.artwork_id]
    );

    // Prepare seller notification
    try {
      await notifyNewSale(
        item.artist_id,
        orderId,
        orderNumber,
        item.title,
        item.quantity,
        sellerEarnings.toFixed(2)
      );
    } catch (error) {
      console.error('Failed to send sale notification:', error);
    }
  }

  // Clear cart
  await query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

  // Process wallet payment
  if (paymentMethod === 'wallet') {
    // Get user's wallet balance
    const walletResult = await query('SELECT wallet_balance FROM users WHERE id = ?', [userId]);
    const walletBalance = parseFloat(walletResult.rows[0].wallet_balance) || 0;

    // Check if user has sufficient balance
    if (walletBalance < totalAmount) {
      return next(new AppError(`Insufficient wallet balance. You need ₱${totalAmount.toFixed(2)} but have ₱${walletBalance.toFixed(2)}`, 400));
    }

    // Deduct from wallet
    await query(
      'UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?',
      [totalAmount, userId]
    );

    // Get new balance
    const newBalanceResult = await query('SELECT wallet_balance FROM users WHERE id = ?', [userId]);
    const newBalance = parseFloat(newBalanceResult.rows[0].wallet_balance) || 0;

    // Record wallet transaction
    await query(
      `INSERT INTO wallet_transactions (user_id, type, amount, description, payment_method, balance_after)
       VALUES (?, 'purchase', ?, ?, 'wallet', ?)`,
      [
        userId,
        -totalAmount,
        `Order ${orderNumber} - Artwork Purchase`,
        newBalance
      ]
    );

    // Mark order as completed and paid
    await query(
      `UPDATE orders SET status = 'completed', payment_status = 'paid', paid_at = NOW() WHERE id = ?`,
      [orderId]
    );
  }

  // Create payment intent for card payments or mark as completed for mock payments
  let paymentIntent = null;
  if (paymentMethod === 'card') {
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        paymentIntent = await createPaymentIntent(
          totalAmount,
          'usd',
          {
            orderId: orderId,
            orderNumber: orderNumber,
            buyerId: userId,
          }
        );

        // Update order with payment intent ID
        await query(
          'UPDATE orders SET payment_intent_id = ? WHERE id = ?',
          [paymentIntent.id, orderId]
        );
      } catch (error) {
        console.error('Failed to create payment intent:', error);
        // Continue without payment intent - can be created later
      }
    } else {
      // Mock card payment - mark as completed immediately
      await query(
        `UPDATE orders SET status = 'completed', payment_status = 'paid', paid_at = NOW() WHERE id = ?`,
        [orderId]
      );
    }
  }

  // Mark bank transfer as completed for mock system
  if (paymentMethod === 'bank_transfer') {
    await query(
      `UPDATE orders SET status = 'completed', payment_status = 'paid', paid_at = NOW() WHERE id = ?`,
      [orderId]
    );
  }

  // Get created order with items
  const orderDetailsResult = await query(
    `SELECT o.*,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
              'id', oi.id,
              'artwork_id', oi.artwork_id,
              'artwork_title', a.title,
              'quantity', oi.quantity,
              'price', oi.price,
              'subtotal', oi.subtotal
            ))
            FROM order_items oi
            JOIN artworks a ON oi.artwork_id = a.id
            WHERE oi.order_id = o.id) as items
     FROM orders o
     WHERE o.id = ?`,
    [orderId]
  );

  const order = orderDetailsResult.rows[0];
  order.items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);

  // Send notification to buyer
  try {
    await notifyNewOrder(userId, orderId, orderNumber, totalAmount.toFixed(2));
  } catch (error) {
    console.error('Failed to send order notification:', error);
  }

  // Add payment intent client secret if available
  const responseData = { ...order };
  if (paymentIntent) {
    responseData.paymentIntent = {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    };
  }

  successResponse(res, responseData, 'Order created successfully', 201);
});

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
exports.getUserOrders = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Get orders
  const ordersResult = await query(
    `SELECT id, order_number, status, total_amount, payment_method, payment_status, created_at
     FROM orders
     WHERE buyer_id = ?
     ORDER BY created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [userId]
  );

  // Get total count
  const countResult = await query(
    'SELECT COUNT(*) as total FROM orders WHERE buyer_id = ?',
    [userId]
  );

  // Get items for each order
  for (const order of ordersResult.rows) {
    const itemsResult = await query(
      `SELECT oi.quantity, oi.price, oi.subtotal,
              a.id as artwork_id, a.title,
              (SELECT media_url FROM artwork_media WHERE artwork_id = a.id AND is_primary = TRUE LIMIT 1) as primary_image
       FROM order_items oi
       JOIN artworks a ON oi.artwork_id = a.id
       WHERE oi.order_id = ?`,
      [order.id]
    );
    order.items = itemsResult.rows;
  }

  successResponse(res, {
    orders: ordersResult.rows,
    pagination: {
      total: countResult.rows[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  }, 'Orders retrieved');
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details
 * @access  Private
 */
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Get order
  const orderResult = await query(
    'SELECT * FROM orders WHERE id = ? AND buyer_id = ?',
    [id, userId]
  );

  if (orderResult.rows.length === 0) {
    return next(new AppError('Order not found', 404));
  }

  const order = orderResult.rows[0];

  // Get order items
  const itemsResult = await query(
    `SELECT oi.*,
            a.title, a.category,
            u.username as seller_username, u.full_name as seller_name,
            (SELECT media_url FROM artwork_media WHERE artwork_id = a.id AND is_primary = TRUE LIMIT 1) as primary_image
     FROM order_items oi
     JOIN artworks a ON oi.artwork_id = a.id
     JOIN users u ON oi.seller_id = u.id
     WHERE oi.order_id = ?`,
    [id]
  );

  order.items = itemsResult.rows;

  // Parse shipping address if exists
  if (order.shipping_address) {
    try {
      order.shipping_address = JSON.parse(order.shipping_address);
    } catch (e) {
      order.shipping_address = null;
    }
  }

  successResponse(res, order, 'Order retrieved');
});

/**
 * @route   GET /api/orders/seller/sales
 * @desc    Get artist's sales (orders containing their artworks)
 * @access  Private (Artists only)
 */
exports.getArtistSales = asyncHandler(async (req, res, next) => {
  const artistId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Get sales
  const salesResult = await query(
    `SELECT DISTINCT o.id, o.order_number, o.status, o.created_at,
            oi.quantity, oi.subtotal, oi.seller_earnings,
            a.title as artwork_title,
            u.username as buyer_username, u.full_name as buyer_name
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     JOIN artworks a ON oi.artwork_id = a.id
     JOIN users u ON o.buyer_id = u.id
     WHERE oi.seller_id = ?
     ORDER BY o.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [artistId]
  );

  // Get total count and earnings
  const statsResult = await query(
    `SELECT COUNT(DISTINCT oi.order_id) as total_orders,
            SUM(oi.seller_earnings) as total_earnings
     FROM order_items oi
     WHERE oi.seller_id = ?`,
    [artistId]
  );

  successResponse(res, {
    sales: salesResult.rows,
    stats: {
      total_orders: statsResult.rows[0].total_orders || 0,
      total_earnings: parseFloat(statsResult.rows[0].total_earnings || 0).toFixed(2),
    },
    pagination: {
      total: statsResult.rows[0].total_orders || 0,
      page,
      limit,
      totalPages: Math.ceil((statsResult.rows[0].total_orders || 0) / limit),
    },
  }, 'Sales retrieved');
});

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order (if still pending)
 * @access  Private
 */
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Get order
  const orderResult = await query(
    'SELECT * FROM orders WHERE id = ? AND buyer_id = ?',
    [id, userId]
  );

  if (orderResult.rows.length === 0) {
    return next(new AppError('Order not found', 404));
  }

  const order = orderResult.rows[0];

  // Can only cancel pending orders
  if (order.status !== 'pending') {
    return next(new AppError('Only pending orders can be cancelled', 400));
  }

  // Get order items to restore stock
  const itemsResult = await query(
    'SELECT * FROM order_items WHERE order_id = ?',
    [id]
  );

  // Cancel payment intent if exists
  if (order.payment_intent_id && process.env.STRIPE_SECRET_KEY) {
    try {
      await cancelPaymentIntent(order.payment_intent_id);
    } catch (error) {
      console.error('Failed to cancel payment intent:', error);
      // Continue with cancellation even if Stripe fails
    }
  }

  // Restore stock
  for (const item of itemsResult.rows) {
    await query(
      'UPDATE artworks SET stock_quantity = stock_quantity + ? WHERE id = ?',
      [item.quantity, item.artwork_id]
    );

    // Unpublish if was marked as sold
    await query(
      `UPDATE artworks SET status = 'published'
       WHERE id = ? AND status = 'sold' AND stock_quantity > 0`,
      [item.artwork_id]
    );
  }

  // Update order status
  await query(
    `UPDATE orders SET status = 'cancelled', payment_status = 'refunded' WHERE id = ?`,
    [id]
  );

  successResponse(res, null, 'Order cancelled successfully');
});

module.exports = exports;
