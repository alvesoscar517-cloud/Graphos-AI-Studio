/**
 * Test Notifications - Quick testing utilities
 */

import { simulateNotification } from '../services/notificationService';

export const testNotifications = {
  info: () => {
    simulateNotification({
      type: 'info',
      priority: 'medium',
      translations: {
        vi: { title: 'Thông tin hệ thống', message: 'Hệ thống đã được cập nhật', cta: '' },
        en: { title: 'System Info', message: 'System has been updated', cta: '' },
        ja: { title: 'システム情報', message: 'システムが更新されました', cta: '' }
      }
    });
  },

  success: () => {
    simulateNotification({
      type: 'success',
      priority: 'high',
      translations: {
        vi: { title: 'Phân tích hoàn tất', message: 'Văn bản có độ tương thích 92%', cta: 'Xem chi tiết' },
        en: { title: 'Analysis Complete', message: 'Text has 92% compatibility', cta: 'View Details' },
        ja: { title: '分析完了', message: 'テキストは92%の互換性があります', cta: '詳細を見る' }
      }
    });
  },

  warning: () => {
    simulateNotification({
      type: 'warning',
      priority: 'high',
      translations: {
        vi: { title: 'Cảnh báo hạn mức', message: 'Đã sử dụng 85% hạn mức', cta: 'Nâng cấp' },
        en: { title: 'Quota Warning', message: 'Used 85% of quota', cta: 'Upgrade' },
        ja: { title: 'クォータ警告', message: 'クォータの85%を使用', cta: 'アップグレード' }
      }
    });
  },

  error: () => {
    simulateNotification({
      type: 'error',
      priority: 'urgent',
      translations: {
        vi: { title: 'Lỗi kết nối', message: 'Không thể kết nối máy chủ', cta: 'Thử lại' },
        en: { title: 'Connection Error', message: 'Unable to connect', cta: 'Retry' },
        ja: { title: '接続エラー', message: '接続できません', cta: '再試行' }
      }
    });
  },

  announcement: () => {
    simulateNotification({
      type: 'announcement',
      priority: 'high',
      translations: {
        vi: { title: '🎉 Tính năng mới', message: 'Viết lại văn bản theo nhiều phong cách', cta: 'Khám phá' },
        en: { title: '🎉 New Feature', message: 'Rewrite text in multiple styles', cta: 'Explore' },
        ja: { title: '🎉 新機能', message: '複数のスタイルでテキストを書き換え', cta: '探索' }
      }
    });
  },

  all: () => {
    testNotifications.info();
    setTimeout(() => testNotifications.success(), 500);
    setTimeout(() => testNotifications.warning(), 1000);
    setTimeout(() => testNotifications.error(), 1500);
    setTimeout(() => testNotifications.announcement(), 2000);
  },

  clear: () => {
    localStorage.removeItem('user_notifications');
    window.dispatchEvent(new CustomEvent('new-notification'));
    console.log('✅ Cleared all notifications');
  },

  spam: () => {
    for (let i = 1; i <= 10; i++) {
      setTimeout(() => {
        simulateNotification({
          type: ['info', 'success', 'warning'][i % 3],
          priority: 'medium',
          translations: {
            vi: { title: `Thông báo ${i}`, message: `Test notification ${i}`, cta: '' }
          }
        });
      }, i * 200);
    }
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.testNotif = testNotifications;
  
  console.log('🔔 Test: window.testNotif.info() | .success() | .all() | .clear()');
}
