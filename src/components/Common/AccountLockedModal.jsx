/**
 * Account Locked Modal
 * Displayed when user's account has been locked by admin
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './AccountLockedModal.css';

export default function AccountLockedModal() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [lockInfo, setLockInfo] = useState(null);

  useEffect(() => {
    // Listen for account locked event
    const handleAccountLocked = (event) => {
      console.log('[AccountLockedModal] Account locked event:', event.detail);
      setLockInfo(event.detail);
      setIsVisible(true);
    };

    window.addEventListener('accountLocked', handleAccountLocked);

    return () => {
      window.removeEventListener('accountLocked', handleAccountLocked);
    };
  }, []);

  const handleContactSupport = () => {
    // Open support/feedback form
    window.open('https://forms.gle/your-support-form', '_blank');
  };

  const handleClose = () => {
    // Reload to clear state and go to login
    window.location.reload();
  };

  if (!isVisible || !lockInfo) {
    return null;
  }

  return (
    <div className="account-locked-overlay">
      <div className="account-locked-modal">
        <div className="locked-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="11" width="14" height="11" rx="2" stroke="#ef4444" strokeWidth="2"/>
            <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1.5" fill="#ef4444"/>
          </svg>
        </div>
        
        <h2 className="locked-title">
          {t('accountLocked.title', 'Account Locked')}
        </h2>
        
        <p className="locked-message">
          {lockInfo.message || t('accountLocked.message', 'Your account has been locked and cannot access the system.')}
        </p>
        
        {lockInfo.reason && (
          <div className="locked-reason">
            <strong>{t('accountLocked.reason', 'Reason')}:</strong>
            <p>{lockInfo.reason}</p>
          </div>
        )}
        
        <div className="locked-actions">
          <button 
            className="btn-support"
            onClick={handleContactSupport}
          >
            {t('accountLocked.contactSupport', 'Contact Support')}
          </button>
          <button 
            className="btn-close-locked"
            onClick={handleClose}
          >
            {t('accountLocked.close', 'Close')}
          </button>
        </div>
        
        <p className="locked-footer">
          {t('accountLocked.footer', 'Please contact support for more information about unlocking your account.')}
        </p>
      </div>
    </div>
  );
}
