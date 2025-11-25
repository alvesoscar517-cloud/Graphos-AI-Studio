/**
 * Credit Handler Utility
 * Xử lý lỗi credit và hiển thị thông báo cho user
 */

/**
 * Kiểm tra response có phải lỗi credit không
 */
export function isCreditError(error) {
  return error?.code === 'INSUFFICIENT_CREDITS' || 
         error?.message?.includes('Insufficient credits') ||
         error?.message?.includes('credit');
}

/**
 * Hiển thị modal thông báo hết credit
 */
export function showCreditErrorModal(error, onUpgradeClick) {
  const required = error?.required || 0;
  const available = error?.available || 0;
  const shortfall = error?.shortfall || (required - available);

  const message = `
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 48px; margin-bottom: 16px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <path d="M2 10h20"/>
        </svg>
      </div>
      <h3 style="margin: 0 0 12px; color: #202124;">Không đủ Credits</h3>
      <p style="margin: 0 0 8px; color: #5f6368;">
        Bạn cần <strong>${required.toFixed(2)}</strong> credits để thực hiện thao tác này/
      </p>
      <p style="margin: 0 0 20px; color: #5f6368;">
        Hiện tại bạn có <strong>${available.toFixed(2)}</strong> credits/
        <br/>
        Thiếu <strong style="color: #d93025;">${shortfall.toFixed(2)}</strong> credits/
      </p>
      <button 
        onclick="window.handleUpgradeClick()" 
        style="
          padding: 10px 24px;
          background: #1a73e8;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        "
      >
        Mua Credits Ngay
      </button>
    </div>
  `;

  // Store callback globally
  window.handleUpgradeClick = () => {
    if (window.modal) {
      window.modal.close();
    }
    if (onUpgradeClick) {
      onUpgradeClick();
    }
  };

  if (window.modal) {
    window.modal.show(message);
  } else {
    alert(`Không đủ credits! Cần ${required.toFixed(2)} credits / bạn có ${available.toFixed(2)} credits/`);
    if (onUpgradeClick) {
      onUpgradeClick();
    }
  }
}

/**
 * Xử lý API response và kiểm tra lỗi credit
 */
export async function handleApiResponse(response, onUpgradeClick) {
  // Check HTTP status
  if (response.status === 402) {
    const data = await response.json();
    showCreditErrorModal(data, onUpgradeClick);
    throw new Error('INSUFFICIENT_CREDITS');
  }

  return response;
}

/**
 * Wrapper cho API calls với xử lý credit tự động
 */
export async function withCreditHandling(apiCall, onUpgradeClick) {
  try {
    return await apiCall();
  } catch (error) {
    if (isCreditError(error)) {
      showCreditErrorModal(error, onUpgradeClick);
    }
    throw error;
  }
}

/**
 * Tính toán ước lượng credit cho một thao tác
 */
export function estimateCredits(operation, params = {}) {
  const estimates = {
    ai_detection: (wordCount = 100) => Math.min(2 + wordCount * 0.001, 10),
    text_analysis: (sentenceCount = 5) => Math.min(5 + sentenceCount * 0.5, 30),
    text_rewrite: (wordCount = 100) => Math.min(3 + wordCount * 0.002, 20),
    improvement_suggestions: (sentenceCount = 1) => Math.min(2 + sentenceCount * 1, 15),
    chat_message: (wordCount = 50) => Math.min(1 + wordCount * 0.001, 10)
  };

  const estimator = estimates[operation];
  if (!estimator) {
    return 0;
  }

  return estimator(params.wordCount || params.sentenceCount || 0);
}

/**
 * Hiển thị preview credit cost trước khi thực hiện
 */
export function showCreditPreview(operation, cost) {
  const operationNames = {
    ai_detection: 'Phát hiện AI',
    text_analysis: 'Phân tích văn bản',
    text_rewrite: 'Viết lại văn bản',
    improvement_suggestions: 'Gợi ý cải thiện',
    chat_message: 'Tin nhắn chat'
  };

  const name = operationNames[operation] || operation;
  console.log(`[Credit] ${name}: ~${cost.toFixed(2)} credits`);
}
