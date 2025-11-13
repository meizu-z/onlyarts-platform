const Stripe = require('stripe');
require('dotenv').config();

// Initialize Stripe with secret key (only if provided)
const stripe = process.env.STRIPE_SECRET_KEY
  ? Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * Create a payment intent for an order
 * @param {number} amount - Amount in cents (e.g., 1000 = $10.00)
 * @param {string} currency - Currency code (e.g., 'usd')
 * @param {object} metadata - Additional data to attach to the payment
 * @returns {Promise} Payment intent object
 */
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
};

/**
 * Retrieve a payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise} Payment intent object
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to retrieve payment intent: ${error.message}`);
  }
};

/**
 * Cancel a payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise} Cancelled payment intent
 */
const cancelPaymentIntent = async (paymentIntentId) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to cancel payment intent: ${error.message}`);
  }
};

/**
 * Create a refund for a payment
 * @param {string} paymentIntentId - Payment intent ID
 * @param {number} amount - Amount to refund in cents (optional, defaults to full refund)
 * @returns {Promise} Refund object
 */
const createRefund = async (paymentIntentId, amount = null) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const refundData = { payment_intent: paymentIntentId };
    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundData);
    return refund;
  } catch (error) {
    throw new Error(`Failed to create refund: ${error.message}`);
  }
};

/**
 * Create a customer in Stripe
 * @param {string} email - Customer email
 * @param {string} name - Customer name
 * @param {object} metadata - Additional metadata
 * @returns {Promise} Customer object
 */
const createCustomer = async (email, name, metadata = {}) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    return customer;
  } catch (error) {
    throw new Error(`Failed to create customer: ${error.message}`);
  }
};

/**
 * Verify webhook signature
 * @param {string} payload - Request body
 * @param {string} signature - Stripe signature header
 * @returns {object} Verified event object
 */
const constructWebhookEvent = (payload, signature) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
};

module.exports = {
  stripe,
  createPaymentIntent,
  retrievePaymentIntent,
  cancelPaymentIntent,
  createRefund,
  createCustomer,
  constructWebhookEvent,
};
