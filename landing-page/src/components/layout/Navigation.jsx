import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../common/Icon'

function Navigation({ mobile = false }) {
  const { t } = useTranslation()
  const location = useLocation()
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const dropdownRef = useRef(null)
  const timeoutRef = useRef(null)

  const isActive = path => location.pathname === path

  // Feature items with icons and unique colors
  const featureItems = [
    { 
      label: t('nav.aiDetection'), 
      href: '/features/ai-detection',
      icon: 'shield-check',
      description: t('nav.aiDetectionDesc', 'Detect AI-generated content'),
      iconColor: 'icon-blue',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      iconBgColor: 'bg-blue-100 dark:bg-blue-500/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      hoverTextColor: 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
    },
    { 
      label: t('nav.humanization'), 
      href: '/features/humanization',
      icon: 'wand-sparkles',
      description: t('nav.humanizationDesc', 'Make AI text sound natural'),
      iconColor: 'icon-amber',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      iconBgColor: 'bg-amber-100 dark:bg-amber-500/20',
      textColor: 'text-amber-600 dark:text-amber-400',
      hoverTextColor: 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
    },
    { 
      label: t('nav.voiceProfile'), 
      href: '/features/voice-profile',
      icon: 'mic',
      description: t('nav.voiceProfileDesc', 'Create your unique voice'),
      iconColor: 'icon-violet',
      bgColor: 'bg-violet-50 dark:bg-violet-500/10',
      iconBgColor: 'bg-violet-100 dark:bg-violet-500/20',
      textColor: 'text-violet-600 dark:text-violet-400',
      hoverTextColor: 'group-hover:text-violet-600 dark:group-hover:text-violet-400'
    },
    { 
      label: t('nav.rewrite', 'AI Rewrite'), 
      href: '/features/rewrite',
      icon: 'edit-3',
      description: t('nav.rewriteDesc', 'Transform text in your voice'),
      iconColor: 'icon-emerald',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      iconBgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      hoverTextColor: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
    },
    { 
      label: t('nav.compatibilityScore', 'Compatibility Score'), 
      href: '/features/compatibility-score',
      icon: 'target',
      description: t('nav.compatibilityScoreDesc', 'Check your writing style match'),
      iconColor: 'icon-teal',
      bgColor: 'bg-teal-50 dark:bg-teal-500/10',
      iconBgColor: 'bg-teal-100 dark:bg-teal-500/20',
      textColor: 'text-teal-600 dark:text-teal-400',
      hoverTextColor: 'group-hover:text-teal-600 dark:group-hover:text-teal-400'
    },
    { 
      label: t('nav.deviations', 'Deviations'), 
      href: '/features/deviations',
      icon: 'alert-triangle',
      description: t('nav.deviationsDesc', 'Find style inconsistencies'),
      iconColor: 'icon-orange',
      bgColor: 'bg-orange-50 dark:bg-orange-500/10',
      iconBgColor: 'bg-orange-100 dark:bg-orange-500/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      hoverTextColor: 'group-hover:text-orange-600 dark:group-hover:text-orange-400'
    },
    { 
      label: t('nav.statistics', 'Statistics'), 
      href: '/features/statistics',
      icon: 'bar-chart-2',
      description: t('nav.statisticsDesc', 'Analyze your writing metrics'),
      iconColor: 'icon-indigo',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      iconBgColor: 'bg-indigo-100 dark:bg-indigo-500/20',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      hoverTextColor: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
    },
    { 
      label: t('nav.aiWorkspace'), 
      href: '/features/ai-workspace',
      icon: 'message-square',
      description: t('nav.aiWorkspaceDesc', 'All-in-one AI workspace'),
      iconColor: 'icon-cyan',
      bgColor: 'bg-cyan-50 dark:bg-cyan-500/10',
      iconBgColor: 'bg-cyan-100 dark:bg-cyan-500/20',
      textColor: 'text-cyan-600 dark:text-cyan-400',
      hoverTextColor: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400'
    },
  ]

  const navItems = [
    {
      label: t('nav.features'),
      children: featureItems,
    },
    { label: t('nav.privacy'), href: '/privacy' },
    { label: t('nav.terms'), href: '/terms' },
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFeaturesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setFeaturesOpen(false)
  }, [location.pathname])

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setFeaturesOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setFeaturesOpen(false), 150)
  }

  // Animation variants
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: 8,
      scale: 0.96,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      y: 4,
      scale: 0.98,
      transition: { duration: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0 }
  }

  if (mobile) {
    return (
      <nav className="flex flex-col gap-1">
        {navItems.map((item, index) =>
          item.children ? (
            <div key={index} className="overflow-hidden">
              <button
                onClick={() => setFeaturesOpen(!featuresOpen)}
                className="w-full flex items-center justify-between py-3 px-2 text-text-primary font-medium rounded-lg hover:bg-bg-hover/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Icon name="grid-2x2" size="sm" color="gray-medium" />
                  {item.label}
                </span>
                <motion.div
                  animate={{ rotate: featuresOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon name="chevron-down" size="sm" color="gray-medium" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {featuresOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="py-2 pl-4 space-y-1">
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          to={child.href}
                          className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all group ${
                            isActive(child.href) 
                              ? `${child.bgColor} ${child.textColor}` 
                              : 'text-text-secondary hover:bg-bg-hover/50'
                          }`}
                        >
                          <div className={`p-1.5 rounded-md transition-colors ${
                            isActive(child.href) ? child.iconBgColor : child.bgColor
                          }`}>
                            <Icon name={child.icon} size="sm" className={child.iconColor} />
                          </div>
                          <div>
                            <div className={`text-sm font-medium transition-colors ${isActive(child.href) ? child.textColor : child.hoverTextColor}`}>{child.label}</div>
                            <div className="text-xs text-text-tertiary">{child.description}</div>
                          </div>
                        </Link>
                      ))}
                      
                      {/* View All Features Link - Mobile */}
                      <Link
                        to="/features"
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 mt-2 rounded-lg border border-dashed transition-all ${
                          isActive('/features') 
                            ? 'bg-violet-50 dark:bg-violet-500/10 border-violet-300 dark:border-violet-500/30 text-violet-600 dark:text-violet-400' 
                            : 'border-gray-300 dark:border-gray-600 text-text-secondary hover:bg-bg-hover/50 hover:text-violet-600 dark:hover:text-violet-400'
                        }`}
                      >
                        <Icon name="grid" size="sm" className="icon-violet" />
                        <span className="text-sm font-medium">{t('nav.viewAllFeatures', 'View All Features')}</span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              key={index}
              to={item.href}
              className={`flex items-center gap-2 py-3 px-2 font-medium rounded-lg transition-colors ${
                isActive(item.href) 
                  ? 'text-primary bg-primary/5' 
                  : 'text-text-primary hover:bg-bg-hover/50'
              }`}
            >
              <Icon 
                name={item.href === '/privacy' ? 'lock' : 'file-text'} 
                size="sm" 
                color={isActive(item.href) ? 'primary' : 'gray-medium'}
              />
              {item.label}
            </Link>
          )
        )}
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item, index) =>
        item.children ? (
          <div 
            key={index} 
            className="relative"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              onClick={() => setFeaturesOpen(!featuresOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all ${
                featuresOpen 
                  ? 'text-text-primary bg-gray-100 dark:bg-gray-800' 
                  : 'text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {item.label}
              <motion.div
                animate={{ rotate: featuresOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Icon name="chevron-down" size="xs" color="gray-medium" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {featuresOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[100]"
                >
                  <div className="bg-bg-primary border border-gray-200/60 rounded-xl shadow-xl shadow-black/10 p-2 min-w-[280px] backdrop-blur-xl">
                    {item.children.map((child, childIndex) => (
                      <motion.div key={childIndex} variants={itemVariants}>
                        <Link
                          to={child.href}
                          className={`flex items-center gap-3 p-2.5 rounded-lg transition-all group ${
                            isActive(child.href) 
                              ? `${child.bgColor}` 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-colors ${
                            isActive(child.href) 
                              ? child.iconBgColor 
                              : child.bgColor
                          }`}>
                            <Icon 
                              name={child.icon} 
                              size="sm" 
                              className={child.iconColor}
                            />
                          </div>
                          <div className="flex-1">
                            <div className={`text-sm font-medium transition-colors ${
                              isActive(child.href) ? child.textColor : `text-text-primary ${child.hoverTextColor}`
                            }`}>
                              {child.label}
                            </div>
                            <div className="text-xs text-text-tertiary mt-0.5">
                              {child.description}
                            </div>
                          </div>
                          <Icon 
                            name="chevron-right" 
                            size="xs" 
                            className={`opacity-0 group-hover:opacity-60 transition-opacity ${child.iconColor}`}
                          />
                        </Link>
                      </motion.div>
                    ))}
                    
                    {/* View All Features Link */}
                    <motion.div variants={itemVariants}>
                      <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                        <Link
                          to="/features"
                          className={`flex items-center justify-center gap-2 p-2.5 rounded-lg transition-all group ${
                            isActive('/features') 
                              ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-text-secondary hover:text-violet-600 dark:hover:text-violet-400'
                          }`}
                        >
                          <Icon name="grid" size="sm" className="icon-violet" />
                          <span className="text-sm font-medium">{t('nav.viewAllFeatures', 'View All Features')}</span>
                          <Icon name="arrow-right" size="xs" className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            key={index}
            to={item.href}
            className={`px-3 py-2 rounded-lg font-medium transition-all ${
              isActive(item.href) 
                ? 'text-text-primary bg-gray-100 dark:bg-gray-800' 
                : 'text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {item.label}
          </Link>
        )
      )}
    </nav>
  )
}

export default Navigation
