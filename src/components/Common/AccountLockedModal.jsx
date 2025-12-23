/**
 * Account Locked Modal
 * Displayed when user's account has been locked by admin
 */

import { logger } from '../../utils/logger'
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

export default function AccountLockedModal() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [lockInfo, setLockInfo] = useState(null);

  useEffect(() => {
    const handleAccountLocked = (event) => {
      setLockInfo(event.detail);
      setIsVisible(true);
    };

    window.addEventListener('accountLocked', handleAccountLocked);
    return () => window.removeEventListener('accountLocked', handleAccountLocked);
  }, []);

  const handleContactSupport = () => {
    window.location.href = 'mailto:Support@graphosai.com?subject=Account%20Locked%20-%20Request%20for%20Assistance';
  };

  const handleClose = () => {
    window.location.reload();
  };

  if (!isVisible || !lockInfo) return null;

  return (
    <div className={cn("fixed inset-0 bg-black/5 flex items-center justify-center z-toast p-5","backdrop-blur-[1px]"
    )}>
      <div className={cn("bg-bg-primary border border-border rounded-2xl p-10 max-w-modal-md w-full","shadow-2xl text-center","animate-slide-up","max-sm:p-6"
      )}>
        {/* Icon */}
        <div className="mx-auto mb-6 w-16 h-16">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="11" width="14" height="11" rx="2" stroke="#ef4444" strokeWidth="2"/>
            <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1.5" fill="#ef4444"/>
          </svg>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl max-sm:text-xl font-bold text-error m-0 mb-4">
          {t('accountLocked.title', 'Account Locked')}
        </h2>
        
        {/* Message */}
        <p className="text-base max-sm:text-sm text-text-secondary leading-relaxed m-0 mb-6">
          {lockInfo.message || t('accountLocked.message', 'Your account has been locked and cannot access the system.')}
        </p>
        
        {/* Reason */}
        {lockInfo.reason && (
          <div className={cn("bg-error/10 border border-error/30","rounded-lg p-4 mb-6 text-left"
          )}>
            <strong className="block text-error text-sm mb-2">
              {t('accountLocked.reason', 'Reason')}:
            </strong>
            <p className="m-0 text-error text-sm leading-relaxed">
              {lockInfo.reason}
            </p>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-3 mb-5 max-sm:flex-col">
          <button 
            className={cn("flex-1 py-3 px-6 rounded-lg font-semibold text-sm cursor-pointer border-none","bg-error text-white transition-all duration-200","hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-glow-error"
            )}
            onClick={handleContactSupport}
          >
            {t('accountLocked.contactSupport', 'Contact Support')}
          </button>
          <button 
            className={cn("flex-1 py-3 px-6 rounded-lg font-semibold text-sm cursor-pointer border-none","bg-bg-secondary text-text-secondary","transition-colors duration-200","hover:bg-bg-tertiary"
            )}
            onClick={handleClose}
          >
            {t('accountLocked.close', 'Close')}
          </button>
        </div>
        
        {/* Footer */}
        <p className="text-sm text-text-muted m-0 leading-relaxed">
          {t('accountLocked.footer', 'Please contact support for more information about unlocking your account.')}
        </p>
        
        {/* Support Email */}
        <p className="text-xs text-text-muted mt-4 m-0">
          {t('common.supportEmail', 'Email')}: <a href="mailto:Support@graphosai.com" className="text-primary hover:underline">Support@graphosai.com</a>
        </p>
      </div>
    </div>
  );
}
