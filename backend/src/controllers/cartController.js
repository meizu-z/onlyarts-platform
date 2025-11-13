const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
exports.getCart = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Get cart items with artwork and artist details
  const result = await query(
    `SELECT
      c.id, c.quantity, c.price_at_add, c.created_at,
      a.id as artwork_id, a.title, a.price as current_price, a.status,
      a.stock_quantity, a.is_for_sale,
      u.id as artist_id, u.username as artist_username, u.full_name as artist_name,
      (SELECT media_url FROM artwork_media WHERE artwork_id = a.id AND is_primary = TRUE LIMIT 1) as primary_image
     FROM cart_items c
     JOIN artworks a ON c.artwork_id = a.id
     JOIN users u ON a.artist_id = u.id
     WHERE c.user_id = ?
     ORDER BY c.created_at DESC`,
    [userId]
  );

  // Calculate totals
  let subtotal = 0;
  const items = result.rows.map(item => {
    const itemTotal = parseFloat(item.current_price) * item.quantity;
    subtotal += itemTotal;

    return {
      ...item,
      item_total: itemTotal.toFixed(2),
      price_changed: parseFloat(item.price_at_add) !== parseFloat(item.current_price),
    };
  });

  successResponse(res, {
    items,
    summary: {
      item_count: items.length,
      total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: subtotal.toFixed(2),
      total: subtotal.toFixed(2), // Can add tax/shipping later
    },
  }, 'Cart retrieved');
});

/**
 * @route   POST /api/cart
 * @desc    Add item to cart
 * @access  Private
 */
exports.addToCart = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { artworkId, quantity = 1 } = req.body;

  if (!artworkId) {
    return next(new AppError('Artwork ID is required', 400));
  }

  if (quantity < 1 || quantity > 10) {
    return next(new AppError('Quantity must be between 1 and 10', 400));
  }

  // Check if artwork exists and is available
  const artworkResult = await query(
    'SELECT * FROM artworks WHERE id = ? AND status = ? AND is_for_sale = TRUE',
    [artworkId, 'published']
  );

  if (artworkResult.rows.length === 0) {
    return next(new AppError('Artwork not found or not available for sale', 404));
  }

  const artwork = artworkResult.rows[0];

  // Check if enough stock
  if (artwork.stock_quantity < quantity) {
    return next(new AppError(`Only ${artwork.stock_quantity} items available in stock`, 400));
  }

  // Can't buy your own artwork
  if (artwork.artist_id === userId) {
    return next(new AppError('You cannot purchase your own artwork', 400));
  }

  // Check if item already in cart
  const existingItem = await query(
    'SELECT * FROM cart_items WHERE user_id = ? AND artwork_id = ?',
    [userId, artworkId]
  );

  if (existingItem.rows.length > 0) {
    // Update quantity
    const newQuantity = existingItem.rows[0].quantity + quantity;

    if (newQuantity > artwork.stock_quantity) {
      return next(new AppError(`Cannot add more. Only ${artwork.stock_quantity} items available`, 400));
    }

    await query(
      'UPDATE cart_items SET quantity = ?, price_at_add = ? WHERE id = ?',
      [newQuantity, artwork.price, existingItem.rows[0].id]
    );

    successResponse(res, {
      id: existingItem.rows[0].id,
      artwork_id: artworkId,
      quantity: newQuantity,
    }, 'Cart updated');
  } else {
    // Add new item
    const result = await query(
      'INSERT INTO cart_items (user_id, artwork_id, quantity, price_at_add) VALUES (?, ?, ?, ?)',
      [userId, artworkId, quantity, artwork.price]
    );

    successResponse(res, {
      id: result.rows.insertId,
      artwork_id: artworkId,
      quantity,
    }, 'Item added to cart', 201);
  }
});

/**
 * @route   PUT /api/cart/:id
 * @desc    Update cart item quantity
 * @access  Private
 */
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1 || quantity > 10) {
    return next(new AppError('Quantity must be between 1 and 10', 400));
  }

  // Check if cart item exists and belongs to user
  const cartResult = await query(
    'SELECT c.*, a.stock_quantity FROM cart_items c JOIN artworks a ON c.artwork_id = a.id WHERE c.id = ? AND c.user_id = ?',
    [id, userId]
  );

  if (cartResult.rows.length === 0) {
    return next(new AppError('Cart item not found', 404));
  }

  const cartItem = cartResult.rows[0];

  // Check stock
  if (quantity > cartItem.stock_quantity) {
    return next(new AppError(`Only ${cartItem.stock_quantity} items available`, 400));
  }

  // Update quantity
  await query(
    'UPDATE cart_items SET quantity = ? WHERE id = ?',
    [quantity, id]
  );

  successResponse(res, {
    id,
    quantity,
  }, 'Cart item updated');
});

/**
 * @route   DELETE /api/cart/:id
 * @desc    Remove item from cart
 * @access  Private
 */
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  // Check if cart item exists and belongs to user
  const cartResult = await query(
    'SELECT * FROM cart_items WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (cartResult.rows.length === 0) {
    return next(new AppError('Cart item not found', 404));
  }

  // Delete item
  await query('DELETE FROM cart_items WHERE id = ?', [id]);

  successResponse(res, null, 'Item removed from cart');
});

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Private
 */
exports.clearCart = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  await query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

  successResponse(res, null, 'Cart cleared');
});

module.exports = exports;
