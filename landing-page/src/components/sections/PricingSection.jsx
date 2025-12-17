/**
 * PricingSection - Premium pricing with animated cards
 * Enhanced: Dec 2025 - Full-width layout, updated features, payment icons
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Icon from '@components/common/Icon'

const CREDIT_PACKAGES = [
  { id: 'free', credits: 100, bonus: 0, price: 0, icon: 'gift', description: 'Free', isFree: true, features: ['tryAllFeatures', 'noCardRequired', 'neverExpires'] },
  { id: 'basic', credits: 200, bonus: 30, price: 4.99, icon: 'crown-basic', description: 'Basic' },
  { id: 'pro', credits: 600, bonus: 150, price: 14.99, icon: 'crown-pro', popular: true, description: 'Pro' },
  { id: 'pro_plus', credits: 1800, bonus: 540, price: 39.99, icon: 'crown-pro-plus', description: 'Pro Plus' },
  { id: 'power', credits: 6000, bonus: 2400, price: 99.99, icon: 'crown-ultimate', description: 'Power', bestValue: true }
]

// Updated features based on actual sidebar functionality (removed Translation)
const CREDIT_USES = [
  { icon: 'shield-check', key: 'aiDetection', cost: '~2-5', description: 'Detect AI-generated content' },
  { icon: 'wand-sparkles', key: 'humanization', cost: '~5-15', description: 'Make text more human-like' },
  { icon: 'mic', key: 'voiceProfiles', cost: '~8-25', description: 'Create writing voice profiles' },
  { icon: 'message-circle', key: 'aiWorkspace', cost: '~1-3', description: 'AI-powered writing assistant' },
  { icon: 'pencil', key: 'rewriting', cost: '~2-8', description: 'Rewrite with your style' },
  { icon: 'bar-chart-4', key: 'styleAnalysis', cost: '~1-3', description: 'Analyze writing patterns' }
]

const CURRENCY_CONFIG = {
  vi: { rate: 25400, symbol: '₫', position: 'after', largeNumber: true },
  ja: { rate: 154, symbol: '¥', position: 'before' },
  ko: { rate: 1380, symbol: '₩', position: 'before', largeNumber: true },
  zh: { rate: 7.25, symbol: '¥', position: 'before' },
  th: { rate: 35.5, symbol: '฿', position: 'before' },
  id: { rate: 16200, symbol: 'Rp', position: 'before', largeNumber: true },
  de: { rate: 0.92, symbol: '€', position: 'after' },
  fr: { rate: 0.92, symbol: '€', position: 'after' },
  es: { rate: 0.92, symbol: '€', position: 'after' },
  pt: { rate: 6.1, symbol: 'R$', position: 'before' }
}

const formatLocalCurrency = (usdPrice, langCode) => {
  const config = CURRENCY_CONFIG[langCode]
  if (!config || usdPrice === 0) return null
  const localPrice = usdPrice * config.rate
  const formatted = config.largeNumber 
    ? `${Math.floor(Math.round(localPrice / 1000) * 1000 / 1000).toLocaleString()}.000`
    : Math.round(localPrice).toLocaleString()
  return config.position === 'before' ? `${config.symbol}${formatted}` : `${formatted}${config.symbol}`
}




const PricingSection = () => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language?.split('-')[0] || 'en'
  const showLocalCurrency = useMemo(() => currentLang !== 'en' && CURRENCY_CONFIG[currentLang], [currentLang])

  const getTotalCredits = (pkg) => pkg.credits + pkg.bonus
  const getPricePerCredit = (pkg) => pkg.price === 0 ? '0' : (pkg.price / getTotalCredits(pkg)).toFixed(3)
  const getBonusPercent = (pkg) => pkg.bonus > 0 ? Math.round((pkg.bonus / pkg.credits) * 100) : 0


  return (
    <section id="pricing" className="py-12 sm:py-16 lg:py-20 xl:py-28 relative overflow-hidden">
      {/* Background - Enhanced gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[300px] sm:w-[400px] lg:w-[500px] h-[300px] sm:h-[400px] lg:h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[250px] sm:w-[350px] lg:w-[400px] h-[250px] sm:h-[350px] lg:h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[500px] lg:w-[600px] h-[400px] sm:h-[500px] lg:h-[600px] bg-gradient-to-br from-primary/3 to-purple-500/3 rounded-full blur-3xl" />
        {/* SVG Background Pattern */}
        <img 
          src="/images/backgrounds/bg-wave-4.svg" 
          alt="" 
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-100"
        />
      </div>

      {/* Container with reduced max-width for better card display */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-10 lg:mb-14">
          <motion.span initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-bg-primary text-primary text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <Icon name="credit-card" size="sm" className="icon-primary" />
            {t('pricing.badge', 'Pricing')}
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3 sm:mb-5">{t('pricing.title', 'Pay As You Go')}</h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2 sm:px-0">{t('pricing.subtitle', 'Buy credits when you need them. No subscription required. Credits never expire.')}</p>
        </motion.div>

        {/* Pricing Cards - Full width grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 mb-8 sm:mb-10 lg:mb-14">
          {CREDIT_PACKAGES.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`relative ${pkg.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-full shadow-lg shadow-primary/25">
                    <Icon name="star" size="xs" className="icon-white" />
                    {t('pricing.popular', 'Most Popular')}
                  </span>
                </div>
              )}
              {pkg.bestValue && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                    <Icon name="trophy" size="xs" className="icon-white" />
                    {t('pricing.bestValue', 'Best Value')}
                  </span>
                </div>
              )}

              <div className={`h-full bg-bg-primary rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border transition-all duration-300 hover:shadow-xl flex flex-col ${
                pkg.popular ? 'border-primary/30 shadow-lg shadow-primary/10' : pkg.isFree ? 'border-green-500/20' : pkg.bestValue ? 'border-amber-500/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}>
                {/* Icon */}
                <div className="flex justify-center mb-2 sm:mb-3 lg:mb-4 pt-1 sm:pt-2">
                  <div className={`w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 rounded-lg sm:rounded-xl flex items-center justify-center border shadow-sm ${
                    pkg.isFree ? 'bg-green-500/10 border-green-500/20' : pkg.popular ? 'bg-primary/10 border-primary/20' : pkg.bestValue ? 'bg-amber-500/10 border-amber-500/20' : 'bg-bg-primary border-gray-200 dark:border-gray-700'
                  }`}>
                    {pkg.isFree ? (
                      <img src={`/icon/${pkg.icon}.svg`} alt={pkg.description} className="w-5 sm:w-6 lg:w-8 h-5 sm:h-6 lg:h-8" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(95%) contrast(90%)' }} />
                    ) : (
                      <img src={`/icon/${pkg.icon}.svg`} alt={pkg.description} className="w-5 sm:w-6 lg:w-8 h-5 sm:h-6 lg:h-8" />
                    )}
                  </div>
                </div>
                <h3 className="text-center text-sm sm:text-base lg:text-lg font-bold text-text-primary mb-2 sm:mb-3">{pkg.description}</h3>

                {/* Price */}
                <div className="text-center mb-2 sm:mb-3 lg:mb-4">
                  {pkg.isFree ? (
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-500">{t('pricing.free', 'Free')}</span>
                  ) : (
                    <>
                      <span className="text-xs sm:text-sm text-text-muted">$</span>
                      <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary">{pkg.price.toFixed(2).split('.')[0]}</span>
                      <span className="text-sm sm:text-base lg:text-lg text-text-muted">.{pkg.price.toFixed(2).split('.')[1]}</span>
                      {showLocalCurrency && <span className="text-[10px] sm:text-xs text-text-muted block mt-0.5 sm:mt-1">≈ {formatLocalCurrency(pkg.price, currentLang)}</span>}
                    </>
                  )}
                </div>

                {/* Credits with x2 display for first purchase */}
                <div className="text-center mb-2 sm:mb-3 lg:mb-4">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
                    <Icon name="coins" size="sm" className="text-amber-500 sm:!w-5 sm:!h-5" />
                    {pkg.isFree ? (
                      <>
                        <span className="text-base sm:text-lg lg:text-xl font-bold text-text-primary">{getTotalCredits(pkg).toLocaleString()}</span>
                        <span className="text-xs sm:text-sm text-text-secondary hidden sm:inline">{t('pricing.credits', 'credits')}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs sm:text-sm lg:text-base text-text-muted line-through hidden sm:inline">{getTotalCredits(pkg).toLocaleString()}</span>
                        <span className="text-base sm:text-lg lg:text-xl font-bold text-primary">{(getTotalCredits(pkg) * 2).toLocaleString()}</span>
                        <span className="text-xs sm:text-sm text-text-secondary hidden sm:inline">{t('pricing.credits', 'credits')}</span>
                      </>
                    )}
                  </div>
                  
                  {/* x2 First Purchase Badge - show for all paid packages */}
                  {!pkg.isFree && (
                    <div className="mt-1.5 sm:mt-2">
                      <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-primary/10 rounded-full">
                        <span className="text-[10px] sm:text-xs font-black text-primary">×2</span>
                        <span className="text-[10px] sm:text-xs font-semibold text-primary hidden sm:inline">{t('pricing.firstPurchase', 'First purchase')}</span>
                      </span>
                    </div>
                  )}
                  
                  {/* Bonus badge */}
                  {pkg.bonus > 0 && (
                    <div className="mt-1.5 sm:mt-2">
                      <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-green-500/10 rounded-full">
                        <img src="/icon/gift.svg" alt="gift" className="w-2.5 sm:w-3 h-2.5 sm:h-3" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(95%) contrast(90%)' }} />
                        <span className="text-[10px] sm:text-xs font-semibold text-green-600 dark:text-green-400">+{getBonusPercent(pkg)}%</span>
                      </span>
                    </div>
                  )}
                </div>

                {!pkg.isFree && <p className="text-center text-[10px] sm:text-xs text-text-muted mb-2 sm:mb-3 lg:mb-4 hidden sm:block">~${getPricePerCredit(pkg)}/credit</p>}

                {pkg.isFree && pkg.features && (
                  <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3 lg:mb-4 hidden sm:block">
                    {pkg.features.map((f) => (
                      <div key={f} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-text-secondary">
                        <Icon name="check" size="xs" className="text-green-500 flex-shrink-0" />
                        <span className="truncate">{t(`pricing.freeFeatures.${f}`, f)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Spacer to push button to bottom */}
                <div className="flex-grow" />

                <motion.a
                  href="https://app.graphosai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 w-full py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                    pkg.isFree || pkg.popular
                      ? 'bg-primary text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30'
                      : 'bg-bg-secondary text-text-primary border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-bg-tertiary'
                  }`}
                >
                  <Icon name={pkg.isFree ? 'rocket' : 'shopping-cart'} size="sm" className={pkg.isFree || pkg.popular ? 'icon-white' : ''} />
                  <span className="hidden xs:inline sm:inline">{pkg.isFree ? t('pricing.startFree', 'Start Free') : t('pricing.buyNow', 'Buy Now')}</span>
                  <span className="xs:hidden sm:hidden">{pkg.isFree ? 'Free' : 'Buy'}</span>
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Credit Uses - Updated features from sidebar */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-bg-primary rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-10 border border-gray-200 dark:border-gray-700 mb-8 sm:mb-10 lg:mb-12">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary text-center mb-2 sm:mb-3">{t('pricing.whatCreditsFor', 'What Can You Do With Credits?')}</h3>
          <p className="text-xs sm:text-sm text-text-muted text-center mb-6 sm:mb-8 lg:mb-10">{t('pricing.creditCostNote', 'Approximate credits per use (varies by text length)')}</p>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 xl:gap-5">
            {CREDIT_USES.map((item, i) => (
              <motion.div 
                key={item.key} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.03 }} 
                whileHover={{ y: -4, transition: { duration: 0.2 } }} 
                className="flex flex-col items-center gap-1.5 sm:gap-2 lg:gap-3 p-2 sm:p-3 lg:p-4 xl:p-5 bg-bg-secondary rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-9 sm:w-10 lg:w-12 xl:w-14 h-9 sm:h-10 lg:h-12 xl:h-14 rounded-lg sm:rounded-xl bg-bg-primary flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm group-hover:scale-110 group-hover:border-primary/30 transition-all duration-300">
                  <Icon name={item.icon} size="md" className="icon-primary sm:!w-5 sm:!h-5 lg:!w-6 lg:!h-6" />
                </div>
                <span className="text-[10px] sm:text-xs lg:text-sm text-center text-text-primary font-semibold line-clamp-2">{t(`pricing.uses.${item.key}`, item.key)}</span>
                <span className="text-[9px] sm:text-[10px] lg:text-xs text-text-muted bg-bg-primary px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 rounded-full border border-gray-100 dark:border-gray-800 font-medium">{item.cost} cr</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benefits - Enhanced grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-5 mb-8 sm:mb-10 lg:mb-12">
          {[
            { icon: 'infinity', key: 'neverExpire', fallback: 'Credits never expire', filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(95%) contrast(90%)', bg: 'bg-green-500/10' },
            { icon: 'ban', key: 'noSubscription', fallback: 'No subscription', filter: 'invert(42%) sepia(93%) saturate(1352%) hue-rotate(200deg) brightness(100%) contrast(97%)', bg: 'bg-blue-500/10' },
            { icon: 'shield-check', key: 'securePayment', fallback: 'Secure payment', filter: 'invert(40%) sepia(96%) saturate(1847%) hue-rotate(238deg) brightness(100%) contrast(94%)', bg: 'bg-purple-500/10' },
            { icon: 'zap', key: 'instantCredits', fallback: 'Instant credits', filter: 'invert(52%) sepia(94%) saturate(1439%) hue-rotate(360deg) brightness(101%) contrast(96%)', bg: 'bg-amber-500/10' }
          ].map((b, i) => (
            <motion.div 
              key={b.key} 
              initial={{ opacity: 0, scale: 0.95 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }} 
              transition={{ delay: i * 0.05 }} 
              className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 lg:p-4 xl:p-5 bg-bg-primary rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
            >
              <div className={`w-8 sm:w-9 lg:w-10 h-8 sm:h-9 lg:h-10 rounded-md sm:rounded-lg ${b.bg} flex items-center justify-center flex-shrink-0`}>
                <img src={`/icon/${b.icon}.svg`} alt={b.fallback} className="w-4 sm:w-4.5 lg:w-5 h-4 sm:h-4.5 lg:h-5" style={{ filter: b.filter }} />
              </div>
              <span className="text-xs sm:text-sm font-medium text-text-primary line-clamp-2">{t(`pricing.benefits.${b.key}`, b.fallback)}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Payment Footer - Enhanced with real icons */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-col items-center gap-4 sm:gap-5 lg:gap-6">
          {showLocalCurrency && <p className="text-[10px] sm:text-xs text-text-muted italic">{t('pricing.localCurrencyNote', '* Local currency estimates may vary')}</p>}
          
          {/* Powered by Lemon Squeezy */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm text-text-muted">{t('pricing.poweredBy', 'Powered by')}</span>
            <img src="/icon/lemonsqueezy-with-name.svg" alt="Lemon Squeezy" className="h-5 sm:h-6 opacity-70 hover:opacity-100 transition-opacity" />
          </div>
          
          {/* Payment Methods - Using actual payment icons */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-text-muted">
            <span className="hidden sm:inline">{t('pricing.acceptedPayments', 'We accept')}:</span>
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/icons/visa-classic-svgrepo-com.svg" alt="Visa" className="h-7 sm:h-8 lg:h-10" />
              <img src="/icons/mastercard-svgrepo-com.svg" alt="Mastercard" className="h-7 sm:h-8 lg:h-10" />
              <img src="/icons/apple-pay-svgrepo-com.svg" alt="Apple Pay" className="h-7 sm:h-8 lg:h-10" />
              <img src="/icons/google-pay-svgrepo-com.svg" alt="Google Pay" className="h-7 sm:h-8 lg:h-10" />
              <img src="/icons/paypal-svgrepo-com.svg" alt="PayPal" className="h-7 sm:h-8 lg:h-10" />
            </div>
          </div>
          
          {/* Security badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-text-muted text-center">
            <img src="/icon/lock.svg" alt="secure" className="w-3.5 sm:w-4 h-3.5 sm:h-4 opacity-60" />
            <span>{t('pricing.secureCheckout', 'Secure checkout with 256-bit SSL encryption')}</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PricingSection



