/**
 * Payment Controller
 * Handles Lemon Squeezy payment integration
 * REFUNDS ARE NOT ALLOWED
 */

const { db, FieldValue } = require('../config/firebase');
const lemonSqueezy = require('../services/lemonsqueezy.service');
const creditService = require('../services/credit.service');
const { CREDIT_PACKAGES, getCreditPackages, getPackageByVariantId, getPackageByPrice } = require('../config/pricing');
const logger = require('../utils/logger');
const realtimeController = require('./realtime.controller');
const autoNotification = require('../services/autoNotification.service');
const { createLocalizer } = require('../utils/localized-messages.util');
const envConfig = require('../config/envConfigHelper');

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
  const l = createLocalizer(req);
  
  try {
    const { variantId, packageId, userId, email } = req.body;

    const apiKey = envConfig.get('LEMON_SQUEEZY_API_KEY');
    const storeId = envConfig.get('LEMON_SQUEEZY_STORE_ID');

    logger.info('Checkout request received', { 
      variantId, 
      packageId, 
      userId, 
      email,
      hasApiKey: !!apiKey,
      hasStoreId: !!storeId
    });

    if (!variantId || !userId) {
      return res.status(400).json({ 
        success: false, 
        ...l.error('invalid_input'),
        details: 'variantId and userId are required'
      });
    }

    // Check if LemonSqueezy is configured
    if (!apiKey || !storeId) {
      logger.error('LemonSqueezy not configured', {
        hasApiKey: !!apiKey,
        hasStoreId: !!storeId
      });
      return res.status(503).json({ 
        success: false, 
        error: 'Payment service not configured',
        code: 'PAYMENT_SERVICE_UNAVAILABLE'
      });
    }

    const checkoutUrl = await lemonSqueezy.createCheckout(variantId, {
      email,
      userId,
      customData: { package_id: packageId }
    });

    logger.info('Checkout created', { variantId, userId, packageId, checkoutUrl: checkoutUrl?.substring(0, 50) });

    res.json({ success: true, checkoutUrl });
  } catch (error) {
    logger.error('Create checkout failed', { 
      error: error.message, 
      stack: error.stack,
      variantId: req.body?.variantId,
      userId: req.body?.userId
    });
    res.status(500).json({ 
      success: false, 
      ...l.error('server_error'), 
      details: error.message,
      code: 'CHECKOUT_FAILED'
    });
  }
};


/**
 * Handle Lemon Squeezy webhooks
 */
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    logger.info('Webhook received', { 
      hasSignature: !!signature, 
      hasRawBody: !!req.rawBody,
      bodyType: typeof req.body 
    });

    // Verify webhook signature (skip in test mode if no secret configured)
    const webhookSecret = envConfig.get('LEMON_SQUEEZY_WEBHOOK_SECRET');
    if (webhookSecret && signature) {
      if (!lemonSqueezy.verifyWebhookSignature(rawBody, signature)) {
        logger.warn('Invalid webhook signature', { signature: signature?.substring(0, 20) + '...' });
        return res.status(401).json({ success: false, error: 'Invalid signature', code: 'INVALID_SIGNATURE' });
      }
      logger.info('Webhook signature verified');
    } else if (!webhookSecret) {
      logger.warn('Webhook secret not configured - skipping signature verification');
    }

    const { meta, data } = req.body;
    const eventName = meta.event_name;
    const customData = meta.custom_data || {};

    logger.info('Processing webhook event', { 
      event: eventName, 
      id: data.id,
      customData,
      testMode: meta.test_mode 
    });

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

    logger.info('Webhook processed successfully');
    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing failed', { 
      error: error.message, 
      stack: error.stack,
      body: req.body 
    });
    res.status(500).json({ success: false, error: 'Webhook processing failed', code: 'WEBHOOK_ERROR', details: error.message });
  }
};

/**
 * Handle order created - Add credits to user
 * Includes first purchase bonus (x2 credits) for new members
 */
async function handleOrderCreated(data, customData) {
  const attrs = data.attributes;
  const userId = customData.user_id;
  let packageId = customData.package_id;
  
  const variantId = attrs.first_order_item?.variant_id;
  const orderTotal = attrs.total; // Price in cents
  
  // Try to find package: 1) from custom_data, 2) from variant ID, 3) from price
  let foundPkg = null;
  const currentPackages = getCreditPackages();
  
  if (packageId && currentPackages[packageId]) {
    foundPkg = { packageId, ...currentPackages[packageId] };
    logger.info('Package found from custom_data', { packageId });
  } else if (variantId) {
    foundPkg = getPackageByVariantId(variantId);
    if (foundPkg) {
      packageId = foundPkg.packageId;
      logger.info('Package found from variant ID', { variantId, packageId });
    }
  }
  
  // Fallback: match by price
  if (!foundPkg && orderTotal) {
    foundPkg = getPackageByPrice(orderTotal);
    if (foundPkg) {
      packageId = foundPkg.packageId;
      logger.info('Package found from price fallback', { orderTotal, packageId });
    }
  }

  // Check if this is user's first purchase (for bonus)
  let isFirstPurchase = false;
  if (userId) {
    const existingOrders = await db.collection('orders')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    isFirstPurchase = existingOrders.empty;
  }

  // Save order record
  const orderData = {
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
    isFirstPurchase, // Track first purchase
    createdAt: new Date(attrs.created_at),
    updatedAt: new Date()
  };
  
  await db.collection('orders').doc(String(data.id)).set(orderData);

  let newCredits = null;

  // Add credits if package exists
  if (userId && foundPkg) {
    const baseCredits = foundPkg.credits + foundPkg.bonus;
    // First purchase bonus: Double the credits (x2)
    const firstPurchaseBonus = isFirstPurchase ? baseCredits : 0;
    const totalCredits = baseCredits + firstPurchaseBonus;
    
    await creditService.addCredits(userId, totalCredits, isFirstPurchase ? 'first_purchase' : 'purchase', {
      orderId: data.id,
      package: packageId,
      price: foundPkg.price,
      baseCredits,
      firstPurchaseBonus,
      isFirstPurchase
    });

    // Get updated credit balance
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    newCredits = userData?.credits || null;
    const creditsBefore = (newCredits?.balance || 0) - totalCredits;

    // Log to user_activity_logs for Activity Logs page
    await db.collection('user_activity_logs').add({
      userId,
      type: 'credit_purchase',
      feature: 'payment',
      source: 'lemon_squeezy',
      creditsUsed: -totalCredits, // Negative because credits are added
      creditsBefore: creditsBefore,
      creditsAfter: newCredits?.balance || totalCredits,
      orderId: data.id,
      packageId,
      packageName: foundPkg.name || packageId,
      price: foundPkg.price,
      priceFormatted: attrs.total_formatted,
      isFirstPurchase,
      firstPurchaseBonus,
      timestamp: new Date(),
      createdAt: new Date()
    });

    logger.info('Credits added from order', { 
      userId, 
      baseCredits,
      firstPurchaseBonus,
      totalCredits, 
      orderId: data.id, 
      packageId,
      isFirstPurchase 
    });
  } else {
    logger.warn('Could not add credits - package not found', { 
      userId, 
      packageId, 
      variantId, 
      orderTotal,
      customData 
    });
  }

  // Broadcast to SSE connections (real-time update to client)
  if (userId) {
    realtimeController.broadcastPayment(userId, {
      type: 'order_created',
      order: {
        orderId: orderData.orderId,
        packageId: orderData.packageId,
        productName: orderData.productName,
        variantName: orderData.variantName,
        total: orderData.total,
        totalFormatted: orderData.totalFormatted
      },
      credits: newCredits
    });

    // Send auto notification for purchase (includes email)
    if (foundPkg && newCredits) {
      const baseCredits = foundPkg.credits + foundPkg.bonus;
      // First purchase bonus: Double the credits (x2)
      const firstPurchaseBonus = isFirstPurchase ? baseCredits : 0;
      const totalCreditsAdded = baseCredits + firstPurchaseBonus;
      
      await autoNotification.sendPurchaseNotification(
        userId,
        foundPkg.description || orderData.variantName || orderData.productName || packageId,
        totalCreditsAdded,
        newCredits.balance || newCredits,
        {
          orderId: String(data.id),
          amount: foundPkg.price,
          currency: attrs.currency || 'USD'
        }
      );
      
      // If first purchase, also send bonus notification with email
      if (isFirstPurchase) {
        await autoNotification.sendFirstPurchaseBonusNotification(
          userId,
          foundPkg.description || orderData.variantName || orderData.productName || packageId,
          baseCredits,
          firstPurchaseBonus, // Bonus credits (same as base for x2)
          'en' // Will be overridden by user's language in the function
        );
      }
    }
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
  const subscriptionPackages = getCreditPackages();
  if (userId && packageId && subscriptionPackages[packageId]) {
    const pkg = subscriptionPackages[packageId];
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
  const l = createLocalizer(req);
  
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
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
    res.status(500).json({ success: false, ...l.error('server_error'), details: error.message });
  }
};

/**
 * Cancel subscription
 */
exports.cancelSubscription = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { subscription_id } = req.body;

    if (!subscription_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    await lemonSqueezy.cancelSubscription(subscription_id);

    res.json({
      success: true,
      message: l.t('success.updated')
    });
  } catch (error) {
    logger.error('Cancel subscription failed', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error'), details: error.message });
  }
};

/**
 * Pause subscription
 */
exports.pauseSubscription = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { subscription_id, mode = 'void' } = req.body;

    if (!subscription_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    const result = await lemonSqueezy.pauseSubscription(subscription_id, mode);

    res.json({ success: true, message: l.t('success.updated'), subscription: result });
  } catch (error) {
    logger.error('Pause subscription failed', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error'), details: error.message });
  }
};

/**
 * Resume subscription
 */
exports.resumeSubscription = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { subscription_id } = req.body;

    if (!subscription_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    const result = await lemonSqueezy.resumeSubscription(subscription_id);

    res.json({ success: true, message: l.t('success.updated'), subscription: result });
  } catch (error) {
    logger.error('Resume subscription failed', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error'), details: error.message });
  }
};

/**
 * Update subscription plan
 */
exports.updateSubscriptionPlan = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { subscription_id, variant_id } = req.body;

    if (!subscription_id || !variant_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    const result = await lemonSqueezy.updateSubscription(subscription_id, variant_id);

    res.json({ success: true, message: l.t('success.updated'), subscription: result });
  } catch (error) {
    logger.error('Update subscription plan failed', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error'), details: error.message });
  }
};

/**
 * Get available products/plans from Lemon Squeezy
 */
exports.getProducts = async (req, res) => {
  const l = createLocalizer(req);
  
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
    res.status(500).json({ success: false, ...l.error('server_error'), details: error.message });
  }
};

/**
 * Get customer portal URL
 */
exports.getCustomerPortal = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { customer_id } = req.query;

    if (!customer_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    const portalUrl = await lemonSqueezy.getCustomerPortalUrl(customer_id);

    res.json({ success: true, portalUrl });
  } catch (error) {
    logger.error('Get customer portal failed', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error'), details: error.message });
  }
};

/**
 * Validate license key
 */
exports.validateLicense = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { license_key } = req.body;

    if (!license_key) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    const result = await lemonSqueezy.validateLicenseKey(license_key);

    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Validate license failed', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error'), details: error.message });
  }
};

/**
 * Activate license key
 */
exports.activateLicense = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { license_key, instance_name } = req.body;

    if (!license_key || !instance_name) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    const result = await lemonSqueezy.activateLicenseKey(license_key, instance_name);

    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Activate license failed', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error'), details: error.message });
  }
};

/**
 * Deactivate license key
 */
exports.deactivateLicense = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { license_key, instance_id } = req.body;

    if (!license_key || !instance_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    const result = await lemonSqueezy.deactivateLicenseKey(license_key, instance_id);

    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Deactivate license failed', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error'), details: error.message });
  }
};

/**
 * Get order history for user
 */
exports.getOrderHistory = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { user_id, limit = 20 } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
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
    res.status(500).json({ success: false, ...l.error('server_error'), details: error.message });
  }
};

/**
 * Check payment status - for polling after checkout
 * Returns the latest order created after a given timestamp
 */
exports.checkPaymentStatus = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { user_id, since } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    // Parse since timestamp (default: 5 minutes ago)
    const sinceTimestamp = since 
      ? parseInt(since) 
      : Date.now() - 5 * 60 * 1000;

    // Simple query - only filter by userId (no orderBy to avoid composite index)
    const ordersSnapshot = await db.collection('orders')
      .where('userId', '==', user_id)
      .get();

    if (ordersSnapshot.empty) {
      return res.json({ 
        success: true, 
        hasPurchase: false,
        message: 'No recent purchase found'
      });
    }

    // Helper to get timestamp from various date formats
    const getTimestamp = (dateValue) => {
      if (!dateValue) return 0;
      if (dateValue.toMillis) return dateValue.toMillis(); // Firestore Timestamp
      if (dateValue instanceof Date) return dateValue.getTime();
      if (typeof dateValue === 'number') return dateValue;
      return new Date(dateValue).getTime();
    };

    // Filter orders created after the timestamp and sort by date desc
    const recentOrders = ordersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(order => getTimestamp(order.createdAt) >= sinceTimestamp)
      .sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt));

    if (recentOrders.length === 0) {
      return res.json({ 
        success: true, 
        hasPurchase: false,
        message: 'No recent purchase found'
      });
    }

    const order = recentOrders[0];
    
    // Get updated credit balance
    const userDoc = await db.collection('users').doc(user_id).get();
    const credits = userDoc.exists ? userDoc.data().credits : null;

    logger.info('Payment status checked', { 
      userId: user_id, 
      orderId: order.orderId,
      packageId: order.packageId 
    });

    res.json({
      success: true,
      hasPurchase: true,
      order: {
        orderId: order.orderId,
        packageId: order.packageId,
        productName: order.productName,
        variantName: order.variantName,
        total: order.total,
        totalFormatted: order.totalFormatted,
        createdAt: order.createdAt
      },
      credits: credits ? {
        balance: credits.balance,
        purchased: credits.purchased
      } : null
    });
  } catch (error) {
    logger.error('Check payment status failed', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error'), details: error.message });
  }
};

module.exports = exports;
