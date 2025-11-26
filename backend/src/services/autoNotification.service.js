/**
 * Auto Notification Service
 * Automatically sends notifications for important user events
 * 
 * Events:
 * - First login (welcome + free credits info)
 * - Purchase completed (credits added)
 * - Subscription created/renewed
 * - Low credits warning
 * - Profile created
 */

const { db } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

// Notification templates
const NOTIFICATION_TEMPLATES = {
  // Welcome notification for first login
  WELCOME: {
    type: 'announcement',
    priority: 'high',
    translations: {
      vi: {
        title: '🎉 Chào mừng bạn đến với AI Content Auth!',
        message: 'Bạn đã nhận được {credits} credits miễn phí để bắt đầu. Hãy khám phá các tính năng phân tích AI của chúng tôi!',
        cta: 'Bắt đầu ngay'
      },
      en: {
        title: '🎉 Welcome to AI Content Auth!',
        message: 'You have received {credits} free credits to get started. Explore our AI analysis features!',
        cta: 'Get Started'
      },
      ja: {
        title: '🎉 AI Content Authへようこそ！',
        message: '{credits}の無料クレジットを受け取りました。AI分析機能をお試しください！',
        cta: '始める'
      }
    },
    ctaAction: { type: 'view', action: 'aistudio-editor' }
  },

  // Purchase completed
  PURCHASE_COMPLETED: {
    type: 'success',
    priority: 'high',
    translations: {
      vi: {
        title: '✅ Thanh toán thành công!',
        message: 'Bạn đã mua gói {packageName} và nhận được {credits} credits. Số dư hiện tại: {balance} credits.',
        cta: 'Xem lịch sử'
      },
      en: {
        title: '✅ Payment Successful!',
        message: 'You purchased {packageName} and received {credits} credits. Current balance: {balance} credits.',
        cta: 'View History'
      },
      ja: {
        title: '✅ 支払い完了！',
        message: '{packageName}を購入し、{credits}クレジットを受け取りました。現在の残高：{balance}クレジット。',
        cta: '履歴を見る'
      }
    },
    ctaAction: { type: 'view', action: 'settings' }
  },

  // Low credits warning
  LOW_CREDITS: {
    type: 'warning',
    priority: 'medium',
    translations: {
      vi: {
        title: '⚠️ Credits sắp hết',
        message: 'Bạn chỉ còn {credits} credits. Hãy nạp thêm để tiếp tục sử dụng dịch vụ.',
        cta: 'Nạp credits'
      },
      en: {
        title: '⚠️ Low Credits',
        message: 'You only have {credits} credits left. Top up to continue using our services.',
        cta: 'Buy Credits'
      },
      ja: {
        title: '⚠️ クレジット残高が少なくなっています',
        message: '残り{credits}クレジットです。サービスを継続するにはチャージしてください。',
        cta: 'クレジットを購入'
      }
    },
    ctaAction: { type: 'view', action: 'upgrade' }
  },

  // Profile created
  PROFILE_CREATED: {
    type: 'success',
    priority: 'medium',
    translations: {
      vi: {
        title: '🎤 Voice Profile đã tạo!',
        message: 'Profile "{profileName}" đã được tạo thành công. Bây giờ bạn có thể sử dụng nó để phân tích văn bản.',
        cta: 'Sử dụng ngay'
      },
      en: {
        title: '🎤 Voice Profile Created!',
        message: 'Profile "{profileName}" has been created successfully. You can now use it for text analysis.',
        cta: 'Use Now'
      },
      ja: {
        title: '🎤 ボイスプロファイル作成完了！',
        message: 'プロファイル「{profileName}」が作成されました。テキスト分析に使用できます。',
        cta: '今すぐ使う'
      }
    },
    ctaAction: { type: 'view', action: 'aistudio-editor' }
  },

  // Credits expired warning
  CREDITS_EXPIRING: {
    type: 'warning',
    priority: 'high',
    translations: {
      vi: {
        title: '⏰ Credits sắp hết hạn',
        message: '{credits} credits của bạn sẽ hết hạn trong {days} ngày. Hãy sử dụng trước khi hết hạn!',
        cta: 'Sử dụng ngay'
      },
      en: {
        title: '⏰ Credits Expiring Soon',
        message: 'Your {credits} credits will expire in {days} days. Use them before they expire!',
        cta: 'Use Now'
      },
      ja: {
        title: '⏰ クレジットの有効期限が近づいています',
        message: '{credits}クレジットが{days}日後に期限切れになります。期限前にご利用ください！',
        cta: '今すぐ使う'
      }
    },
    ctaAction: { type: 'view', action: 'aistudio-editor' }
  },

  // New feature announcement
  NEW_FEATURE: {
    type: 'announcement',
    priority: 'medium',
    translations: {
      vi: {
        title: '🆕 Tính năng mới!',
        message: '{featureName}: {description}',
        cta: 'Khám phá'
      },
      en: {
        title: '🆕 New Feature!',
        message: '{featureName}: {description}',
        cta: 'Explore'
      },
      ja: {
        title: '🆕 新機能！',
        message: '{featureName}：{description}',
        cta: '探索する'
      }
    },
    ctaAction: { type: 'view', action: 'home' }
  }
};

/**
 * Replace placeholders in text with actual values
 */
function replacePlaceholders(text, data) {
  if (!text) return text;
  let result = text;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

/**
 * Create notification from template
 */
function createFromTemplate(templateKey, data = {}) {
  const template = NOTIFICATION_TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`Unknown notification template: ${templateKey}`);
  }

  const notification = {
    type: template.type,
    priority: template.priority,
    translations: {},
    ctaAction: template.ctaAction
  };

  // Process translations with placeholders
  for (const [lang, content] of Object.entries(template.translations)) {
    notification.translations[lang] = {
      title: replacePlaceholders(content.title, data),
      message: replacePlaceholders(content.message, data),
      cta: content.cta
    };
  }

  return notification;
}

/**
 * Send notification to a specific user
 */
async function sendToUser(userId, notification, expiresInDays = 30) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000);
  
  const userNotifId = uuidv4();
  
  await db.collection('user_notifications').doc(userNotifId).set({
    userId,
    notificationId: null, // Auto-generated, not from admin
    type: notification.type,
    priority: notification.priority,
    translations: notification.translations,
    ctaAction: notification.ctaAction || null,
    expiresAt,
    read: false,
    clicked: false,
    autoGenerated: true,
    createdAt: now
  });

  // Dispatch event for real-time update (if SSE connected)
  console.log(`[AUTO-NOTIF] Sent to user ${userId}:`, notification.translations.vi?.title);
  
  return userNotifId;
}

// ============================================================================
// PUBLIC API - Call these from other controllers
// ============================================================================

/**
 * Send welcome notification on first login
 */
async function sendWelcomeNotification(userId, freeCredits = 100) {
  try {
    // Check if user already received welcome notification
    const existingSnapshot = await db.collection('user_notifications')
      .where('userId', '==', userId)
      .where('autoGenerated', '==', true)
      .where('type', '==', 'announcement')
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      console.log(`[AUTO-NOTIF] User ${userId} already received welcome notification`);
      return null;
    }

    const notification = createFromTemplate('WELCOME', { credits: freeCredits });
    return await sendToUser(userId, notification);
  } catch (error) {
    console.error('[AUTO-NOTIF] Send welcome notification error:', error);
    return null;
  }
}

/**
 * Send purchase completed notification
 */
async function sendPurchaseNotification(userId, packageName, creditsAdded, newBalance) {
  try {
    const notification = createFromTemplate('PURCHASE_COMPLETED', {
      packageName,
      credits: creditsAdded,
      balance: newBalance
    });
    return await sendToUser(userId, notification, 7); // Expires in 7 days
  } catch (error) {
    console.error('[AUTO-NOTIF] Send purchase notification error:', error);
    return null;
  }
}

/**
 * Send low credits warning
 */
async function sendLowCreditsWarning(userId, remainingCredits) {
  try {
    // Check if already sent recently (within 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const existingSnapshot = await db.collection('user_notifications')
      .where('userId', '==', userId)
      .where('type', '==', 'warning')
      .where('createdAt', '>', sevenDaysAgo)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return null; // Already warned recently
    }

    const notification = createFromTemplate('LOW_CREDITS', { credits: remainingCredits });
    return await sendToUser(userId, notification, 14);
  } catch (error) {
    console.error('[AUTO-NOTIF] Send low credits warning error:', error);
    return null;
  }
}

/**
 * Send profile created notification
 */
async function sendProfileCreatedNotification(userId, profileName) {
  try {
    const notification = createFromTemplate('PROFILE_CREATED', { profileName });
    return await sendToUser(userId, notification, 7);
  } catch (error) {
    console.error('[AUTO-NOTIF] Send profile created notification error:', error);
    return null;
  }
}

/**
 * Send new feature announcement to all users
 */
async function sendNewFeatureAnnouncement(featureName, description, targetView = 'home') {
  try {
    const notification = createFromTemplate('NEW_FEATURE', { featureName, description });
    notification.ctaAction = { type: 'view', action: targetView };

    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Batch create notifications
    const BATCH_SIZE = 450;
    const userIds = usersSnapshot.docs.map(doc => doc.id);

    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchUserIds = userIds.slice(i, i + BATCH_SIZE);

      batchUserIds.forEach(userId => {
        const userNotifId = uuidv4();
        const userNotifRef = db.collection('user_notifications').doc(userNotifId);

        batch.set(userNotifRef, {
          userId,
          notificationId: null,
          type: notification.type,
          priority: notification.priority,
          translations: notification.translations,
          ctaAction: notification.ctaAction,
          expiresAt,
          read: false,
          clicked: false,
          autoGenerated: true,
          createdAt: now
        });
      });

      await batch.commit();
    }

    console.log(`[AUTO-NOTIF] New feature announcement sent to ${userIds.length} users`);
    return userIds.length;
  } catch (error) {
    console.error('[AUTO-NOTIF] Send new feature announcement error:', error);
    return 0;
  }
}

module.exports = {
  sendWelcomeNotification,
  sendPurchaseNotification,
  sendLowCreditsWarning,
  sendProfileCreatedNotification,
  sendNewFeatureAnnouncement,
  NOTIFICATION_TEMPLATES,
  createFromTemplate,
  sendToUser
};
