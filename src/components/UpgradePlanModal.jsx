/**
 * UpgradePlanModal Component
 * Uses TanStack Query for packages fetching and checkout
 * Includes first purchase bonus (x2 credits) for new members
 * Displays local currency estimates based on user's language
 */
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import Icon from './Common/Icon'
import { useQueryClient } from '@tanstack/react-query';
import { usePayment } from '../contexts/PaymentContext';
import { usePackages, useCreateCheckout } from '@/hooks/queries';
import { useToasts } from '@/stores/uiStore';
import { useUser } from '@/stores/authStore';
import { queryKeys } from '@/lib/queryKeys';
import { cn } from '../lib/utils';

import { CreditCard, Gift, Info, ShoppingCart, Tags, X } from 'lucide-react'

// Package icon mapping - maps package id to custom crown SVG icons
const PACKAGE_ICON_MAP = {
  'basic': 'crown-basic',
  'pro': 'crown-pro', 
  'pro_plus': 'crown-pro-plus',
  'power': 'crown-power',
}

// Currency mapping by language code with exchange rates (approximate, updated periodically)
const CURRENCY_CONFIG = {
  vi: { currency: 'VND', rate: 25400, symbol: '₫', position: 'after', largeNumber: true },
  ja: { currency: 'JPY', rate: 154, symbol: '¥', position: 'before', largeNumber: false },
  ko: { currency: 'KRW', rate: 1380, symbol: '₩', position: 'before', largeNumber: true },
  zh: { currency: 'CNY', rate: 7.25, symbol: '¥', position: 'before', largeNumber: false },
  'zh-CN': { currency: 'CNY', rate: 7.25, symbol: '¥', position: 'before', largeNumber: false },
  th: { currency: 'THB', rate: 35.5, symbol: '฿', position: 'before', largeNumber: false },
  id: { currency: 'IDR', rate: 16200, symbol: 'Rp', position: 'before', largeNumber: true },
  hi: { currency: 'INR', rate: 84, symbol: '₹', position: 'before', largeNumber: false },
  ru: { currency: 'RUB', rate: 103, symbol: '₽', position: 'after', largeNumber: false },
  ar: { currency: 'SAR', rate: 3.75, symbol: 'ر.س', position: 'after', largeNumber: false },
  de: { currency: 'EUR', rate: 0.92, symbol: '€', position: 'after', largeNumber: false },
  fr: { currency: 'EUR', rate: 0.92, symbol: '€', position: 'after', largeNumber: false },
  es: { currency: 'EUR', rate: 0.92, symbol: '€', position: 'after', largeNumber: false },
  it: { currency: 'EUR', rate: 0.92, symbol: '€', position: 'after', largeNumber: false },
  pt: { currency: 'BRL', rate: 6.1, symbol: 'R$', position: 'before', largeNumber: false },
  en: null, // USD - no conversion needed
};

/**
 * Format local currency with smart display for large numbers
 * For currencies like VND, IDR, KRW - shows abbreviated format with smaller trailing zeros
 * @param {number} usdPrice - Price in USD
 * @param {string} langCode - Language code
 * @param {boolean} isPerCredit - If true, format for per-credit display (no rounding to thousands)
 */
const formatLocalCurrency = (usdPrice, langCode, isPerCredit = false) => {
  const config = CURRENCY_CONFIG[langCode];
  if (!config) return null;
  
  const localPrice = usdPrice * config.rate;
  
  let formattedPrice;
  if (config.largeNumber) {
    if (isPerCredit) {
      // For per-credit pricing: show actual value without rounding to thousands
      // Round to nearest integer, no thousand separators
      const roundedPrice = Math.round(localPrice);
      formattedPrice = { main: String(roundedPrice), suffix: '' };
    } else {
      // For package prices: round to nearest thousand, no thousand separators
      const roundedPrice = Math.round(localPrice / 1000) * 1000;
      const mainPart = Math.floor(roundedPrice / 1000);
      // Format without thousand separators: e.g., 127.000 instead of 127,000
      formattedPrice = { main: String(mainPart).replace(/\B(?=(\d{3})+(?!\d))/g, ','), suffix: '.000' };
    }
  } else {
    // For non-large number currencies
    if (isPerCredit) {
      // Show 2-3 decimal places for per-credit
      formattedPrice = { main: localPrice.toFixed(localPrice < 1 ? 3 : 2), suffix: '' };
    } else {
      formattedPrice = { main: String(Math.round(localPrice)), suffix: '' };
    }
  }
  
  return {
    ...config,
    price: localPrice,
    formatted: formattedPrice
  };
};

const UpgradePlanModal = ({ isOpen, onClose, onPurchaseSuccess }) => {
  const { t } = useTranslation();
  const [loadingPackageId, setLoadingPackageId] = useState(null);
  const { startPolling } = usePayment();
  const { showError } = useToasts();
  const queryClient = useQueryClient();
  const user = useUser();
  const userId = user?.userId || user?.id;

  // TanStack Query hooks - pass userId to check first purchase eligibility
  const { data: packagesData, isLoading: packagesLoading } = usePackages(userId);
  const packages = packagesData?.packages || [];
  const isFirstPurchaseEligible = packagesData?.isFirstPurchaseEligible || false;
  const createCheckout = useCreateCheckout();

  useEffect(() => {
    const handlePaymentSuccess = () => {
      // Invalidate packages to refresh first purchase eligibility
      queryClient.invalidateQueries({ queryKey: queryKeys.payment.packages(userId) });
      onPurchaseSuccess?.();
    };
    window.addEventListener('payment-success', handlePaymentSuccess);
    return () => window.removeEventListener('payment-success', handlePaymentSuccess);
  }, [onPurchaseSuccess, queryClient, userId]);

  const handlePurchasePackage = async (pkg) => {
    // Prevent double-clicks while processing
    if (createCheckout.isPending || loadingPackageId) {
      return;
    }
    
    setLoadingPackageId(pkg.id);
    
    try {
      const data = await createCheckout.mutateAsync({
        packageId: pkg.id,
        variantId: pkg.variantId
      });

      if (data.success && data.checkoutUrl) {
        startPolling();
        window.open(data.checkoutUrl, '_blank');
        onClose();
      } else {
        showError(data.error || t('errors.unableToCreatePayment'), { error: new Error(data.error || 'Payment creation failed'), context: 'UpgradePlanModal.handlePurchase' });
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      // Show more specific error message if available
      const errorMessage = err?.message || t('errors.networkError');
      showError(errorMessage, { error: err, context: 'UpgradePlanModal.handlePurchase' });
    } finally {
      setLoadingPackageId(null);
    }
  };

  const { i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'en';
  
  // Check if we should show local currency
  const showLocalCurrency = useMemo(() => {
    return currentLang !== 'en' && CURRENCY_CONFIG[currentLang];
  }, [currentLang]);

  const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(price);
  const getBonusPercent = (pkg) => pkg.bonus > 0 ? Math.round((pkg.bonus / pkg.credits) * 100) : null;
  
  // Format local price with smart display
  // isLarge: for package price display (big text)
  // isPerCredit: for per-credit pricing (no rounding to thousands)
  const renderLocalPrice = (usdPrice, isLarge = false, isPerCredit = false) => {
    const localData = formatLocalCurrency(usdPrice, i18n.language, isPerCredit) || formatLocalCurrency(usdPrice, currentLang, isPerCredit);
    if (!localData) return null;
    
    const { symbol, position, formatted } = localData;
    
    if (isLarge) {
      return (
        <span className="text-2xl font-bold text-text-primary tracking-tight max-sm:text-xl">
          {position === 'before' && symbol}
          {formatted.main}
          {formatted.suffix && <span className="text-base opacity-60">{formatted.suffix}</span>}
          {position === 'after' && symbol}
        </span>
      );
    }
    
    return (
      <span className="text-xs text-text-muted">
        {position === 'before' && symbol}
        {formatted.main}
        {formatted.suffix && <span className="text-[10px] opacity-70">{formatted.suffix}</span>}
        {position === 'after' && symbol}
      </span>
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className={cn("fixed inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center z-toast p-5","animate-overlay-fade","max-md:p-3 max-md:items-end"
      )}
      onClick={onClose}
    >
      <div 
        className={cn("bg-bg-primary","border border-border rounded-2xl max-w-[820px] w-full max-h-[85vh]","overflow-hidden flex flex-col shadow-modal","animate-modal-slide","max-md:max-w-full max-md:max-h-[90vh] max-md:rounded-t-2xl max-md:rounded-b-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5">
          <div className="flex items-center gap-2.5">
            <Icon name="coins" size="2xl" className="opacity-80" />
            <h2 className="m-0 text-lg font-semibold text-text-primary">{t('billing.buyCredits')}</h2>
          </div>
          <button 
            className="bg-transparent border-none w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
            onClick={onClose}
            aria-label={t('common.close')}
            data-tooltip={t('common.close')}
            data-tooltip-position="bottom"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Banner */}
        {createCheckout.error && (
          <div className="flex items-center gap-2.5 py-3 px-6 mx-6 bg-red-400/10 rounded-lg">
            <svg className="w-4 h-4 shrink-0 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span className="flex-1 text-sm text-red-400 font-medium">{createCheckout.error.message}</span>
            <button 
              className="bg-transparent border-none w-6 h-6 rounded flex items-center justify-center cursor-pointer opacity-60 hover:opacity-100"
              onClick={() => createCheckout.reset()}
              data-tooltip={t('common.close')}
              data-tooltip-position="left"
            >
              <svg className="w-3.5 h-3.5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}

        {/* First Purchase Banner */}
        {isFirstPurchaseEligible && (
          <div className="mx-6 mb-2 p-3 bg-bg-secondary rounded-xl">
            <div className="flex items-center justify-center gap-2.5">
              <Icon name="gift-banner" size="lg" className="w-5 h-5 shrink-0" />
              <div className="text-center">
                <span className="text-sm font-bold text-amber-500">{t('billing.firstPurchaseTitle', 'WELCOME OFFER')}</span>
                <span className="text-sm font-medium text-amber-500 ml-2">{t('billing.firstPurchaseDesc', 'Double credits on your first purchase!')}</span>
              </div>
              <Icon name="gift-banner" size="lg" className="w-5 h-5 shrink-0" />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 max-sm:p-3.5">
          {packagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3.5 max-[900px]:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-2.5">
              {packages.map((pkg) => {
                const bonusPercent = getBonusPercent(pkg);
                const displayCredits = isFirstPurchaseEligible ? pkg.totalWithFirstPurchase : pkg.totalCredits;
                return (
                  <div
                    key={pkg.id}
                    className={cn("bg-bg-secondary border border-border-light rounded-2xl py-5 px-4 flex flex-col items-center relative","transition-colors hover:border-border-hover","max-sm:flex-row max-sm:flex-wrap max-sm:p-3.5 max-sm:gap-2.5"
                    )}
                  >
                    {/* First Purchase x2 Badge */}
                    {isFirstPurchaseEligible && (
                      <Icon name="x2-credits" alt="x2" />
                    )}
                    
                    {pkg.popular && !isFirstPurchaseEligible && (
                      <div className={cn("absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-white border-none","py-1 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 uppercase tracking-wide","max-sm:static max-sm:translate-x-0 max-sm:w-full max-sm:justify-center max-sm:order-[-1] max-sm:mb-1"
                      )}>
                        <Tags size={12} />
                        <span>{t('billing.popular')}</span>
                      </div>
                    )}
                    
                    <div className={cn("flex flex-col items-center gap-2.5 mb-3.5 pt-3","max-sm:flex-row max-sm:mb-0 max-sm:!pt-0 max-sm:flex-1"
                    )}>
                      <div className="w-10 h-10 flex items-center justify-center max-sm:w-9 max-sm:h-9">
                        <img 
                          src={`/icon/${PACKAGE_ICON_MAP[pkg.id] || 'crown-basic'}.svg`}
                          alt={pkg.description}
                          className="w-8 h-8 max-sm:w-7 max-sm:h-7"
                        />
                      </div>
                      <h3 className="m-0 text-sm font-semibold text-text-primary">{pkg.description}</h3>
                    </div>

                    <div className="text-center mb-3.5 max-sm:mb-0">
                      {showLocalCurrency ? (
                        renderLocalPrice(pkg.price, true)
                      ) : (
                        <span className="text-2xl font-bold text-text-primary tracking-tight max-sm:text-xl">{formatPrice(pkg.price)}</span>
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-1.5 mb-2.5 max-sm:flex-row max-sm:w-full max-sm:justify-between max-sm:mb-1.5">
                      <div className="flex items-center gap-1.5 text-text-primary">
                        <Icon name="coins" size="xs" className="opacity-60" />
                        {isFirstPurchaseEligible ? (
                          <>
                            <span className="text-xs text-text-muted line-through">{pkg.totalCredits.toLocaleString()}</span>
                            <strong className="text-base font-semibold text-amber-500">{displayCredits.toLocaleString()}</strong>
                          </>
                        ) : (
                          <strong className="text-base font-semibold">{displayCredits.toLocaleString()}</strong>
                        )}
                        <span className="text-sm text-text-secondary">{t('billing.credits')}</span>
                      </div>
                      {isFirstPurchaseEligible ? (
                        <div className="inline-flex items-center gap-1 py-0.5 px-2 bg-amber-500/15 rounded-lg text-xs font-semibold text-amber-500">
                          <span>+{pkg.firstPurchaseBonus?.toLocaleString()} {t('billing.bonus')}</span>
                        </div>
                      ) : bonusPercent ? (
                        <div className="inline-flex items-center gap-1 py-0.5 px-2 bg-success/10 rounded-lg text-xs font-semibold text-success">
                          <Gift size={10} />
                          <span>+{bonusPercent}% {t('billing.bonus')}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="text-center mb-3.5 max-sm:hidden">
                      {showLocalCurrency ? (
                        <span className="text-xs text-text-muted">
                          {renderLocalPrice(pkg.price / pkg.totalCredits, false, true)}{t('billing.perCredit')}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">{formatPrice(pkg.price / pkg.totalCredits)}{t('billing.perCredit')}</span>
                      )}
                    </div>

                    <button
                      className={cn("w-full py-2.5 px-3.5 border-none rounded-xl text-sm font-semibold cursor-pointer","transition-colors flex items-center justify-center gap-1.5 mt-auto",
                        pkg.popular 
                          ?"bg-primary text-white hover:opacity-90" 
                          :"bg-fill-tertiary text-text-primary hover:bg-fill-secondary","disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      onClick={(e) => { e.stopPropagation(); handlePurchasePackage(pkg); }}
                      disabled={createCheckout.isPending}
                    >
                      {loadingPackageId === pkg.id ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-transparent border-t-current rounded-full animate-spin" />
                          <span>{t('common.processing')}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={16} />
                          <span>{t('billing.buyNow')}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="py-3.5 px-6 flex flex-col items-center gap-1.5 max-sm:p-3.5">
          {showLocalCurrency && (
            <div className="flex items-center gap-1 text-[10px] text-text-muted opacity-70 italic">
              <Info size={12} className="opacity-50" />
              <span>{t('billing.localCurrencyDisclaimer', 'Prices shown are estimates and may vary based on current exchange rates')}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-secondary">{t('billing.securePayment')}</span>
            <img src="/icon/lemonsqueezy-light-mode.svg" alt="Lemon Squeezy" className="h-4 w-auto opacity-90 lemonsqueezy-light" />
            <img src="/icon/lemonsqueezy-darkmode.svg" alt="Lemon Squeezy" className="h-4 w-auto opacity-90 lemonsqueezy-dark" />
          </div>
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <CreditCard size={14} className="opacity-50" />
            <span className="opacity-70">{t('billing.paymentMethods')}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UpgradePlanModal;
