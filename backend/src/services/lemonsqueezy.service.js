/**
 * Lemon Squeezy Payment Service
 * Handles all payment operations with Lemon Squeezy API
 * REFUNDS ARE NOT ALLOWED
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

const LEMON_SQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1';

class LemonSqueezyService {
  constructor() {
    this.apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    this.storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    this.webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  }

  getHeaders() {
    return {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  async apiRequest(endpoint, method = 'GET', body = null) {
    const url = `${LEMON_SQUEEZY_API_URL}${endpoint}`;
    const options = { method, headers: this.getHeaders() };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        logger.error('Lemon Squeezy API error', { status: response.status, data, endpoint });
        throw new Error(data.errors?.[0]?.detail || 'API request failed');
      }

      return data;
    } catch (error) {
      logger.error('Lemon Squeezy request failed', { error: error.message, endpoint });
      throw error;
    }
  }

  verifyWebhookSignature(payload, signature) {
    if (!this.webhookSecret) {
      logger.warn('Webhook secret not configured');
      return false;
    }

    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    const digest = hmac.update(payload).digest('hex');
    
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    } catch {
      return false;
    }
  }


  /**
   * Create checkout URL for purchasing credits
   * Only shows the selected variant - no variant picker
   */
  async createCheckout(variantId, userData = {}) {
    const { email, userId, customData = {} } = userData;

    const checkoutData = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: email,
            custom: {
              user_id: userId,
              ...customData
            }
          },
          product_options: {
            // Disable variant picker - only show selected variant
            enabled_variants: [parseInt(variantId)]
          },
          checkout_options: {
            embed: false,
            media: true,
            logo: true,
            desc: true,
            discount: true
          }
        },
        relationships: {
          store: {
            data: { type: 'stores', id: this.storeId }
          },
          variant: {
            data: { type: 'variants', id: String(variantId) }
          }
        }
      }
    };

    const result = await this.apiRequest('/checkouts', 'POST', checkoutData);
    return result.data.attributes.url;
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId) {
    const result = await this.apiRequest(`/subscriptions/${subscriptionId}`);
    return result.data;
  }

  /**
   * Cancel subscription (at period end, NO REFUND)
   */
  async cancelSubscription(subscriptionId) {
    const result = await this.apiRequest(`/subscriptions/${subscriptionId}`, 'DELETE');
    logger.info('Subscription cancelled (no refund)', { subscriptionId });
    return result;
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(subscriptionId, mode = 'void') {
    const result = await this.apiRequest(`/subscriptions/${subscriptionId}`, 'PATCH', {
      data: {
        type: 'subscriptions',
        id: String(subscriptionId),
        attributes: { pause: { mode } }
      }
    });
    logger.info('Subscription paused', { subscriptionId, mode });
    return result.data;
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(subscriptionId) {
    const result = await this.apiRequest(`/subscriptions/${subscriptionId}`, 'PATCH', {
      data: {
        type: 'subscriptions',
        id: String(subscriptionId),
        attributes: { pause: null }
      }
    });
    logger.info('Subscription resumed', { subscriptionId });
    return result.data;
  }

  /**
   * Update subscription plan
   */
  async updateSubscription(subscriptionId, newVariantId) {
    const result = await this.apiRequest(`/subscriptions/${subscriptionId}`, 'PATCH', {
      data: {
        type: 'subscriptions',
        id: String(subscriptionId),
        attributes: { variant_id: parseInt(newVariantId) }
      }
    });
    logger.info('Subscription updated', { subscriptionId, newVariantId });
    return result.data;
  }

  /**
   * Get order details
   */
  async getOrder(orderId) {
    const result = await this.apiRequest(`/orders/${orderId}`);
    return result.data;
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email) {
    const result = await this.apiRequest(`/customers?filter[email]=${encodeURIComponent(email)}`);
    return result.data?.[0] || null;
  }

  /**
   * Get all products from store
   */
  async getProducts() {
    const result = await this.apiRequest(`/products?filter[store_id]=${this.storeId}`);
    return result.data;
  }

  /**
   * Get product variants (pricing plans)
   */
  async getVariants(productId) {
    const result = await this.apiRequest(`/variants?filter[product_id]=${productId}`);
    return result.data;
  }

  /**
   * Validate license key
   */
  async validateLicenseKey(licenseKey) {
    try {
      const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: licenseKey })
      });
      return await response.json();
    } catch (error) {
      logger.error('License validation failed', { error: error.message });
      return { valid: false, error: error.message };
    }
  }

  /**
   * Activate license key
   */
  async activateLicenseKey(licenseKey, instanceName) {
    try {
      const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: licenseKey, instance_name: instanceName })
      });
      return await response.json();
    } catch (error) {
      logger.error('License activation failed', { error: error.message });
      return { activated: false, error: error.message };
    }
  }

  /**
   * Deactivate license key
   */
  async deactivateLicenseKey(licenseKey, instanceId) {
    try {
      const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/deactivate', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: licenseKey, instance_id: instanceId })
      });
      return await response.json();
    } catch (error) {
      logger.error('License deactivation failed', { error: error.message });
      return { deactivated: false, error: error.message };
    }
  }

  /**
   * Get customer portal URL
   */
  async getCustomerPortalUrl(customerId) {
    const result = await this.apiRequest(`/customers/${customerId}`);
    return result.data.attributes.urls.customer_portal;
  }
}

module.exports = new LemonSqueezyService();
