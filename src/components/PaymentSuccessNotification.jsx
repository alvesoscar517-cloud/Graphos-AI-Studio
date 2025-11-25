/**
 * PaymentSuccessNotification Component
 * Shows a compact success notification with confetti animation
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
          <img src="/icon/x.svg" alt="Close" />
        </button>

        <div className="success-icon-wrapper">
          <div className="success-icon">
            <img src="/icon/check.svg" alt="Success" />
          </div>
        </div>

        <h3 className="success-title">Thanks for your order!</h3>
        
        <p className="success-message">
          Woohoo! Your payment was successful, and your order is complete. 
          A receipt is on its way to your inbox.
        </p>

        {credits && (
          <div className="credits-info">
            <img src="/icon/coins.svg" alt="Credits" />
            <span>New balance: <strong>{credits.balance?.toFixed(2)}</strong> credits</span>
          </div>
        )}

        <button className="continue-btn" onClick={handleClose}>
          Continue
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default PaymentSuccessNotification;
