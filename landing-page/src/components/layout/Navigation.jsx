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

  // Feature items with icons for modern look
  const featureItems = [
    { 
      label: t('nav.aiDetection'), 
      href: '/features/ai-detection',
      icon: 'shield-check',
      description: t('nav.aiDetectionDesc', 'Detect AI-generated content')
    },
    { 
      label: t('nav.humanization'), 
      href: '/features/humanization',
      icon: 'sparkles',
      description: t('nav.humanizationDesc', 'Make AI text sound natural')
    },
    { 
      label: t('nav.voiceProfile'), 
      href: '/features/voice-profile',
      icon: 'user-circle',
      description: t('nav.voiceProfileDesc', 'Create your unique voice')
    },
    { 
      label: t('nav.aiWorkspace'), 
      href: '/features/ai-workspace',
      icon: 'layout-grid',
      description: t('nav.aiWorkspaceDesc', 'All-in-one AI workspace')
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
                          className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all ${
                            isActive(child.href) 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-text-secondary hover:bg-bg-hover/50 hover:text-text-primary'
                          }`}
                        >
                          <div className={`p-1.5 rounded-md ${
                            isActive(child.href) ? 'bg-primary/20' : 'bg-bg-secondary'
                          }`}>
                            <Icon name={child.icon} size="sm" color={isActive(child.href) ? 'primary' : 'gray-medium'} />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{child.label}</div>
                            <div className="text-xs text-text-tertiary">{child.description}</div>
                          </div>
                        </Link>
                      ))}
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
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all group ${
                            isActive(child.href) 
                              ? 'bg-gray-100 dark:bg-gray-800' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-colors ${
                            isActive(child.href) 
                              ? 'bg-gray-200 dark:bg-gray-700' 
                              : 'bg-bg-secondary group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                          }`}>
                            <Icon 
                              name={child.icon} 
                              size="sm" 
                              color="gray"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-text-primary">
                              {child.label}
                            </div>
                            <div className="text-xs text-text-tertiary mt-0.5">
                              {child.description}
                            </div>
                          </div>
                          <Icon 
                            name="chevron-right" 
                            size="xs" 
                            color="gray-medium"
                            className="opacity-0 group-hover:opacity-60 transition-opacity" 
                          />
                        </Link>
                      </motion.div>
                    ))}
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
