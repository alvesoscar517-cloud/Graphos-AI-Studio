import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { getUserInfo } from '../services/api';
import { usePayment } from '../contexts/PaymentContext';
import apiClient from '../services/api/client';

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
  const { t } = useTranslation();
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [loading, setLoading] = useState(false);
  const [loadingPackageId, setLoadingPackageId] = useState(null);
  const [error, setError] = useState(null);
  
  // Payment context - polling is managed at app level
  const { startPolling } = usePayment();

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
      setError(null);
    }
  }, [isOpen]);

  // Listen for payment success event to trigger callback
  useEffect(() => {
    const handlePaymentSuccess = () => {
      onPurchaseSuccess?.();
    };
    
    window.addEventListener('payment-success', handlePaymentSuccess);
    return () => {
      window.removeEventListener('payment-success', handlePaymentSuccess);
    };
  }, [onPurchaseSuccess]);

  const fetchPackages = async () => {
    try {
      const { data } = await apiClient.get('/api/credits/packages');

      if (data.packages && data.packages.length > 0) {
        // Merge with default to keep icon and popular flag (match by id)
        const defaultMap = DEFAULT_PACKAGES.reduce((acc, pkg) => {
          acc[pkg.id] = pkg;
          return acc;
        }, {});
        
        const mergedPackages = data.packages.map((pkg) => ({
          ...defaultMap[pkg.id],
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
      
      const { data } = await apiClient.post('/api/payment/checkout', {
        packageId: pkg.id,
        variantId: pkg.variantId,
        userId: userInfo.userId,
        email: userInfo.email
      });

      if (data.success && data.checkoutUrl) {
        // Start polling for payment status
        startPolling();
        window.open(data.checkoutUrl, '_blank');
        onClose();
      } else {
        // Show error in modal instead of using modal.error
        setError(data.error || t('errors.unableToCreatePayment'));
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      setError(t('errors.networkError'));
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

  if (!isOpen) return null;

  const modalContent = (
    <div className="upgrade-modal-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upgrade-modal-header">
          <div className="header-title">
            <img src="/icon/coins.svg" alt="" className="header-icon" />
            <h2>{t('billing.buyCredits')}</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label={t('common.close')}>
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
                      <span>{t('billing.popular')}</span>
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
                      <span>{t('billing.credits')}</span>
                    </div>
                    {bonusPercent && (
                      <div className="bonus-tag">
                        <img src="/icon/gift.svg" alt="" />
                        <span>+{bonusPercent}% {t('billing.bonus')}</span>
                      </div>
                    )}
                  </div>

                  <div className="package-value">
                    <span className="per-credit">
                      {formatPrice(pkg.price / pkg.totalCredits)}{t('billing.perCredit')}
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
                        <span>{t('common.processing')}</span>
                      </>
                    ) : (
                      <>
                        <img src="/icon/shopping-cart.svg" alt="" />
                        <span>{t('billing.buyNow')}</span>
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
            <span className="lemon-text">{t('billing.securePayment')}</span>
            <img src="/icon/lemonsqueezy-with-name.svg" alt="Lemon Squeezy" className="lemon-logo" />
          </div>
          <div className="payment-methods">
            <img src="/icon/credit-card.svg" alt="Card" title={t('billing.creditDebitCard')} />
            <span className="separator">•</span>
            <span className="method-text">{t('billing.paymentMethods')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UpgradePlanModal;
