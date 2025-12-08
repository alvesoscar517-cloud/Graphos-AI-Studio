/**
 * UpgradePlanModal Component
 * Uses TanStack Query for packages fetching and checkout
 */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { usePayment } from '../contexts/PaymentContext';
import { usePackages, useCreateCheckout } from '@/hooks/queries';
import { useToasts } from '@/stores/uiStore';
import { cn } from '../lib/utils';

const UpgradePlanModal = ({ isOpen, onClose, onPurchaseSuccess }) => {
  const { t } = useTranslation();
  const [loadingPackageId, setLoadingPackageId] = useState(null);
  const { startPolling } = usePayment();
  const { showError } = useToasts();

  // TanStack Query hooks
  const { data: packages = [], isLoading: packagesLoading } = usePackages();
  const createCheckout = useCreateCheckout();

  useEffect(() => {
    const handlePaymentSuccess = () => onPurchaseSuccess?.();
    window.addEventListener('payment-success', handlePaymentSuccess);
    return () => window.removeEventListener('payment-success', handlePaymentSuccess);
  }, [onPurchaseSuccess]);

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
        showError(data.error || t('errors.unableToCreatePayment'));
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      // Show more specific error message if available
      const errorMessage = err?.message || t('errors.networkError');
      showError(errorMessage);
    } finally {
      setLoadingPackageId(null);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(price);
  const getBonusPercent = (pkg) => pkg.bonus > 0 ? Math.round((pkg.bonus / pkg.credits) * 100) : null;

  if (!isOpen) return null;

  return createPortal(
    <div 
      className={cn(
        "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-toast p-5",
        "animate-overlay-fade",
        "max-sm:p-0"
      )}
      onClick={onClose}
    >
      <div 
        className={cn(
          "bg-bg-primary",
          "border border-border rounded-2xl max-w-[820px] w-full max-h-[85vh]",
          "overflow-hidden flex flex-col shadow-modal",
          "animate-modal-slide",
          "max-sm:max-w-full max-sm:max-h-full max-sm:rounded-none max-sm:h-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5">
          <div className="flex items-center gap-2.5">
            <img src="/icon/coins.svg" alt="" className="w-icon-2xl h-icon-2xl opacity-80 icon-invert" />
            <h2 className="m-0 text-lg font-semibold text-text-primary">{t('billing.buyCredits')}</h2>
          </div>
          <button 
            className="bg-transparent border-none w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <img src="/icon/x.svg" alt="" className="w-icon-lg h-icon-lg icon-invert" />
          </button>
        </div>

        {/* Error Banner */}
        {createCheckout.error && (
          <div className="flex items-center gap-2.5 py-3 px-6 mx-6 bg-red-400/10 rounded-lg">
            <img src="/icon/alert-circle.svg" alt="" className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-sm text-red-400 font-medium">{createCheckout.error.message}</span>
            <button 
              className="bg-transparent border-none w-6 h-6 rounded flex items-center justify-center cursor-pointer opacity-60 hover:opacity-100"
              onClick={() => createCheckout.reset()}
            >
              <img src="/icon/x.svg" alt="" className="w-3.5 h-3.5" />
            </button>
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
                return (
                  <div
                    key={pkg.id}
                    className={cn(
                      "bg-bg-secondary border border-border-light rounded-xl py-5 px-4 flex flex-col items-center relative",
                      "transition-colors hover:border-border-hover",
                      pkg.popular && "border-primary/30",
                      "max-sm:flex-row max-sm:flex-wrap max-sm:p-3.5 max-sm:gap-2.5"
                    )}
                  >
                    {pkg.popular && (
                      <div className={cn(
                        "absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-white border-none",
                        "py-1 px-2.5 rounded text-xs font-semibold flex items-center gap-1 uppercase tracking-wide",
                        "max-sm:static max-sm:translate-x-0 max-sm:w-full max-sm:justify-center max-sm:order-[-1] max-sm:mb-1"
                      )}>
                        <img src="/icon/tags.svg" alt="" className="w-3 h-3 brightness-0 invert" />
                        <span>{t('billing.popular')}</span>
                      </div>
                    )}
                    
                    <div className={cn(
                      "flex flex-col items-center gap-2.5 mb-3.5 pt-1",
                      pkg.popular && "pt-3",
                      "max-sm:flex-row max-sm:mb-0 max-sm:!pt-0 max-sm:flex-1"
                    )}>
                      <div className="w-9 h-9 rounded-lg bg-fill-tertiary border border-border-light flex items-center justify-center max-sm:w-8 max-sm:h-8">
                        <img src={`/icon/${pkg.icon || 'zap'}.svg`} alt="" className="w-icon-lg h-icon-lg opacity-80 icon-invert" />
                      </div>
                      <h3 className="m-0 text-sm font-semibold text-text-primary">{pkg.description}</h3>
                    </div>

                    <div className="text-center mb-3.5 max-sm:mb-0">
                      <span className="text-2xl font-bold text-text-primary tracking-tight max-sm:text-xl">{formatPrice(pkg.price)}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 mb-2.5 max-sm:flex-row max-sm:w-full max-sm:justify-between max-sm:mb-1.5">
                      <div className="flex items-center gap-1.5 text-text-primary">
                        <img src="/icon/coins.svg" alt="" className="w-3.5 h-3.5 opacity-60 icon-invert" />
                        <strong className="text-base font-semibold">{pkg.totalCredits.toLocaleString()}</strong>
                        <span className="text-sm text-text-secondary">{t('billing.credits')}</span>
                      </div>
                      {bonusPercent && (
                        <div className="inline-flex items-center gap-1 py-0.5 px-2 bg-success/10 rounded text-xs font-semibold text-success">
                          <img src="/icon/gift.svg" alt="" className="w-icon-2xs h-icon-2xs" style={{ filter: 'brightness(0) saturate(100%) invert(61%) sepia(70%) saturate(459%) hue-rotate(93deg) brightness(95%) contrast(92%)' }} />
                          <span>+{bonusPercent}% {t('billing.bonus')}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center mb-3.5 max-sm:hidden">
                      <span className="text-xs text-text-muted">{formatPrice(pkg.price / pkg.totalCredits)}{t('billing.perCredit')}</span>
                    </div>

                    <button
                      className={cn(
                        "w-full py-2.5 px-3.5 border-none rounded-lg text-sm font-semibold cursor-pointer",
                        "transition-colors flex items-center justify-center gap-1.5 mt-auto",
                        pkg.popular 
                          ? "bg-primary text-white hover:opacity-90" 
                          : "bg-fill-tertiary text-text-primary hover:bg-fill-secondary",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
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
                          <img src="/icon/shopping-cart.svg" alt="" className={cn("w-3.5 h-3.5 opacity-70", pkg.popular ? "brightness-0 invert" : "icon-invert")} />
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
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-secondary">{t('billing.securePayment')}</span>
            <img src="/icon/lemonsqueezy-with-name.svg" alt="Lemon Squeezy" className="h-4 w-auto opacity-90 icon-invert" />
          </div>
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <img src="/icon/credit-card.svg" alt="Card" title={t('billing.creditDebitCard')} className="w-3.5 h-3.5 opacity-50 icon-invert" />
            <span className="opacity-70">{t('billing.paymentMethods')}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UpgradePlanModal;
