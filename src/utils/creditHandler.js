/**
 * Credit Handler Utility
 * Handle credit errors and display notifications to user
 */

/**
 * Check if response is a credit error
 */
export function isCreditError(error) {
  return error?.code === 'INSUFFICIENT_CREDITS' || 
         error?.message?.includes('Insufficient credits') ||
         error?.message?.includes('credit');
}

/**
 * Show modal notification for insufficient credits
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
      <h3 style="margin: 0 0 12px; color: #202124;">Insufficient Credits</h3>
      <p style="margin: 0 0 8px; color: #5f6368;">
        You need <strong>${required.toFixed(2)}</strong> credits to perform this action.
      </p>
      <p style="margin: 0 0 20px; color: #5f6368;">
        You currently have <strong>${available.toFixed(2)}</strong> credits.
        <br/>
        You need <strong style="color: #d93025;">${shortfall.toFixed(2)}</strong> more credits.
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
        Buy Credits Now
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
    alert(`Insufficient credits! Need ${required.toFixed(2)} credits, you have ${available.toFixed(2)} credits.`);
    if (onUpgradeClick) {
      onUpgradeClick();
    }
  }
}

/**
 * Handle API response and check for credit errors
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
 * Wrapper for API calls with automatic credit handling
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
 * Calculate estimated credit for an operation
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
 * Show credit cost preview before performing operation
 */
export function showCreditPreview(operation, cost) {
  const operationNames = {
    ai_detection: 'AI Detection',
    text_analysis: 'Text Analysis',
    text_rewrite: 'Text Rewrite',
    improvement_suggestions: 'Improvement Suggestions',
    chat_message: 'Chat Message'
  };

  const name = operationNames[operation] || operation;
  console.log(`[Credit] ${name}: ~${cost.toFixed(2)} credits`);
}
