/**
 * DemoWrapper - Wrapper component for interactive demos
 * Provides sandbox mode with mock data for real UI components
 */
import { useState, createContext, useContext } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// Demo Context for managing demo state
const DemoContext = createContext(null)

export const useDemoContext = () => {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error('useDemoContext must be used within DemoWrapper')
  }
  return context
}

// App Frame - simulates the real app container
export const AppFrame = ({ children, title, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative bg-bg-primary rounded-lg border border-gray-200 shadow-xl overflow-hidden ${className}`}
    >
      {/* Window Title Bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-bg-secondary/50">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        {title && (
          <span className="ml-2 text-xs text-text-secondary font-medium">{title}</span>
        )}
      </div>
      <div className="relative">
        {children}
      </div>
    </motion.div>
  )
}

// Main DemoWrapper component
const DemoWrapper = ({ 
  children, 
  feature,
  initialData = {},
  onInteraction,
  className = ''
}) => {
  const [demoState, setDemoState] = useState({
    isProcessing: false,
    result: null,
    error: null,
    ...initialData
  })

  const updateDemoState = (updates) => {
    setDemoState(prev => ({ ...prev, ...updates }))
    onInteraction?.(updates)
  }

  const simulateProcessing = async (duration = 1500) => {
    updateDemoState({ isProcessing: true, error: null })
    await new Promise(resolve => setTimeout(resolve, duration))
    updateDemoState({ isProcessing: false })
  }

  const contextValue = {
    ...demoState,
    updateDemoState,
    simulateProcessing,
    feature
  }

  return (
    <DemoContext.Provider value={contextValue}>
      <div className={`demo-wrapper ${className}`}>
        {children}
      </div>
    </DemoContext.Provider>
  )
}

export default DemoWrapper
