import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CONFIG } from '../utils/config';
import { getUserInfo } from '../services/api';
import { usePaymentPolling } from '../hooks/usePaymentPolling';
import PaymentSuccessNotification from './PaymentSuccessNotification';

import './UpgradePlanModal.css';

// Default packages với variant IDs
const DEFAULT_PACKAGES = [
  {
    id: 'basic',
    credits: 100,
    price: 4.99,
    bonus: 0,
    totalCredits: 100,
    description: 'Basic',
    icon: 'zap'
  },
  {
    id: 'pro',
    credits: 500,
    price: 19.99,
    bonus: 50,
    totalCredits: 550,
    description: 'Pro',
    popular: true,
    icon: 'star'
  },
  {
    id: 'pro_plus',
    credits: 1500,
    price: 49.99,
    bonus: 300,
    totalCredits: 1800,
    description: 'Pro+',
    icon: 'award'
  },
  {
    id: 'power',
    credits: 5000,
    price: 149.99,
    bonus: 1500,
    totalCredits: 6500,
    description: 'Power',
    icon: 'rocket'
  }
];

const UpgradePlanModal = ({ isOpen, onClose, onPurchaseSuccess }) => {
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [loading, setLoading] = useState(false);
  const [loadingPackageId, setLoadingPackageId] = useState(null);
  const [error, setError] = useState(null);
  
  // Payment polling hook
  const { 
    purchaseResult, 
    startPolling, 
    stopPolling, 
    clearPurchaseResult 
  } = usePaymentPolling();

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
      setError(null);
    } else {
      // Stop polling when modal closes (but keep checking in background)
    }
  }, [isOpen]);

  // Stop polling when component unmounts
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/credits/packages`);
      const data = await response.json();

      if (data.packages && data.packages.length > 0) {
        // Merge với default để giữ icon và popular flag
        const mergedPackages = data.packages.map((pkg, index) => ({
          ...DEFAULT_PACKAGES[index],
          ...pkg
        }));
        setPackages(mergedPackages);
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
    }
  };

  const handlePurchasePackage = async (pkg) => {
    setLoading(true);
    setLoadingPackageId(pkg.id);
    setError(null);
    
    try {
      const userInfo = await getUserInfo();
      
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/payment/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          variantId: pkg.variantId,
          userId: userInfo.userId,
          email: userInfo.email
        })
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Start polling for payment status
        startPolling();
        window.open(data.checkoutUrl, '_blank');
        onClose();
      } else {
        // Hiển thị lỗi trong modal thay vì dùng modal.error
        setError(data.error || 'Không thể tạo thanh toán. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      setError('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
    } finally {
      setLoading(false);
      setLoadingPackageId(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const getBonusPercent = (pkg) => {
    if (pkg.bonus <= 0) return null;
    return Math.round((pkg.bonus / pkg.credits) * 100);
  };

  // Handle purchase success notification close
  const handlePurchaseNotificationClose = () => {
    clearPurchaseResult();
    // Callback to parent to refresh credit balance
    onPurchaseSuccess?.();
  };

  // Show success notification even when modal is closed
  if (purchaseResult) {
    return (
      <PaymentSuccessNotification
        isVisible={true}
        order={purchaseResult.order}
        credits={purchaseResult.credits}
        onClose={handlePurchaseNotificationClose}
      />
    );
  }

  if (!isOpen) return null;

  const modalContent = (
    <div className="upgrade-modal-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upgrade-modal-header">
          <div className="header-title">
            <img src="/icon/coins.svg" alt="" className="header-icon" />
            <h2>Mua Credits</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Đóng">
            <img src="/icon/x.svg" alt="" />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <img src="/icon/alert-circle.svg" alt="" className="error-icon" />
            <span>{error}</span>
            <button className="error-close" onClick={() => setError(null)}>
              <img src="/icon/x.svg" alt="" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="upgrade-modal-content">
          <div className="packages-grid">
            {packages.map((pkg) => {
              const bonusPercent = getBonusPercent(pkg);
              return (
                <div
                  key={pkg.id}
                  className={`package-card ${pkg.popular ? 'popular' : ''}`}
                >
                  {pkg.popular && (
                    <div className="popular-badge">
                      <img src="/icon/tags.svg" alt="" />
                      <span>Phổ biến</span>
                    </div>
                  )}
                  
                  <div className="package-header">
                    <div className="package-icon">
                      <img src={`/icon/${pkg.icon || 'zap'}.svg`} alt="" />
                    </div>
                    <h3>{pkg.description}</h3>
                  </div>

                  <div className="package-price">
                    <span className="price">{formatPrice(pkg.price)}</span>
                  </div>

                  <div className="package-credits">
                    <div className="credits-main">
                      <img src="/icon/coins.svg" alt="" className="credits-icon" />
                      <strong>{pkg.totalCredits.toLocaleString()}</strong>
                      <span>credits</span>
                    </div>
                    {bonusPercent && (
                      <div className="bonus-tag">
                        <img src="/icon/gift.svg" alt="" />
                        <span>+{bonusPercent}% bonus</span>
                      </div>
                    )}
                  </div>

                  <div className="package-value">
                    <span className="per-credit">
                      {formatPrice(pkg.price / pkg.totalCredits)}/credit
                    </span>
                  </div>

                  <button
                    className={`purchase-btn ${pkg.popular ? 'primary' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchasePackage(pkg);
                    }}
                    disabled={loading}
                  >
                    {loadingPackageId === pkg.id ? (
                      <>
                        <span className="spinner"></span>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <img src="/icon/shopping-cart.svg" alt="" />
                        <span>Mua ngay</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="upgrade-modal-footer">
          <div className="payment-info">
            <span className="lemon-text">Thanh toán an toàn qua</span>
            <img src="/icon/lemonsqueezy-with-name.svg" alt="Lemon Squeezy" className="lemon-logo" />
          </div>
          <div className="payment-methods">
            <img src="/icon/credit-card.svg" alt="Card" title="Credit/Debit Card" />
            <span className="separator">•</span>
            <span className="method-text">Visa, Mastercard, PayPal</span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UpgradePlanModal;
