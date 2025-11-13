const express = require('express');
const stripe = require('../config/stripe');
const { query } = require('../config/database');
const { sendOrderConfirmationEmail, sendSubscriptionConfirmationEmail } = require('../config/email');

const router = express.Router();

/**
 * Stripe Webhook Handler
 * IMPORTANT: This route must use raw body, not JSON parsed body
 * Place this route BEFORE body-parser middleware in server.js
 */
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`🔔 Stripe webhook received: ${event.type}`);

    // Handle the event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object);
          break;

        case 'charge.succeeded':
          await handleChargeSucceeded(event.data.object);
          break;

        case 'charge.refunded':
          await handleChargeRefunded(event.data.object);
          break;

        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).send('Webhook handler failed');
    }
  }
);

/**
 * Webhook Event Handlers
 */

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('💳 PaymentIntent succeeded:', paymentIntent.id);

  try {
    // Find order by payment intent ID
    const result = await query(
      `SELECT o.*, u.email, u.username
       FROM orders o
       JOIN users u ON o.buyer_id = u.id
       WHERE o.stripe_payment_intent_id = ?`,
      [paymentIntent.id]
    );

    if (result.rows.length === 0) {
      console.warn('No order found for payment intent:', paymentIntent.id);
      return;
    }

    const order = result.rows[0];

    // Update order status to paid
    await query(
      `UPDATE orders
       SET payment_status = 'paid', status = 'processing', updated_at = NOW()
       WHERE id = ?`,
      [order.id]
    );

    // Send order confirmation email
    await sendOrderConfirmationEmail(order.email, order.username, order);

    console.log(`✅ Order #${order.id} marked as paid`);
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

// Handle failed payment intent
async function handlePaymentIntentFailed(paymentIntent) {
  console.log('❌ PaymentIntent failed:', paymentIntent.id);

  try {
    await query(
      `UPDATE orders
       SET payment_status = 'failed', updated_at = NOW()
       WHERE stripe_payment_intent_id = ?`,
      [paymentIntent.id]
    );
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

// Handle successful charge
async function handleChargeSucceeded(charge) {
  console.log('💰 Charge succeeded:', charge.id);
  // Additional charge processing if needed
}

// Handle refunded charge
async function handleChargeRefunded(charge) {
  console.log('↩️ Charge refunded:', charge.id);

  try {
    // Find order by payment intent
    const result = await query(
      `SELECT * FROM orders WHERE stripe_payment_intent_id = ?`,
      [charge.payment_intent]
    );

    if (result.rows.length > 0) {
      const order = result.rows[0];

      await query(
        `UPDATE orders
         SET payment_status = 'refunded', status = 'cancelled', updated_at = NOW()
         WHERE id = ?`,
        [order.id]
      );

      console.log(`✅ Order #${order.id} marked as refunded`);
    }
  } catch (error) {
    console.error('Error handling charge refunded:', error);
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription) {
  console.log('📅 Subscription created:', subscription.id);

  try {
    const userId = subscription.metadata.userId;
    const tierId = subscription.metadata.tierId;

    if (!userId || !tierId) {
      console.warn('Missing metadata in subscription:', subscription.id);
      return;
    }

    // Get user and tier info
    const [userResult, tierResult] = await Promise.all([
      query('SELECT * FROM users WHERE id = ?', [userId]),
      query('SELECT * FROM subscription_tiers WHERE id = ?', [tierId])
    ]);

    if (userResult.rows.length === 0 || tierResult.rows.length === 0) {
      console.warn('User or tier not found');
      return;
    }

    const user = userResult.rows[0];
    const tier = tierResult.rows[0];

    // Create or update subscription
    await query(
      `INSERT INTO subscriptions (user_id, tier_id, stripe_subscription_id, status, current_period_start, current_period_end)
       VALUES (?, ?, ?, 'active', FROM_UNIXTIME(?), FROM_UNIXTIME(?))
       ON DUPLICATE KEY UPDATE
       stripe_subscription_id = VALUES(stripe_subscription_id),
       status = VALUES(status),
       current_period_start = VALUES(current_period_start),
       current_period_end = VALUES(current_period_end)`,
      [userId, tierId, subscription.id, subscription.current_period_start, subscription.current_period_end]
    );

    // Send confirmation email
    await sendSubscriptionConfirmationEmail(user.email, user.username, tier.name, tier.price);

    console.log(`✅ Subscription created for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription updated:', subscription.id);

  try {
    await query(
      `UPDATE subscriptions
       SET status = ?,
           current_period_start = FROM_UNIXTIME(?),
           current_period_end = FROM_UNIXTIME(?),
           cancel_at_period_end = ?
       WHERE stripe_subscription_id = ?`,
      [
        subscription.status,
        subscription.current_period_start,
        subscription.current_period_end,
        subscription.cancel_at_period_end,
        subscription.id
      ]
    );
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

// Handle subscription deleted/cancelled
async function handleSubscriptionDeleted(subscription) {
  console.log('🚫 Subscription deleted:', subscription.id);

  try {
    await query(
      `UPDATE subscriptions
       SET status = 'cancelled', cancelled_at = NOW()
       WHERE stripe_subscription_id = ?`,
      [subscription.id]
    );
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

// Handle successful invoice payment (recurring subscription)
async function handleInvoicePaymentSucceeded(invoice) {
  console.log('✅ Invoice payment succeeded:', invoice.id);

  try {
    const subscriptionId = invoice.subscription;

    if (subscriptionId) {
      await query(
        `UPDATE subscriptions
         SET status = 'active', updated_at = NOW()
         WHERE stripe_subscription_id = ?`,
        [subscriptionId]
      );
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice) {
  console.log('❌ Invoice payment failed:', invoice.id);

  try {
    const subscriptionId = invoice.subscription;

    if (subscriptionId) {
      await query(
        `UPDATE subscriptions
         SET status = 'past_due', updated_at = NOW()
         WHERE stripe_subscription_id = ?`,
        [subscriptionId]
      );
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

module.exports = router;
