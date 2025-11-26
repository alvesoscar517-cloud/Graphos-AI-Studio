import { createContext, useContext, useState } from 'react'

const RewriteContext = createContext()

export const useRewrite = () => {
  const context = useContext(RewriteContext)
  if (!context) {
    throw new Error('useRewrite must be used within RewriteProvider')
  }
  return context
}

export const RewriteProvider = ({ children }) => {
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash')
  const [writingPreferences, setWritingPreferences] = useState({
    // Original preferences
    useVocabularyPreferences: true,
    useKeyCharacteristics: true,
    useSentencePatterns: true,
    useRewriteInstructions: true,
    // NEW: Humanization preferences
    useAntiAIDetection: true,      // Apply anti-AI detection rules
    useIterativeRefinement: false, // Use iterative refinement loop
    targetAIProbability: 35        // Target AI probability for iterative refinement
  })

  const value = {
    selectedModel,
    setSelectedModel,
    writingPreferences,
    setWritingPreferences
  }

  return (
    <RewriteContext.Provider value={value}>
      {children}
    </RewriteContext.Provider>
  )
}
