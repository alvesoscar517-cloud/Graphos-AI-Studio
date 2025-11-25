/**
 * Payment Controller
 * Handles Lemon Squeezy payment integration
 * REFUNDS ARE NOT ALLOWED
 */

const { db, FieldValue } = require('../config/firebase');
const lemonSqueezy = require('../services/lemonsqueezy.service');
const creditService = require('../services/credit.service');
const { CREDIT_PACKAGES, getPackageByVariantId } = require('../config/pricing');
const logger = require('../utils/logger');

// Webhook event types
const WEBHOOK_EVENTS = {
  ORDER_CREATED: 'order_created',
  ORDER_REFUNDED: 'order_refunded',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_UPDATED: 'subscription_updated',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  SUBSCRIPTION_RESUMED: 'subscription_resumed',
  SUBSCRIPTION_EXPIRED: 'subscription_expired',
  SUBSCRIPTION_PAUSED: 'subscription_paused',
  SUBSCRIPTION_UNPAUSED: 'subscription_unpaused',
  SUBSCRIPTION_PAYMENT_SUCCESS: 'subscription_payment_success',
  SUBSCRIPTION_PAYMENT_FAILED: 'subscription_payment_failed',
  SUBSCRIPTION_PAYMENT_RECOVERED: 'subscription_payment_recovered',
  LICENSE_KEY_CREATED: 'license_key_created'
};

/**
 * Create checkout session for credit package
 */
exports.createCheckout = async (req, res) => {
  try {
    const { variantId, packageId, userId, email } = req.body;

    if (!variantId || !userId) {
      return res.status(400).json({ error: 'variantId and userId are required' });
    }

    const checkoutUrl = await lemonSqueezy.createCheckout(variantId, {
      email,
      userId,
      customData: { package_id: packageId }
    });

    logger.info('Checkout created', { variantId, userId, packageId });

    res.json({ success: true, checkoutUrl });
  } catch (error) {
    logger.error('Create checkout failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};


/**
 * Handle Lemon Squeezy webhooks
 */
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    // Verify webhook signature
    if (!lemonSqueezy.verifyWebhookSignature(rawBody, signature)) {
      logger.warn('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { meta, data } = req.body;
    const eventName = meta.event_name;
    const customData = meta.custom_data || {};

    logger.info('Webhook received', { event: eventName, id: data.id });

    switch (eventName) {
      case WEBHOOK_EVENTS.ORDER_CREATED:
        await handleOrderCreated(data, customData);
        break;

      case WEBHOOK_EVENTS.ORDER_REFUNDED:
        // REFUNDS NOT ALLOWED - Log and ignore
        await logRefundAttempt(data, customData);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(data, customData);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(data, customData);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_CANCELLED:
        await handleSubscriptionCancelled(data, customData);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_RESUMED:
      case WEBHOOK_EVENTS.SUBSCRIPTION_UNPAUSED:
        await handleSubscriptionResumed(data, customData);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_EXPIRED:
        await handleSubscriptionExpired(data, customData);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_PAUSED:
        await handleSubscriptionPaused(data, customData);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_PAYMENT_SUCCESS:
        await handlePaymentSuccess(data, customData);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_PAYMENT_FAILED:
        await handlePaymentFailed(data, customData);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_PAYMENT_RECOVERED:
        await handlePaymentRecovered(data, customData);
        break;

      case WEBHOOK_EVENTS.LICENSE_KEY_CREATED:
        await handleLicenseKeyCreated(data, customData);
        break;

      default:
        logger.info('Unhandled webhook event', { event: eventName });
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing failed', { error: error.message });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Handle order created - Add credits to user
 */
async function handleOrderCreated(data, customData) {
  const attrs = data.attributes;
  const userId = customData.user_id;
  let packageId = customData.package_id;
  
  // Try to find package from variant ID if not provided
  const variantId = attrs.first_order_item?.variant_id;
  if (!packageId && variantId) {
    const foundPkg = getPackageByVariantId(variantId);
    if (foundPkg) {
      packageId = foundPkg.packageId;
    }
  }

  // Save order record
  await db.collection('orders').doc(String(data.id)).set({
    orderId: data.id,
    userId,
    customerEmail: attrs.user_email,
    customerId: attrs.customer_id,
    productName: attrs.first_order_item?.product_name,
    variantName: attrs.first_order_item?.variant_name,
    variantId: variantId,
    status: attrs.status,
    total: attrs.total,
    totalFormatted: attrs.total_formatted,
    currency: attrs.currency,
    packageId,
    refunded: false,
    createdAt: new Date(attrs.created_at),
    updatedAt: new Date()
  });

  // Add credits if package exists
  if (userId && packageId && CREDIT_PACKAGES[packageId]) {
    const pkg = CREDIT_PACKAGES[packageId];
    const totalCredits = pkg.credits + pkg.bonus;
    
    await creditService.addCredits(userId, totalCredits, 'purchase', {
      orderId: data.id,
      package: packageId,
      price: pkg.price
    });

    logger.info('Credits added from order', { userId, credits: totalCredits, orderId: data.id });
  } else {
    logger.warn('Could not add credits - package not found', { userId, packageId, variantId });
  }
}

/**
 * Log refund attempt - REFUNDS NOT ALLOWED
 */
async function logRefundAttempt(data, customData) {
  await db.collection('refund_attempts').add({
    orderId: data.id,
    userId: customData.user_id,
    attemptedAt: new Date(),
    status: 'BLOCKED',
    reason: 'Refunds are not allowed per policy',
    orderData: data.attributes
  });
  
  logger.warn('Refund attempt blocked', { orderId: data.id, userId: customData.user_id });
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(data, customData) {
  const attrs = data.attributes;
  const userId = customData.user_id;

  await db.collection('subscriptions').doc(String(data.id)).set({
    subscriptionId: data.id,
    userId,
    customerId: attrs.customer_id,
    orderId: attrs.order_id,
    productName: attrs.product_name,
    variantName: attrs.variant_name,
    status: attrs.status,
    cardBrand: attrs.card_brand,
    cardLastFour: attrs.card_last_four,
    renewsAt: attrs.renews_at ? new Date(attrs.renews_at) : null,
    endsAt: attrs.ends_at ? new Date(attrs.ends_at) : null,
    trialEndsAt: attrs.trial_ends_at ? new Date(attrs.trial_ends_at) : null,
    createdAt: new Date(attrs.created_at),
    updatedAt: new Date()
  });

  // Update user subscription status
  if (userId) {
    await db.collection('users').doc(userId).update({
      'subscription.id': data.id,
      'subscription.status': attrs.status,
      'subscription.plan': attrs.variant_name,
      'subscription.renewsAt': attrs.renews_at,
      'subscription.updatedAt': new Date().toISOString()
    });
  }

  logger.info('Subscription created', { subscriptionId: data.id, userId });
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(data, customData) {
  const attrs = data.attributes;
  const userId = customData.user_id;

  await db.collection('subscriptions').doc(String(data.id)).update({
    status: attrs.status,
    variantName: attrs.variant_name,
    renewsAt: attrs.renews_at ? new Date(attrs.renews_at) : null,
    endsAt: attrs.ends_at ? new Date(attrs.ends_at) : null,
    updatedAt: new Date()
  });

  if (userId) {
    await db.collection('users').doc(userId).update({
      'subscription.status': attrs.status,
      'subscription.plan': attrs.variant_name,
      'subscription.renewsAt': attrs.renews_at,
      'subscription.updatedAt': new Date().toISOString()
    });
  }

  logger.info('Subscription updated', { subscriptionId: data.id });
}

/**
 * Handle subscription cancelled
 */
async function handleSubscriptionCancelled(data, customData) {
  const attrs = data.attributes;
  const userId = customData.user_id;

  await db.collection('subscriptions').doc(String(data.id)).update({
    status: 'cancelled',
    endsAt: attrs.ends_at ? new Date(attrs.ends_at) : null,
    cancelledAt: new Date(),
    updatedAt: new Date()
  });

  if (userId) {
    await db.collection('users').doc(userId).update({
      'subscription.status': 'cancelled',
      'subscription.endsAt': attrs.ends_at,
      'subscription.cancelledAt': new Date().toISOString()
    });
  }

  logger.info('Subscription cancelled', { subscriptionId: data.id, userId });
}

/**
 * Handle subscription resumed
 */
async function handleSubscriptionResumed(data, customData) {
  const attrs = data.attributes;
  const userId = customData.user_id;

  await db.collection('subscriptions').doc(String(data.id)).update({
    status: attrs.status,
    renewsAt: attrs.renews_at ? new Date(attrs.renews_at) : null,
    updatedAt: new Date()
  });

  if (userId) {
    await db.collection('users').doc(userId).update({
      'subscription.status': attrs.status,
      'subscription.renewsAt': attrs.renews_at,
      'subscription.updatedAt': new Date().toISOString()
    });
  }

  logger.info('Subscription resumed', { subscriptionId: data.id });
}

/**
 * Handle subscription expired
 */
async function handleSubscriptionExpired(data, customData) {
  const userId = customData.user_id;

  await db.collection('subscriptions').doc(String(data.id)).update({
    status: 'expired',
    expiredAt: new Date(),
    updatedAt: new Date()
  });

  if (userId) {
    await db.collection('users').doc(userId).update({
      'subscription.status': 'expired',
      'subscription.expiredAt': new Date().toISOString()
    });
  }

  logger.info('Subscription expired', { subscriptionId: data.id, userId });
}

/**
 * Handle subscription paused
 */
async function handleSubscriptionPaused(data, customData) {
  const attrs = data.attributes;
  const userId = customData.user_id;

  await db.collection('subscriptions').doc(String(data.id)).update({
    status: 'paused',
    pausedAt: new Date(),
    resumesAt: attrs.resumes_at ? new Date(attrs.resumes_at) : null,
    updatedAt: new Date()
  });

  if (userId) {
    await db.collection('users').doc(userId).update({
      'subscription.status': 'paused',
      'subscription.pausedAt': new Date().toISOString()
    });
  }

  logger.info('Subscription paused', { subscriptionId: data.id });
}

/**
 * Handle payment success - Add recurring credits
 */
async function handlePaymentSuccess(data, customData) {
  const attrs = data.attributes;
  const userId = customData.user_id;
  const packageId = customData.package_id;

  // Log payment
  await db.collection('payment_history').add({
    subscriptionId: data.id,
    userId,
    type: 'success',
    billingReason: attrs.billing_reason,
    total: attrs.total,
    createdAt: new Date()
  });

  // Add recurring credits if subscription
  if (userId && packageId && CREDIT_PACKAGES[packageId]) {
    const pkg = CREDIT_PACKAGES[packageId];
    const totalCredits = pkg.credits + pkg.bonus;
    
    await creditService.addCredits(userId, totalCredits, 'subscription_renewal', {
      subscriptionId: data.id,
      package: packageId
    });

    logger.info('Recurring credits added', { userId, credits: totalCredits });
  }

  // Update subscription
  await db.collection('subscriptions').doc(String(data.id)).update({
    lastPaymentAt: new Date(),
    renewsAt: attrs.renews_at ? new Date(attrs.renews_at) : null,
    updatedAt: new Date()
  });

  logger.info('Payment successful', { subscriptionId: data.id, userId });
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(data, customData) {
  const attrs = data.attributes;
  const userId = customData.user_id;

  await db.collection('payment_history').add({
    subscriptionId: data.id,
    userId,
    type: 'failed',
    billingReason: attrs.billing_reason,
    createdAt: new Date()
  });

  await db.collection('subscriptions').doc(String(data.id)).update({
    status: 'past_due',
    lastPaymentFailedAt: new Date(),
    updatedAt: new Date()
  });

  if (userId) {
    await db.collection('users').doc(userId).update({
      'subscription.status': 'past_due',
      'subscription.paymentFailed': true
    });
  }

  logger.warn('Payment failed', { subscriptionId: data.id, userId });
}

/**
 * Handle payment recovered
 */
async function handlePaymentRecovered(data, customData) {
  const userId = customData.user_id;

  await db.collection('payment_history').add({
    subscriptionId: data.id,
    userId,
    type: 'recovered',
    createdAt: new Date()
  });

  await db.collection('subscriptions').doc(String(data.id)).update({
    status: 'active',
    paymentRecoveredAt: new Date(),
    updatedAt: new Date()
  });

  if (userId) {
    await db.collection('users').doc(userId).update({
      'subscription.status': 'active',
      'subscription.paymentFailed': false
    });
  }

  logger.info('Payment recovered', { subscriptionId: data.id, userId });
}

/**
 * Handle license key created
 */
async function handleLicenseKeyCreated(data, customData) {
  const attrs = data.attributes;
  const userId = customData.user_id;

  await db.collection('license_keys').doc(String(data.id)).set({
    licenseKeyId: data.id,
    userId,
    orderId: attrs.order_id,
    key: attrs.key,
    status: attrs.status,
    activationLimit: attrs.activation_limit,
    activationsCount: attrs.activations_count,
    expiresAt: attrs.expires_at ? new Date(attrs.expires_at) : null,
    createdAt: new Date(attrs.created_at)
  });

  logger.info('License key created', { licenseKeyId: data.id, userId });
}


/**
 * Get user subscription status
 */
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const subsSnapshot = await db.collection('subscriptions')
      .where('userId', '==', user_id)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (subsSnapshot.empty) {
      return res.json({ success: true, hasSubscription: false, subscription: null });
    }

    const subscription = subsSnapshot.docs[0].data();

    res.json({
      success: true,
      hasSubscription: true,
      subscription: {
        id: subscription.subscriptionId,
        status: subscription.status,
        plan: subscription.variantName,
        renewsAt: subscription.renewsAt,
        endsAt: subscription.endsAt
      }
    });
  } catch (error) {
    logger.error('Get subscription status failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Cancel subscription
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const { subscription_id } = req.body;

    if (!subscription_id) {
      return res.status(400).json({ error: 'subscription_id is required' });
    }

    await lemonSqueezy.cancelSubscription(subscription_id);

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of billing period. No refund will be issued.'
    });
  } catch (error) {
    logger.error('Cancel subscription failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Pause subscription
 */
exports.pauseSubscription = async (req, res) => {
  try {
    const { subscription_id, mode = 'void' } = req.body;

    if (!subscription_id) {
      return res.status(400).json({ error: 'subscription_id is required' });
    }

    const result = await lemonSqueezy.pauseSubscription(subscription_id, mode);

    res.json({ success: true, message: 'Subscription paused', subscription: result });
  } catch (error) {
    logger.error('Pause subscription failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Resume subscription
 */
exports.resumeSubscription = async (req, res) => {
  try {
    const { subscription_id } = req.body;

    if (!subscription_id) {
      return res.status(400).json({ error: 'subscription_id is required' });
    }

    const result = await lemonSqueezy.resumeSubscription(subscription_id);

    res.json({ success: true, message: 'Subscription resumed', subscription: result });
  } catch (error) {
    logger.error('Resume subscription failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update subscription plan
 */
exports.updateSubscriptionPlan = async (req, res) => {
  try {
    const { subscription_id, variant_id } = req.body;

    if (!subscription_id || !variant_id) {
      return res.status(400).json({ error: 'subscription_id and variant_id are required' });
    }

    const result = await lemonSqueezy.updateSubscription(subscription_id, variant_id);

    res.json({ success: true, message: 'Subscription plan updated', subscription: result });
  } catch (error) {
    logger.error('Update subscription plan failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get available products/plans from Lemon Squeezy
 */
exports.getProducts = async (req, res) => {
  try {
    const products = await lemonSqueezy.getProducts();

    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await lemonSqueezy.getVariants(product.id);
        return {
          id: product.id,
          name: product.attributes.name,
          description: product.attributes.description,
          variants: variants.map(v => ({
            id: v.id,
            name: v.attributes.name,
            price: v.attributes.price,
            priceFormatted: v.attributes.price_formatted,
            interval: v.attributes.interval,
            intervalCount: v.attributes.interval_count
          }))
        };
      })
    );

    res.json({ success: true, products: productsWithVariants });
  } catch (error) {
    logger.error('Get products failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get customer portal URL
 */
exports.getCustomerPortal = async (req, res) => {
  try {
    const { customer_id } = req.query;

    if (!customer_id) {
      return res.status(400).json({ error: 'customer_id is required' });
    }

    const portalUrl = await lemonSqueezy.getCustomerPortalUrl(customer_id);

    res.json({ success: true, portalUrl });
  } catch (error) {
    logger.error('Get customer portal failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Validate license key
 */
exports.validateLicense = async (req, res) => {
  try {
    const { license_key } = req.body;

    if (!license_key) {
      return res.status(400).json({ error: 'license_key is required' });
    }

    const result = await lemonSqueezy.validateLicenseKey(license_key);

    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Validate license failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Activate license key
 */
exports.activateLicense = async (req, res) => {
  try {
    const { license_key, instance_name } = req.body;

    if (!license_key || !instance_name) {
      return res.status(400).json({ error: 'license_key and instance_name are required' });
    }

    const result = await lemonSqueezy.activateLicenseKey(license_key, instance_name);

    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Activate license failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Deactivate license key
 */
exports.deactivateLicense = async (req, res) => {
  try {
    const { license_key, instance_id } = req.body;

    if (!license_key || !instance_id) {
      return res.status(400).json({ error: 'license_key and instance_id are required' });
    }

    const result = await lemonSqueezy.deactivateLicenseKey(license_key, instance_id);

    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Deactivate license failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get order history for user
 */
exports.getOrderHistory = async (req, res) => {
  try {
    const { user_id, limit = 20 } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const ordersSnapshot = await db.collection('orders')
      .where('userId', '==', user_id)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, orders });
  } catch (error) {
    logger.error('Get order history failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
