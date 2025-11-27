/**
 * PaymentSuccessNotification Component
 * Shows a compact success notification with confetti animation
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import confettiAnimation from '../animation/Confetti.json';
import './PaymentSuccessNotification.css';

const PaymentSuccessNotification = ({ 
  isVisible, 
  order, 
  credits, 
  onClose,
  autoCloseDelay = 8000 
}) => {
  const { t } = useTranslation();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const content = (
    <div className={`payment-success-wrapper ${isClosing ? 'closing' : ''}`}>
      {/* Confetti Animation - Full screen background */}
      <div className="confetti-container">
        <Lottie
          animationData={confettiAnimation}
          loop={false}
          autoplay={true}
          style={{ 
            width: '100%', 
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      </div>

      {/* Notification Card */}
      <div className="payment-success-notification">
        <button className="close-notification" onClick={handleClose}>
          <img src="/icon/x.svg" alt={t('common.close')} />
        </button>

        <div className="success-icon-wrapper">
          <div className="success-icon">
            <img src="/icon/check.svg" alt={t('common.success')} />
          </div>
        </div>

        <h3 className="success-title">{t('payment.thanksForOrder')}</h3>
        
        <p className="success-message">
          {t('payment.paymentSuccessful')}
        </p>

        {credits && (
          <div className="credits-info">
            <img src="/icon/coins.svg" alt={t('credits.credits')} />
            <span>{t('payment.newBalance')} <strong>{credits.balance?.toFixed(2)}</strong> {t('credits.credits')}</span>
          </div>
        )}

        <button className="continue-btn" onClick={handleClose}>
          {t('payment.continue')}
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default PaymentSuccessNotification;
