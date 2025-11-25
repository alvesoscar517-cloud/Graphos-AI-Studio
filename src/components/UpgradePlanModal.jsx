import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CONFIG } from '../utils/config';
import { getUserInfo } from '../services/api';
import './UpgradePlanModal.css';

// Default packages với variant IDs
const DEFAULT_PACKAGES = [
  {
    id: 'basic',
    credits: 100,
    price: 4.99,
    bonus: 0,
    totalCredits: 100,
    description: 'Basic'
  },
  {
    id: 'pro',
    credits: 500,
    price: 19.99,
    bonus: 50,
    totalCredits: 550,
    description: 'Pro'
  },
  {
    id: 'pro_plus',
    credits: 1500,
    price: 49.99,
    bonus: 300,
    totalCredits: 1800,
    description: 'Pro+'
  },
  {
    id: 'power',
    credits: 5000,
    price: 149.99,
    bonus: 1500,
    totalCredits: 6500,
    description: 'Power'
  }
];

const UpgradePlanModal = ({ isOpen, onClose, onUpgrade }) => {
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [loading, setLoading] = useState(false);
  const [loadingPackageId, setLoadingPackageId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/credits/packages`);
      const data = await response.json();

      if (data.packages && data.packages.length > 0) {
        setPackages(data.packages);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handlePurchasePackage = async (pkg) => {
    setLoading(true);
    setLoadingPackageId(pkg.id);
    
    try {
      const userInfo = await getUserInfo();
      
      // Gọi API tạo checkout URL từ Lemon Squeezy
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
        // Mở Lemon Squeezy checkout trong tab mới
        window.open(data.checkoutUrl, '_blank');
        onClose();
      } else {
        alert('Không thể tạo thanh toán: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Lỗi khi tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setLoadingPackageId(null);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="upgrade-modal-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upgrade-modal-header">
          <h2>Mua Credits</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="upgrade-modal-content">
          <div className="packages-grid">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="package-card"
              >
                <h3>{pkg.description}</h3>

                <div className="package-price">
                  <span className="price">${pkg.price}</span>
                </div>

                <div className="package-credits">
                  <strong>{pkg.totalCredits}</strong> credits
                  {pkg.bonus > 0 && (
                    <span className="bonus-percent">+{Math.round((pkg.bonus / pkg.credits) * 100)}% bonus</span>
                  )}
                </div>

                <button
                  className="purchase-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchasePackage(pkg);
                  }}
                  disabled={loading}
                >
                  {loadingPackageId === pkg.id ? 'Đang xử lý...' : 'Mua ngay'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="upgrade-modal-footer">
          <p className="note">
            Thanh toán an toàn qua Lemon Squeezy
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UpgradePlanModal;
