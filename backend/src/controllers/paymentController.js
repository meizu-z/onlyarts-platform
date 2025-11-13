const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const {
  createPaymentIntent,
  retrievePaymentIntent,
  cancelPaymentIntent,
  createRefund,
  constructWebhookEvent,
} = require('../config/stripe');
const { notifyPaymentSuccess, notifyPaymentFailed } = require('../utils/notifications');

/**
 * @route   POST /api/payments/create-intent
 * @desc    Create a payment intent for an order
 * @access  Private
 */
exports.createPaymentIntentForOrder = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { orderId } = req.body;

  if (!orderId) {
    return next(new AppError('Order ID is required', 400));
  }

  // Get order details
  const orderResult = await query(
    'SELECT * FROM orders WHERE id = ? AND buyer_id = ?',
    [orderId, userId]
  );

  if (orderResult.rows.length === 0) {
    return next(new AppError('Order not found', 404));
  }

  const order = orderResult.rows[0];

  // Check if order is already paid or cancelled
  if (order.payment_status === 'completed') {
    return next(new AppError('Order is already paid', 400));
  }

  if (order.status === 'cancelled') {
    return next(new AppError('Cannot pay for cancelled order', 400));
  }

  // Create payment intent
  const paymentIntent = await createPaymentIntent(
    parseFloat(order.total_amount),
    'usd',
    {
      orderId: order.id,
      orderNumber: order.order_number,
      buyerId: userId,
    }
  );

  // Update order with payment intent ID
  await query(
    'UPDATE orders SET payment_intent_id = ? WHERE id = ?',
    [paymentIntent.id, orderId]
  );

  successResponse(res, {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  }, 'Payment intent created successfully');
});

/**
 * @route   GET /api/payments/intent/:paymentIntentId
 * @desc    Get payment intent status
 * @access  Private
 */
exports.getPaymentIntentStatus = asyncHandler(async (req, res, next) => {
  const { paymentIntentId } = req.params;

  // Get payment intent from Stripe
  const paymentIntent = await retrievePaymentIntent(paymentIntentId);

  // Verify this payment belongs to user's order
  const orderResult = await query(
    'SELECT * FROM orders WHERE payment_intent_id = ? AND buyer_id = ?',
    [paymentIntentId, req.user.id]
  );

  if (orderResult.rows.length === 0) {
    return next(new AppError('Payment intent not found or unauthorized', 404));
  }

  successResponse(res, {
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    paymentMethod: paymentIntent.payment_method,
  }, 'Payment intent status retrieved');
});

/**
 * @route   POST /api/payments/refund
 * @desc    Refund a payment (admin or automated)
 * @access  Private
 */
exports.refundPayment = asyncHandler(async (req, res, next) => {
  const { orderId, amount } = req.body;

  if (!orderId) {
    return next(new AppError('Order ID is required', 400));
  }

  // Get order
  const orderResult = await query(
    'SELECT * FROM orders WHERE id = ?',
    [orderId]
  );

  if (orderResult.rows.length === 0) {
    return next(new AppError('Order not found', 404));
  }

  const order = orderResult.rows[0];

  // Verify user is buyer or admin
  if (order.buyer_id !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to refund this order', 403));
  }

  if (!order.payment_intent_id) {
    return next(new AppError('No payment found for this order', 400));
  }

  if (order.payment_status === 'refunded') {
    return next(new AppError('Order is already refunded', 400));
  }

  // Create refund in Stripe
  const refund = await createRefund(
    order.payment_intent_id,
    amount ? parseFloat(amount) : null
  );

  // Update order status
  await query(
    `UPDATE orders
     SET payment_status = 'refunded', status = 'cancelled', updated_at = NOW()
     WHERE id = ?`,
    [orderId]
  );

  successResponse(res, {
    refundId: refund.id,
    amount: refund.amount,
    status: refund.status,
  }, 'Refund processed successfully');
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (but verified by Stripe signature)
 */
exports.handleWebhook = asyncHandler(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = constructWebhookEvent(req.body, signature);
  } catch (error) {
    return next(new AppError(`Webhook Error: ${error.message}`, 400));
  }

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    case 'payment_intent.canceled':
      await handlePaymentCancelled(event.data.object);
      break;

    case 'charge.refunded':
      await handleRefund(event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return 200 to acknowledge receipt
  res.json({ received: true });
});

/**
 * Handle successful payment
 */
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    // Update order payment status
    await query(
      `UPDATE orders
       SET payment_status = 'completed', status = 'processing', updated_at = NOW()
       WHERE payment_intent_id = ?`,
      [paymentIntent.id]
    );

    // Get order details for notification (future feature)
    const orderResult = await query(
      'SELECT * FROM orders WHERE payment_intent_id = ?',
      [paymentIntent.id]
    );

    if (orderResult.rows.length > 0) {
      const order = orderResult.rows[0];
      console.log(`Payment successful for order ${order.order_number}`);

      // Send notification to buyer
      try {
        await notifyPaymentSuccess(
          order.buyer_id,
          order.id,
          order.order_number,
          parseFloat(order.total_amount).toFixed(2)
        );
      } catch (error) {
        console.error('Failed to send payment success notification:', error);
      }
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};

/**
 * Handle failed payment
 */
const handlePaymentFailed = async (paymentIntent) => {
  try {
    await query(
      `UPDATE orders
       SET payment_status = 'failed', updated_at = NOW()
       WHERE payment_intent_id = ?`,
      [paymentIntent.id]
    );

    // Get order details and send notification
    const orderResult = await query(
      'SELECT * FROM orders WHERE payment_intent_id = ?',
      [paymentIntent.id]
    );

    if (orderResult.rows.length > 0) {
      const order = orderResult.rows[0];
      console.log(`Payment failed for order ${order.order_number}`);

      // Send notification to buyer
      try {
        await notifyPaymentFailed(
          order.buyer_id,
          order.id,
          order.order_number,
          parseFloat(order.total_amount).toFixed(2)
        );
      } catch (error) {
        console.error('Failed to send payment failed notification:', error);
      }
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};

/**
 * Handle cancelled payment
 */
const handlePaymentCancelled = async (paymentIntent) => {
  try {
    await query(
      `UPDATE orders
       SET payment_status = 'cancelled', status = 'cancelled', updated_at = NOW()
       WHERE payment_intent_id = ?`,
      [paymentIntent.id]
    );

    console.log(`Payment cancelled for payment intent ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
};

/**
 * Handle refund
 */
const handleRefund = async (charge) => {
  try {
    // Get payment intent from charge
    const paymentIntentId = charge.payment_intent;

    await query(
      `UPDATE orders
       SET payment_status = 'refunded', status = 'cancelled', updated_at = NOW()
       WHERE payment_intent_id = ?`,
      [paymentIntentId]
    );

    console.log(`Refund processed for payment intent ${paymentIntentId}`);
    // TODO: Send notification to buyer
  } catch (error) {
    console.error('Error handling refund:', error);
  }
};

module.exports = exports;
