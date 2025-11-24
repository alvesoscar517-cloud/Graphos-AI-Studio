import { useState, useEffect } from 'react';
import './UpgradePlanModal.css';

// Default plans - hiển thị ngay lập tức
const DEFAULT_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    monthlyCredits: 100,
    features: {
      ai_detection: true,
      text_analysis: true,
      text_rewrite: true,
      chat_message: true,
      voice_profiles: 2,
      priority_support: false,
      api_access: false
    }
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9.99,
    monthlyCredits: 500,
    features: {
      ai_detection: true,
      text_analysis: true,
      text_rewrite: true,
      chat_message: true,
      improvement_suggestions: true,
      voice_profiles: 5,
      priority_support: false,
      api_access: false
    },
    bonus: {
      signup_credits: 100
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 29.99,
    monthlyCredits: 2000,
    features: {
      ai_detection: true,
      text_analysis: true,
      text_rewrite: true,
      chat_message: true,
      improvement_suggestions: true,
      translation: true,
      voice_profiles: 20,
      priority_support: true,
      api_access: false
    },
    bonus: {
      signup_credits: 500
    },
    discount: {
      rewrite_cost: 0.8,
      analysis_cost: 0.8
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    monthlyCredits: 10000,
    features: {
      ai_detection: true,
      text_analysis: true,
      text_rewrite: true,
      chat_message: true,
      improvement_suggestions: true,
      translation: true,
      voice_profiles: -1,
      priority_support: true,
      api_access: true
    },
    bonus: {
      signup_credits: 2000
    },
    discount: {
      rewrite_cost: 0.6,
      analysis_cost: 0.6
    }
  }
];

// Default packages - hiển thị ngay lập tức
const DEFAULT_PACKAGES = [
  {
    id: 'small',
    credits: 100,
    price: 4.99,
    bonus: 0,
    totalCredits: 100,
    description: 'Gói nhỏ'
  },
  {
    id: 'medium',
    credits: 500,
    price: 19.99,
    bonus: 50,
    totalCredits: 550,
    description: 'Gói trung'
  },
  {
    id: 'large',
    credits: 1500,
    price: 49.99,
    bonus: 300,
    totalCredits: 1800,
    description: 'Gói lớn'
  },
  {
    id: 'mega',
    credits: 5000,
    price: 149.99,
    bonus: 1500,
    totalCredits: 6500,
    description: 'Gói khổng lồ'
  }
];

const UpgradePlanModal = ({ isOpen, onClose, currentPlan = 'free', onUpgrade }) => {
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [activeTab, setActiveTab] = useState('subscription');
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Vẫn fetch từ server để cập nhật nếu có thay đổi
      fetchPlansAndPackages();
    }
  }, [isOpen]);

  const fetchPlansAndPackages = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const [plansRes, packagesRes] = await Promise.all([
        fetch(`${apiUrl}/api/subscription/plans`),
        fetch(`${apiUrl}/api/subscription/packages`)
      ]);

      const plansData = await plansRes.json();
      const packagesData = await packagesRes.json();

      // Chỉ cập nhật nếu có data từ server
      if (plansData.plans && plansData.plans.length > 0) {
        setPlans(plansData.plans);
      }
      if (packagesData.packages && packagesData.packages.length > 0) {
        setPackages(packagesData.packages);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Giữ nguyên default plans nếu có lỗi
    }
  };

  const handleUpgradePlan = async (planId) => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/subscription/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: localStorage.getItem('userId'),
          plan_id: planId,
          payment_method: 'card'
        })
      });

      const data = await response.json();

      if (data.success) {
        onUpgrade?.(data);
        onClose();
      } else {
        alert('Upgrade failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Failed to upgrade plan');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchasePackage = async (packageId) => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/subscription/credits/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: localStorage.getItem('userId'),
          package_id: packageId,
          payment_method: 'card'
        })
      });

      const data = await response.json();

      if (data.success) {
        onUpgrade?.(data);
        onClose();
      } else {
        alert('Purchase failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error purchasing package:', error);
      alert('Failed to purchase package');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="upgrade-modal-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upgrade-modal-header">
          <h2>Nâng cấp tài khoản</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="upgrade-tabs">
          <button
            className={`tab ${activeTab === 'subscription' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscription')}
          >
            Gói đăng ký
          </button>
          <button
            className={`tab ${activeTab === 'credits' ? 'active' : ''}`}
            onClick={() => setActiveTab('credits')}
          >
            Mua credits
          </button>
        </div>

        <div className="upgrade-modal-content">
          {activeTab === 'subscription' && (
            <div className="plans-grid">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`plan-card ${plan.id === currentPlan ? 'current' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="plan-header">
                    <h3>{plan.name}</h3>
                    {plan.id === currentPlan && <span className="current-badge">Hiện tại</span>}
                  </div>

                  <div className="plan-price">
                    <span className="price">${plan.price}</span>
                    <span className="period">/tháng</span>
                  </div>

                  <div className="plan-credits">
                    <strong>{plan.monthlyCredits}</strong> credits/tháng
                    {plan.bonus?.signup_credits && (
                      <span className="inline-bonus"> + {plan.bonus.signup_credits} credits bonus khi đăng ký</span>
                    )}
                  </div>

                  <div className="plan-features">
                    <ul>
                      {plan.features.ai_detection && (
                        <li><img src="/icon/search.svg" alt="" className="feature-icon" />Phát hiện AI</li>
                      )}
                      {plan.features.text_analysis && (
                        <li><img src="/icon/chart-bar.svg" alt="" className="feature-icon" />Phân tích văn bản</li>
                      )}
                      {plan.features.text_rewrite && (
                        <li><img src="/icon/pen.svg" alt="" className="feature-icon" />Viết lại văn bản</li>
                      )}
                      {plan.features.improvement_suggestions && (
                        <li><img src="/icon/lightbulb.svg" alt="" className="feature-icon" />Gợi ý cải thiện</li>
                      )}
                      {plan.features.chat_message && (
                        <li><img src="/icon/message-circle.svg" alt="" className="feature-icon" />Chat AI</li>
                      )}
                      {plan.features.translation && (
                        <li><img src="/icon/languages.svg" alt="" className="feature-icon" />Dịch thuật</li>
                      )}
                      <li>
                        <img src="/icon/mic.svg" alt="" className="feature-icon" />
                        {plan.features.voice_profiles === -1 ? 'Không giới hạn' : plan.features.voice_profiles} voice profiles
                      </li>
                      {plan.features.priority_support && (
                        <li><img src="/icon/bolt.svg" alt="" className="feature-icon" />Hỗ trợ ưu tiên</li>
                      )}
                      {plan.features.api_access && (
                        <li><img src="/icon/plug.svg" alt="" className="feature-icon" />API access</li>
                      )}
                      {plan.discount?.rewrite_cost && (
                        <li><img src="/icon/badge-percent.svg" alt="" className="feature-icon" />{Math.round((1 - plan.discount.rewrite_cost) * 100)}% giảm viết lại</li>
                      )}
                      {plan.discount?.analysis_cost && (
                        <li><img src="/icon/badge-percent.svg" alt="" className="feature-icon" />{Math.round((1 - plan.discount.analysis_cost) * 100)}% giảm phân tích</li>
                      )}
                    </ul>
                  </div>

                  {plan.id !== currentPlan && (
                    <button
                      className="upgrade-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpgradePlan(plan.id);
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Đang xử lý...' : 'Nâng cấp'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'credits' && (
            <div className="packages-grid">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`package-card ${selectedPackage === pkg.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  <h3>{pkg.description}</h3>

                  <div className="package-price">
                    <span className="price">${pkg.price}</span>
                  </div>

                  <div className="package-credits">
                    <strong>{pkg.totalCredits}</strong> credits
                    {pkg.bonus > 0 && (
                      <span className="bonus-percent">+{Math.round((pkg.bonus / pkg.credits) * 10) / 10}% lợi ích</span>
                    )}
                  </div>

                  <button
                    className="purchase-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchasePackage(pkg.id);
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Đang xử lý...' : 'Mua ngay'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="upgrade-modal-footer">
          <p className="note">
            Thanh toán an toàn qua Lemon Squeezy
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlanModal;
