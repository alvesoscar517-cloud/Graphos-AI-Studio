import { createContext, useContext, useState } from 'react'

const AIProcessingContext = createContext()

export const useAIProcessing = () => {
  const context = useContext(AIProcessingContext)
  if (!context) {
    throw new Error('useAIProcessing must be used within AIProcessingProvider')
  }
  return context
}

export const AIProcessingProvider = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingType, setProcessingType] = useState(null) // 'detect', 'analyze', 'rewrite', etc.

  const startProcessing = (type) => {
    setIsProcessing(true)
    setProcessingType(type)
  }

  const stopProcessing = () => {
    setIsProcessing(false)
    setProcessingType(null)
  }

  const value = {
    isProcessing,
    processingType,
    startProcessing,
    stopProcessing
  }

  return (
    <AIProcessingContext.Provider value={value}>
      {children}
    </AIProcessingContext.Provider>
  )
}
